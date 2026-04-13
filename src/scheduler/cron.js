const cron = require('node-cron');

const { runGithubCheck } = require('../modules/github/github.scheduler');
const { runJobCheck } = require('../modules/jobs/jobs.scheduler');

const { log } = require('../utils/logger');

// Runs scheduled jobs
function startCronJobs() {

  // =========================
  // GitHub Check (8 PM daily)
  // =========================
  cron.schedule(
    '0 20 * * *',
    async () => {
      try {
        log('Running GitHub activity check...');
        await runGithubCheck();
      } catch (err) {
        console.error('GitHub Cron Error:', err.message);
      }
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );

  // =========================
  // Job Scraper (Every 3 hours)
  // =========================
  cron.schedule(
    '0 */3 * * *',
    async () => {
      try {
        log('Running job scraper...');
        await runJobCheck();
      } catch (err) {
        console.error('Jobs Cron Error:', err.message);
      }
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );
}

module.exports = { startCronJobs };