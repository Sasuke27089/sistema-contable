const axios = require('axios');

function createAIClient() {
  const API_URL = process.env.AI_API_URL;
  const API_KEY = process.env.AI_API_KEY;
  const MODEL = process.env.AI_MODEL || undefined;

  if (!API_URL || !API_KEY) {
    console.warn('AI client no está configurado: configure AI_API_URL y AI_API_KEY en .env');
  }

  async function sendPrompt(prompt, options = {}) {
    if (!API_URL || !API_KEY) throw new Error('AI client no configurado');

    const payload = Object.assign({ prompt }, options);
    if (MODEL) payload.model = MODEL;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    };

    const res = await axios.post(API_URL, payload, { headers, timeout: 20000 });
    return res.data;
  }

  return { sendPrompt };
}

module.exports = createAIClient;
