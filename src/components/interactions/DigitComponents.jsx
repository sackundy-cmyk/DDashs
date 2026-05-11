// ============================================================
//  interactions/DigitComponents.jsx
//  Click-to-select + click-to-place digit interaction.
//  No drag-and-drop for digit cards.
// ============================================================

import React, { useState, useEffect } from 'react';
import { digitPickState } from './digitPickState.js';

// Inject pulse-border keyframe animation once into the document
if (typeof document !== 'undefined') {
  const STYLE_ID = '__ddash_digit_pick__';
  if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      @keyframes ddash-pulse-border {
        0%, 100% { box-shadow: 0 0 0 2px rgba(217,119,6,0.55); }
        50%       { box-shadow: 0 0 0 5px rgba(217,119,6,0.10); }
      }
    `;
    document.head.appendChild(s);
  }
}

/* ── DigitPalette ─────────────────────────────────────────── */
export function DigitPalette({ paletteId, decimal = true, minus = false }) {
  const [selected, setSelected] = useState(() => digitPickState.get(paletteId));

  useEffect(() => {
    setSelected(digitPickState.get(paletteId));
    return digitPickState.sub(paletteId, setSelected);
  }, [paletteId]);

  const baseCard = {
    background: '#fff', color: 'var(--blue-dark)',
    border: '2.5px solid var(--blue)', borderRadius: 10,
    width: 46, height: 46, fontSize: 20, fontWeight: 900,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', userSelect: 'none', transition: 'all .15s',
    boxShadow: 'var(--shadow-sm)',
  };

  const selectedCard = {
    ...baseCard,
    background: '#D97706', color: '#fff',
    border: '2.5px solid #B45309',
    transform: 'scale(1.08)',
    boxShadow: '0 4px 14px rgba(217,119,6,0.45)',
  };

  const cardStyle = (val) => {
    const isSelected = selected !== null && String(selected) === String(val);
    return isSelected ? selectedCard : baseCard;
  };

  const handleClick = (val) => () => digitPickState.toggle(paletteId, String(val));

  return (
    <div style={{
      background: 'var(--blue-light)', border: '1.5px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', marginBottom: 14,
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
        🔢 Click a digit, then click a box to place it
        {selected !== null && (
          <span style={{ marginLeft: 10, color: '#D97706', textTransform: 'none', letterSpacing: 0, fontWeight: 900, fontSize: 12 }}>
            — <strong>{selected === '-' ? '−' : selected}</strong> selected
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[0,1,2,3,4,5,6,7,8,9].map(d => (
          <div key={d} onClick={handleClick(d)} style={cardStyle(d)}>
            {d}
          </div>
        ))}
        {decimal && (
          <div onClick={handleClick('.')} style={cardStyle('.')}>
            .
          </div>
        )}
        {minus && (
          <div
            onClick={handleClick('-')}
            style={{
              ...cardStyle('-'),
              ...(selected === '-'
                ? {}
                : { color: 'var(--red)', borderColor: 'var(--red)' }),
              fontSize: 22,
            }}
          >
            −
          </div>
        )}
      </div>
    </div>
  );
}

/* ── DigitDropZone ────────────────────────────────────────── */
const ZONE_BORDER = {
  default: '2.5px dashed var(--border)',
  ready:   '2.5px solid #D97706',
  filled:  '2.5px solid #CE82FF',
  correct: '2.5px solid var(--green)',
  wrong:   '2.5px solid var(--red)',
  reveal:  '2.5px dashed var(--green)',
};
const ZONE_BG = {
  default: '#fff',
  ready:   '#FFFBEB',
  filled:  '#F9F0FF',
  correct: 'var(--green-bg)',
  wrong:   'var(--red-bg)',
  reveal:  'var(--green-bg)',
};

/**
 * @param {string}   paletteId  - must match the paired DigitPalette's paletteId
 * @param {string[]} digits     - current digits in zone
 * @param {string}   zoneState  - 'default'|'correct'|'wrong'|'reveal'
 * @param {function} onDrop     - called with 'digit:X' (same format as before)
 * @param {function} onRemove   - called with digit index to remove
 */
export function DigitDropZone({ paletteId, digits = [], zoneState = 'default', onDrop, onRemove }) {
  const [selected, setSelected] = useState(() => digitPickState.get(paletteId));

  useEffect(() => {
    setSelected(digitPickState.get(paletteId));
    return digitPickState.sub(paletteId, setSelected);
  }, [paletteId]);

  const locked = ['correct', 'reveal'].includes(zoneState);
  const displayState = locked
    ? zoneState
    : (selected !== null
        ? 'ready'
        : (digits.length > 0 && zoneState === 'default' ? 'filled' : zoneState));

  const handleZoneClick = () => {
    if (locked || selected === null) return;
    if (onDrop) onDrop('digit:' + selected);
  };

  const digitStyle = {
    background: displayState === 'correct' || displayState === 'reveal' ? 'var(--green-bg)'
              : displayState === 'wrong' ? 'var(--red-bg)' : '#F9F0FF',
    color: displayState === 'correct' || displayState === 'reveal' ? 'var(--green)'
         : displayState === 'wrong' ? 'var(--red)' : '#7B2FA8',
    border: displayState === 'correct' || displayState === 'reveal' ? '2px solid var(--green)'
          : displayState === 'wrong' ? '2px solid var(--red)' : '2px solid #CE82FF',
    borderRadius: 7, width: 34, height: 38,
    fontSize: 18, fontWeight: 900,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: locked ? 'default' : 'pointer', transition: 'all .15s',
  };

  return (
    <div
      onClick={handleZoneClick}
      style={{
        minWidth: 80, minHeight: 52,
        border: ZONE_BORDER[displayState] || ZONE_BORDER.default,
        borderRadius: 10,
        background: ZONE_BG[displayState] || ZONE_BG.default,
        display: 'flex', alignItems: 'center',
        flexWrap: 'wrap', gap: 4, padding: '4px 8px',
        transition: 'all .2s',
        cursor: (!locked && selected !== null) ? 'pointer' : 'default',
        animation: displayState === 'ready' ? 'ddash-pulse-border 1.2s ease-in-out infinite' : 'none',
      }}
    >
      {digits.length === 0 ? (
        <span style={{ fontSize: 13, fontWeight: 700, color: displayState === 'ready' ? '#B45309' : 'var(--muted)', padding: '4px 6px' }}>
          {displayState === 'ready' ? `Place ${selected === '-' ? '−' : selected} here` : 'Click a digit card'}
        </span>
      ) : (
        digits.map((d, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); if (!locked && onRemove) onRemove(i); }}
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
