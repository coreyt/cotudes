/**
 * Anthropic Messages API adapter (Claude Haiku).
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

export class AnthropicModelAdapter {
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
    if (!this.apiKey) throw new Error('Anthropic API key not set');

    this._setStatus('generating');

    const body = {
      model: MODEL,
      max_tokens: 1024,
      system: system || undefined,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Anthropic API error: ${response.status} ${err}`);
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
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);
            if (event.type === 'content_block_delta' && event.delta?.text) {
              yield event.delta.text;
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
    return 200000;
  }

  destroy() {
    this._setStatus('idle');
  }
}
