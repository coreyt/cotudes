/**
 * Unified model adapter interface.
 *
 * Manages model switching between SmolLM2 (local) and frontier API providers.
 */

import { SmolModelAdapter } from './model-smol.js';
import { AnthropicModelAdapter } from './model-anthropic.js';
import { GoogleModelAdapter } from './model-google.js';
import { MistralModelAdapter } from './model-mistral.js';

export const MODEL_OPTIONS = [
  { id: 'smol', label: 'SmolLM2 (Local)', tier: 'smol', requiresKey: false },
  { id: 'anthropic', label: 'Claude Haiku', tier: 'frontier', requiresKey: true, keyName: 'anthropic' },
  { id: 'google', label: 'Gemini Flash', tier: 'frontier', requiresKey: true, keyName: 'google' },
  { id: 'mistral', label: 'Mistral Small', tier: 'frontier', requiresKey: true, keyName: 'mistral' },
];

export class UnifiedModelAdapter {
  constructor() {
    this.currentModelId = null;
    this.adapter = null;
    this._onStatusChange = null;
  }

  onStatusChange(cb) {
    this._onStatusChange = cb;
  }

  getStatus() {
    return this.adapter?.getStatus() || 'idle';
  }

  getContextLimit() {
    return this.adapter?.getContextLimit() || 8192;
  }

  getModelTier() {
    const option = MODEL_OPTIONS.find(o => o.id === this.currentModelId);
    return option?.tier || 'smol';
  }

  async switchModel(modelId, apiKeys = {}) {
    // Destroy current adapter
    if (this.adapter) {
      this.adapter.destroy();
      this.adapter = null;
    }

    this.currentModelId = modelId;
    const option = MODEL_OPTIONS.find(o => o.id === modelId);
    if (!option) throw new Error(`Unknown model: ${modelId}`);

    switch (modelId) {
      case 'smol': {
        this.adapter = new SmolModelAdapter();
        this.adapter.onStatusChange((status, msg) => this._onStatusChange?.(status, msg));
        await this.adapter.initialize();
        break;
      }
      case 'anthropic': {
        this.adapter = new AnthropicModelAdapter();
        this.adapter.onStatusChange((status) => this._onStatusChange?.(status));
        await this.adapter.initialize({ apiKey: apiKeys.anthropic || '' });
        break;
      }
      case 'google': {
        this.adapter = new GoogleModelAdapter();
        this.adapter.onStatusChange((status) => this._onStatusChange?.(status));
        await this.adapter.initialize({ apiKey: apiKeys.google || '' });
        break;
      }
      case 'mistral': {
        this.adapter = new MistralModelAdapter();
        this.adapter.onStatusChange((status) => this._onStatusChange?.(status));
        await this.adapter.initialize({ apiKey: apiKeys.mistral || '' });
        break;
      }
    }
  }

  async *chatStream(messages, system) {
    if (!this.adapter) throw new Error('No model loaded');
    yield* this.adapter.chatStream(messages, system);
  }

  destroy() {
    this.adapter?.destroy();
    this.adapter = null;
    this.currentModelId = null;
  }
}
