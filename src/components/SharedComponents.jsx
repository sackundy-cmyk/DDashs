// ============================================================
//  SharedComponents.jsx — small atomic UI components
//  Exported individually for easy import
// ============================================================

import React from 'react';

/* ── ObjectiveCard ─────────────────────────────────────────── */
export function ObjectiveCard({ text }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--blue-dark), var(--blue))',
      color: '#fff', borderRadius: 'var(--radius-lg)',
      padding: '20px 24px', marginBottom: 24,
    }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
        🎯 Learning Objective
      </h2>
      <p style={{ fontSize: 19, fontWeight: 800 }}>{text}</p>
    </div>
  );
}

/* ── ExplainPanel ──────────────────────────────────────────── */
export function ExplainPanel({ title, children }) {
  return (
    <div style={{
      background: '#fff', border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24,
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--blue)', marginBottom: 10 }}>
        📐 {title}
      </h3>
      {children}
    </div>
  );
}

export function RuleBox({ children }) {
  return (
    <div style={{
      background: 'var(--blue-light)', border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '13px 16px',
      margin: '10px 0', fontSize: 15, lineHeight: 1.9,
    }}>
      {children}
    </div>
  );
}

/* ── ScoreTrack ────────────────────────────────────────────── */
export function ScoreTrack({ completed, total }) {
  const pct = Math.round((completed / total) * 100);
  return (
    <div style={{
      background: '#fff', border: '1.5px solid var(--border)',
      borderRadius: 14, padding: '16px 20px', marginBottom: 20,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Progress</div>
      <div style={{ flex: 1, height: 14, background: '#E2E8F0', borderRadius: 7, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(to right, var(--green), #4ADE80)',
          borderRadius: 7, width: `${pct}%`, transition: 'width .5s ease',
        }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--green)', whiteSpace: 'nowrap' }}>
        {completed} / {total} done
      </div>
    </div>
  );
}

/* ── GuidedHint ────────────────────────────────────────────── */
export function GuidedHint({ children }) {
  return (
    <div style={{
      background: 'var(--amber-bg)', border: '1px solid var(--amber-border)',
      borderRadius: 'var(--radius-sm)', padding: '10px 14px',
      fontSize: 14, color: 'var(--amber)', fontWeight: 700, marginBottom: 14,
    }}>
      💡 <strong>Guided:</strong> {children}
    </div>
  );
}

/* ── FeedbackBox ───────────────────────────────────────────── */
const FB_STYLES = {
  correct: { bg: 'var(--green-bg)', color: 'var(--green)', border: '1.5px solid var(--green-border)' },
  wrong:   { bg: 'var(--red-bg)',   color: 'var(--red)',   border: '1.5px solid var(--red-border)'   },
  hint:    { bg: 'var(--amber-bg)', color: 'var(--amber)', border: '1.5px solid var(--amber-border)' },
};

export function FeedbackBox({ type, message }) {
  if (!message) return null;
  const s = FB_STYLES[type] || FB_STYLES.wrong;
  return (
    <div style={{
      background: s.bg, color: s.color, border: s.border,
      borderRadius: 'var(--radius-sm)', padding: '12px 16px',
      fontSize: 15, fontWeight: 700, marginTop: 10,
    }}>
      {message}
    </div>
  );
}

/* ── LblCircle ─────────────────────────────────────────────── */
export function LblCircle({ letter }) {
  return (
    <span style={{
      background: 'var(--blue)', color: '#fff',
      minWidth: 40, height: 40, borderRadius: '50%',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, fontWeight: 900, flexShrink: 0,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {String(letter).toUpperCase()}
    </span>
  );
}

/* ── NumChip ───────────────────────────────────────────────── */
export function NumChip({ value, color = 'var(--blue)', size = 28 }) {
  return (
    <span style={{
      background: color, color: '#fff',
      borderRadius: 10, padding: '4px 16px',
      fontSize: size, fontWeight: 900, lineHeight: 1.35,
      display: 'inline-block', boxShadow: 'var(--shadow-sm)',
      verticalAlign: 'middle',
    }}>
      {value}
    </span>
  );
}

/* ── Frac — stacked fraction (numerator / line / denominator) ── */
export function Frac({ num, den, size = 22, color = 'var(--blue)' }) {
  return (
    <span style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
      verticalAlign: 'middle', margin: '0 4px', lineHeight: 1,
    }}>
      <span style={{ fontSize: size, fontWeight: 900, color, lineHeight: 1.1 }}>{num}</span>
      <span style={{ display: 'block', borderBottom: `2.5px solid ${color}`, width: '100%', minWidth: size * 0.9 }} />
      <span style={{ fontSize: size, fontWeight: 900, color, lineHeight: 1.1 }}>{den}</span>
    </span>
  );
}

/* ── CheckButton ───────────────────────────────────────────── */
export function CheckButton({ label = '✓ Check', onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#94A3B8' : '#D97706',
        color: '#fff', border: 'none', borderRadius: 10,
        padding: '13px 30px', fontSize: 17, fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--font)', marginTop: 14, minHeight: 48,
        display: 'inline-flex', alignItems: 'center', gap: 7,
        boxShadow: disabled ? 'none' : '0 3px 12px rgba(217,119,6,0.35)',
        transition: 'background .15s, transform .1s, box-shadow .15s',
      }}
    >
      {label}
    </button>
  );
}

/* ── Summary ───────────────────────────────────────────────── */
export function Summary({ score, total, message }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 100;
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--blue-dark), var(--blue))',
      color: '#fff', borderRadius: 'var(--radius-lg)',
      padding: 32, textAlign: 'center', marginTop: 32,
    }}>
      <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>🎉 Lesson Complete!</h2>
      <div style={{ fontSize: 64, fontWeight: 900, margin: '12px 0', lineHeight: 1 }}>{pct}%</div>
      <div style={{ fontSize: 40, margin: '12px 0', display: 'flex', justifyContent: 'center', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ color: i < stars ? '#FBBF24' : 'rgba(255,255,255,.3)' }}>★</span>
        ))}
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, opacity: 0.9, maxWidth: 420, margin: '0 auto' }}>
        {message || (pct >= 90 ? 'Excellent work!' : pct >= 70 ? 'Good job! Review any tricky questions.' : 'Keep practising — you\'re getting there!')}
      </p>
    </div>
  );
}
