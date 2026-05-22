const axios = require('axios');
const { buildAssistantSystemPrompt } = require('./assistant.prompts');
const { normalizeAssistantIntent } = require('./assistant.schema');

function isLlmEnabled() {
  return process.env.LLM_ENABLED !== 'false' && Boolean(process.env.OPENAI_API_KEY);
}

function extractJson(content) {
  const text = String(content || '').trim();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

function parseFallbackIntent(text) {
  const normalizedText = String(text || '').trim().toLowerCase();

  if (!normalizedText) {
    return { intent: 'unknown', confidence: 0, entities: {}, source: 'fallback' };
  }

  if (/\b(help|menu|what can you do)\b/.test(normalizedText)) {
    return { intent: 'help', confidence: 0.9, entities: {}, source: 'fallback' };
  }

  if (/\b(show|list|view)\b/.test(normalizedText) && /\b(reminders?|schedules?)\b/.test(normalizedText)) {
    return { intent: 'schedules_list', confidence: 0.9, entities: {}, source: 'fallback' };
  }

  if (/\b(github|commit|streak)\b/.test(normalizedText)) {
    const checkNow = /\b(check|run|fetch)\b/.test(normalizedText) && /\b(now|today)\b/.test(normalizedText);

    return {
      intent: checkNow ? 'github_check_now' : 'github_status',
      confidence: 0.85,
      entities: {},
      source: 'fallback',
    };
  }

  if (/\b(job|jobs|hiring|opening|openings)\b/.test(normalizedText)) {
    const scheduleIntent = /\b(remind|reminder|schedule|daily|every day|morning|evening)\b/.test(normalizedText);
    const timeMatch = normalizedText.match(/\bat\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)
      || normalizedText.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i);

    return {
      intent: scheduleIntent ? 'jobs_schedule_create' : 'jobs_search',
      confidence: 0.8,
      entities: {
        timeOfDay: timeMatch ? timeMatch[1] : null,
        frequency: scheduleIntent ? 'daily' : null,
      },
      source: 'fallback',
    };
  }

  return { intent: 'unknown', confidence: 0, entities: {}, source: 'fallback' };
}

async function parseAssistantIntent(text) {
  if (!isLlmEnabled()) {
    return normalizeAssistantIntent(parseFallbackIntent(text), text);
  }

  try {
    const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.LLM_MODEL || 'gpt-4o-mini';
    const response = await axios.post(
      `${baseUrl.replace(/\/$/, '')}/chat/completions`,
      {
        model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildAssistantSystemPrompt() },
          { role: 'user', content: text },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: Number(process.env.LLM_TIMEOUT_MS || 15000),
      }
    );

    const content = response.data && response.data.choices
      && response.data.choices[0]
      && response.data.choices[0].message
      && response.data.choices[0].message.content;
    const rawIntent = extractJson(content);

    return normalizeAssistantIntent({ ...rawIntent, source: 'llm' }, text);
  } catch (err) {
    console.error('Assistant LLM error:', err.message || String(err));
    return normalizeAssistantIntent(parseFallbackIntent(text), text);
  }
}

module.exports = {
  isLlmEnabled,
  parseAssistantIntent,
  parseFallbackIntent,
};