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
      event.created_at.startsWith(today) &&
      event.payload
    ) {
      commitCount += 1;
    }
  });

  console.log(`Commits today: ${commitCount}`);

  return {
    hasCommitToday: commitCount > 0,
    commitCount: Number(commitCount)
  };
}

module.exports = { checkTodayActivity };