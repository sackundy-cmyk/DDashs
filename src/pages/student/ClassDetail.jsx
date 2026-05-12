// ============================================================
//  src/pages/student/ClassDetail.jsx — units grid for a class
//  Route: /student/classes/:classId
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon, ProgressRing } from '../../components/EnhancedUI.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';
const PALETTE = ['#58CC02', '#1CB0F6', '#FF9600', '#CE82FF', '#FF4B4B', '#FFC800'];

const UNIT_TITLES = {
  1: 'Decimals',
  2: 'Algebra & Patterns',
  3: 'Multiples, Factors & Primes',
  4: 'Addition & Subtraction',
  5: 'Mental & Written Calculations',
  6: 'Geometry',
  7: 'Integers',
};

const UNIT_ICONS = {
  1: 'calculator',
  2: 'atom',
  3: 'sparkles',
  4: 'calculator',
  5: 'lightbulb',
  6: 'compass',
  7: 'flame',
};

export default function ClassDetail() {
  const { classId } = useParams();
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ class: null, lessons: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API}/classes/${classId}`)
      .then(r => r.json())
      .then(d => setData({ class: d.class || null, lessons: d.lessons || [] }))
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading…</div>
    </DashboardLayout>
  );

  if (!data.class) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Class not found.</div>
    </DashboardLayout>
  );

  const cls = data.class;
  const baseColor = cls.color || PALETTE[0];

  // Group lessons by unit
  const byUnit = new Map();
  data.lessons.forEach(l => {
    if (!byUnit.has(l.unit)) byUnit.set(l.unit, []);
    byUnit.get(l.unit).push(l);
  });

  const units = [...byUnit.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([unit, lessons], idx) => {
      const total = lessons.length;
      const done = lessons.filter(l => l.completedSections >= l.totalSections && l.totalSections > 0).length;
      return {
        unit,
        displayNum: idx + 1,
        title: UNIT_TITLES[unit] || `Unit ${idx + 1}`,
        color: PALETTE[idx % PALETTE.length],
        totalLessons: total,
        doneLessons: done,
        pct: total ? Math.round((done / total) * 100) : 0,
      };
    });

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 8, fontSize: 13, color: '#64748B' }}>
        <Link to="/student/classes" style={{ color: '#1CB0F6', fontWeight: 700, textDecoration: 'none' }}>My Classes</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ fontWeight: 600 }}>{cls.name}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: `linear-gradient(145deg, ${baseColor}, ${baseColor}bb)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 18px ${baseColor}44`,
        }}>
          <Icon name="book" size={26} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
            {cls.name}
          </h2>
          <div style={{ fontSize: 'var(--font-small)', color: '#64748B', marginTop: 2 }}>
            {cls.teacher_name} · {cls.grade} · {data.lessons.length} lessons across {units.length} units
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {units.map((u, idx) => (
          <div
            key={u.unit}
            className={`anim-fade-up anim-delay-${Math.min(idx + 1, 6)}`}
            onClick={() => navigate(`/student/classes/${classId}/unit/${u.unit}`)}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              background: '#FFFFFF',
              border: '2px solid #F0F4FF',
              cursor: 'pointer',
              transition: 'transform 0.30s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
              boxShadow: '0 2px 10px rgba(15,23,42,0.06)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = `0 18px 40px ${u.color}44, 0 4px 12px rgba(15,23,42,0.08)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(15,23,42,0.06)';
            }}
          >
            {/* Vivid gradient header */}
            <div style={{
              height: 130,
              background: `linear-gradient(145deg, ${u.color} 0%, ${u.color}99 60%, ${u.color}cc 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '0 20px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Dot texture */}
              <svg style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none' }} width="100%" height="100%">
                <defs>
                  <pattern id={`dots-${u.unit}`} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="8" cy="8" r="1.2" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#dots-${u.unit})`} />
              </svg>
              {/* Subject icon — top-right corner */}
              <div style={{
                position: 'absolute', top: 10, right: 14,
                opacity: 0.45, pointerEvents: 'none',
              }}>
                <Icon name={UNIT_ICONS[u.unit] || 'book'} size={22} color="#fff" />
              </div>
              {/* Big unit number circle */}
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(255,255,255,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 900, color: '#fff',
                position: 'relative',
              }}>
                {u.displayNum}
              </div>
              <div style={{
                fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.90)',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                position: 'relative',
              }}>
                Unit {u.displayNum}
              </div>
            </div>

            {/* White body */}
            <div style={{ padding: '16px 20px 20px' }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', lineHeight: 1.3, marginBottom: 12 }}>
                {u.title}
              </div>

              {/* Progress bar + % */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, height: 8, background: '#F0F4FF', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${u.pct}%`, height: '100%',
                    background: u.color, borderRadius: 4,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: u.color, minWidth: 44, textAlign: 'right' }}>
                  {u.pct}%
                </div>
              </div>

              <div style={{
                fontSize: 11, color: '#94A3B8', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {u.doneLessons} of {u.totalLessons} lessons complete
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
