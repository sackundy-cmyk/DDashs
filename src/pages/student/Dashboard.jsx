// ============================================================
//  src/pages/student/Dashboard.jsx — enhanced design
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { Icon, ProgressRing, Sparkline, Badge, LiftButton } from '../../components/EnhancedUI.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

const CLASS_PALETTE = ['#58CC02', '#1CB0F6', '#FF9600', '#CE82FF', '#FF4B4B', '#FFC800'];

function classColor(cls, idx) {
  return cls.color || CLASS_PALETTE[idx % CLASS_PALETTE.length];
}

function statusVariant(p) {
  if (!p) return 'not-started';
  if (p.completed_sections >= p.total_sections && p.total_sections > 0) return 'complete';
  if (p.completed_sections > 0) return 'in-progress';
  return 'not-started';
}

const STAT_COLORS = {
  blue:   { bar: '#1565C0', tint: '#D0EFFE' },
  teal:   { bar: '#1CB0F6', tint: '#D0EFFE' },
  amber:  { bar: '#FF9600', tint: '#FFF0D0' },
  purple: { bar: '#CE82FF', tint: '#F3E8FF' },
  green:  { bar: '#58CC02', tint: '#D7F5B3' },
};

function StatCard({ label, value, icon, color = 'blue', sparkData, trend }) {
  const c = STAT_COLORS[color] || STAT_COLORS.blue;
  const trendCls = trend > 0 ? s.trendUp : trend < 0 ? s.trendDown : s.trendFlat;
  return (
    <div className={s.statCard}>
      <div className={s.statTopBar} style={{ background: c.bar }} />
      <div className={s.statHead}>
        <div className={s.statIconBox} style={{ background: c.tint }}>
          <Icon name={icon} size={20} color={c.bar} />
        </div>
        {sparkData && <Sparkline data={sparkData} color={c.bar} />}
      </div>
      <div>
        <div className={s.statNumber}>{value}</div>
        <div className={s.statLabel}>{label}</div>
      </div>
      {trend !== undefined && (
        <div className={`${s.statTrend} ${trendCls}`}>
          <Icon name="trending_up" size={13} color="currentColor" />
          {trend > 0 ? '+' : ''}{trend}% this week
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [classes,  setClasses]  = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch(`${API}/classes`).then(r => r.json()),
      authFetch(`${API}/progress/summary/${user.id}`).then(r => r.json()),
    ]).then(([cd, pd]) => {
      setClasses(cd.classes || []);
      setProgress(pd.summary || []);
    }).finally(() => setLoading(false));
  }, [user.id]);

  // Build per-lesson lookup
  const progressMap = {};
  progress.forEach(p => {
    progressMap[`${p.class_id}-${p.unit}-${p.lesson_num}`] = p;
  });

  // Stats
  const totalLessons   = classes.reduce((acc, c) => acc + (c.lesson_count || 0), 0);
  const touchedCount   = Object.values(progressMap).filter(p => p.completed_sections >= 1).length;
  const inProgress     = Object.values(progressMap).filter(p => p.completed_sections > 0 && p.completed_sections < (p.total_sections || 5)).length;

  // Recent activity
  const recent = progress
    .filter(p => p.last_attempt_at)
    .sort((a, b) => new Date(b.last_attempt_at) - new Date(a.last_attempt_at))
    .slice(0, 3);

  // Next lesson to continue
  const nextLesson = (() => {
    for (const cls of classes) {
      for (let i = 1; i <= (cls.lesson_count || 0); i++) {
        const key = `${cls.id}-1-${i}`;
        const p = progressMap[key];
        if (!p || p.completed_sections < (p.total_sections || 1)) {
          return { classId: cls.id, className: cls.name, unit: 1, lessonNum: i, p };
        }
      }
    }
    return null;
  })();

  // Overall progress %
  const sectionsDone = progress.reduce((acc, p) => acc + (p.completed_sections || 0), 0);
  const sectionsTotal = progress.reduce((acc, p) => acc + (p.total_sections || 0), 0);
  const overallPct = sectionsTotal ? Math.round((sectionsDone / sectionsTotal) * 100) : 0;

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading…</div>
    </DashboardLayout>
  );

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* ── Welcome banner ── */}
        <div style={{
          borderRadius: 18,
          padding: '24px 28px',
          background: 'linear-gradient(120deg, #0A1628 0%, #0D1F45 50%, #0C2A5C 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          {/* Dot pattern */}
          <svg style={{ position: 'absolute', inset: 0, opacity: 0.1, pointerEvents: 'none' }} width="100%" height="100%">
            <defs>
              <pattern id="ddash-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ddash-dots)" />
          </svg>
          {/* Glow blob */}
          <div style={{
            position: 'absolute', right: 100, top: -40,
            width: 220, height: 220, borderRadius: '50%',
            background: 'rgba(21,101,192,0.35)', filter: 'blur(48px)', pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#A5B4FC', marginBottom: 8,
            }}>Welcome back</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6 }}>
              Good day, {firstName}! 👋
            </div>
            <div style={{ fontSize: 13.5, color: '#C7D2FE', fontWeight: 500 }}>
              You're enrolled in {classes.length} class{classes.length !== 1 ? 'es' : ''} · Keep up the great work!
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              {nextLesson && (
                <LiftButton
                  variant="secondary" icon="play"
                  onClick={() => navigate(`/student/lesson/${nextLesson.unit}/${nextLesson.lessonNum}?classId=${nextLesson.classId}`)}
                  style={{ background: '#fff', color: '#312E81', border: 'none' }}
                >
                  Continue Learning
                </LiftButton>
              )}
              <div style={{ fontSize: 12.5, color: '#A5B4FC', fontWeight: 600 }}>
                {overallPct}% overall progress
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <ProgressRing pct={overallPct} size={80} stroke={6} color="#22D3EE" track="rgba(255,255,255,0.18)" />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{overallPct}%</div>
                <div style={{ fontSize: 9, color: '#A5B4FC', fontWeight: 600 }}>done</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className={s.statsGrid} style={{ marginBottom: 0 }}>
          <StatCard label="Classes Enrolled" value={classes.length} icon="classes" color="blue" />
          <StatCard label="Lessons Touched"  value={touchedCount}    icon="book"    color="teal" />
          <StatCard label="In Progress"      value={inProgress}      icon="zap"     color="amber" />
          <StatCard label="Total Lessons"    value={totalLessons}    icon="chart"   color="purple" />
        </div>

        {/* ── Continue + Recent activity ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {/* Continue learning */}
          <div className={s.card} style={{ marginBottom: 0 }}>
            <div className={s.cardTitle}>Continue Learning</div>
            {nextLesson ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 12,
                background: '#F8FAFC', border: '1.5px solid #E2E8F0',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, #1E6FD9, #6366F1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name="book" size={20} color="#fff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {nextLesson.className}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    Unit {nextLesson.unit} · Lesson {nextLesson.lessonNum}
                  </div>
                  <div style={{ marginTop: 8, height: 4, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${nextLesson.p ? Math.round(((nextLesson.p.completed_sections || 0) / Math.max(1, nextLesson.p.total_sections || 1)) * 100) : 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #1E6FD9, #22D3EE)',
                      borderRadius: 4,
                    }} />
                  </div>
                </div>
                <LiftButton variant="primary" size="sm" icon="play"
                  onClick={() => navigate(`/student/lesson/${nextLesson.unit}/${nextLesson.lessonNum}?classId=${nextLesson.classId}`)}>
                  Continue
                </LiftButton>
              </div>
            ) : (
              <div style={{ color: '#64748B', fontSize: 14 }}>All lessons completed! Great work.</div>
            )}
          </div>

          {/* Recent activity */}
          <div className={s.card} style={{ marginBottom: 0 }}>
            <div className={s.cardTitle}>Recent Activity</div>
            {recent.length === 0 ? (
              <div style={{ color: '#64748B', fontSize: 14 }}>No activity yet. Start your first lesson!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recent.map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 10,
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: '#EEF2FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon name="book" size={15} color="#1E6FD9" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                        Unit {r.unit} · Lesson {r.lesson_num}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                        {new Date(r.last_attempt_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={statusVariant(r)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── My Classes ── */}
        <div className={s.card} style={{ marginBottom: 0 }}>
          <div className={s.cardTitle}>My Classes</div>
          <div className={s.cardGrid}>
            {classes.map((cls, idx) => {
              const lessons = Array.from({ length: cls.lesson_count || 0 }, (_, i) => i + 1);
              const done = lessons.filter(i => {
                const p = progressMap[`${cls.id}-1-${i}`];
                return p && p.completed_sections > 0;
              }).length;
              const pct = cls.lesson_count ? Math.round((done / cls.lesson_count) * 100) : 0;
              const color = classColor(cls, idx);

              return (
                <div
                  key={cls.id}
                  onClick={() => navigate('/student/classes')}
                  style={{
                    borderRadius: 14,
                    border: '1.5px solid #EEF2F7',
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#FFFFFF',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 6px 22px rgba(15,23,42,0.10)';
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
                    height: 3, background: color, borderRadius: '14px 14px 0 0',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 11,
                      background: color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="book" size={18} color="#fff" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <ProgressRing pct={pct} size={40} stroke={4} color={color} />
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#334155', marginTop: 2 }}>{pct}%</div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 13.5, fontWeight: 800, color: '#0F172A',
                    letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 4,
                  }}>{cls.name}</div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>{cls.teacher_name}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{cls.lesson_count} lessons</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
