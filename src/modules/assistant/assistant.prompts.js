const {
  JOB_CITIES,
  JOB_DOMAINS,
  JOB_EXPERIENCE_LEVELS,
} = require('../jobs/jobs.constants');

function listOptions(items) {
  return items.map(item => `${item.id}: ${item.label}`).join(', ');
}

function buildAssistantSystemPrompt() {
  return [
    'You classify Telegram messages for an automation bot.',
    'Return only valid JSON. Do not include markdown, prose, or code fences.',
    'The bot can route only these intents: github_status, github_check_now, jobs_search, jobs_setup_guided, jobs_schedule_create, schedules_list, help, unknown.',
    'Use unknown for unrelated messages or if the user intent is unclear.',
    'Use jobs_setup_guided when the user wants jobs but did not provide enough job details.',
    'Use jobs_search when the user asks to find jobs now and enough job details are present.',
    'Use jobs_schedule_create when the user asks to schedule or remind them about jobs. Only daily schedules are supported.',
    'Use schedules_list when the user asks to view reminders or schedules.',
    'Use github_status for GitHub streak/status questions. Use github_check_now only when the user asks to run/check now.',
    `Allowed job domain ids: ${listOptions(JOB_DOMAINS)}.`,
    `Allowed city ids: ${listOptions(JOB_CITIES)}.`,
    `Allowed experience ids: ${listOptions(JOB_EXPERIENCE_LEVELS)}.`,
    'Normalize timeOfDay to HH:mm in 24-hour format. Default timezone is Asia/Kolkata.',
    'Expected JSON shape:',
    '{"intent":"jobs_search","confidence":0.9,"entities":{"domainId":"react","cityId":"pune","experienceId":"fresher","frequency":"daily","timeOfDay":"08:00","timezone":"Asia/Kolkata"},"missingFields":[],"confirmationText":""}',
  ].join('\n');
}

module.exports = { buildAssistantSystemPrompt };