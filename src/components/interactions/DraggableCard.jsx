// ============================================================
//  interactions/DraggableCard.jsx
//  Generic draggable card — number, word, or any string label.
//  Payload is JSON-serialised so any data structure can be carried.
// ============================================================

import React from 'react';

/**
 * @param {any}    payload   - data to pass on drag (will be JSON.stringify'd)
 * @param {string} label     - display text
 * @param {string} size      - 'sm' | 'md' | 'lg' (default 'md')
 * @param {string} variant   - 'primary' | 'red' | 'amber' (default 'primary')
 * @param {boolean} disabled
 */
export function DraggableCard({ payload, label, size = 'md', variant = 'primary', disabled }) {
  const SIZES = {
    sm: { padding: '5px 10px', fontSize: 15, minWidth: 36 },
    md: { padding: '8px 16px', fontSize: 18, minWidth: 46 },
    lg: { padding: '10px 20px', fontSize: 22, minWidth: 56 },
  };
  const VARIANTS = {
    primary: { bg: '#fff', color: 'var(--blue-dark)', border: '2.5px solid var(--blue)' },
    red:     { bg: '#fff', color: 'var(--red)',       border: '2.5px solid var(--red)'  },
    amber:   { bg: '#fff', color: 'var(--amber)',     border: '2.5px solid var(--amber)'},
  };
  const s = SIZES[size]   || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;

  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => {
        if (disabled) return;
        e.dataTransfer.setData('text/plain', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'copy';
        e.currentTarget.style.opacity = '0.35';
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = '';
      }}
      style={{
        background: v.bg,
        color:      disabled ? '#9CA3AF' : v.color,
        border:     disabled ? '2.5px solid #E2E8F0' : v.border,
        borderRadius: 10,
        padding:    s.padding,
        fontSize:   s.fontSize,
        fontWeight: 900,
        cursor:     disabled ? 'not-allowed' : 'grab',
        userSelect: 'none',
        transition: 'all .15s',
        minWidth:   s.minWidth,
        textAlign:  'center',
        display:    'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow:  disabled ? 'none' : 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        if (disabled) return;
        e.currentTarget.style.background = v.color;
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = v.bg;
        e.currentTarget.style.color = disabled ? '#9CA3AF' : v.color;
        e.currentTarget.style.transform = 'none';
      }}
    >
      {label}
    </div>
  );
}
