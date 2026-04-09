const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

async function sendMessage(message) {
  try {
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
  } catch (err) {
    console.error('Telegram Error:', err.message);
  }
}

module.exports = { sendMessage };