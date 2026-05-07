const { getNewFilteredJobs } = require('./jobs.service');
const { sendMessage } = require('../../notifier/telegram.service');

async function runJobCheck() {
  const jobs = await getNewFilteredJobs();

  for (const job of jobs) {
    const company = job.company || 'Unknown company';
    const location = job.location || 'Unknown location';

    await sendMessage(
      `🚀 New Job!\n\n${job.title}\n${company}\n${location}\n${job.link}`
    );
  }

  return jobs;
}

module.exports = { runJobCheck };