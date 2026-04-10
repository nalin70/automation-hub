require('dotenv').config();

const { startCronJobs } = require('./scheduler/cron');
const { log } = require('./utils/logger');

// 👇 this line is IMPORTANT
require('./modules/github/github.controller');

function startApp() {
  log('🚀 Automation Hub started...');
  startCronJobs();
}

startApp();