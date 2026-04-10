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

const PORT = process.env.PORT || 3000;

// Minimal HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Automation Hub running 🚀');
});

server.listen(PORT, () => {
  log(`Server running on port ${PORT}`);
  startCronJobs();
});