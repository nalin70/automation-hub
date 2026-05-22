require('dotenv').config();

const { bot } = require('../../notifier/telegram.service');
const { findOrCreateTelegramUser } = require('../users/users.service');
const { parseAssistantIntent } = require('./assistant.service');
const { routeAssistantIntent } = require('./assistant.router');

function shouldIgnoreMessage(text) {
  if (!text || text.startsWith('/')) return true;
  if (/^\s*(hi|hello)\b/i.test(text)) return true;

  return false;
}

bot.on('message', async (msg) => {
  const text = msg.text || '';

  if (shouldIgnoreMessage(text)) return;

  try {
    const intent = await parseAssistantIntent(text);
    if (intent.intent === 'unknown') return;

    const user = await findOrCreateTelegramUser(msg);
    await routeAssistantIntent(intent, {
      bot,
      chatId: msg.chat.id,
      message: msg,
      user,
    });
  } catch (err) {
    console.error('Assistant controller error:', err.message || String(err));
    await bot.sendMessage(msg.chat.id, `Could not understand that request.\n\n${err.message || String(err)}`);
  }
});

module.exports = { shouldIgnoreMessage };