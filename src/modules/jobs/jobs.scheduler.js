const { getNewFilteredJobs, markJobsSent } = require('./jobs.service');
const { formatJobMessageChunks } = require('./jobs.formatter');
const { sendMessage } = require('../../notifier/telegram.service');
const { findOrCreateTelegramUserByChatId } = require('../users/users.service');

async function resolveUserId(chatId, options) {
  if (options.userId) return options.userId;

  if (!chatId) {
    throw new Error('A chat is required to fetch personalized jobs.');
  }

  const user = await findOrCreateTelegramUserByChatId(chatId);
  return user.id;
}

async function runJobCheck(chatId = process.env.TELEGRAM_CHAT_ID, options = {}) {
  const userId = await resolveUserId(chatId, options);
  const jobs = await getNewFilteredJobs(userId, options);
  const messages = formatJobMessageChunks(jobs);

  for (const message of messages) {
    await sendMessage(message, chatId);
  }

  await markJobsSent(userId, jobs, options);

  return jobs;
}

module.exports = { runJobCheck };