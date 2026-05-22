const { getJson } = require('serpapi');
const { JOB_CITIES, JOB_DOMAINS } = require('./jobs.constants');
const { log } = require('../../utils/logger');

const DEFAULT_MIN_RESULTS = 8;
const DEFAULT_MAX_SEARCHES = 5;

function getJobLink(job) {
  if (job.share_link) return job.share_link;
  if (job.link) return job.link;

  const applyOption = Array.isArray(job.apply_options) ? job.apply_options[0] : null;
  if (applyOption && applyOption.link) return applyOption.link;

  const relatedLink = Array.isArray(job.related_links) ? job.related_links[0] : null;
  if (relatedLink && relatedLink.link) return relatedLink.link;

  return `https://www.google.com/search?q=${encodeURIComponent(`${job.title || ''} ${job.company_name || ''} jobs`)}`;
}

function normalizeJob(job) {
  const link = getJobLink(job);

  return {
    id: job.job_id || link,
    title: job.title || 'Untitled job',
    company: job.company_name || job.company || 'Unknown company',
    location: job.location || 'Unknown location',
    link,
    source: job.via || null,
    description: job.description || null,
    postedAtText: job.detected_extensions && job.detected_extensions.posted_at
      ? job.detected_extensions.posted_at
      : null,
  };
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getJobFingerprints(job) {
  const link = normalizeText(job.link);
  const identity = [job.title, job.company, job.location]
    .map(normalizeText)
    .filter(Boolean)
    .join('|');

  return [link && `link:${link}`, identity && `identity:${identity}`].filter(Boolean);
}

function dedupeJobs(jobs) {
  const seen = new Set();
  const deduped = [];

  for (const job of jobs) {
    const fingerprints = getJobFingerprints(job);
    if (fingerprints.length === 0 || fingerprints.some(fingerprint => seen.has(fingerprint))) continue;

    for (const fingerprint of fingerprints) {
      seen.add(fingerprint);
    }

    deduped.push(job);
  }

  return deduped;
}

function findCity(options) {
  if (options.cityId) {
    const city = JOB_CITIES.find(item => item.id === options.cityId);
    if (city) return city;
  }

  const location = normalizeText(options.location || process.env.JOBS_LOCATION);
  if (!location) return null;

  return JOB_CITIES.find((city) => {
    const candidates = [city.location, city.label, ...(city.searchLocations || [])].map(normalizeText);
    return candidates.some(candidate => candidate && (candidate === location || candidate.includes(location) || location.includes(candidate)));
  }) || null;
}

function getSearchLocations(options) {
  const city = findCity(options);
  const configuredLocations = Array.isArray(options.searchLocations) ? options.searchLocations : [];
  const cityLocations = city && Array.isArray(city.searchLocations) ? city.searchLocations : [];

  return unique([
    options.location || process.env.JOBS_LOCATION || 'Remote',
    ...configuredLocations,
    ...cityLocations,
  ]);
}

function getSearchQueries(options) {
  const baseQuery = options.query || process.env.JOBS_QUERY || 'Node.js Developer';
  const domain = options.domainId
    ? JOB_DOMAINS.find(item => item.id === options.domainId)
    : null;
  const keywordQueries = Array.isArray(options.keywords)
    ? options.keywords.map(keyword => `${keyword} developer`)
    : [];

  return unique([
    baseQuery,
    domain && domain.query,
    ...keywordQueries,
  ]);
}

function buildSearches(options) {
  const maxSearches = Number(process.env.JOBS_MAX_SEARCHES || DEFAULT_MAX_SEARCHES);
  const locations = getSearchLocations(options);
  const queries = getSearchQueries(options);
  const searches = [];

  for (const query of queries) {
    for (const location of locations) {
      searches.push({ query, location });

      if (searches.length >= maxSearches) return searches;
    }
  }

  return searches;
}

function getErrorMessage(err) {
  if (!err) return 'Unknown SerpApi error';
  if (typeof err === 'string') {
    try {
      const parsed = JSON.parse(err);
      return parsed.error || err;
    } catch (_) {
      return err;
    }
  }
  if (err.message) {
    try {
      const parsed = JSON.parse(err.message);
      return parsed.error || err.message;
    } catch (_) {
      return err.message;
    }
  }
  if (err.error) return err.error;
  return JSON.stringify(err);
}

function isUnsupportedLocationError(message) {
  return /unsupported [`']?.+?[`']? location|unsupported .+ location/i.test(String(message || ''));
}

async function fetchJobs(options = {}) {
  const apiKey = process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY;

  if (!apiKey) {
    throw new Error('Missing SERPAPI_API_KEY in .env');
  }

  const minResults = Number(process.env.JOBS_MIN_RESULTS || DEFAULT_MIN_RESULTS);
  const searches = buildSearches(options);
  const collectedJobs = [];

  for (const search of searches) {
    let response;

    try {
      response = await getJson({
        engine: 'google_jobs',
        q: search.query,
        location: search.location,
        google_domain: process.env.JOBS_GOOGLE_DOMAIN || 'google.co.in',
        hl: process.env.JOBS_HL || 'en',
        gl: process.env.JOBS_GL || 'in',
        api_key: apiKey,
      });
    } catch (err) {
      const message = getErrorMessage(err);

      if (isUnsupportedLocationError(message)) {
        log(`Skipping unsupported Google Jobs location "${search.location}" for "${search.query}".`);
        continue;
      }

      throw new Error(`SerpApi error: ${message}`);
    }

    if (response.error) {
      if (isUnsupportedLocationError(response.error)) {
        log(`Skipping unsupported Google Jobs location "${search.location}" for "${search.query}".`);
        continue;
      }

      throw new Error(`SerpApi error: ${response.error}`);
    }

    const jobs = Array.isArray(response.jobs_results) ? response.jobs_results : [];
    collectedJobs.push(...jobs.map(normalizeJob));

    const dedupedCount = dedupeJobs(collectedJobs).length;
    log(`Google Jobs returned ${jobs.length} job(s) for "${search.query}" in "${search.location}"; ${dedupedCount} unique so far.`);

    if (dedupedCount >= minResults) break;
  }

  return dedupeJobs(collectedJobs);
}

module.exports = { fetchJobs };