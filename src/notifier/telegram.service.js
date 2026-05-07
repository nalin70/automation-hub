const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const pollingEnabled = process.env.TELEGRAM_POLLING !== 'false';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: pollingEnabled,
});

let stoppedPollingForNetworkError = false;

bot.on('polling_error', async (err) => {
  const message = err.message || String(err);

  console.error('Telegram polling error:', message);

  if (stoppedPollingForNetworkError) return;

  if (message.includes('ENOTFOUND') || message.includes('EAI_AGAIN')) {
    stoppedPollingForNetworkError = true;
    console.error('Telegram polling stopped because api.telegram.org cannot be resolved. Check your DNS/network or set TELEGRAM_POLLING=false for offline runs.');

    try {
      await bot.stopPolling();
    } catch (stopErr) {
      console.error('Telegram polling stop error:', stopErr.message);
    }
  }
});

async function sendMessage(message) {
  try {
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
  } catch (err) {
    console.error('Telegram Error:', err.message);
  }
}

module.exports = { bot, pollingEnabled, sendMessage };