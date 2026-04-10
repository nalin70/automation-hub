const fs = require('fs');
const path = require('path');
const { checkTodayActivity } = require('./github.service');
const { sendMessage } = require('../../notifier/telegram.service');
const { log, error } = require('../../utils/logger');
const { getTodayDate } = require('../../utils/date');

const STATE_PATH = path.join(__dirname, '../../../data/state.json');

function readState() {
  if (!fs.existsSync(STATE_PATH)) {
    return {
      lastCheckedDate: '',
      streak: 0
    };
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
}

function writeState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

async function runGithubCheck() {
  try {
    const username = process.env.GITHUB_USERNAME;
    const today = getTodayDate();

    const state = readState();

    // if (state.lastCheckedDate === today) {
    //   log('Already checked today');
    //   return;
    // }

    const result = await checkTodayActivity(username);
    console.log('GitHub activity result:', result);

    if (result.hasCommitToday) {
      state.streak += 1;

      await sendMessage(
        `✅ ${username} committed ${result.commitCount} time(s) today!\n🔥 Streak: ${state.streak}`
      );
    } else {
      state.streak = 0;

      await sendMessage(
        `⚠️ No commits today for ${username}!\nPush something 🚀`
      );
    }

    state.lastCheckedDate = today;

    writeState(state);

    log('GitHub check completed');
  } catch (err) {
    error(err.message);
  }
}

module.exports = { runGithubCheck };