import { useState } from 'preact/hooks';
import { MODEL_OPTIONS } from '../lib/model-adapter.js';
import { getApiKeys, setApiKeys } from '../lib/progress.js';

export function ModelSelector({ currentModelId, modelStatus, onModelChange }) {
  const [showSettings, setShowSettings] = useState(false);
  const [keys, setKeys] = useState(() => getApiKeys());

  const handleModelChange = (e) => {
    const modelId = e.target.value;
    const option = MODEL_OPTIONS.find(o => o.id === modelId);

    if (option?.requiresKey && !keys[option.keyName]) {
      // Open settings to enter key
      setShowSettings(true);
      return;
    }

    onModelChange(modelId);
  };

  const handleSaveKeys = () => {
    setApiKeys(keys);
    setShowSettings(false);

    // If the currently selected model needs a key we just entered, switch to it
    const option = MODEL_OPTIONS.find(o => o.id === currentModelId);
    if (option?.requiresKey && keys[option.keyName]) {
      onModelChange(currentModelId);
    }
  };

  const handleKeyChange = (keyName, value) => {
    setKeys(prev => ({ ...prev, [keyName]: value }));
  };

  const statusDotClass = `model-status-dot ${modelStatus || 'idle'}`;

  return (
    <div class="header-controls">
      <div class="model-status">
        <span class={statusDotClass} />
      </div>
      <div class="model-selector">
        <select value={currentModelId} onChange={handleModelChange}>
          {MODEL_OPTIONS.map(option => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button class="btn" onClick={() => setShowSettings(true)} title="Settings">
        &#9881;
      </button>

      {showSettings && (
        <div class="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowSettings(false);
        }}>
          <div class="modal">
            <h3>Settings</h3>

            <div class="modal-field">
              <label>Anthropic API Key (Claude Haiku)</label>
              <input
                type="password"
                value={keys.anthropic || ''}
                onInput={(e) => handleKeyChange('anthropic', e.target.value)}
                placeholder="sk-ant-..."
              />
              <div class="hint">Required for Claude Haiku model</div>
            </div>

            <div class="modal-field">
              <label>Google API Key (Gemini Flash)</label>
              <input
                type="password"
                value={keys.google || ''}
                onInput={(e) => handleKeyChange('google', e.target.value)}
                placeholder="AIza..."
              />
              <div class="hint">Required for Gemini Flash model</div>
            </div>

            <div class="modal-field">
              <label>Mistral API Key (Mistral Small)</label>
              <input
                type="password"
                value={keys.mistral || ''}
                onInput={(e) => handleKeyChange('mistral', e.target.value)}
                placeholder="..."
              />
              <div class="hint">Required for Mistral Small model</div>
            </div>

            <div class="modal-field">
              <div class="warning">
                API keys are stored in your browser's localStorage. Do not use this on shared computers.
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn" onClick={() => setShowSettings(false)}>Cancel</button>
              <button class="btn btn-primary" onClick={handleSaveKeys}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
