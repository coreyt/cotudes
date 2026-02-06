import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import { marked } from 'marked';
import {
  assembleSystemPrompt,
  checkContextUsage,
  getInitialGreeting,
} from '../lib/prompt-engine.js';

const CONVERSATION_KEY_PREFIX = 'cotudes-chat-';

function getConversationKey(etudeId, phaseId) {
  return `${CONVERSATION_KEY_PREFIX}${etudeId}-${phaseId}`;
}

function loadConversation(etudeId, phaseId) {
  try {
    const key = getConversationKey(etudeId, phaseId);
    return JSON.parse(sessionStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function saveConversation(etudeId, phaseId, messages) {
  const key = getConversationKey(etudeId, phaseId);
  sessionStorage.setItem(key, JSON.stringify(messages));
}

export function ChatPanel({ practice, currentPhaseIndex, modelAdapter, modelTier }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const phase = practice?.phases?.[currentPhaseIndex];
  const etudeId = practice?.etude_id;
  const phaseId = phase?.id;

  // Load conversation when phase changes
  useEffect(() => {
    if (!etudeId || !phaseId) return;

    const saved = loadConversation(etudeId, phaseId);
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      // Generate initial greeting
      const greeting = getInitialGreeting(practice, currentPhaseIndex);
      if (greeting) {
        const initial = [{ role: 'assistant', content: greeting }];
        setMessages(initial);
        saveConversation(etudeId, phaseId, initial);
      } else {
        setMessages([]);
      }
    }
  }, [etudeId, phaseId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const systemPrompt = practice
    ? assembleSystemPrompt(practice, currentPhaseIndex, modelTier)
    : '';

  const contextUsage = checkContextUsage(systemPrompt, messages, modelTier);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isGenerating || !modelAdapter) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsGenerating(true);
    setStreamingText('');

    try {
      let fullResponse = '';
      const chatMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      for await (const token of modelAdapter.chatStream(chatMessages, systemPrompt)) {
        fullResponse += token;
        setStreamingText(fullResponse);
      }

      const assistantMsg = { role: 'assistant', content: fullResponse };
      const final = [...updatedMessages, assistantMsg];
      setMessages(final);
      saveConversation(etudeId, phaseId, final);
    } catch (err) {
      const errorMsg = { role: 'assistant', content: `Error: ${err.message}` };
      const final = [...updatedMessages, errorMsg];
      setMessages(final);
      saveConversation(etudeId, phaseId, final);
    } finally {
      setIsGenerating(false);
      setStreamingText('');
    }
  }, [input, messages, isGenerating, modelAdapter, systemPrompt, etudeId, phaseId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!practice) {
    return (
      <div class="chat-pane">
        <div class="chat-empty">
          <p>Select an etude to start coaching.</p>
        </div>
      </div>
    );
  }

  const modelStatus = modelAdapter?.getStatus() || 'idle';
  const isReady = modelStatus === 'ready' || modelStatus === 'generating';

  return (
    <div class="chat-pane">
      <div class="chat-header">Coach</div>
      <div class="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} class={`chat-message ${msg.role}`}>
            <div class="role">{msg.role === 'assistant' ? 'Coach' : 'You'}</div>
            <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
          </div>
        ))}
        {isGenerating && streamingText && (
          <div class="chat-message assistant">
            <div class="role">Coach</div>
            <div dangerouslySetInnerHTML={{ __html: marked.parse(streamingText) }} />
            <span class="streaming-dot" />
          </div>
        )}
        {isGenerating && !streamingText && (
          <div class="chat-message assistant">
            <div class="role">Coach</div>
            <span class="streaming-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div class="chat-input-area">
        <textarea
          ref={inputRef}
          class="chat-input"
          value={input}
          onInput={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isReady ? 'Type a message...' : `Model ${modelStatus}...`}
          disabled={!isReady || isGenerating}
          rows={1}
        />
        <button
          class="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isGenerating || !isReady}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export function TokenGauge({ systemPrompt, messages, modelTier }) {
  const usage = checkContextUsage(systemPrompt, messages, modelTier);

  let fillClass = 'token-gauge-fill';
  if (usage.warning === 'critical') fillClass += ' danger';
  else if (usage.warning === 'high' || usage.warning === 'moderate') fillClass += ' warning';

  const display = modelTier === 'smol'
    ? `${(usage.used / 1000).toFixed(1)}K/${(usage.limit / 1000).toFixed(0)}K`
    : '';

  return (
    <div class="token-gauge">
      {display && (
        <>
          <div class="token-gauge-bar">
            <div
              class={fillClass}
              style={{ width: `${Math.min(usage.percentage, 100)}%` }}
            />
          </div>
          <span>{display}</span>
        </>
      )}
    </div>
  );
}
