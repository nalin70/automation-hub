require('dotenv').config();

const { startCronJobs } = require('./scheduler/cron');
const { runGithubCheck } = require('./modules/github/github.scheduler');
const { log } = require('./utils/logger');

async function startApp() {
  log('🚀 Automation Hub started...');

  // Run immediately (for testing)
  await runGithubCheck();

  startCronJobs();
}

startApp();