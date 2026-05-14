const { getNewFilteredJobs, markJobsSent } = require('./jobs.service');
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

  for (const job of jobs) {
    const company = job.company || 'Unknown company';
    const location = job.location || 'Unknown location';

    await sendMessage(
      `🚀 New Job!\n\n${job.title}\n${company}\n${location}\n${job.link}`,
      chatId
    );
  }

  await markJobsSent(userId, jobs, options);

  return jobs;
}

module.exports = { runJobCheck };