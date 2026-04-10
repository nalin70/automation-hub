const axios = require('axios');

async function checkTodayActivity(username) {
  const url = `https://api.github.com/users/${username}/events`;

  const res = await axios.get(url);
  const events = res.data;
  console.log('GitHub events:', events);

  const today = new Date().toISOString().slice(0, 10);

  let commitCount = 0;

  events.forEach(event => {
    if (
      event.type === 'PushEvent' &&
      event.created_at.startsWith(today)
    ) {
      commitCount += event.payload.commits.length;
    }
  });

  console.log(`Commits today: ${commitCount}`);

  return {
    hasCommitToday: commitCount > 0,
    commitCount
  };
}

module.exports = { checkTodayActivity };