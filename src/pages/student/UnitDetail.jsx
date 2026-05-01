// ============================================================
//  src/pages/student/UnitDetail.jsx — lessons grid for a unit
//  Route: /student/classes/:classId/unit/:unit
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon, Badge, LiftButton } from '../../components/EnhancedUI.jsx';

const API = import.meta.env.VITE_API_URL || '/api';
const PALETTE = ['#1E6FD9', '#0891B2', '#16A34A', '#D97706', '#7C3AED', '#DB2777'];

const UNIT_TITLES = {
  1: 'Decimals',
  2: 'Algebra & Patterns',
  3: 'Multiples, Factors & Primes',
  4: 'Addition & Subtraction',
  5: 'Mental & Written Calculations',
};

function lessonStatus(l) {
  if (l.locked) return 'locked';
  if (!l.totalSections) return 'not-started';
  if (l.completedSections >= l.totalSections) return 'complete';
  if (l.completedSections > 0) return 'in-progress';
  return 'not-started';
}

function actionLabel(status) {
  if (status === 'complete') return { label: 'Review', variant: 'secondary' };
  if (status === 'in-progress') return { label: 'Continue', variant: 'primary' };
  return { label: 'Start', variant: 'primary' };
}

export default function UnitDetail() {
  const { classId, unit } = useParams();
  const unitNum = Number(unit);
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
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
  const lessons = data.lessons.filter(l => l.unit === unitNum);
  // Pick a unit color: use unit index in distinct unit list
  const distinctUnits = [...new Set(data.lessons.map(l => l.unit))].sort((a, b) => a - b);
  const unitColorIdx = distinctUnits.indexOf(unitNum);
  const unitColor = PALETTE[unitColorIdx % PALETTE.length];

  const handleClick = (l) => {
    if (l.locked) {
      toast.info('This lesson is locked by your teacher.');
      return;
    }
    navigate(`/student/lesson/${l.unit}/${l.lesson_num}?classId=${classId}`);
  };

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 8, fontSize: 13, color: '#64748B' }}>
        <Link to="/student/classes" style={{ color: '#1E6FD9', fontWeight: 700, textDecoration: 'none' }}>My Classes</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link to={`/student/classes/${classId}`} style={{ color: '#1E6FD9', fontWeight: 700, textDecoration: 'none' }}>{cls.name}</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ fontWeight: 600 }}>Unit {unitNum}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: `linear-gradient(135deg, ${unitColor}, ${unitColor}cc)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${unitColor}44`,
        }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{unitNum}</span>
        </div>
        <div>
          <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
            {UNIT_TITLES[unitNum] || `Unit ${unitNum}`}
          </h2>
          <div style={{ fontSize: 'var(--font-small)', color: '#64748B', marginTop: 2 }}>
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {lessons.map(l => {
          const status = lessonStatus(l);
          const action = actionLabel(status);
          const pct = l.totalSections ? Math.round((l.completedSections / l.totalSections) * 100) : 0;
          return (
            <div
              key={`${l.unit}-${l.lesson_num}`}
              style={{
                borderRadius: 14,
                border: '1.5px solid #EEF2F7',
                padding: 16,
                background: '#FFFFFF',
                position: 'relative',
                overflow: 'hidden',
                opacity: status === 'locked' ? 0.65 : 1,
                transition: 'all 0.18s',
              }}
              onMouseEnter={e => {
                if (status === 'locked') return;
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(15,23,42,0.08)';
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
                height: 3, background: unitColor, borderRadius: '14px 14px 0 0',
              }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: status === 'locked' ? '#F1F5F9' : `${unitColor}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: status === 'locked' ? '#94A3B8' : unitColor,
                }}>
                  {status === 'locked' ? <Icon name="lock" size={14} color="#94A3B8" /> : l.lesson_num}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', flex: 1, minWidth: 0 }}>
                  {l.title}
                </div>
              </div>

              {l.totalSections > 0 && (
                <div style={{ height: 4, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: unitColor, borderRadius: 4,
                  }} />
                </div>
              )}

              <div style={{ fontSize: 11.5, color: '#64748B', marginBottom: 12 }}>
                {l.totalSections > 0
                  ? `${l.completedSections}/${l.totalSections} sections${l.avgScore ? ` · avg ${l.avgScore}%` : ''}`
                  : 'No progress yet'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <Badge variant={status} />
                {status !== 'locked' && (
                  <LiftButton variant={action.variant} size="sm" icon={status === 'complete' ? 'check' : 'play'} onClick={() => handleClick(l)}>
                    {action.label}
                  </LiftButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
