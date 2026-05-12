const { runJobCheck } = require('../jobs/jobs.scheduler');
const { sendMessage } = require('../../notifier/telegram.service');
const {
  getDueSchedules,
  markScheduleRunFinished,
  markScheduleRunStarted,
} = require('./schedules.service');
const { log, error } = require('../../utils/logger');

let isRunning = false;

async function runDueSchedules() {
  if (isRunning) return;

  isRunning = true;

  try {
    const schedules = await getDueSchedules();

    for (const schedule of schedules) {
      await runSchedule(schedule);
    }
  } finally {
    isRunning = false;
  }
}

async function runSchedule(schedule) {
  const run = await markScheduleRunStarted(schedule.id);
  const chatId = schedule.user.telegramChatId;

  try {
    if (schedule.type === 'jobs') {
      log(`Running schedule ${schedule.id} for chat ${chatId}`);
      const jobs = await runJobCheck(chatId, schedule.config);

      if (jobs.length === 0) {
        await sendMessage('No new matching jobs found for your scheduled reminder.', chatId);
      }

      await markScheduleRunFinished(schedule, run, 'success', {
        message: `Sent ${jobs.length} job(s).`,
      });
      return;
    }

    throw new Error(`Unsupported schedule type: ${schedule.type}`);
  } catch (err) {
    const message = err.message || String(err);

    error(`Schedule ${schedule.id} failed: ${message}`);
    await sendMessage(`Scheduled ${schedule.title} failed.\n\n${message}`, chatId);
    await markScheduleRunFinished(schedule, run, 'failed', { error: message });
  }
}

module.exports = { runDueSchedules };