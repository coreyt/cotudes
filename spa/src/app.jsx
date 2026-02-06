import { render } from 'preact';
import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { CurriculumNav } from './components/CurriculumNav.jsx';
import { PhaseTabs } from './components/PhaseTabs.jsx';
import { EtudeViewer } from './components/EtudeViewer.jsx';
import { ChatPanel, TokenGauge } from './components/ChatPanel.jsx';
import { ModelSelector } from './components/ModelSelector.jsx';
import { UnifiedModelAdapter } from './lib/model-adapter.js';
import { assembleSystemPrompt } from './lib/prompt-engine.js';
import {
  getEtudeProgress,
  setCurrentPhase,
  completePhase,
  getApiKeys,
  getModelPreference,
  setModelPreference,
} from './lib/progress.js';

function App() {
  const [manifest, setManifest] = useState(null);
  const [etudes, setEtudes] = useState([]);
  const [selectedEtudeId, setSelectedEtudeId] = useState(null);
  const [currentPractice, setCurrentPractice] = useState(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [modelId, setModelId] = useState(() => getModelPreference());
  const [modelStatus, setModelStatus] = useState('idle');
  const [modelStatusMessage, setModelStatusMessage] = useState('');
  const modelRef = useRef(null);

  // Load manifest on mount
  useEffect(() => {
    async function loadManifest() {
      try {
        const resp = await fetch('./manifest.json');
        const data = await resp.json();
        setManifest(data);

        // Load all practice.json files listed in the manifest
        const loaded = await Promise.all(
          data.etudes.map(async (entry) => {
            try {
              const resp = await fetch(entry.practice_url);
              return await resp.json();
            } catch {
              return null;
            }
          })
        );

        setEtudes(loaded.filter(Boolean));
      } catch (err) {
        console.error('Failed to load manifest:', err);
      }
    }
    loadManifest();
  }, []);

  // Initialize model adapter
  useEffect(() => {
    const adapter = new UnifiedModelAdapter();
    adapter.onStatusChange((status, message) => {
      setModelStatus(status);
      setModelStatusMessage(message || '');
    });
    modelRef.current = adapter;

    // Auto-initialize the preferred model
    const keys = getApiKeys();
    adapter.switchModel(modelId, keys).catch(err => {
      console.warn('Model init failed:', err.message);
    });

    return () => adapter.destroy();
  }, []);

  // Handle model switch
  const handleModelChange = useCallback(async (newModelId) => {
    setModelId(newModelId);
    setModelPreference(newModelId);
    const keys = getApiKeys();
    try {
      await modelRef.current?.switchModel(newModelId, keys);
    } catch (err) {
      console.error('Model switch failed:', err);
    }
  }, []);

  // Handle etude selection
  const handleSelectEtude = useCallback((etudeId) => {
    const practice = etudes.find(e => e.etude_id === etudeId);
    if (!practice) return;

    setSelectedEtudeId(etudeId);
    setCurrentPractice(practice);

    // Restore phase progress
    const progress = getEtudeProgress(etudeId);
    setCurrentPhaseIndex(progress.currentPhase || 0);
  }, [etudes]);

  // Handle phase selection
  const handleSelectPhase = useCallback((index) => {
    setCurrentPhaseIndex(index);
    if (selectedEtudeId) {
      setCurrentPhase(selectedEtudeId, index);
    }

    // Auto-complete previous phase when advancing
    if (currentPractice && index > 0) {
      const prevPhase = currentPractice.phases[index - 1];
      if (prevPhase && !prevPhase.checklist) {
        completePhase(selectedEtudeId, prevPhase.id);
      }
    }
  }, [selectedEtudeId, currentPractice]);

  // Handle checklist changes (for unlocking next phases)
  const handleChecklistChange = useCallback(() => {
    // Force re-render to update lock states
    setCurrentPhaseIndex(idx => idx);
  }, []);

  const modelTier = modelRef.current?.getModelTier() || 'smol';
  const systemPrompt = currentPractice
    ? assembleSystemPrompt(currentPractice, currentPhaseIndex, modelTier)
    : '';

  // Get conversation messages for token gauge (from sessionStorage)
  const phase = currentPractice?.phases?.[currentPhaseIndex];
  let chatMessages = [];
  if (currentPractice && phase) {
    try {
      const key = `cotudes-chat-${currentPractice.etude_id}-${phase.id}`;
      chatMessages = JSON.parse(sessionStorage.getItem(key)) || [];
    } catch { /* empty */ }
  }

  return (
    <div class="app-layout">
      <header class="app-header">
        <h1>cotudes practice</h1>
        <ModelSelector
          currentModelId={modelId}
          modelStatus={modelStatus}
          onModelChange={handleModelChange}
        />
      </header>

      <CurriculumNav
        etudes={etudes}
        selectedEtudeId={selectedEtudeId}
        onSelectEtude={handleSelectEtude}
      />

      <div class="main-area">
        {currentPractice ? (
          <>
            <div class="etude-header">
              <h2>{currentPractice.etude_id}: {currentPractice.title}</h2>
              <div class="etude-axiom">"{currentPractice.axiom}"</div>
              <div class="etude-meta">
                <span class="etude-meta-badge">{currentPractice.competency}</span>
                <span class={`etude-meta-badge tier-${currentPractice.tier_support?.smol}`}>
                  SmolLM2: {currentPractice.tier_support?.smol}
                </span>
                <span class={`etude-meta-badge tier-${currentPractice.tier_support?.frontier}`}>
                  Frontier: {currentPractice.tier_support?.frontier}
                </span>
              </div>
            </div>
            <PhaseTabs
              practice={currentPractice}
              currentPhaseIndex={currentPhaseIndex}
              onSelectPhase={handleSelectPhase}
            />
            <div class="content-chat-split">
              <EtudeViewer
                practice={currentPractice}
                currentPhaseIndex={currentPhaseIndex}
                onChecklistChange={handleChecklistChange}
              />
              <ChatPanel
                practice={currentPractice}
                currentPhaseIndex={currentPhaseIndex}
                modelAdapter={modelRef.current}
                modelTier={modelTier}
              />
            </div>
          </>
        ) : (
          <div class="welcome-screen">
            <h2>cotudes practice</h2>
            <p>A coaching companion for AI agent collaboration skills.</p>
            <p>Select an etude from the sidebar to get started.</p>
          </div>
        )}
      </div>

      <div class="status-bar">
        <div class="status-bar-left">
          {currentPractice && phase && (
            <span>
              Phase {currentPhaseIndex + 1}/{currentPractice.phases.length}
              {' \u00B7 '}
              {phase.label}
            </span>
          )}
        </div>
        <div class="status-bar-right">
          <span class="model-status">
            <span class={`model-status-dot ${modelStatus}`} />
            {modelStatusMessage && modelStatus === 'loading'
              ? modelStatusMessage
              : `${modelId === 'smol' ? 'SmolLM2' : modelId}: ${modelStatus}`}
          </span>
          <TokenGauge
            systemPrompt={systemPrompt}
            messages={chatMessages}
            modelTier={modelTier}
          />
        </div>
      </div>
    </div>
  );
}

render(<App />, document.getElementById('app'));
