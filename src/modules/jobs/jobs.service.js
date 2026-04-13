const { fetchJobs } = require('./jobs.scraper');
const { filterJobs } = require('./jobs.filter');
const { readJobs, saveJobs, isNewJob } = require('../../storage/jobs.store');

async function getNewFilteredJobs() {
  const jobs = await fetchJobs();
  const filtered = filterJobs(jobs);

  const existing = readJobs();

  const newJobs = filtered.filter(job => isNewJob(existing, job));

  if (newJobs.length > 0) {
    saveJobs([...existing, ...newJobs]);
  }

  return newJobs;
}

module.exports = { getNewFilteredJobs };