require('dotenv').config();

const { bot } = require('../../notifier/telegram.service');
const { findOrCreateTelegramUser } = require('../users/users.service');
const {
  cancelScheduleForUser,
  createSchedule,
  listSchedulesForUser,
  setScheduleEnabledForUser,
} = require('./schedules.service');
const {
  parseNaturalJobsReminder,
  parseScheduleJobsCommand,
} = require('./schedules.parser');
const {
  formatScheduleCreated,
  formatScheduleList,
} = require('./schedules.formatter');

bot.onText(/\/schedule_jobs(?:\s+.+)?/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const user = await findOrCreateTelegramUser(msg);
    const input = parseScheduleJobsCommand(msg.text);
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

bot.on('message', async (msg) => {
  const text = msg.text || '';

  if (!text || text.startsWith('/')) return;

  try {
    const input = parseNaturalJobsReminder(text);
    if (!input) return;

    const user = await findOrCreateTelegramUser(msg);
    const schedule = await createSchedule(user.id, input);

    await bot.sendMessage(msg.chat.id, formatScheduleCreated(schedule));
  } catch (err) {
    await bot.sendMessage(msg.chat.id, `Could not create reminder.\n\n${err.message || String(err)}`);
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