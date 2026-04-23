// ============================================================
//  interactions/NumberCardBank.jsx
//  Palette of draggable rectangular number chips.
//  Used in divisibility, multiples, factors sections.
// ============================================================

import React from 'react';

/**
 * @param {string}   label   - palette instruction label
 * @param {number[]} numbers - numbers to show as chips
 * @param {Set}      hidden  - set of numbers to hide (already placed)
 */
export function NumberCardBank({ label = '🃏 Drag numbers', numbers, hidden = new Set() }) {
  return (
    <div style={{
      background: 'var(--blue-light)', border: '1.5px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', marginBottom: 14,
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {numbers.map(n => hidden.has(n) ? null : (
          <div
            key={n}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', JSON.stringify({ value: n, type: 'numcard' }));
            }}
            style={{
              background: '#fff', color: 'var(--blue-dark)',
              border: '2.5px solid var(--blue)', borderRadius: 10,
              padding: '7px 16px', fontSize: 18, fontWeight: 900,
              cursor: 'grab', userSelect: 'none', transition: 'all .15s',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}
