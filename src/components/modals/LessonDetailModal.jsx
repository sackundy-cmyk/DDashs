// ============================================================
//  LessonDetailModal — students + per-student lock for one lesson
// ============================================================

import { useEffect, useState } from 'react';
import Modal from '../Modal.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../Toast.jsx';

const API = import.meta.env.VITE_API_URL || '/api';

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function LessonDetailModal({ open, onClose, classId, lesson }) {
  const { authFetch } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [lockedIds, setLockedIds] = useState(new Set());
  const [progressRows, setProgressRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !classId || !lesson) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      authFetch(`${API}/classes/${classId}/students`).then(r => r.json()),
      authFetch(`${API}/classes/${classId}/progress`).then(r => r.json()),
      authFetch(`${API}/locks/class/${classId}`).then(r => r.json()),
    ])
      .then(([sData, pData, lData]) => {
        if (cancelled) return;
        setStudents(sData.students || []);
        setProgressRows(pData.progress || []);
        const ids = new Set(
          (lData.locks || [])
            .filter(l => l.unit === lesson.unit && l.lesson_num === lesson.lesson_num && l.locked === 1)
            .map(l => l.student_id)
        );
        setLockedIds(ids);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [open, classId, lesson, authFetch]);

  if (!lesson) return null;

  const accuracyFor = (studentId) => {
    const rows = progressRows.filter(
      p => p.student_id === studentId && p.unit === lesson.unit && p.lesson_num === lesson.lesson_num && p.completed === 1
    );
    if (rows.length === 0) return null;
    return Math.round(rows.reduce((a, r) => a + (r.score || 0), 0) / rows.length);
  };

  const toggleLock = async (studentId, nextLocked) => {
    try {
      const res = await authFetch(
        `${API}/locks/student/${studentId}/lesson/${classId}/${lesson.unit}/${lesson.lesson_num}`,
        { method: 'PUT', body: JSON.stringify({ locked: nextLocked }) }
      );
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      setLockedIds(prev => {
        const next = new Set(prev);
        if (nextLocked) next.add(studentId); else next.delete(studentId);
        return next;
      });
      toast.success(nextLocked ? 'Lesson locked' : 'Lesson unlocked');
    } catch (err) { toast.error(err.message); }
  };

  const bulk = async (locked) => {
    try {
      const res = await authFetch(
        `${API}/locks/class/${classId}/lesson/${lesson.unit}/${lesson.lesson_num}/bulk`,
        { method: 'POST', body: JSON.stringify({ locked, studentIds: 'all' }) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const next = new Set();
      if (locked) students.forEach(s => next.add(s.id));
      setLockedIds(next);
      toast.success(`${locked ? 'Locked' : 'Unlocked'} for ${data.count} students`);
    } catch (err) { toast.error(err.message); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Lesson · Unit ${lesson.unit} · ${lesson.title}`}
      width={680}
      footer={<>
        <button onClick={() => bulk(true)}  style={btnDanger}>🔒 Lock all</button>
        <button onClick={() => bulk(false)} style={btnSuccess}>🔓 Unlock all</button>
        <button onClick={onClose} style={btnPrimary}>Done</button>
      </>}
    >
      {loading ? (
        <div style={{ color: '#64748b' }}>Loading…</div>
      ) : students.length === 0 ? (
        <div style={{ color: '#64748b' }}>No students enrolled.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {students.map(stu => {
            const acc = accuracyFor(stu.id);
            const locked = lockedIds.has(stu.id);
            return (
              <div key={stu.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10,
                border: '1px solid #e2e8f0', background: '#f8fafd',
              }}>
                <div style={avatarStyle}>{initials(stu.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0b2b5e' }}>{stu.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {acc == null ? 'No attempts' : `${acc}% accuracy`}
                  </div>
                </div>
                <button
                  onClick={() => toggleLock(stu.id, !locked)}
                  style={locked ? btnDangerSmall : btnSuccessSmall}
                >
                  {locked ? '🔒 Locked' : '🔓 Unlocked'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

const avatarStyle = {
  width: 34, height: 34, borderRadius: '50%',
  background: '#dbeafe', color: '#1e40af',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 12, fontWeight: 800,
};
const btnPrimary = {
  padding: '9px 16px', borderRadius: 8, border: 'none',
  background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
};
const btnDanger = {
  padding: '9px 14px', borderRadius: 8, border: '1.5px solid #fecaca',
  background: '#fff', color: '#b91c1c', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
};
const btnSuccess = {
  padding: '9px 14px', borderRadius: 8, border: '1.5px solid #bbf7d0',
  background: '#fff', color: '#15803d', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
};
const btnDangerSmall = {
  padding: '6px 12px', borderRadius: 999, border: 'none',
  background: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontSize: 12,
  cursor: 'pointer', fontFamily: 'var(--font)',
};
const btnSuccessSmall = {
  padding: '6px 12px', borderRadius: 999, border: 'none',
  background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 12,
  cursor: 'pointer', fontFamily: 'var(--font)',
};
