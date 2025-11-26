const path = require('path');

function createAIClient() {
  // Selecciona proveedor por env: AI_PROVIDER (openai|anthropic|mock)
  const envProvider = (process.env.AI_PROVIDER || '').toLowerCase();
  const autoDetect = process.env.AI_API_URL && process.env.AI_API_KEY;
  const providerName = envProvider || (autoDetect ? 'openai' : 'mock');

  let providerFactory;
  try {
    providerFactory = require(path.join(__dirname, 'aiProviders', providerName));
  } catch (err) {
    console.warn(`Proveedor AI '${providerName}' no encontrado, usando 'mock'`);
    providerFactory = require(path.join(__dirname, 'aiProviders', 'mock'));
  }

  const provider = providerFactory();
  const configured = !!(provider && provider.configured);

  if (!configured) {
    console.warn(`AI provider '${provider.name || providerName}' no está configurado. Usa modo 'mock' para desarrollo o establece variables en .env`);
  }

  async function sendPrompt(prompt, options = {}) {
    if (!configured) throw new Error(`AI provider '${provider.name || providerName}' no configurado`);
    return provider.sendPrompt(prompt, options);
  }

  return { sendPrompt, configured, provider: provider.name || providerName };
}

module.exports = createAIClient;
