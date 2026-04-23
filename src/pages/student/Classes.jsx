// ============================================================
//  src/pages/student/Classes.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { useToast } from '../../components/Toast.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

// Units that have real React lesson components
const REAL_UNITS = new Set([1, 2, 3, 4, 5]);

function LessonStatus({ completed, total }) {
  if (!total)           return <span className={`${s.pill} ${s.pillGray}`}>Not Started</span>;
  if (completed >= total) return <span className={`${s.pill} ${s.pillGreen}`}>Completed</span>;
  if (completed > 0)    return <span className={`${s.pill} ${s.pillBlue}`}>In Progress</span>;
  return <span className={`${s.pill} ${s.pillGray}`}>Not Started</span>;
}

function ClassCard({ cls, progress, onStartLesson, onLockedAttempt }) {
  const [open, setOpen] = useState(false);

  // Group lessons by unit
  const byUnit = {};
  (cls.lessons || []).forEach(l => {
    if (!byUnit[l.unit]) byUnit[l.unit] = [];
    byUnit[l.unit].push(l);
  });

  const totalLessons = cls.lessons?.length || 0;
  const doneLessons  = (cls.lessons || []).filter(l => {
    const p = progress[`${cls.id}-${l.unit}-${l.lesson_num}`];
    return p && p.completed_sections >= p.total_sections && p.total_sections > 0;
  }).length;
  const pct = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0;

  return (
    <div className={s.card} style={{ marginBottom: 20 }}>
      {/* Class header */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setOpen(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: cls.color || '#1E6FD9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>📚</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#0b2b5e' }}>{cls.name}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              {cls.teacher_name} · {cls.grade} · {totalLessons} lessons
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0b2b5e' }}>{pct}%</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>complete</div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: '#f0f4ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}>▼</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#e2e8f0', borderRadius: 99, height: 6, margin: '14px 0 0', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: cls.color || '#1E6FD9',
          width: `${pct}%`, transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Lessons list */}
      {open && (
        <div style={{ marginTop: 20 }}>
          {Object.entries(byUnit).map(([unit, lessons]) => (
            <div key={unit} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                marginBottom: 8, paddingLeft: 2,
              }}>
                Unit {unit}
              </div>
              {lessons.map(lesson => {
                const key = `${cls.id}-${lesson.unit}-${lesson.lesson_num}`;
                const p   = progress[key];
                const hasComponent = REAL_UNITS.has(lesson.unit);
                const btnLabel = !p || p.completed_sections === 0 ? 'Start'
                  : p.completed_sections >= p.total_sections && p.total_sections > 0 ? 'Review'
                  : 'Continue';

                return (
                  <div key={lesson.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 12,
                    background: '#f8fafd', border: '1.5px solid #eef3f9',
                    marginBottom: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: cls.color + '22',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, color: cls.color, fontWeight: 800,
                      }}>
                        {lesson.lesson_num}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                          {lesson.title}
                        </div>
                        {p && (
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                            {p.completed_sections}/{p.total_sections || '—'} sections
                            {p.avg_score ? ` · avg ${p.avg_score}%` : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <LessonStatus
                        completed={p?.completed_sections || 0}
                        total={p?.total_sections || 0}
                      />
                      {lesson.locked ? (
                        <span
                          title="Locked by your teacher"
                          onClick={() => onLockedAttempt?.()}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', borderRadius: 40,
                            background: '#fee2e2', color: '#b91c1c',
                            fontSize: 13, fontWeight: 700, cursor: 'help',
                          }}
                        >🔒 Locked</span>
                      ) : hasComponent ? (
                        <button
                          onClick={() => onStartLesson(cls.id, lesson.unit, lesson.lesson_num)}
                          style={{
                            background: '#2563eb', color: 'white', border: 'none',
                            padding: '7px 16px', borderRadius: 40, fontWeight: 700,
                            fontSize: 13, cursor: 'pointer',
                          }}
                        >
                          {btnLabel}
                        </button>
                      ) : (
                        <span className={`${s.pill} ${s.pillGray}`}>Coming soon</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentClasses() {
  const { user, authFetch } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [classes,  setClasses]  = useState([]);
  const [progress, setProgress] = useState({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all(
      // Fetch each class detail (includes lessons)
      // First get class list, then details
      [authFetch(`${API}/classes`).then(r => r.json())]
    ).then(async ([cd]) => {
      const classList = cd.classes || [];
      // Fetch details for each class
      const details = await Promise.all(
        classList.map(c => authFetch(`${API}/classes/${c.id}`).then(r => r.json()))
      );
      const merged = classList.map((c, i) => ({ ...c, lessons: details[i]?.lessons || [] }));
      setClasses(merged);

      // Build progress map from all lesson data
      const map = {};
      details.forEach(d => {
        (d.lessons || []).forEach(l => {
          const key = `${d.class?.id}-${l.unit}-${l.lesson_num}`;
          map[key] = {
            completed_sections: l.completedSections || 0,
            total_sections:     l.totalSections     || 0,
            avg_score:          l.avgScore          || null,
          };
        });
      });
      setProgress(map);
    }).finally(() => setLoading(false));
  }, [user.id]);

  const handleStartLesson = (classId, unit, lessonNum) => {
    navigate(`/student/lesson/${unit}/${lessonNum}?classId=${classId}`);
  };

  const handleLockedAttempt = () => {
    toast.info('This lesson is locked by your teacher.');
  };

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading classes…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0b2b5e', margin: 0 }}>
          My Classes
        </h2>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
          {classes.length} class{classes.length !== 1 ? 'es' : ''} enrolled — click to expand lessons
        </p>
      </div>

      {classes.length === 0 ? (
        <div className={s.card} style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <p style={{ color: '#64748b' }}>You are not enrolled in any classes yet.</p>
        </div>
      ) : (
        classes.map(cls => (
          <ClassCard
            key={cls.id}
            cls={cls}
            progress={progress}
            onStartLesson={handleStartLesson}
            onLockedAttempt={handleLockedAttempt}
          />
        ))
      )}
    </DashboardLayout>
  );
}
