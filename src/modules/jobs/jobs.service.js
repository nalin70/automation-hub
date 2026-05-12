const { fetchJobs } = require('./jobs.scraper');
const { filterJobs } = require('./jobs.filter');
const { readJobs, saveJobs, isNewJob } = require('../../storage/jobs.store');

async function getNewFilteredJobs(options = {}) {
  const jobs = await fetchJobs(options);
  const filtered = filterJobs(jobs, options);

  const existing = readJobs();

  const newJobs = filtered.filter(job => isNewJob(existing, job));

  if (newJobs.length > 0) {
    saveJobs([...existing, ...newJobs]);
  }

  return newJobs;
}

module.exports = { getNewFilteredJobs };