// ============================================================
//  interactions/DropSlot.jsx + FactorSlotRow.jsx
// ============================================================

import React, { useState } from 'react';

/* ── DropSlot ─────────────────────────────────────────────── */
const SLOT_STYLE = {
  default: { border: '2.5px dashed var(--border)', bg: '#fff',           color: 'var(--blue-dark)' },
  filled:  { border: '2.5px solid var(--blue)',   bg: 'var(--blue-light)', color: 'var(--blue-dark)' },
  over:    { border: '2.5px solid var(--green)',  bg: 'var(--green-bg)',  color: 'var(--green)'     },
  correct: { border: '2.5px solid var(--green)',  bg: 'var(--green-bg)',  color: 'var(--green)'     },
  wrong:   { border: '2.5px solid var(--red)',    bg: 'var(--red-bg)',    color: 'var(--red)'       },
  reveal:  { border: '2.5px dashed var(--green)', bg: 'var(--green-bg)', color: 'var(--green)'     },
  prefilled:{ border: '2.5px solid var(--blue)',  bg: 'var(--blue)',      color: '#fff'             },
};

/**
 * Single drop slot.
 * @param {any}      value      - displayed value (null = empty)
 * @param {string}   slotState  - 'default'|'filled'|'correct'|'wrong'|'reveal'|'prefilled'
 * @param {function} onDrop     - called with dropped data
 * @param {function} onClick    - called when filled slot is clicked (to remove)
 * @param {number}   size       - px size (default 52)
 */
export function DropSlot({ value, slotState = 'default', onDrop, onClick, size = 52 }) {
  const [over, setOver] = useState(false);
  const locked = ['correct', 'reveal', 'prefilled'].includes(slotState);
  const state = over && !locked ? 'over' : (value !== null && value !== undefined && slotState === 'default' ? 'filled' : slotState);
  const s = SLOT_STYLE[state] || SLOT_STYLE.default;

  const handleDrop = (e) => {
    e.preventDefault(); setOver(false);
    if (locked) return;
    let data;
    try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { data = e.dataTransfer.getData('text/plain'); }
    if (onDrop) onDrop(data);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      onClick={() => !locked && value !== null && value !== undefined && onClick && onClick()}
      style={{
        width: size, height: size, borderRadius: 10,
        border: s.border, background: s.bg, color: s.color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 900,
        cursor: locked ? 'default' : value !== null ? 'pointer' : 'default',
        transition: 'all .2s', position: 'relative', userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {value !== null && value !== undefined ? value : ''}
    </div>
  );
}

/* ── FactorSlotRow ────────────────────────────────────────── */
/**
 * Row of slots for factor ordering.
 * First slot is pre-filled with "1".
 * @param {Array}    slots      - [{ value, state }] for each empty slot
 * @param {function} onDrop     - called with (slotIndex, data)
 * @param {function} onClick    - called with (slotIndex) to remove
 */
export function FactorSlotRow({ slots, onDrop, onClick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      <span style={{ fontSize: 24, color: 'var(--blue)', fontWeight: 900 }}>→</span>
      {/* Pre-filled "1" */}
      <DropSlot value={1} slotState="prefilled" size={54} />
      {/* Empty slots */}
      {slots.map((slot, i) => (
        <DropSlot
          key={i}
          value={slot.value}
          slotState={slot.state}
          onDrop={(data) => onDrop && onDrop(i, data)}
          onClick={() => onClick && onClick(i)}
          size={54}
        />
      ))}
    </div>
  );
}
