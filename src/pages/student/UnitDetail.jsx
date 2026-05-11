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
  const distinctUnits = [...new Set(data.lessons.map(l => l.unit))].sort((a, b) => a - b);
  const unitColorIdx = distinctUnits.indexOf(unitNum);
  const unitColor = PALETTE[unitColorIdx % PALETTE.length];
  // Display number is rank within this class (1-based), not the raw unit ID
  const displayUnitNum = unitColorIdx + 1;

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
        <Link to="/student/classes" style={{ color: '#1CB0F6', fontWeight: 700, textDecoration: 'none' }}>My Classes</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link to={`/student/classes/${classId}`} style={{ color: '#1CB0F6', fontWeight: 700, textDecoration: 'none' }}>{cls.name}</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ fontWeight: 600 }}>Unit {displayUnitNum}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: `linear-gradient(145deg, ${unitColor}, ${unitColor}bb)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 18px ${unitColor}44`,
        }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{displayUnitNum}</span>
        </div>
        <div>
          <h2 style={{ fontSize: 'var(--font-h1)', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
            {UNIT_TITLES[unitNum] || `Unit ${displayUnitNum}`}
          </h2>
          <div style={{ fontSize: 'var(--font-small)', color: '#64748B', marginTop: 2 }}>
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {lessons.map(l => {
          const status = lessonStatus(l);
          const action = actionLabel(status);
          const pct = l.totalSections ? Math.round((l.completedSections / l.totalSections) * 100) : 0;
          const isLocked = status === 'locked';
          const blockColor = isLocked ? '#94A3B8' : unitColor;
          return (
            <div
              key={`${l.unit}-${l.lesson_num}`}
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                background: '#FFFFFF',
                border: '2px solid #F0F4FF',
                opacity: isLocked ? 0.55 : 1,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
                filter: isLocked ? 'grayscale(0.4)' : 'none',
              }}
              onMouseEnter={e => {
                if (isLocked) return;
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 10px 26px ${unitColor}2a`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,0.05)';
              }}
            >
              {/* Color block with big lesson number */}
              <div style={{
                height: 88,
                background: isLocked
                  ? 'linear-gradient(145deg, #CBD5E1, #94A3B8)'
                  : `linear-gradient(145deg, ${unitColor}, ${unitColor}bb)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}>
                {isLocked ? (
                  <Icon name="lock" size={28} color="rgba(255,255,255,0.7)" />
                ) : (
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 900, color: '#fff',
                  }}>
                    {l.lesson_num}
                  </div>
                )}
              </div>

              {/* White body */}
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 10 }}>
                  {l.title}
                </div>

                {l.totalSections > 0 && (
                  <div style={{ height: 6, background: '#F0F4FF', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: blockColor, borderRadius: 3,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                )}

                <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 12 }}>
                  {l.totalSections > 0
                    ? `${l.completedSections}/${l.totalSections} sections${l.avgScore ? ` · avg ${l.avgScore}%` : ''}`
                    : 'Not started'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <Badge variant={status} />
                  {!isLocked && (
                    <LiftButton variant={action.variant} size="sm" icon={status === 'complete' ? 'check' : 'play'} onClick={() => handleClick(l)}>
                      {action.label}
                    </LiftButton>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
