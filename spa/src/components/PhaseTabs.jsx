import { getUnlockedPhases, isPhaseCompleted } from '../lib/progress.js';

export function PhaseTabs({ practice, currentPhaseIndex, onSelectPhase }) {
  if (!practice) return null;

  const phases = practice.phases;
  const unlocked = getUnlockedPhases(practice.etude_id, phases);

  return (
    <div class="phase-tabs">
      {phases.map((phase, index) => {
        const isLocked = !unlocked[index];
        const isActive = index === currentPhaseIndex;
        const completed = isPhaseCompleted(practice.etude_id, phase.id);

        let className = 'phase-tab';
        if (isActive) className += ' active';
        if (isLocked) className += ' locked';
        if (completed) className += ' completed';

        return (
          <button
            key={phase.id}
            class={className}
            onClick={() => !isLocked && onSelectPhase(index)}
            disabled={isLocked}
            title={isLocked ? 'Complete the previous checkpoint to unlock' : phase.label}
          >
            {isLocked && <span class="lock-icon" />}
            {completed && !isActive ? '\u2713 ' : ''}
            {phase.label}
          </button>
        );
      })}
    </div>
  );
}
