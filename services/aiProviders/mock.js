function createMockProvider() {
  const configured = true;
  async function sendPrompt(prompt, options = {}) {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 200));
    return {
      id: 'mock-1',
      provider: 'mock',
      input: prompt,
      output: `Respuesta simulada para: ${prompt}`,
      raw: {
        choices: [
          {
            text: `Respuesta simulada para: ${prompt}`
          }
        ]
      }
    };
  }

  return { sendPrompt, configured, name: 'mock' };
}

module.exports = createMockProvider;
