const { getJson } = require('serpapi');

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
  };
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

async function fetchJobs(options = {}) {
  const apiKey = process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY;

  if (!apiKey) {
    throw new Error('Missing SERPAPI_API_KEY in .env');
  }

  let response;

  try {
    response = await getJson({
      engine: 'google_jobs',
      q: options.query || process.env.JOBS_QUERY || 'Node.js Developer',
      location: options.location || process.env.JOBS_LOCATION || 'Remote',
      google_domain: 'google.com',
      hl: process.env.JOBS_HL || 'en',
      gl: process.env.JOBS_GL || 'us',
      api_key: apiKey,
    });
  } catch (err) {
    throw new Error(`SerpApi error: ${getErrorMessage(err)}`);
  }

  if (response.error) {
    throw new Error(`SerpApi error: ${response.error}`);
  }

  const jobs = Array.isArray(response.jobs_results) ? response.jobs_results : [];
  return jobs.map(normalizeJob);
}

module.exports = { fetchJobs };