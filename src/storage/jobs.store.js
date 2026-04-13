const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../../data/jobs.json');

function readJobs() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

function saveJobs(jobs) {
  fs.writeFileSync(FILE, JSON.stringify(jobs, null, 2));
}

function isNewJob(existingJobs, job) {
  return !existingJobs.some(j => j.id === job.id);
}

module.exports = { readJobs, saveJobs, isNewJob };