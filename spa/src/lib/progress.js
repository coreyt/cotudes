/**
 * Progress tracking via localStorage.
 *
 * Stores per-etude phase completion and checklist state.
 */

const STORAGE_KEY = 'cotudes-progress';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Get progress for a specific etude. */
export function getEtudeProgress(etudeId) {
  const data = load();
  return data[etudeId] || { currentPhase: 0, phases: {} };
}

/** Mark a phase as completed. */
export function completePhase(etudeId, phaseId) {
  const data = load();
  if (!data[etudeId]) data[etudeId] = { currentPhase: 0, phases: {} };
  if (!data[etudeId].phases[phaseId]) data[etudeId].phases[phaseId] = {};
  data[etudeId].phases[phaseId].completed = true;
  save(data);
}

/** Set the current phase index. */
export function setCurrentPhase(etudeId, phaseIndex) {
  const data = load();
  if (!data[etudeId]) data[etudeId] = { currentPhase: 0, phases: {} };
  data[etudeId].currentPhase = phaseIndex;
  save(data);
}

/** Get/set checklist state for a phase. */
export function getChecklist(etudeId, phaseId) {
  const data = load();
  return data[etudeId]?.phases?.[phaseId]?.checklist || [];
}

export function setChecklist(etudeId, phaseId, checked) {
  const data = load();
  if (!data[etudeId]) data[etudeId] = { currentPhase: 0, phases: {} };
  if (!data[etudeId].phases[phaseId]) data[etudeId].phases[phaseId] = {};
  data[etudeId].phases[phaseId].checklist = checked;
  save(data);
}

/** Check if a phase is completed. */
export function isPhaseCompleted(etudeId, phaseId) {
  const data = load();
  return !!data[etudeId]?.phases?.[phaseId]?.completed;
}

/** Check if an etude has any progress. */
export function hasProgress(etudeId) {
  const data = load();
  return !!data[etudeId];
}

/** Check if all phases of an etude are completed. */
export function isEtudeCompleted(etudeId, phaseCount) {
  const data = load();
  if (!data[etudeId]) return false;
  const phases = data[etudeId].phases || {};
  return Object.values(phases).filter(p => p.completed).length >= phaseCount;
}

/**
 * Determine which phases are unlocked based on progress.
 * Phase unlock rules:
 * - setup → always visible
 * - part1_work → visible after setup
 * - part1_checkpoint → visible after part1_work
 * - part2_work → locked until part1_checkpoint completed (checklist threshold)
 * - part2_checkpoint → visible after part2_work
 * - reflection → visible after part2_checkpoint
 */
export function getUnlockedPhases(etudeId, phases) {
  const progress = getEtudeProgress(etudeId);
  const phaseMap = progress.phases || {};

  return phases.map((phase, index) => {
    // First phase always unlocked
    if (index === 0) return true;

    const prevPhase = phases[index - 1];
    const prevCompleted = !!phaseMap[prevPhase.id]?.completed;

    // part2_work requires part1_checkpoint to be completed
    if (phase.id === 'part2_work') {
      const cp = phaseMap['part1_checkpoint'];
      if (!cp?.completed) return false;
      // Also check checklist threshold if present
      const checklistPhase = phases.find(p => p.id === 'part1_checkpoint');
      if (checklistPhase?.checklist) {
        const checked = cp.checklist || [];
        const threshold = Math.ceil(checklistPhase.checklist.length * 0.5);
        return checked.filter(Boolean).length >= threshold;
      }
      return true;
    }

    // All other phases require the previous phase to be completed
    return prevCompleted;
  });
}

/** Get/save API keys. */
export function getApiKeys() {
  try {
    return JSON.parse(localStorage.getItem('cotudes-api-keys')) || {};
  } catch {
    return {};
  }
}

export function setApiKeys(keys) {
  localStorage.setItem('cotudes-api-keys', JSON.stringify(keys));
}

/** Get/save model preference. */
export function getModelPreference() {
  return localStorage.getItem('cotudes-model') || 'smol';
}

export function setModelPreference(model) {
  localStorage.setItem('cotudes-model', model);
}
