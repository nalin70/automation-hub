require('dotenv').config();

const { bot } = require('../../notifier/telegram.service');
const { getJobPreference } = require('../jobs/jobs.service');
const { findOrCreateTelegramUser } = require('../users/users.service');
const {
  cancelScheduleForUser,
  createSchedule,
  listSchedulesForUser,
  setScheduleEnabledForUser,
} = require('./schedules.service');
const {
  parseScheduleJobsCommand,
} = require('./schedules.parser');
const {
  formatScheduleCreated,
  formatScheduleList,
} = require('./schedules.formatter');

async function applySavedJobsConfig(userId, input) {
  if (input.type !== 'jobs') return input;

  const preference = await getJobPreference(userId);
  if (!preference) return input;

  return {
    ...input,
    config: {
      domainId: preference.domainId,
      cityId: preference.cityId,
      experienceId: preference.experienceId,
      query: preference.query,
      location: preference.location,
      keywords: preference.keywords,
      summary: preference.summary,
    },
  };
}

bot.onText(/\/schedule_jobs(?:\s+.+)?/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const user = await findOrCreateTelegramUser(msg);
    const input = await applySavedJobsConfig(user.id, parseScheduleJobsCommand(msg.text));
    const schedule = await createSchedule(user.id, input);

    await bot.sendMessage(chatId, formatScheduleCreated(schedule));
  } catch (err) {
    await bot.sendMessage(chatId, `Could not create schedule.\n\n${err.message || String(err)}`);
  }
});

bot.onText(/\/(schedules|reminders)\b/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const user = await findOrCreateTelegramUser(msg);
    const schedules = await listSchedulesForUser(user.id);

    await bot.sendMessage(chatId, formatScheduleList(schedules));
  } catch (err) {
    await bot.sendMessage(chatId, `Could not load schedules.\n\n${err.message || String(err)}`);
  }
});

bot.onText(/\/schedule_pause\s+(\S+)/, async (msg, match) => {
  await updateScheduleStatus(msg, match[1], false, 'paused');
});

bot.onText(/\/schedule_resume\s+(\S+)/, async (msg, match) => {
  await updateScheduleStatus(msg, match[1], true, 'resumed');
});

bot.onText(/\/schedule_cancel\s+(\S+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  try {
    const user = await findOrCreateTelegramUser(msg);
    await cancelScheduleForUser(user.id, match[1]);

    await bot.sendMessage(chatId, 'Schedule cancelled.');
  } catch (err) {
    await bot.sendMessage(chatId, `Could not cancel schedule.\n\n${err.message || String(err)}`);
  }
});

async function updateScheduleStatus(msg, scheduleId, enabled, action) {
  const chatId = msg.chat.id;

  try {
    const user = await findOrCreateTelegramUser(msg);
    await setScheduleEnabledForUser(user.id, scheduleId, enabled);

    await bot.sendMessage(chatId, `Schedule ${action}.`);
  } catch (err) {
    await bot.sendMessage(chatId, `Could not update schedule.\n\n${err.message || String(err)}`);
  }
}