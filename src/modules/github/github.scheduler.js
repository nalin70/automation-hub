const fs = require('fs');
const path = require('path');
const { checkTodayActivity } = require('./github.service');
const { sendMessage } = require('../../notifier/telegram.service');
const { log } = require('../../utils/logger');

const STATE_PATH = path.join(__dirname, '../../../data/state.json');

async function runGithubCheck() {
  const username = process.env.GITHUB_USERNAME;

  const result = await checkTodayActivity(username);

  const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));

  const today = new Date().toISOString().slice(0, 10);

  // prevent duplicate check same day
  if (state.lastCheckedDate === today) {
    log('Already checked today');
    return;
  }

  if (result.hasCommitToday) {
    state.streak += 1;

    await sendMessage(
      `✅ You committed ${result.commitCount} time(s) today!\n🔥 Streak: ${state.streak}`
    );
  } else {
    state.streak = 0;

    await sendMessage(
      `⚠️ No commits today!\nBreak your laziness 😄`
    );
  }

  state.lastCheckedDate = today;
  state.hasCommittedToday = result.hasCommitToday;

  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));

  log('GitHub check completed');
}

module.exports = { runGithubCheck };