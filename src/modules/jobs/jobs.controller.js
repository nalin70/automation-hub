require('dotenv').config();

const { runJobCheck } = require('./jobs.scheduler');
const { bot } = require('../../notifier/telegram.service');

// manual trigger
bot.onText(/\/jobs/, async (msg) => {
  const chatId = msg.chat.id;
  console.log('JOB CHECK TRIGGERED:', msg.text);

  try {
    await bot.sendMessage(chatId, '🔍 Fetching jobs...');
    const jobs = await runJobCheck();

    if (jobs.length === 0) {
      await bot.sendMessage(chatId, 'No new matching jobs found.');
      return;
    }

    await bot.sendMessage(chatId, `✅ Done! Sent ${jobs.length} job(s).`);
  } catch (err) {
    console.error('Jobs command error:', err.message);
    await bot.sendMessage(chatId, '❌ Failed to fetch jobs');
  }
});