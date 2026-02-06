import { useState } from 'preact/hooks';
import { isEtudeCompleted } from '../lib/progress.js';

const PATH_LABELS = {
  'associate-software-engineer': 'ASE',
  'staff-software-engineer': 'STE',
  'principal-software-engineer': 'PSE',
  'principal-software-architect': 'PSA',
  'staff-devops-engineer': 'DOE',
  'staff-data-management-engineer': 'DME',
};

const PATH_ORDER = ['ASE', 'STE', 'PSE', 'PSA', 'DOE', 'DME'];

export function CurriculumNav({ etudes, selectedEtudeId, onSelectEtude }) {
  const [openPaths, setOpenPaths] = useState(() => {
    // Open the path of the selected etude by default
    const selected = etudes.find(e => e.etude_id === selectedEtudeId);
    const pathKey = selected ? PATH_LABELS[selected.path] : null;
    const initial = {};
    PATH_ORDER.forEach(p => { initial[p] = p === pathKey; });
    return initial;
  });

  // Group etudes by path
  const grouped = {};
  for (const etude of etudes) {
    const key = PATH_LABELS[etude.path] || etude.path;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(etude);
  }

  // Sort each group by etude_id
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.etude_id.localeCompare(b.etude_id));
  }

  const togglePath = (path) => {
    setOpenPaths(prev => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <nav class="sidebar">
      {PATH_ORDER.filter(p => grouped[p]).map(pathKey => (
        <div class="sidebar-section" key={pathKey}>
          <div
            class="sidebar-section-header"
            onClick={() => togglePath(pathKey)}
          >
            <span class={`chevron ${openPaths[pathKey] ? 'open' : ''}`}>&#9654;</span>
            {pathKey}
            <span class="sidebar-section-count">({grouped[pathKey].length})</span>
          </div>
          {openPaths[pathKey] && grouped[pathKey].map(etude => {
            const isActive = etude.etude_id === selectedEtudeId;
            const completed = isEtudeCompleted(etude.etude_id, etude.phases?.length || 6);
            return (
              <div
                key={etude.etude_id}
                class={`sidebar-etude ${isActive ? 'active' : ''} ${completed ? 'completed' : ''}`}
                onClick={() => onSelectEtude(etude.etude_id)}
              >
                <span class="indicator" />
                {etude.etude_id.split('-')[0]}-{etude.etude_id.split('-')[1]} {etude.title}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
