import { useMemo } from 'preact/hooks';
import { marked } from 'marked';
import { Checklist } from './Checklist.jsx';

// Configure marked for safe rendering
marked.setOptions({
  breaks: false,
  gfm: true,
});

export function EtudeViewer({ practice, currentPhaseIndex, onChecklistChange }) {
  if (!practice) {
    return (
      <div class="welcome-screen">
        <h2>cotudes practice</h2>
        <p>Select an etude from the sidebar to get started.</p>
        <p>Practice AI agent collaboration skills with a coaching companion.</p>
      </div>
    );
  }

  const phase = practice.phases[currentPhaseIndex];
  if (!phase) return null;

  const renderedContent = useMemo(() => {
    if (!phase.content_md) return '';
    return marked.parse(phase.content_md);
  }, [phase.content_md]);

  return (
    <div class="content-pane">
      <div
        class="markdown-content"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
      {phase.checklist && (
        <Checklist
          etudeId={practice.etude_id}
          phaseId={phase.id}
          items={phase.checklist}
          onChecklistChange={onChecklistChange}
        />
      )}
    </div>
  );
}
