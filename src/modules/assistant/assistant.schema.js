const {
  JOB_CITIES,
  JOB_DOMAINS,
  JOB_EXPERIENCE_LEVELS,
} = require('../jobs/jobs.constants');
const { DEFAULT_TIMEZONE, parseTimeTo24Hour } = require('../schedules/schedules.parser');

const ASSISTANT_INTENTS = new Set([
  'github_status',
  'github_check_now',
  'jobs_search',
  'jobs_setup_guided',
  'jobs_schedule_create',
  'schedules_list',
  'help',
  'unknown',
]);

const MIN_CONFIDENCE = Number(process.env.LLM_MIN_CONFIDENCE || 0.65);

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function findOptionByIdOrText(items, value, text) {
  const normalizedValue = normalizeText(value);
  const normalizedText = normalizeText(text);

  if (normalizedValue) {
    const exact = items.find(item => normalizeText(item.id) === normalizedValue);
    if (exact) return exact;

    const byLabel = items.find(item => normalizeText(item.label) === normalizedValue);
    if (byLabel) return byLabel;
  }

  return items.find((item) => {
    const id = normalizeText(item.id);
    const label = normalizeText(item.label);
    const query = normalizeText(item.query);
    const location = normalizeText(item.location);

    return normalizedText.includes(id)
      || normalizedText.includes(label)
      || (query && normalizedText.includes(query))
      || (location && normalizedText.includes(location.split(',')[0]));
  }) || null;
}

function findDomain(value, text) {
  const normalizedText = normalizeText(`${value || ''} ${text || ''}`);

  if (normalizedText.includes('mern')) {
    return JOB_DOMAINS.find(item => item.id === 'fullstack');
  }

  return findOptionByIdOrText(JOB_DOMAINS, value, text);
}

function findCity(value, text) {
  const normalizedText = normalizeText(`${value || ''} ${text || ''}`);

  if (normalizedText.includes('wfh') || normalizedText.includes('work from home')) {
    return JOB_CITIES.find(item => item.id === 'remote');
  }

  if (normalizedText.includes('bengaluru')) {
    return JOB_CITIES.find(item => item.id === 'bangalore');
  }

  if (normalizedText.includes('ncr')) {
    return JOB_CITIES.find(item => item.id === 'delhi');
  }

  return findOptionByIdOrText(JOB_CITIES, value, text);
}

function findExperience(value, text) {
  const normalizedText = normalizeText(`${value || ''} ${text || ''}`);

  if (/\b(fresher|entry|graduate|intern)\b/.test(normalizedText)) {
    return JOB_EXPERIENCE_LEVELS.find(item => item.id === 'fresher');
  }

  if (/\b(1|2|3)\s*(years?|yrs?)\b/.test(normalizedText)) {
    return JOB_EXPERIENCE_LEVELS.find(item => item.id === 'junior');
  }

  if (/\b(4|5)\s*(years?|yrs?)\b/.test(normalizedText)) {
    return JOB_EXPERIENCE_LEVELS.find(item => item.id === 'mid');
  }

  if (/\b(senior|lead|6|7|8|9|10)\b/.test(normalizedText)) {
    return JOB_EXPERIENCE_LEVELS.find(item => item.id === 'senior');
  }

  return findOptionByIdOrText(JOB_EXPERIENCE_LEVELS, value, text);
}

function buildJobOptions(domain, city, experience) {
  const query = `${domain.query} ${experience.query}`;

  return {
    domainId: domain.id,
    cityId: city.id,
    experienceId: experience.id,
    query,
    location: city.location,
    keywords: domain.keywords,
    summary: `${domain.label} jobs in ${city.label} for ${experience.label}`,
  };
}

function normalizeTime(value) {
  if (!value) return null;

  try {
    return parseTimeTo24Hour(value);
  } catch (_) {
    return null;
  }
}

function getMissingJobFields(domain, city, experience) {
  const missing = [];

  if (!domain) missing.push('domain');
  if (!city) missing.push('city');
  if (!experience) missing.push('experience');

  return missing;
}

function normalizeAssistantIntent(rawIntent, sourceText) {
  const raw = rawIntent && typeof rawIntent === 'object' ? rawIntent : {};
  const intent = ASSISTANT_INTENTS.has(raw.intent) ? raw.intent : 'unknown';
  const entities = raw.entities && typeof raw.entities === 'object' ? raw.entities : {};
  const confidence = Number(raw.confidence || 0);
  const normalized = {
    intent,
    confidence: Number.isFinite(confidence) ? confidence : 0,
    entities: {},
    missingFields: Array.isArray(raw.missingFields) ? raw.missingFields : [],
    confirmationText: String(raw.confirmationText || '').trim(),
    source: raw.source || 'llm',
  };

  if (normalized.intent === 'unknown' || normalized.confidence < MIN_CONFIDENCE) {
    return { ...normalized, intent: 'unknown' };
  }

  if (['jobs_search', 'jobs_schedule_create'].includes(normalized.intent)) {
    const domain = findDomain(entities.domainId || entities.domain || entities.query, sourceText);
    const city = findCity(entities.cityId || entities.city || entities.location, sourceText);
    const experience = findExperience(entities.experienceId || entities.experience, sourceText);
    const missingFields = getMissingJobFields(domain, city, experience);

    if (missingFields.length > 0 && normalized.intent === 'jobs_search') {
      return {
        ...normalized,
        intent: 'jobs_setup_guided',
        missingFields,
      };
    }

    normalized.missingFields = missingFields;

    if (missingFields.length === 0) {
      normalized.entities.jobOptions = buildJobOptions(domain, city, experience);
    }
  }

  if (normalized.intent === 'jobs_schedule_create') {
    const timeOfDay = normalizeTime(entities.timeOfDay || entities.time || entities.at);
    const frequency = normalizeText(entities.frequency || 'daily');

    if (frequency && frequency !== 'daily') {
      return {
        ...normalized,
        intent: 'unknown',
        missingFields: ['supportedFrequency'],
      };
    }

    if (!timeOfDay) {
      return {
        ...normalized,
        intent: 'jobs_setup_guided',
        missingFields: ['timeOfDay'],
      };
    }

    normalized.entities.scheduleInput = {
      type: 'jobs',
      title: 'Job recommendations',
      frequency: 'daily',
      timeOfDay,
      timezone: entities.timezone || DEFAULT_TIMEZONE,
      config: normalized.entities.jobOptions || null,
    };
  }

  return normalized;
}

function isSupportedIntent(intent) {
  return ASSISTANT_INTENTS.has(intent);
}

module.exports = {
  ASSISTANT_INTENTS,
  MIN_CONFIDENCE,
  buildJobOptions,
  findCity,
  findDomain,
  findExperience,
  isSupportedIntent,
  normalizeAssistantIntent,
};