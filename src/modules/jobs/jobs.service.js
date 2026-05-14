const { fetchJobs } = require('./jobs.scraper');
const { filterJobs } = require('./jobs.filter');
const { prisma } = require('../../lib/prisma');

function toStoredJobData(job) {
  return {
    externalId: job.id || null,
    title: job.title || 'Untitled job',
    company: job.company || 'Unknown company',
    location: job.location || 'Unknown location',
    link: job.link,
    source: job.source || null,
    description: job.description || null,
    postedAtText: job.postedAtText || null,
  };
}

async function saveJob(job) {
  const data = toStoredJobData(job);

  return prisma.job.upsert({
    where: { link: data.link },
    create: data,
    update: data,
  });
}

async function getNewFilteredJobs(userId, options = {}) {
  if (!userId) {
    throw new Error('A user is required to fetch personalized jobs.');
  }

  const jobs = await fetchJobs(options);
  const filtered = filterJobs(jobs, options);
  const newJobs = [];

  for (const job of filtered) {
    if (!job.link) continue;

    const storedJob = await saveJob(job);
    const alreadySent = await prisma.sentJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId: storedJob.id,
        },
      },
    });

    if (!alreadySent) {
      newJobs.push({
        ...job,
        databaseId: storedJob.id,
      });
    }
  }

  return newJobs;
}

async function markJobsSent(userId, jobs, options = {}) {
  if (!userId || !Array.isArray(jobs) || jobs.length === 0) return;

  for (const job of jobs) {
    if (!job.databaseId) continue;

    await prisma.sentJob.upsert({
      where: {
        userId_jobId: {
          userId,
          jobId: job.databaseId,
        },
      },
      create: {
        userId,
        jobId: job.databaseId,
        scheduleId: options.scheduleId || null,
      },
      update: {},
    });
  }
}

async function saveJobPreference(userId, preference) {
  if (!userId) {
    throw new Error('A user is required to save job preferences.');
  }

  const data = {
    domainId: preference.domainId,
    cityId: preference.cityId,
    experienceId: preference.experienceId,
    query: preference.query,
    location: preference.location,
    keywordsJson: JSON.stringify(preference.keywords || []),
    summary: preference.summary || null,
  };

  return prisma.jobPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

function parsePreference(preference) {
  if (!preference) return null;

  let keywords = [];
  try {
    keywords = JSON.parse(preference.keywordsJson || '[]');
  } catch (_) {
    keywords = [];
  }

  return {
    ...preference,
    keywords: Array.isArray(keywords) ? keywords : [],
  };
}

async function getJobPreference(userId) {
  if (!userId) return null;

  const preference = await prisma.jobPreference.findUnique({
    where: { userId },
  });

  return parsePreference(preference);
}

module.exports = {
  getJobPreference,
  getNewFilteredJobs,
  markJobsSent,
  saveJobPreference,
};