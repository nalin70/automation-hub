const { formatOptionsMenu, buildOptionsKeyboard } = require('../greetings/greetings.menu');
const { sendGithubStatus } = require('../github/github.controller');
const { runGithubCheck } = require('../github/github.scheduler');
const { sendJobs, startJobSearch } = require('../jobs/jobs.controller');
const { getJobPreference, saveJobPreference } = require('../jobs/jobs.service');
const { getDefaultJobsConfig } = require('../schedules/schedules.parser');
const { createSchedule, listSchedulesForUser } = require('../schedules/schedules.service');
const { formatScheduleCreated, formatScheduleList } = require('../schedules/schedules.formatter');

async function getScheduleConfig(userId, inputConfig) {
  if (inputConfig) return inputConfig;

  const preference = await getJobPreference(userId);
  if (!preference) return getDefaultJobsConfig();

  return {
    domainId: preference.domainId,
    cityId: preference.cityId,
    experienceId: preference.experienceId,
    query: preference.query,
    location: preference.location,
    keywords: preference.keywords,
    summary: preference.summary,
  };
}

async function routeAssistantIntent(intent, context) {
  const { bot, chatId, user } = context;

  if (intent.intent === 'unknown') {
    return false;
  }

  if (intent.intent === 'help') {
    await bot.sendMessage(chatId, formatOptionsMenu(), {
      reply_markup: buildOptionsKeyboard(),
    });
    return true;
  }

  if (intent.intent === 'github_status') {
    await sendGithubStatus(chatId);
    return true;
  }

  if (intent.intent === 'github_check_now') {
    await bot.sendMessage(chatId, 'Checking GitHub activity...');
    await runGithubCheck(chatId);
    await bot.sendMessage(chatId, 'Check completed.');
    return true;
  }

  if (intent.intent === 'schedules_list') {
    const schedules = await listSchedulesForUser(user.id);
    await bot.sendMessage(chatId, formatScheduleList(schedules));
    return true;
  }

  if (intent.intent === 'jobs_setup_guided') {
    await bot.sendMessage(chatId, 'I need a few job details to find good matches.');
    await startJobSearch(chatId, user.id);
    return true;
  }

  if (intent.intent === 'jobs_search') {
    const options = { ...intent.entities.jobOptions, userId: user.id };

    await saveJobPreference(user.id, options);
    await sendJobs(chatId, options);
    return true;
  }

  if (intent.intent === 'jobs_schedule_create') {
    const input = {
      ...intent.entities.scheduleInput,
      config: await getScheduleConfig(user.id, intent.entities.scheduleInput.config),
    };
    const schedule = await createSchedule(user.id, input);

    if (input.config.domainId && input.config.cityId && input.config.experienceId) {
      await saveJobPreference(user.id, input.config);
    }

    await bot.sendMessage(chatId, formatScheduleCreated(schedule));
    return true;
  }

  return false;
}

module.exports = { routeAssistantIntent };