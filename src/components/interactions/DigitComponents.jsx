// ============================================================
//  interactions/DigitPalette.jsx + DigitDropZone.jsx
// ============================================================

import React, { useState } from 'react';

/* ── DigitPalette ─────────────────────────────────────────── */
export function DigitPalette({ paletteId, decimal = true }) {
  const cardStyle = {
    background: '#fff', color: 'var(--blue-dark)',
    border: '2.5px solid var(--blue)', borderRadius: 10,
    width: 46, height: 46, fontSize: 20, fontWeight: 900,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'grab', userSelect: 'none', transition: 'all .15s',
    boxShadow: 'var(--shadow-sm)',
  };

  const handleDragStart = (val) => (e) => {
    e.dataTransfer.setData('text/plain', val === 'DEL' ? 'del' : `digit:${val}`);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div style={{
      background: 'var(--blue-light)', border: '1.5px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', marginBottom: 14,
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
        🃏 Drag digits to build your answer
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[0,1,2,3,4,5,6,7,8,9].map(d => (
          <div
            key={d}
            draggable
            onDragStart={handleDragStart(d)}
            style={cardStyle}
          >
            {d}
          </div>
        ))}
        {decimal && (
          <div
            draggable
            onDragStart={handleDragStart('.')}
            style={{ ...cardStyle, fontSize: 22, fontWeight: 900 }}
          >
            .
          </div>
        )}
        <div
          draggable
          onDragStart={handleDragStart('DEL')}
          style={{
            ...cardStyle, width: 'auto', padding: '0 12px',
            color: 'var(--red)', borderColor: 'var(--red)', fontSize: 13,
          }}
        >
          ✕ DEL
        </div>
      </div>
    </div>
  );
}

/* ── DigitDropZone ────────────────────────────────────────── */
const ZONE_BORDER = {
  default: '2.5px dashed var(--border)',
  filled:  '2.5px solid #CE82FF',
  correct: '2.5px solid var(--green)',
  wrong:   '2.5px solid var(--red)',
  reveal:  '2.5px dashed var(--green)',
  over:    '2.5px solid var(--green)',
};
const ZONE_BG = {
  default: '#fff',
  filled:  '#F9F0FF',
  correct: 'var(--green-bg)',
  wrong:   'var(--red-bg)',
  reveal:  'var(--green-bg)',
  over:    'var(--green-bg)',
};

/**
 * @param {string[]} digits    - current digits in zone
 * @param {string}   zoneState - 'default'|'filled'|'correct'|'wrong'|'reveal'
 * @param {function} onDrop    - called with 'digit:X' or 'del'
 * @param {function} onRemove  - called with digit index to remove
 */
export function DigitDropZone({ digits = [], zoneState = 'default', onDrop, onRemove }) {
  const [over, setOver] = useState(false);
  const locked = ['correct', 'reveal'].includes(zoneState);
  const state = over && !locked ? 'over' : (digits.length > 0 && zoneState === 'default' ? 'filled' : zoneState);

  const handleDrop = (e) => {
    e.preventDefault();
    setOver(false);
    if (locked) return;
    const data = e.dataTransfer.getData('text/plain');
    if (onDrop) onDrop(data);
  };

  const digitStyle = {
    background: state === 'correct' || state === 'reveal' ? 'var(--green-bg)' : state === 'wrong' ? 'var(--red-bg)' : '#F9F0FF',
    color: state === 'correct' || state === 'reveal' ? 'var(--green)' : state === 'wrong' ? 'var(--red)' : '#7B2FA8',
    border: state === 'correct' || state === 'reveal' ? '2px solid var(--green)' : state === 'wrong' ? '2px solid var(--red)' : '2px solid #CE82FF',
    borderRadius: 7, width: 34, height: 38,
    fontSize: 18, fontWeight: 900,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: locked ? 'default' : 'pointer', transition: 'all .15s',
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      style={{
        minWidth: 80, minHeight: 52,
        border: ZONE_BORDER[state],
        borderRadius: 10, background: ZONE_BG[state],
        display: 'flex', alignItems: 'center',
        flexWrap: 'wrap', gap: 4, padding: '4px 8px',
        transition: 'all .2s',
      }}
    >
      {digits.length === 0 ? (
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted)', padding: '4px 8px' }}>
          Drop digits here
        </span>
      ) : (
        digits.map((d, i) => (
          <div
            key={i}
            onClick={() => !locked && onRemove && onRemove(i)}
            style={digitStyle}
            title={locked ? '' : 'Click to remove'}
          >
            {d}
          </div>
        ))
      )}
    </div>
  );
}
