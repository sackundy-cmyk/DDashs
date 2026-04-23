// ============================================================
//  components/layout/PageWrapper.jsx
//  Wraps all lesson content with consistent max-width + padding.
// ============================================================

import React from 'react';

export default function PageWrapper({ children }) {
  return (
    <div
      className="page"
      style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 80px' }}
    >
      {children}
    </div>
  );
}
