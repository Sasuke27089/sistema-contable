const axios = require('axios');

function createAnthropicProvider() {
  const API_URL = process.env.AI_API_URL;
  const API_KEY = process.env.AI_API_KEY;
  const MODEL = process.env.AI_MODEL || undefined;

  const configured = !!(API_URL && API_KEY);

  async function sendPrompt(prompt, options = {}) {
    if (!configured) throw new Error('Anthropic provider no configurado');

    const payload = Object.assign({}, options);
    if (MODEL && !payload.model) payload.model = MODEL;
    payload.prompt = prompt;

    // Some Anthropic endpoints expect an API key header 'x-api-key' or Authorization, keep both possibilities
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      Authorization: `Bearer ${API_KEY}`
    };

    const res = await axios.post(API_URL, payload, { headers, timeout: 20000 });
    return res.data;
  }

  return { sendPrompt, configured, name: 'anthropic' };
}

module.exports = createAnthropicProvider;
