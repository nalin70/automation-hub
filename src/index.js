// require('dotenv').config();

// const http = require('http');
// const { startCronJobs } = require('./scheduler/cron');
// const { log } = require('./utils/logger');

// // 👇 load controller
// require('./modules/github/github.controller');

// const PORT = process.env.PORT || 3000;

// // Simple server for Render
// const server = http.createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('Automation Hub is running 🚀');
// });

// server.listen(PORT, () => {
//   log(`Server running on port ${PORT}`);
//   startCronJobs();
// });

require('dotenv').config();

const http = require('http');
const { startCronJobs } = require('./scheduler/cron');
const { log } = require('./utils/logger');

// load bot controller
require('./modules/github/github.controller');
require('./modules/jobs/jobs.controller');
require('./modules/greetings/greetings.controller');
require('./modules/schedules/schedules.controller');

const PORT = process.env.PORT || 3000;

// Minimal HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Automation Hub running 🚀');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing app process or set PORT to another value.`);
    process.exit(1);
  }

  throw err;
});

server.listen(PORT, () => {
  log(`Server running on port ${PORT}`);
  startCronJobs();
});