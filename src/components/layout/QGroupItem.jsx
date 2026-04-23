// ============================================================
//  layout/QGroup.jsx + QItem.jsx
// ============================================================

import React from 'react';

export function QGroup({ title, children }) {
  return (
    <div style={{
      background: '#F8FAFF', borderRadius: 14,
      padding: 18, marginBottom: 16,
      border: '1px solid var(--border)',
    }}>
      {title && (
        <div style={{
          fontSize: 12, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '.6px', color: 'var(--muted)', marginBottom: 14,
        }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function QItem({ children, last }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 12, padding: 16,
      marginBottom: last ? 0 : 12,
    }}>
      {children}
    </div>
  );
}

export function QItemLabel({ children }) {
  return (
    <div style={{
      fontSize: 18, fontWeight: 800,
      display: 'flex', alignItems: 'center', gap: 10,
      flexWrap: 'wrap', marginBottom: 12, lineHeight: 1.4,
    }}>
      {children}
    </div>
  );
}
