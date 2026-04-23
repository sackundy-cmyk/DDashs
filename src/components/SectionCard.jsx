// ============================================================
//  SectionCard.jsx — white card wrapping a question section
// ============================================================

import React from 'react';

const TAG_STYLES = {
  drag:  { background: '#DCFCE7', color: '#15803D' },
  mcq:   { background: '#EDE9FE', color: '#5B21B6' },
  tap:   { background: '#FEF3C7', color: '#92400E' },
  step:  { background: '#FEF3C7', color: '#92400E' },
  venn:  { background: '#FEF3C7', color: '#92400E' },
  guided:{ background: '#EDE9FE', color: '#5B21B6' },
};

function Tag({ type, label }) {
  const s = TAG_STYLES[type] || TAG_STYLES.mcq;
  return (
    <span style={{
      ...s, display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 800, marginLeft: 8,
    }}>
      {label}
    </span>
  );
}

/**
 * @param {number}   badge       - question number (1, 2, 3…)
 * @param {string}   title       - section title
 * @param {string}   subtitle    - instruction text
 * @param {string}   tagType     - 'drag' | 'mcq' | 'tap' | 'step' | 'venn'
 * @param {string}   tagLabel    - tag display text
 * @param {string|object} score  - "8/10 ✓" string OR { pct, correct, total, attempts, label }
 * @param {ReactNode} children
 */
function renderScore(score) {
  if (!score) return null;
  if (typeof score === 'string') return score;
  if (typeof score === 'object') {
    if (score.label) return score.label;
    if (Number.isFinite(score.pct)) return `${score.pct}%`;
    if (score.completed) return '✓';
  }
  return null;
}

export default function SectionCard({ badge, title, subtitle, tagType, tagLabel, score, children }) {
  const scoreText = renderScore(score);
  return (
    <div style={{
      background: '#fff', border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)', marginBottom: 24,
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--blue-light)', borderBottom: '1.5px solid var(--border)',
        padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12,
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--blue)', color: '#fff',
          fontWeight: 900, fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {badge}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>
            {title}
            {tagType && tagLabel && <Tag type={tagType} label={tagLabel} />}
          </div>
          {subtitle && <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 3 }}>{subtitle}</div>}
        </div>
        {scoreText && (
          <div style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, color: 'var(--green)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {scoreText}
          </div>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}
