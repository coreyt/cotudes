/**
 * Google Generative AI API adapter (Gemini Flash).
 */

const MODEL = 'gemini-2.0-flash';

function getApiUrl(apiKey) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
}

export class GoogleModelAdapter {
  constructor() {
    this.apiKey = '';
    this.status = 'idle';
    this._onStatusChange = null;
  }

  onStatusChange(cb) {
    this._onStatusChange = cb;
  }

  _setStatus(status) {
    this.status = status;
    this._onStatusChange?.(status);
  }

  async initialize(config) {
    this.apiKey = config.apiKey;
    if (this.apiKey) {
      this._setStatus('ready');
    }
  }

  async *chatStream(messages, system) {
    if (!this.apiKey) throw new Error('Google API key not set');

    this._setStatus('generating');

    // Convert messages to Gemini format
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body = {
      contents,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      },
    };

    if (system) {
      body.systemInstruction = { parts: [{ text: system }] };
    }

    try {
      const response = await fetch(getApiUrl(this.apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Google API error: ${response.status} ${err}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);

          try {
            const event = JSON.parse(data);
            const text = event.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              yield text;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } finally {
      this._setStatus('ready');
    }
  }

  getStatus() {
    return this.status;
  }

  getContextLimit() {
    return 1000000;
  }

  destroy() {
    this._setStatus('idle');
  }
}
