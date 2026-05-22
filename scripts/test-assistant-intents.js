process.env.LLM_ENABLED = 'false';

const assert = require('assert');
const { parseAssistantIntent } = require('../src/modules/assistant/assistant.service');

async function expectIntent(text, expectedIntent, check) {
  const intent = await parseAssistantIntent(text);

  assert.strictEqual(
    intent.intent,
    expectedIntent,
    `Expected "${text}" to be ${expectedIntent}, received ${intent.intent}`
  );

  if (check) check(intent);
}

async function run() {
  await expectIntent('show my GitHub status', 'github_status');
  await expectIntent('check GitHub now', 'github_check_now');
  await expectIntent('show my reminders', 'schedules_list');
  await expectIntent('what can you do?', 'help');
  await expectIntent('find React fresher jobs in Pune', 'jobs_search', (intent) => {
    assert.strictEqual(intent.entities.jobOptions.domainId, 'react');
    assert.strictEqual(intent.entities.jobOptions.cityId, 'pune');
    assert.strictEqual(intent.entities.jobOptions.experienceId, 'fresher');
  });
  await expectIntent('remind me daily at 8 am for jobs', 'jobs_schedule_create', (intent) => {
    assert.strictEqual(intent.entities.scheduleInput.timeOfDay, '08:00');
    assert.strictEqual(intent.entities.scheduleInput.frequency, 'daily');
  });
  await expectIntent('random unrelated note', 'unknown');

  console.log('Assistant intent fixtures passed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});