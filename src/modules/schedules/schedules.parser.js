const DEFAULT_TIMEZONE = 'Asia/Kolkata';

function parseTimeTo24Hour(input) {
  const text = String(input || '').trim().toLowerCase();
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);

  if (!match) {
    throw new Error('Use time like 08:00, 8:00, 8 am, or 8pm.');
  }

  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3];

  if (meridiem) {
    if (hour < 1 || hour > 12) {
      throw new Error('Use a valid 12-hour time like 8 am or 6:30 pm.');
    }

    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error('Use a valid 24-hour time between 00:00 and 23:59.');
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseScheduleJobsCommand(text) {
  const parts = String(text || '').trim().split(/\s+/);

  if (parts.length < 3) {
    throw new Error('Usage: /schedule_jobs daily 08:00');
  }

  const frequency = parts[1].toLowerCase();
  if (frequency !== 'daily') {
    throw new Error('Only daily job schedules are supported right now.');
  }

  return {
    type: 'jobs',
    title: 'Job recommendations',
    frequency,
    timeOfDay: parseTimeTo24Hour(parts.slice(2).join(' ')),
    timezone: DEFAULT_TIMEZONE,
    config: getDefaultJobsConfig(),
  };
}

function parseNaturalJobsReminder(text) {
  const message = String(text || '').trim();

  if (!/\b(remind|reminder|schedule)\b/i.test(message) || !/\bjob|jobs\b/i.test(message)) {
    return null;
  }

  const timeMatch = message.match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (!timeMatch) return null;

  return {
    type: 'jobs',
    title: 'Job recommendations',
    frequency: 'daily',
    timeOfDay: parseTimeTo24Hour(timeMatch[1]),
    timezone: DEFAULT_TIMEZONE,
    config: getDefaultJobsConfig(),
  };
}

function getDefaultJobsConfig() {
  return {
    query: process.env.JOBS_QUERY || 'Node.js Developer',
    location: process.env.JOBS_LOCATION || 'Remote',
    keywords: (process.env.JOBS_KEYWORDS || '')
      .split(',')
      .map(keyword => keyword.trim())
      .filter(Boolean),
  };
}

module.exports = {
  DEFAULT_TIMEZONE,
  parseNaturalJobsReminder,
  parseScheduleJobsCommand,
  parseTimeTo24Hour,
};