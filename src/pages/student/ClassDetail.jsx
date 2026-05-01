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
const PALETTE = ['#1E6FD9', '#0891B2', '#16A34A', '#D97706', '#7C3AED', '#DB2777'];

const UNIT_TITLES = {
  1: 'Decimals',
  2: 'Algebra & Patterns',
  3: 'Multiples, Factors & Primes',
  4: 'Addition & Subtraction',
  5: 'Mental & Written Calculations',
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
        title: UNIT_TITLES[unit] || `Unit ${unit}`,
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
        <Link to="/student/classes" style={{ color: '#1E6FD9', fontWeight: 700, textDecoration: 'none' }}>My Classes</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ fontWeight: 600 }}>{cls.name}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `linear-gradient(135deg, ${baseColor}, ${baseColor}cc)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${baseColor}44`,
        }}>
          <Icon name="book" size={24} color="#fff" />
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {units.map(u => (
          <div
            key={u.unit}
            onClick={() => navigate(`/student/classes/${classId}/unit/${u.unit}`)}
            style={{
              borderRadius: 16,
              border: '1.5px solid #EEF2F7',
              padding: 18,
              cursor: 'pointer',
              transition: 'all 0.18s',
              position: 'relative',
              overflow: 'hidden',
              background: '#FFFFFF',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.10)';
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#EEF2F7';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 4, background: u.color, borderRadius: '16px 16px 0 0',
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: u.color, padding: '4px 10px', borderRadius: 9999, background: `${u.color}15`,
              }}>
                Unit {u.unit}
              </div>
              <div style={{ position: 'relative', width: 48, height: 48 }}>
                <ProgressRing pct={u.pct} size={48} stroke={4} color={u.color} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#0F172A' }}>
                  {u.pct}%
                </div>
              </div>
            </div>
            <div style={{ fontSize: 'var(--font-h3)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 4 }}>
              {u.title}
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              {u.doneLessons} of {u.totalLessons} lessons complete
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
