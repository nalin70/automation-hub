require('dotenv').config();

const { bot } = require('../../notifier/telegram.service');
const { sendGithubStatus } = require('../github/github.controller');
const { startJobSearch } = require('../jobs/jobs.controller');
const { findOrCreateTelegramUser } = require('../users/users.service');
const {
  CALLBACK_GITHUB_STATUS,
  CALLBACK_JOBS,
  buildOptionsKeyboard,
  formatOptionsMenu,
} = require('./greetings.menu');

function isGreeting(text) {
  return /^\s*(hi|hello)\b/i.test(text || '');
}

bot.on('message', async (msg) => {
  const text = msg.text || '';

  if (!isGreeting(text) || text.startsWith('/')) return;

  await bot.sendMessage(msg.chat.id, formatOptionsMenu(), {
    reply_markup: buildOptionsKeyboard(),
  });
});

bot.on('callback_query', async (query) => {
  if (![CALLBACK_JOBS, CALLBACK_GITHUB_STATUS].includes(query.data)) return;

  const chatId = query.message && query.message.chat.id;

  if (!chatId) return;

  try {
    if (query.data === CALLBACK_JOBS) {
      const user = await findOrCreateTelegramUser({ from: query.from, chat: query.message.chat });

      await bot.answerCallbackQuery(query.id, { text: 'Choose job details' });
      await startJobSearch(chatId, user.id);
      return;
    }

    if (query.data === CALLBACK_GITHUB_STATUS) {
      await bot.answerCallbackQuery(query.id, { text: 'Checking GitHub status...' });
      await sendGithubStatus(chatId);
    }
  } catch (err) {
    const message = err.message || String(err);

    console.error('Greeting callback error:', message);
    await bot.sendMessage(chatId, `Could not complete that action.\n\n${message}`);
  }
});