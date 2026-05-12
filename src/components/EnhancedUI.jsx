// ============================================================
//  EnhancedUI.jsx — visual primitives shared across dashboards
//  (icons, progress ring, sparkline, badges, avatar)
// ============================================================

import { useState } from 'react';

/* ── SVG icons ─────────────────────────────────────────────── */
const PATHS = {
  dashboard:    <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  classes:      <><path d="M4 19V7a1 1 0 011-1h10a1 1 0 011 1v12"/><path d="M2 19h20"/><path d="M9 11h6"/><path d="M9 15h6"/><path d="M9 7h6"/></>,
  teachers:     <><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 21v-2a4 4 0 00-3-3.87"/></>,
  students:     <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  reports:      <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></>,
  settings:     <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
  logout:       <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  arrow_right:  <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></>,
  check:        <polyline points="20,6 9,17 4,12"/>,
  lock:         <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
  play:         <polygon points="5,3 19,12 5,21"/>,
  star:         <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>,
  chart:        <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  bell:         <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
  chevron_down: <polyline points="6,9 12,15 18,9"/>,
  chevron_up:   <polyline points="18,15 12,9 6,15"/>,
  plus:         <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  search:       <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  zap:          <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>,
  target:       <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  book:         <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>,
  trending_up:  <><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></>,
  award:        <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
  shield:       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  menu:         <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  download:     <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  edit:         <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash:        <><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></>,
  arrow_left:   <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></>,
  external:     <><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
  // ── New educational icons ──────────────────────────────────
  trophy:       <><path d="M6 9H4a2 2 0 000 4h2"/><path d="M18 9h2a2 2 0 010 4h-2"/><path d="M6 5h12v4c0 4-2.5 6-6 6s-6-2-6-6V5z"/><path d="M10 19v2"/><path d="M14 19v2"/><path d="M8 21h8"/></>,
  flame:        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7 7 7 0 01-7-7c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>,
  rocket:       <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></>,
  graduation:   <><path d="M22 10v6"/><path d="M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>,
  lightbulb:    <><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></>,
  sparkles:     <><path d="M12 3l1.88 5.76a2 2 0 001.27 1.27L21 12l-5.85 1.97a2 2 0 00-1.27 1.27L12 21l-1.88-5.76a2 2 0 00-1.27-1.27L3 12l5.85-1.97a2 2 0 001.27-1.27L12 3z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></>,
  calculator:   <><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></>,
  medal:        <><circle cx="12" cy="14" r="6"/><path d="M12 8V2"/><path d="M8.5 5.5l3.5-3.5 3.5 3.5"/><path d="M12 11v6"/></>,
  pencil:       <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>,
  compass:      <><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/></>,
  atom:         <><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/></>,
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
  const [pressed, setPressed] = useState(false);
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
      transform: pressed ? 'translateY(1px) scale(0.97)' : hov ? 'translateY(-1px)' : 'translateY(0)',
    },
    secondary: {
      background: hov ? '#F1F5F9' : '#FFFFFF',
      color: '#1E293B',
      border: '1.5px solid #E2E8F0',
      boxShadow: hov ? '0 4px 12px rgba(15,23,42,0.08)' : '0 1px 3px rgba(15,23,42,0.06)',
      transform: pressed ? 'translateY(1px) scale(0.97)' : hov ? 'translateY(-1px)' : 'translateY(0)',
    },
    ghost: {
      background: hov ? '#F1F5F9' : 'transparent',
      color: '#475569',
      transform: pressed ? 'scale(0.97)' : 'scale(1)',
    },
    danger: {
      background: hov ? '#FEE2E2' : 'transparent',
      color: hov ? '#B91C1C' : '#DC2626',
      border: '1.5px solid #FCA5A5',
      transform: pressed ? 'scale(0.97)' : 'scale(1)',
    },
    teal: {
      background: hov ? '#0E7490' : '#0891B2',
      color: '#fff',
      boxShadow: hov ? '0 8px 20px rgba(8,145,178,0.35)' : '0 2px 8px rgba(8,145,178,0.20)',
      transform: pressed ? 'translateY(1px) scale(0.97)' : hov ? 'translateY(-1px)' : 'translateY(0)',
    },
    success: {
      background: hov ? '#15803D' : '#16A34A',
      color: '#fff',
      boxShadow: hov ? '0 8px 20px rgba(22,163,74,0.35)' : '0 2px 8px rgba(22,163,74,0.20)',
      transform: pressed ? 'translateY(1px) scale(0.97)' : hov ? 'translateY(-1px)' : 'translateY(0)',
    },
  };
  return (
    <button onClick={onClick} disabled={disabled} type={type}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontFamily: 'inherit', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none', letterSpacing: '-0.01em', borderRadius: 9999,
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.15s ease',
        ...sizes[size], ...variants[variant], ...style,
      }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} color="currentColor" />}
      {children}
    </button>
  );
}
