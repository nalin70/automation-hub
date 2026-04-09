const cron = require('node-cron');
const { runGithubCheck } = require('../modules/github/github.scheduler');
const { log } = require('../utils/logger');

// Runs every day at 8 PM
function startCronJobs() {
  cron.schedule('0 20 * * *', async () => {
    log('Running GitHub activity check...');
    await runGithubCheck();
  });
}

module.exports = { startCronJobs };