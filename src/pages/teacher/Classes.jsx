// ============================================================
//  src/pages/teacher/Classes.jsx
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import LessonDetailModal from '../../components/modals/LessonDetailModal.jsx';
import ConfirmDialog from '../../components/modals/ConfirmDialog.jsx';
import { useToast } from '../../components/Toast.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

function StudentRoster({ classId, color }) {
  const { authFetch } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [unenrollDialog, setUnenrollDialog] = useState({ open: false, student: null });

  const load = useCallback(() => {
    setLoading(true);
    authFetch(`${API}/classes/${classId}/students`)
      .then(r => r.json())
      .then(d => setStudents(d.students || []))
      .finally(() => setLoading(false));
  }, [classId, authFetch]);

  useEffect(() => { load(); }, [load]);

  const doUnenroll = async () => {
    const st = unenrollDialog.student;
    if (!st) return;
    try {
      const res = await authFetch(`${API}/classes/${classId}/students/${st.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success(`${st.name} unenrolled`);
      load();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div style={{ fontSize: 13, color: '#94a3b8', padding: '8px 0' }}>Loading studentsâ€¦</div>;
  if (students.length === 0) return <div style={{ fontSize: 13, color: '#94a3b8', padding: '8px 0' }}>No students enrolled.</div>;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {students.map(st => {
          const initials = st.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div key={st.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 8,
              background: '#f8fafd', border: '1px solid #eef3f9',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: 'white',
              }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{st.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {st.sections_done ?? 0} sections Â· {st.avg_score != null ? `${Math.round(st.avg_score)}% avg` : 'no score'}
                </div>
              </div>
              <button
                onClick={() => setUnenrollDialog({ open: true, student: st })}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: '1px solid #fecaca',
                  background: '#fff5f5', fontSize: 12, fontWeight: 600,
                  color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                }}
              >
                Unenroll
              </button>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={unenrollDialog.open}
        onClose={() => setUnenrollDialog({ open: false, student: null })}
        onConfirm={doUnenroll}
        title="Unenroll student"
        message={`Remove ${unenrollDialog.student?.name} from this class? Their progress is kept.`}
        confirmLabel="Unenroll"
      />
    </>
  );
}

function ClassRow({ cls, onOpenLesson }) {
  const [open,    setOpen]    = useState(false);
  const [detail,  setDetail]  = useState(null);
  const [section, setSection] = useState('lessons');
  const { authFetch } = useAuth();

  const load = async () => {
    if (detail) { setOpen(v => !v); return; }
    const res = await authFetch(`${API}/classes/${cls.id}`);
    const data = await res.json();
    setDetail(data);
    setOpen(true);
  };

  const byUnit = {};
  (detail?.lessons || []).forEach(l => {
    (byUnit[l.unit] = byUnit[l.unit] || []).push(l);
  });

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={load}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: '#f8fafd',
          border: '1.5px solid #e2e8f0', borderRadius: open ? '14px 14px 0 0' : 14,
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: cls.color || '#1CB0F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>ðŸ“š</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0b2b5e' }}>{cls.name}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {cls.grade} Â· {cls.student_count} students Â· {cls.lesson_count} lessons
            </div>
          </div>
        </div>
        <span style={{ fontSize: 18, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : '' }}>â–¼</span>
      </div>

      {open && (
        <div style={{
          border: '1.5px solid #e2e8f0', borderTop: 'none',
          borderRadius: '0 0 14px 14px', background: 'white', padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {['lessons', 'students'].map(tab => (
              <button
                key={tab}
                onClick={() => setSection(tab)}
                style={{
                  padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
                  background: section === tab ? (cls.color || '#2563eb') : '#f1f5f9',
                  color: section === tab ? '#fff' : '#475569',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {section === 'lessons' && (
            Object.keys(byUnit).length === 0
              ? <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>No lessons assigned.</p>
              : Object.entries(byUnit).map(([unit, lessons]) => (
                <div key={unit} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Unit {unit}
                  </div>
                  {lessons.map(l => {
                    const pct = l.completedSections && l.totalSections
                      ? Math.round((l.completedSections / l.totalSections) * 100) : 0;
                    return (
                      <div
                        key={l.id}
                        onClick={() => onOpenLesson(cls, l)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: 10,
                          background: '#f8fafd', marginBottom: 6,
                          border: '1px solid #eef3f9', cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                          {l.order_index + 1}. {l.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ background: '#e2e8f0', borderRadius: 99, height: 6, width: 80, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 99, background: cls.color || '#2563eb', width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#64748b', width: 36 }}>{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
          )}

          {section === 'students' && (
            <StudentRoster classId={cls.id} color={cls.color} />
          )}
        </div>
      )}
    </div>
  );
}

export default function TeacherClasses() {
  const { authFetch } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lessonModal, setLessonModal] = useState({ open: false, classId: null, lesson: null });

  useEffect(() => {
    authFetch(`${API}/classes`).then(r => r.json())
      .then(d => setClasses(d.classes || []))
      .finally(() => setLoading(false));
  }, []);

  const openLesson = (cls, l) => setLessonModal({
    open: true,
    classId: cls.id,
    lesson: { unit: l.unit, lesson_num: l.lesson_num, title: l.title },
  });

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0b2b5e', margin: 0 }}>My Classes</h2>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
          {classes.length} class{classes.length !== 1 ? 'es' : ''} â€” expand to manage lessons and students
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loadingâ€¦</div>
      ) : classes.length === 0 ? (
        <div className={s.card} style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: '#64748b' }}>No classes assigned yet.</p>
        </div>
      ) : (
        classes.map(cls => <ClassRow key={cls.id} cls={cls} onOpenLesson={openLesson} />)
      )}

      <LessonDetailModal
        open={lessonModal.open}
        classId={lessonModal.classId}
        lesson={lessonModal.lesson}
        onClose={() => setLessonModal({ open: false, classId: null, lesson: null })}
      />
    </DashboardLayout>
  );
}
