require('dotenv').config();

const { startCronJobs } = require('./scheduler/cron');
const { log } = require('./utils/logger');

function startApp() {
  log('🚀 Automation Hub started...');
  startCronJobs();
}

startApp();