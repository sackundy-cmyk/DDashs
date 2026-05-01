// ============================================================
//  EnhancedUI.jsx — visual primitives shared across dashboards
//  (icons, progress ring, sparkline, badges, avatar)
// ============================================================

import { useState } from 'react';

/* ── SVG icons ─────────────────────────────────────────────── */
const PATHS = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  classes: <><path d="M4 19V7a1 1 0 011-1h10a1 1 0 011 1v12"/><path d="M2 19h20"/><path d="M9 11h6"/><path d="M9 15h6"/><path d="M9 7h6"/></>,
  teachers: <><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/></>,
  students: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  reports: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
  logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  arrow_right: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></>,
  check: <polyline points="20,6 9,17 4,12"/>,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
  play: <polygon points="5,3 19,12 5,21"/>,
  star: <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>,
  chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
  chevron_down: <polyline points="6,9 12,15 18,9"/>,
  chevron_up: <polyline points="18,15 12,9 6,15"/>,
  plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  zap: <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>,
  target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  book: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
  trending_up: <><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></>,
  award: <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
};

export function Icon({ name, size = 18, color = 'currentColor', style }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      {path}
    </svg>
  );
}

/* ── Progress ring ─────────────────────────────────────────── */
export function ProgressRing({ pct = 0, size = 44, stroke = 4, color = '#1E6FD9', track = '#E2E8F0' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, pct)) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  );
}

/* ── Mini sparkline ────────────────────────────────────────── */
export function Sparkline({ data, color = '#1E6FD9', height = 28, width = 64 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Avatar (initials) ─────────────────────────────────────── */
export function Avatar({ name = '', size = 36, bg = '#1E6FD9', color = '#fff' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0, letterSpacing: '-0.02em',
    }}>{initials}</div>
  );
}

/* ── Badge ─────────────────────────────────────────────────── */
const BADGE_STYLES = {
  'in-progress': { bg: '#DBEAFE', color: '#1E40AF', label: 'In Progress' },
  'not-started': { bg: '#F1F5F9', color: '#475569', label: 'Not Started' },
  'complete':    { bg: '#DCFCE7', color: '#166534', label: 'Complete' },
  'completed':   { bg: '#DCFCE7', color: '#166534', label: 'Completed' },
  'locked':      { bg: '#FEF3C7', color: '#92400E', label: 'Locked' },
  'excellent':   { bg: '#DCFCE7', color: '#166534', label: 'Excellent' },
  'good':        { bg: '#DBEAFE', color: '#1E40AF', label: 'Good' },
  'fair':        { bg: '#FEF9C3', color: '#854D0E', label: 'Fair' },
  'needs-help':  { bg: '#FEE2E2', color: '#B91C1C', label: 'Needs Help' },
  'no-data':     { bg: '#F1F5F9', color: '#64748B', label: 'No Data' },
};

export function Badge({ variant = 'no-data', label }) {
  const s = BADGE_STYLES[variant] || BADGE_STYLES['no-data'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 9999,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.01em',
    }}>
      {variant === 'locked' && <Icon name="lock" size={11} color={s.color} />}
      {label || s.label}
    </span>
  );
}

/* ── Lift button (rounded-full primary with hover lift) ───── */
export function LiftButton({ children, variant = 'primary', size = 'md', icon, onClick, style = {}, disabled = false, type }) {
  const [hov, setHov] = useState(false);
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 12 },
    md: { padding: '9px 18px', fontSize: 13 },
    lg: { padding: '12px 24px', fontSize: 14 },
  };
  const variants = {
    primary: {
      background: hov ? '#1558B0' : '#1E6FD9',
      color: '#fff',
      boxShadow: hov ? '0 8px 22px rgba(30,111,217,0.38)' : '0 2px 8px rgba(30,111,217,0.22)',
      transform: hov ? 'translateY(-1px)' : 'translateY(0)',
    },
    secondary: {
      background: hov ? '#F1F5F9' : '#FFFFFF',
      color: '#1E293B',
      border: '1.5px solid #E2E8F0',
      boxShadow: hov ? '0 4px 12px rgba(15,23,42,0.08)' : '0 1px 3px rgba(15,23,42,0.06)',
      transform: hov ? 'translateY(-1px)' : 'translateY(0)',
    },
    ghost: {
      background: hov ? '#F1F5F9' : 'transparent',
      color: '#475569',
    },
    danger: {
      background: hov ? '#FEE2E2' : 'transparent',
      color: hov ? '#B91C1C' : '#DC2626',
      border: '1.5px solid #FCA5A5',
    },
    teal: {
      background: hov ? '#0E7490' : '#0891B2',
      color: '#fff',
      boxShadow: hov ? '0 8px 20px rgba(8,145,178,0.35)' : '0 2px 8px rgba(8,145,178,0.20)',
      transform: hov ? 'translateY(-1px)' : 'translateY(0)',
    },
    success: {
      background: hov ? '#15803D' : '#16A34A',
      color: '#fff',
      boxShadow: hov ? '0 8px 20px rgba(22,163,74,0.35)' : '0 2px 8px rgba(22,163,74,0.20)',
      transform: hov ? 'translateY(-1px)' : 'translateY(0)',
    },
  };
  return (
    <button onClick={onClick} disabled={disabled} type={type}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontFamily: 'inherit', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none', letterSpacing: '-0.01em', borderRadius: 9999,
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.18s ease',
        ...sizes[size], ...variants[variant], ...style,
      }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} color="currentColor" />}
      {children}
    </button>
  );
}
