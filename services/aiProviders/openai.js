const axios = require('axios');

function createOpenAIProvider() {
  const API_URL = process.env.AI_API_URL;
  const API_KEY = process.env.AI_API_KEY;
  const MODEL = process.env.AI_MODEL || undefined;

  const configured = !!(API_URL && API_KEY);

  async function sendPrompt(prompt, options = {}) {
    if (!configured) throw new Error('OpenAI provider no configurado');

    const payload = Object.assign({}, options);
    if (MODEL && !payload.model) payload.model = MODEL;
    // Keep a minimal generic payload: { prompt, model, ...options }
    payload.prompt = prompt;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    };

    const res = await axios.post(API_URL, payload, { headers, timeout: 20000 });
    return res.data;
  }

  return { sendPrompt, configured, name: 'openai' };
}

module.exports = createOpenAIProvider;
