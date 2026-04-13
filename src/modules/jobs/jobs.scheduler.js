const { getNewFilteredJobs } = require('./jobs.service');
const { sendMessage } = require('../../notifier/telegram.service');

async function runJobCheck() {
  const jobs = await getNewFilteredJobs();

  for (const job of jobs) {
    await sendMessage(
      `🚀 New Job!\n\n${job.title}\n${job.company}\n${job.location}\n${job.link}`
    );
  }
}

module.exports = { runJobCheck };