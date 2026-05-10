// ============================================================
//  interactions/MCQOptions.jsx
//  Column of MCQ buttons: default → selected (blue fill) →
//  correct (green) | wrong (red) | reveal (green dashed)
// ============================================================

import React from 'react';

const STATE_STYLES = {
  default:  { bg: '#fff',                color: 'var(--text)', border: '2.5px solid var(--border)', cursor: 'pointer' },
  hovered:  { bg: 'var(--blue-light)',   color: 'var(--blue-dark)', border: '2.5px solid var(--blue)', cursor: 'pointer' },
  selected: { bg: '#CE82FF',             color: '#fff',  border: '2.5px solid #9333EA',     cursor: 'pointer' },
  correct:  { bg: 'var(--green-bg)',     color: 'var(--green)', border: '2.5px solid var(--green)', cursor: 'default' },
  wrong:    { bg: 'var(--red-bg)',       color: 'var(--red)',   border: '2.5px solid var(--red)',   cursor: 'default' },
  reveal:   { bg: 'var(--green-bg)',     color: 'var(--green)', border: '2.5px dashed var(--green)', cursor: 'default' },
};

/**
 * @param {Array<{id, label, state}>} options
 * @param {function} onSelect - called with option id
 */
export function MCQOptions({ options, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      {options.map(opt => {
        const s = STATE_STYLES[opt.state || 'default'];
        const locked = ['correct', 'wrong', 'reveal'].includes(opt.state);
        return (
          <button
            key={opt.id}
            onClick={() => !locked && onSelect && onSelect(opt.id)}
            style={{
              background: s.bg, color: s.color, border: s.border,
              borderRadius: 12, padding: '13px 18px',
              fontSize: 20, fontWeight: 700,
              cursor: s.cursor, textAlign: 'left',
              fontFamily: 'var(--font)', lineHeight: 1.5,
              transition: 'all .15s',
              pointerEvents: locked ? 'none' : undefined,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
