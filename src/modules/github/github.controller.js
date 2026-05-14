require('dotenv').config();

const { checkTodayActivity } = require('./github.service');
const { runGithubCheck } = require('./github.scheduler');
const { bot, pollingEnabled } = require('../../notifier/telegram.service');
const { log, error } = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, '../../../data/state.json');

// helper to read state
function readState() {
  if (!fs.existsSync(STATE_PATH)) {
    return {
      streak: 0,
      lastCheckedDate: '',
    };
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
}

if (pollingEnabled) {
  bot.getMe()
    .then(res => console.log('Bot connected:', res.username))
    .catch(err => console.error('Connection failed:', err.message));
}

  bot.on('message', (msg) => {
  console.log('MESSAGE RECEIVED:', msg.text);
});

// =======================
// COMMAND: /check-now
// =======================
bot.onText(/\/check-now/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(chatId, '⏳ Checking GitHub activity...');

    await runGithubCheck();

    await bot.sendMessage(chatId, '✅ Check completed!');
  } catch (err) {
    error(err.message);
    bot.sendMessage(chatId, '❌ Error while checking activity');
  }
});

async function sendGithubStatus(chatId) {
  const username = process.env.GITHUB_USERNAME;

  const result = await checkTodayActivity(username);
  const state = readState();

  let message = `📊 GitHub Status for ${username}\n\n`;

  if (result.hasCommitToday) {
    message += `✅ Commits today: ${result.commitCount}\n`;
  } else {
    message += `❌ No commits today\n`;
  }

  message += `🔥 Current streak: ${state.streak}`;

  await bot.sendMessage(chatId, message);
}

async function handleGithubStatusCommand(msg) {
  const chatId = msg.chat.id;

  try {
    await sendGithubStatus(chatId);
  } catch (err) {
    error(err.message);
    bot.sendMessage(chatId, '❌ Failed to fetch status');
  }
}

// =======================
// COMMAND: /status
// =======================
bot.onText(/\/status/, handleGithubStatusCommand);

// =======================
// COMMAND: /start
// =======================
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `👋 Welcome to GitHub Activity Assistant!

Available commands:
/check-now → Check activity now
/status → View today's status
/jobs → Check matching jobs now
/schedule_jobs daily 08:00 → Schedule daily job recommendations
/schedules → View your schedules
/schedule_pause <id> → Pause a schedule
/schedule_resume <id> → Resume a schedule
/schedule_cancel <id> → Cancel a schedule

Stay consistent 🚀`
  );
});

module.exports = { sendGithubStatus, handleGithubStatusCommand };