const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../../data/jobs.json');

function ensureDataFile() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });

  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, '[]');
  }
}

function readJobs() {
  ensureDataFile();

  const content = fs.readFileSync(FILE, 'utf-8').trim();
  if (!content) return [];

  try {
    const jobs = JSON.parse(content);
    return Array.isArray(jobs) ? jobs : [];
  } catch (err) {
    console.error('Jobs Store Error:', err.message);
    return [];
  }
}

function saveJobs(jobs) {
  ensureDataFile();
  fs.writeFileSync(FILE, JSON.stringify(jobs, null, 2));
}

function isNewJob(existingJobs, job) {
  return !existingJobs.some(j => j.id === job.id || j.link === job.link);
}

module.exports = { readJobs, saveJobs, isNewJob };