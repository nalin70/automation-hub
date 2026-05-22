function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function getKeywordScore(job, keyword) {
  const title = normalizeText(job.title);
  const description = normalizeText(job.description);
  const company = normalizeText(job.company);
  const source = normalizeText(job.source);
  const location = normalizeText(job.location);
  let score = 0;

  if (title.includes(keyword)) score += 3;
  if (description.includes(keyword)) score += 2;
  if (company.includes(keyword)) score += 1;
  if (source.includes(keyword)) score += 1;
  if (location.includes(keyword)) score += 1;

  return score;
}

function filterJobs(jobs, options = {}) {
  if (!Array.isArray(jobs)) return [];

  const keywordsInput = Array.isArray(options.keywords)
    ? options.keywords
    : (process.env.JOBS_KEYWORDS || '').split(',');

  const keywords = keywordsInput
    .map(keyword => keyword.trim().toLowerCase())
    .filter(Boolean);

  if (keywords.length === 0) return jobs;

  return jobs.filter(job =>
    keywords.reduce((score, keyword) => score + getKeywordScore(job, keyword), 0) > 0
  );
}

module.exports = { filterJobs };