import { useState, useEffect } from 'preact/hooks';
import { getChecklist, setChecklist, completePhase, isPhaseCompleted } from '../lib/progress.js';

export function Checklist({ etudeId, phaseId, items, onChecklistChange }) {
  const [checked, setChecked] = useState(() => getChecklist(etudeId, phaseId));
  const completed = isPhaseCompleted(etudeId, phaseId);

  // Sync checked state when etude/phase changes
  useEffect(() => {
    setChecked(getChecklist(etudeId, phaseId));
  }, [etudeId, phaseId]);

  const handleToggle = (index) => {
    const next = [...checked];
    next[index] = !next[index];
    setChecked(next);
    setChecklist(etudeId, phaseId, next);
    onChecklistChange?.(next);

    // Auto-complete phase if enough items are checked
    const checkedCount = next.filter(Boolean).length;
    const threshold = Math.ceil(items.length * 0.5);
    if (checkedCount >= threshold && !completed) {
      completePhase(etudeId, phaseId);
    }
  };

  const checkedCount = checked.filter(Boolean).length;
  const threshold = Math.ceil(items.length * 0.5);
  const meetsThreshold = checkedCount >= threshold;

  return (
    <div>
      <ul class="checklist">
        {items.map((item, index) => (
          <li key={index} class={`checklist-item ${checked[index] ? 'checked' : ''}`}>
            <input
              type="checkbox"
              id={`check-${phaseId}-${index}`}
              checked={!!checked[index]}
              onChange={() => handleToggle(index)}
            />
            <label for={`check-${phaseId}-${index}`}>{item}</label>
          </li>
        ))}
      </ul>
      <div class="checklist-progress">
        {checkedCount} / {items.length} items checked
      </div>
      {!meetsThreshold && phaseId === 'part1_checkpoint' && (
        <div class="checklist-unlock-hint">
          Mark at least {threshold} items to unlock Part 2.
        </div>
      )}
    </div>
  );
}
