/**
 * Mistral API adapter (OpenAI-compatible chat completions).
 */

const API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MODEL = 'mistral-small-latest';

export class MistralModelAdapter {
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
    if (!this.apiKey) throw new Error('Mistral API key not set');

    this._setStatus('generating');

    const msgs = [];
    if (system) {
      msgs.push({ role: 'system', content: system });
    }
    msgs.push(...messages.map(m => ({ role: m.role, content: m.content })));

    const body = {
      model: MODEL,
      messages: msgs,
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 0.9,
      stream: true,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Mistral API error: ${response.status} ${err}`);
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
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);
            const text = event.choices?.[0]?.delta?.content;
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
    return 32000;
  }

  destroy() {
    this._setStatus('idle');
  }
}
