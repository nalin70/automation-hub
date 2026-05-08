function filterJobs(jobs) {
  if (!Array.isArray(jobs)) return [];

  const keywords = (process.env.JOBS_KEYWORDS || '')
    .split(',')
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