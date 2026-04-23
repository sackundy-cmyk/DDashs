// ============================================================
//  src/pages/student/Dashboard.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

function statusLabel(completed, total) {
  if (!total)      return { label: 'Not Started', cls: s.pillGray };
  if (completed >= total) return { label: 'Completed',   cls: s.pillGreen };
  if (completed > 0)      return { label: 'In Progress', cls: s.pillBlue };
  return { label: 'Not Started', cls: s.pillGray };
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

  // Build per-lesson lookup: classId-unit-lessonNum → {completedSections, totalSections}
  const progressMap = {};
  progress.forEach(p => {
    const key = `${p.class_id}-${p.unit}-${p.lesson_num}`;
    progressMap[key] = p;
  });

  // Stats
  const totalLessons   = classes.reduce((s, c) => s + (c.lesson_count || 0), 0);
  const completedCount = Object.values(progressMap).filter(p => p.completed_sections >= 1).length;
  const inProgress     = Object.values(progressMap).filter(p => p.completed_sections > 0 && p.completed_sections < 5).length;

  // Recent activity: last 3 progress entries
  const recent = progress
    .filter(p => p.last_attempt_at)
    .sort((a, b) => new Date(b.last_attempt_at) - new Date(a.last_attempt_at))
    .slice(0, 3);

  // Next lesson to continue (first not fully completed)
  const nextLesson = (() => {
    for (const cls of classes) {
      for (let i = 1; i <= (cls.lesson_count || 0); i++) {
        const key = `${cls.id}-1-${i}`;
        const p = progressMap[key];
        if (!p || p.completed_sections < p.total_sections) {
          return { classId: cls.id, className: cls.name, unit: 1, lessonNum: i };
        }
      }
    }
    return null;
  })();

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, #0b2b5e 0%, #1e4a8b 100%)',
        borderRadius: 20, padding: '24px 28px', marginBottom: 28, color: 'white',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p style={{ margin: '6px 0 0', color: '#a8c4e8', fontSize: 14 }}>
          Keep up the great work — you are enrolled in {classes.length} class{classes.length !== 1 ? 'es' : ''}.
        </p>
      </div>

      {/* Stats */}
      <div className={s.statsGrid}>
        {[
          { icon: '📚', label: 'Classes Enrolled',   value: classes.length,  bg: '#dbeafe', fg: '#1e40af' },
          { icon: '✅', label: 'Lessons Touched',     value: completedCount,  bg: '#d1fae5', fg: '#065f46' },
          { icon: '🔄', label: 'In Progress',          value: inProgress,      bg: '#fef9c3', fg: '#854d0e' },
          { icon: '📋', label: 'Total Lessons',        value: totalLessons,    bg: '#ede9fe', fg: '#5b21b6' },
        ].map(st => (
          <div className={s.statCard} key={st.label}>
            <div className={s.statIcon} style={{ background: st.bg, color: st.fg }}>{st.icon}</div>
            <div>
              <div className={s.statNumber}>{st.value}</div>
              <div className={s.statLabel}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Continue learning */}
        <div className={s.card}>
          <div className={s.cardTitle}>Continue Learning</div>
          {nextLesson ? (
            <div style={{
              background: '#f0f4ff', borderRadius: 14,
              padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0b2b5e', fontSize: 15 }}>{nextLesson.className}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
                  Unit {nextLesson.unit} · Lesson {nextLesson.lessonNum}
                </div>
              </div>
              <button
                onClick={() => navigate(`/student/lesson/${nextLesson.unit}/${nextLesson.lessonNum}`)}
                style={{
                  background: '#2563eb', color: 'white', border: 'none',
                  padding: '10px 20px', borderRadius: 40, fontWeight: 700,
                  fontSize: 14, cursor: 'pointer',
                }}
              >
                Continue →
              </button>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: 14 }}>All lessons completed! Great work.</p>
          )}
        </div>

        {/* Recent activity */}
        <div className={s.card}>
          <div className={s.cardTitle}>Recent Activity</div>
          {recent.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 14 }}>No activity yet. Start your first lesson!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recent.map((r, i) => {
                const { label, cls: pCls } = statusLabel(r.completed_sections, r.total_sections);
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: '#f8fafd', borderRadius: 12,
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                        Unit {r.unit} · Lesson {r.lesson_num}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        {new Date(r.last_attempt_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`${s.pill} ${pCls}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Enrolled classes quick view */}
      <div className={s.card} style={{ marginTop: 0 }}>
        <div className={s.cardTitle}>My Classes</div>
        <div className={s.cardGrid}>
          {classes.map(cls => {
            const lessons = Array.from({ length: cls.lesson_count || 0 }, (_, i) => i + 1);
            const done = lessons.filter(i => {
              const p = progressMap[`${cls.id}-1-${i}`];
              return p && p.completed_sections > 0;
            }).length;
            const pct = cls.lesson_count ? Math.round((done / cls.lesson_count) * 100) : 0;

            return (
              <div
                key={cls.id}
                onClick={() => navigate('/student/classes')}
                style={{
                  background: '#f8fafd', border: '1.5px solid #e2e8f0',
                  borderRadius: 16, padding: '18px 20px', cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,20,50,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: cls.color || '#1E6FD9',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18, marginBottom: 10,
                }}>
                  📚
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0b2b5e', marginBottom: 4 }}>
                  {cls.name}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                  {cls.teacher_name} · {cls.lesson_count} lessons
                </div>
                <div style={{ background: '#e2e8f0', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    background: cls.color || '#1E6FD9', width: `${pct}%`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 5 }}>{pct}% complete</div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
