require('dotenv').config();

const { runJobCheck } = require('./jobs.scheduler');
const { bot } = require('../../notifier/telegram.service');
const { findOrCreateTelegramUser } = require('../users/users.service');
const { saveJobPreference } = require('./jobs.service');
const {
  JOB_CITIES,
  JOB_DOMAINS,
  JOB_EXPERIENCE_LEVELS,
} = require('./jobs.constants');

const CALLBACK_PREFIX = 'jobs:';
const CALLBACK_CANCEL = 'jobs:cancel';
const pendingJobSelections = new Map();

function chunk(items, size) {
  const rows = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
}

function toKeyboard(items, action) {
  return [
    ...chunk(items.map(item => ({
      text: item.label,
      callback_data: `${CALLBACK_PREFIX}${action}:${item.id}`,
    })), 2),
    [{ text: 'Cancel', callback_data: CALLBACK_CANCEL }],
  ];
}

function findById(items, id) {
  return items.find(item => item.id === id);
}

function buildJobOptions(selection) {
  const query = `${selection.domain.query} ${selection.experience.query}`;

  return {
    domainId: selection.domain.id,
    cityId: selection.city.id,
    experienceId: selection.experience.id,
    query,
    location: selection.city.location,
    keywords: selection.domain.keywords,
    summary: `${selection.domain.label} jobs in ${selection.city.label} for ${selection.experience.label}`,
  };
}

async function sendJobs(chatId, options = {}) {
  const summary = options.summary ? `\n${options.summary}` : '';

  await bot.sendMessage(chatId, `🔍 Fetching jobs...${summary}`);
  const jobs = await runJobCheck(chatId, options);

  if (jobs.length === 0) {
    await bot.sendMessage(chatId, 'No new matching jobs found.');
    return;
  }

  await bot.sendMessage(chatId, `✅ Done! Sent ${jobs.length} job(s).`);
}

async function startJobSearch(chatId, userId) {
  pendingJobSelections.set(chatId, { userId });

  await bot.sendMessage(chatId, 'Choose a job domain:', {
    reply_markup: {
      inline_keyboard: toKeyboard(JOB_DOMAINS, 'domain'),
    },
  });
}

async function askForCity(chatId) {
  await bot.sendMessage(chatId, 'Choose a city:', {
    reply_markup: {
      inline_keyboard: toKeyboard(JOB_CITIES, 'city'),
    },
  });
}

async function askForExperience(chatId) {
  await bot.sendMessage(chatId, 'Choose your experience:', {
    reply_markup: {
      inline_keyboard: toKeyboard(JOB_EXPERIENCE_LEVELS, 'experience'),
    },
  });
}

bot.on('callback_query', async (query) => {
  const data = query.data || '';

  if (!data.startsWith(CALLBACK_PREFIX)) return;

  const chatId = query.message && query.message.chat.id;
  if (!chatId) return;

  try {
    if (data === CALLBACK_CANCEL) {
      pendingJobSelections.delete(chatId);
      await bot.answerCallbackQuery(query.id, { text: 'Cancelled' });
      await bot.sendMessage(chatId, 'Job search cancelled.');
      return;
    }

    const [, action, id] = data.split(':');
    const selection = pendingJobSelections.get(chatId) || {};

    if (action === 'domain') {
      const domain = findById(JOB_DOMAINS, id);
      if (!domain) return;

      pendingJobSelections.set(chatId, { ...selection, domain });
      await bot.answerCallbackQuery(query.id, { text: domain.label });
      await askForCity(chatId);
      return;
    }

    if (action === 'city') {
      const city = findById(JOB_CITIES, id);
      if (!city) return;

      pendingJobSelections.set(chatId, { ...selection, city });
      await bot.answerCallbackQuery(query.id, { text: city.label });
      await askForExperience(chatId);
      return;
    }

    if (action === 'experience') {
      const experience = findById(JOB_EXPERIENCE_LEVELS, id);
      if (!experience || !selection.domain || !selection.city) return;

      const user = selection.userId
        ? { id: selection.userId }
        : await findOrCreateTelegramUser({ from: query.from, chat: query.message.chat });
      const options = buildJobOptions({ ...selection, experience });

      pendingJobSelections.delete(chatId);
      await bot.answerCallbackQuery(query.id, { text: experience.label });
      await saveJobPreference(user.id, options);
      await sendJobs(chatId, { ...options, userId: user.id });
    }
  } catch (err) {
    const message = err.message || String(err);

    console.error('Jobs selection error:', message);
    pendingJobSelections.delete(chatId);
    await bot.sendMessage(chatId, `❌ Failed to fetch jobs\n\n${message}`);
  }
});

async function handleJobsCommand(msg) {
  const chatId = msg.chat.id;
  console.log('JOB CHECK TRIGGERED:', msg.text);

  try {
    const user = await findOrCreateTelegramUser(msg);
    await startJobSearch(chatId, user.id);
  } catch (err) {
    const message = err.message || String(err);

    console.error('Jobs command error:', message);
    await bot.sendMessage(chatId, `❌ Failed to fetch jobs\n\n${message}`);
  }
}

// manual trigger
bot.onText(/\/jobs/, handleJobsCommand);

module.exports = { handleJobsCommand, sendJobs, startJobSearch };