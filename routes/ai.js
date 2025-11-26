const express = require('express');
const router = express.Router();

module.exports = (createAIClient) => {
  const ai = createAIClient();

  router.get('/ai', (req, res) => {
    const error = ai.configured
      ? null
      : `AI no está configurado para el proveedor '${ai.provider}'. Para habilitarlo, establece AI_PROVIDER (openai|anthropic) y AI_API_URL/AI_API_KEY en .env, o usa AI_PROVIDER=mock para desarrollo.`;

    res.render('ai', { result: null, error, provider: ai.provider, configured: ai.configured });
  });

  router.post('/ai', async (req, res) => {
    const { prompt } = req.body || {};
    if (!prompt) return res.render('ai', { result: null, error: 'Proporciona un prompt', provider: ai.provider, configured: ai.configured });

    if (!ai.configured) {
      return res.render('ai', { result: null, error: `AI no está configurado para el proveedor '${ai.provider}'. Habilítalo o cambia a 'mock'.`, provider: ai.provider, configured: ai.configured });
    }

    try {
      const data = await ai.sendPrompt(prompt, { max_tokens: 400 });
      res.render('ai', { result: JSON.stringify(data, null, 2), error: null, provider: ai.provider, configured: ai.configured });
    } catch (err) {
      console.error('Error AI:', err && err.message ? err.message : err);
      res.render('ai', { result: null, error: 'Error al llamar al proveedor AI. Revisa logs y configuración.', provider: ai.provider, configured: ai.configured });
    }
  });

  return router;
};
