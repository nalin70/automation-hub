const assert = require('assert');
const { formatJobMessageChunks } = require('../src/modules/jobs/jobs.formatter');

const sampleJobs = [
  {
    title: 'React Developer',
    company: 'Acme Tech',
    location: 'Pune, Maharashtra, India',
    source: 'LinkedIn',
    postedAtText: '2 days ago',
    description: 'Build React interfaces for customer-facing dashboards.',
    link: 'https://example.com/react-developer',
  },
  {
    title: 'Frontend Engineer',
    company: 'Bright Labs',
    location: 'Remote',
    link: 'https://example.com/frontend-engineer',
  },
];

const singleMessage = formatJobMessageChunks(sampleJobs, { maxLength: 3800 });

assert.strictEqual(singleMessage.length, 1);
assert(singleMessage[0].includes('New Jobs Found: 2'));
assert(singleMessage[0].includes('1. React Developer'));
assert(singleMessage[0].includes('Company: Acme Tech'));
assert(singleMessage[0].includes('Link: https://example.com/react-developer'));
assert(singleMessage[0].includes('2. Frontend Engineer'));

const chunkedMessages = formatJobMessageChunks(sampleJobs, { maxLength: 360 });

assert(chunkedMessages.length > 1);
assert(chunkedMessages.every(message => message.length <= 360));
assert(chunkedMessages[0].includes('Part 1/'));
assert(chunkedMessages[chunkedMessages.length - 1].includes(`Part ${chunkedMessages.length}/${chunkedMessages.length}`));

console.log('Job formatter fixtures passed.');