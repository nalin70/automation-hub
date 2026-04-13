function filterJobs(jobs) {
  const keywords = ['node', 'backend'];

  return jobs.filter(job =>
    keywords.some(keyword =>
      job.title.toLowerCase().includes(keyword)
    )
  );
}

module.exports = { filterJobs };