const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const { runJobCheck } = require('./jobs.scheduler');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

// manual trigger
bot.onText(/\/jobs/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(chatId, '🔍 Fetching jobs...');
  await runJobCheck();
  await bot.sendMessage(chatId, '✅ Done!');
});