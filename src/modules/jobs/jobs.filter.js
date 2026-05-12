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
    keywords.some(keyword =>
      (job.title || '').toLowerCase().includes(keyword)
    )
  );
}

module.exports = { filterJobs };