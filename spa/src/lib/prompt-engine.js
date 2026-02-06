/**
 * Phase-gated prompt assembly and token management.
 *
 * Assembles system prompts from practice.json based on current phase
 * and model tier. Manages token estimation for SmolLM2's 8K limit.
 */

const SMOL_CONTEXT_LIMIT = 8192;
const FRONTIER_CONTEXT_LIMIT = 200000;

// Rough token estimation: ~4 chars per token for English text
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Assemble the system prompt for the current phase and model tier.
 *
 * SmolLM2:  coach_prompt_smol (~500) + phase.coach_context (~300) = ~800 tokens
 * Frontier: coach_prompt_frontier (~2000) + phase detail (~500) = ~2500 tokens
 */
export function assembleSystemPrompt(practice, phaseIndex, modelTier) {
  const phase = practice.phases[phaseIndex];
  if (!phase) return '';

  if (modelTier === 'smol') {
    const parts = [practice.coach_prompt_smol];
    if (phase.coach_context) {
      parts.push(`\nCurrent phase: ${phase.label}\n${phase.coach_context}`);
    }
    if (phase.coach_goals?.length) {
      parts.push(`\nGoals: ${phase.coach_goals.join('. ')}.`);
    }
    if (phase.suggested_questions?.length) {
      parts.push(`\nSuggested questions to ask:\n- ${phase.suggested_questions.join('\n- ')}`);
    }
    return parts.join('\n');
  }

  // Frontier tier: richer context
  const parts = [practice.coach_prompt_frontier];
  parts.push(`\n--- Current Phase: ${phase.label} ---`);
  if (phase.coach_context) {
    parts.push(phase.coach_context);
  }
  if (phase.coach_goals?.length) {
    parts.push(`\nCoaching goals for this phase:\n- ${phase.coach_goals.join('\n- ')}`);
  }
  if (phase.suggested_questions?.length) {
    parts.push(`\nSuggested Socratic questions:\n- ${phase.suggested_questions.join('\n- ')}`);
  }
  if (phase.checklist?.length) {
    parts.push(`\nChecklist items the student should evaluate:\n- ${phase.checklist.join('\n- ')}`);
  }
  if (phase.reflection_questions?.length) {
    parts.push(`\nReflection questions:\n- ${phase.reflection_questions.join('\n- ')}`);
  }
  return parts.join('\n');
}

/**
 * Estimate total token usage for a conversation.
 */
export function estimateConversationTokens(systemPrompt, messages) {
  let total = estimateTokens(systemPrompt);
  for (const msg of messages) {
    total += estimateTokens(msg.content) + 4; // 4 tokens overhead per message
  }
  return total;
}

/**
 * Get context limit for the current model tier.
 */
export function getContextLimit(modelTier) {
  return modelTier === 'smol' ? SMOL_CONTEXT_LIMIT : FRONTIER_CONTEXT_LIMIT;
}

/**
 * Check if conversation is approaching context limit.
 * Returns { used, limit, percentage, warning }
 */
export function checkContextUsage(systemPrompt, messages, modelTier) {
  const used = estimateConversationTokens(systemPrompt, messages);
  const limit = getContextLimit(modelTier);
  const percentage = (used / limit) * 100;

  let warning = null;
  if (percentage > 90) {
    warning = 'critical';
  } else if (percentage > 75) {
    warning = 'high';
  } else if (percentage > 50 && modelTier === 'smol') {
    warning = 'moderate';
  }

  return { used, limit, percentage, warning };
}

/**
 * Truncate conversation to fit within context limit.
 * Keeps system prompt + first message + recent messages.
 */
export function truncateConversation(messages, systemPrompt, modelTier) {
  const limit = getContextLimit(modelTier);
  const systemTokens = estimateTokens(systemPrompt);
  const available = limit - systemTokens - 500; // reserve 500 for response

  if (available <= 0) return [];

  // Always keep the first message for context
  const result = [];
  let used = 0;

  if (messages.length > 0) {
    const firstTokens = estimateTokens(messages[0].content) + 4;
    if (firstTokens < available) {
      result.push(messages[0]);
      used += firstTokens;
    }
  }

  // Add messages from the end until we run out of space
  const remaining = [];
  for (let i = messages.length - 1; i > 0; i--) {
    const msgTokens = estimateTokens(messages[i].content) + 4;
    if (used + msgTokens > available) break;
    remaining.unshift(messages[i]);
    used += msgTokens;
  }

  return [...result, ...remaining];
}

/**
 * Generate an initial greeting message from the coach based on the current phase.
 */
export function getInitialGreeting(practice, phaseIndex) {
  const phase = practice.phases[phaseIndex];
  if (!phase) return null;

  if (phase.suggested_questions?.length) {
    return phase.suggested_questions[0];
  }

  return `Let's work through the "${phase.label}" phase. What are you working on?`;
}
