const express = require('express');
const router = express.Router();

module.exports = (createAIClient) => {
  const ai = createAIClient();

  router.get('/ai', (req, res) => {
    res.render('ai', { result: null, error: null });
  });

  router.post('/ai', async (req, res) => {
    const { prompt } = req.body || {};
    if (!prompt) return res.render('ai', { result: null, error: 'Proporciona un prompt' });

    try {
      const data = await ai.sendPrompt(prompt, { max_tokens: 400 });
      res.render('ai', { result: JSON.stringify(data, null, 2), error: null });
    } catch (err) {
      console.error('Error AI:', err && err.message ? err.message : err);
      res.render('ai', { result: null, error: 'Error al llamar al proveedor AI. Revisa logs y configuración.' });
    }
  });

  return router;
};
