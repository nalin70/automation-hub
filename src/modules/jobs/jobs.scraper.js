const axios = require('axios');

async function fetchJobs() {
  // Example: mock or simple API (replace later with real scraper)
  return [
    {
      id: '1',
      title: 'Node.js Developer',
      company: 'ABC',
      location: 'Remote',
      link: 'https://example.com/job/1'
    }
  ];
}

module.exports = { fetchJobs };