function formatScheduleId(id) {
  return id.slice(0, 8);
}

function formatJobConfig(config = {}) {
  const parts = [];

  if (config.query) parts.push(`Query: ${config.query}`);
  if (config.location) parts.push(`Location: ${config.location}`);
  if (Array.isArray(config.keywords) && config.keywords.length > 0) {
    parts.push(`Keywords: ${config.keywords.join(', ')}`);
  }

  return parts.length > 0 ? `\n${parts.join('\n')}` : '';
}

function formatSchedule(schedule, index) {
  const status = schedule.enabled ? 'Active' : 'Paused';
  const configText = schedule.type === 'jobs' ? formatJobConfig(schedule.config) : '';

  return [
    `${index + 1}. ${schedule.title}`,
    `ID: ${formatScheduleId(schedule.id)}`,
    `Time: ${schedule.frequency} at ${schedule.timeOfDay} (${schedule.timezone})`,
    `Status: ${status}${configText}`,
  ].join('\n');
}

function formatScheduleList(schedules) {
  if (schedules.length === 0) {
    return 'You do not have any schedules yet. Use /schedule_jobs daily 08:00 to add one.';
  }

  return `Your schedules:\n\n${schedules.map(formatSchedule).join('\n\n')}`;
}

function formatScheduleCreated(schedule) {
  return [
    'Schedule created.',
    `${schedule.title}`,
    `Time: ${schedule.frequency} at ${schedule.timeOfDay} (${schedule.timezone})`,
    `ID: ${formatScheduleId(schedule.id)}`,
  ].join('\n');
}

module.exports = {
  formatScheduleCreated,
  formatScheduleId,
  formatScheduleList,
};