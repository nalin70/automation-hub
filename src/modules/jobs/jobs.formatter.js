const DEFAULT_MAX_MESSAGE_LENGTH = 3800;
const MAX_DESCRIPTION_LENGTH = 220;

function cleanText(value, fallback = 'Not specified') {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function truncateText(value, maxLength) {
  const text = cleanText(value, '');

  if (!text || text.length <= maxLength) return text;

  return `${text.slice(0, maxLength - 3).trim()}...`;
}

function formatJobBlock(job, index) {
  const lines = [
    `${index}. ${cleanText(job.title, 'Untitled job')}`,
    `Company: ${cleanText(job.company, 'Unknown company')}`,
    `Location: ${cleanText(job.location, 'Unknown location')}`,
  ];

  if (job.source) {
    lines.push(`Source: ${cleanText(job.source)}`);
  }

  if (job.postedAtText) {
    lines.push(`Posted: ${cleanText(job.postedAtText)}`);
  }

  if (job.description) {
    lines.push(`Details: ${truncateText(job.description, MAX_DESCRIPTION_LENGTH)}`);
  }

  lines.push(`Link: ${cleanText(job.link, 'No link available')}`);

  return lines.join('\n');
}

function getHeader(totalJobs, part, totalParts) {
  if (totalParts && totalParts > 1) {
    return `🚀 New Jobs Found: ${totalJobs} (Part ${part}/${totalParts})`;
  }

  return `🚀 New Jobs Found: ${totalJobs}`;
}

function buildChunks(blocks, totalJobs, maxLength) {
  const maxBodyLength = maxLength - 120;
  const chunks = [];
  let current = '';

  for (const block of blocks) {
    const next = current ? `${current}\n\n${block}` : block;

    if (next.length > maxBodyLength && current) {
      chunks.push(current);
      current = block;
      continue;
    }

    current = next;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.map((body, index) => [
    getHeader(totalJobs, index + 1, chunks.length),
    body,
  ].join('\n\n'));
}

function formatJobMessageChunks(jobs, options = {}) {
  if (!Array.isArray(jobs) || jobs.length === 0) return [];

  const maxLength = Number(options.maxLength || DEFAULT_MAX_MESSAGE_LENGTH);
  const blocks = jobs.map((job, index) => formatJobBlock(job, index + 1));

  return buildChunks(blocks, jobs.length, maxLength);
}

module.exports = {
  DEFAULT_MAX_MESSAGE_LENGTH,
  formatJobBlock,
  formatJobMessageChunks,
};