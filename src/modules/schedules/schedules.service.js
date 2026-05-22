const { prisma } = require('../../lib/prisma');

function parseConfig(schedule) {
  if (!schedule) return schedule;

  try {
    return {
      ...schedule,
      config: JSON.parse(schedule.configJson || '{}'),
    };
  } catch (_) {
    return {
      ...schedule,
      config: {},
    };
  }
}

function getZonedParts(date, timezone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const values = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  }

  if (values.hour === 24) values.hour = 0;

  return values;
}

function localTimeToUtc(year, month, day, hour, minute, timezone) {
  let utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const target = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let index = 0; index < 3; index += 1) {
    const parts = getZonedParts(utcDate, timezone);
    const actual = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second || 0);
    utcDate = new Date(utcDate.getTime() + target - actual);
  }

  return utcDate;
}

function calculateNextRunAt(timeOfDay, timezone, fromDate = new Date()) {
  const [hour, minute] = timeOfDay.split(':').map(Number);
  const localNow = getZonedParts(fromDate, timezone);
  let targetDate = new Date(Date.UTC(localNow.year, localNow.month - 1, localNow.day, hour, minute, 0));
  let nextRunAt = localTimeToUtc(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth() + 1,
    targetDate.getUTCDate(),
    hour,
    minute,
    timezone
  );

  if (nextRunAt <= fromDate) {
    targetDate = new Date(Date.UTC(localNow.year, localNow.month - 1, localNow.day + 1, hour, minute, 0));
    nextRunAt = localTimeToUtc(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth() + 1,
      targetDate.getUTCDate(),
      hour,
      minute,
      timezone
    );
  }

  return nextRunAt;
}

async function createSchedule(userId, input) {
  const duplicate = await prisma.schedule.findFirst({
    where: {
      userId,
      type: input.type,
      frequency: input.frequency,
      timeOfDay: input.timeOfDay,
      enabled: true,
    },
  });

  if (duplicate) {
    throw new Error('You already have an active schedule like this.');
  }

  const schedule = await prisma.schedule.create({
    data: {
      userId,
      type: input.type,
      title: input.title,
      frequency: input.frequency,
      timeOfDay: input.timeOfDay,
      timezone: input.timezone,
      configJson: JSON.stringify(input.config || {}),
      nextRunAt: calculateNextRunAt(input.timeOfDay, input.timezone),
    },
  });

  return parseConfig(schedule);
}

async function listSchedulesForUser(userId) {
  const schedules = await prisma.schedule.findMany({
    where: { userId },
    orderBy: [{ enabled: 'desc' }, { nextRunAt: 'asc' }],
  });

  return schedules.map(parseConfig);
}

async function setScheduleEnabledForUser(userId, scheduleId, enabled) {
  const schedule = await prisma.schedule.findFirst({
    where: {
      userId,
      OR: [
        { id: scheduleId },
        { id: { startsWith: scheduleId } },
      ],
    },
  });

  if (!schedule) {
    throw new Error('Schedule not found.');
  }

  const updated = await prisma.schedule.update({
    where: { id: schedule.id },
    data: {
      enabled,
      nextRunAt: enabled ? calculateNextRunAt(schedule.timeOfDay, schedule.timezone) : schedule.nextRunAt,
    },
  });

  return parseConfig(updated);
}

async function cancelScheduleForUser(userId, scheduleId) {
  const schedule = await prisma.schedule.findFirst({
    where: {
      userId,
      OR: [
        { id: scheduleId },
        { id: { startsWith: scheduleId } },
      ],
    },
  });

  if (!schedule) {
    throw new Error('Schedule not found.');
  }

  await prisma.schedule.delete({ where: { id: schedule.id } });
}

async function getDueSchedules(now = new Date()) {
  const schedules = await prisma.schedule.findMany({
    where: {
      enabled: true,
      nextRunAt: {
        lte: now,
      },
    },
    include: { user: true },
    orderBy: { nextRunAt: 'asc' },
  });

  return schedules.map(parseConfig);
}

async function markScheduleRunStarted(scheduleId) {
  return prisma.scheduleRun.create({
    data: {
      scheduleId,
      status: 'running',
    },
  });
}

async function markScheduleRunFinished(schedule, run, status, details = {}) {
  const nextRunAt = calculateNextRunAt(schedule.timeOfDay, schedule.timezone, new Date(Date.now() + 1000));

  await prisma.$transaction([
    prisma.scheduleRun.update({
      where: { id: run.id },
      data: {
        status,
        message: details.message || null,
        error: details.error || null,
        finishedAt: new Date(),
      },
    }),
    prisma.schedule.update({
      where: { id: schedule.id },
      data: {
        lastRunAt: new Date(),
        nextRunAt,
      },
    }),
  ]);
}

module.exports = {
  calculateNextRunAt,
  cancelScheduleForUser,
  createSchedule,
  getDueSchedules,
  listSchedulesForUser,
  markScheduleRunFinished,
  markScheduleRunStarted,
  parseConfig,
  setScheduleEnabledForUser,
};