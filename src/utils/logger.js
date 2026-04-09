function log(message, type = 'INFO') {
  console.log(`[${type}] [${new Date().toISOString()}] ${message}`);
}

function error(message) {
  log(message, 'ERROR');
}

module.exports = { log, error };