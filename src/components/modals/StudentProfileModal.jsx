// ============================================================
//  StudentProfileModal — per-lesson lock table + reset password
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import Modal from '../Modal.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../Toast.jsx';
import StudentNotesTimeline from '../StudentNotesTimeline.jsx';
import curriculum from '../../data/curriculum.json';

const API = import.meta.env.VITE_API_URL || '/api';

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function StudentProfileModal({ open, onClose, student, classId: classIdProp }) {
  const { authFetch, role } = useAuth();
  const toast = useToast();

  const [progressRows, setProgressRows] = useState([]);
  const [lockedKeys, setLockedKeys] = useState(new Set());
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [classId, setClassId] = useState(classIdProp || null);
  const [loading, setLoading] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [certificates, setCertificates] = useState([]);

  const lessons = useMemo(
    () => curriculum.units.flatMap(u => u.lessons.map(l => ({ unit: u.id, lesson_num: l.id, title: l.title }))),
    []
  );

  useEffect(() => { setClassId(classIdProp || null); }, [classIdProp]);

  // Step 1: load student profile to learn enrolled classes (if classId not preset)
  useEffect(() => {
    if (!open || !student) return;
    let cancelled = false;
    setNewPwd('');
    authFetch(`${API}/students/${student.id}`).then(r => r.json()).then(data => {
      if (cancelled) return;
      const classes = data.classes || [];
      setEnrolledClasses(classes);
      setProgressRows(data.progress || []);
      if (!classIdProp && classes.length > 0) setClassId(classes[0].id);
    });
    return () => { cancelled = true; };
  }, [open, student, classIdProp, authFetch]);

  // Step 2: once we have a classId, load locks for this class + student
  useEffect(() => {
    if (!open || !student || !classId) {
      setLockedKeys(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    authFetch(`${API}/locks/class/${classId}`).then(r => r.json()).then(data => {
      if (cancelled) return;
      const keys = new Set(
        (data.locks || [])
          .filter(l => l.student_id === student.id && l.locked === 1)
          .map(l => `${l.unit}-${l.lesson_num}`)
      );
      setLockedKeys(keys);
    }).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [open, student, classId, authFetch]);

  // Step 3: load certificates for this student
  useEffect(() => {
    if (!open || !student) return;
    let cancelled = false;
    authFetch(`${API}/certificates/student/${student.id}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setCertificates(d.certificates || []); });
    return () => { cancelled = true; };
  }, [open, student, authFetch]);

  if (!student) return null;

  const accuracyFor = (unit, lessonNum) => {
    const rows = progressRows.filter(p => p.unit === unit && p.lesson_num === lessonNum && p.completed === 1);
    if (rows.length === 0) return null;
    return Math.round(rows.reduce((a, r) => a + (r.score || 0), 0) / rows.length);
  };

  const toggleLock = async (unit, lessonNum, nextLocked) => {
    if (!classId) { toast.error('Select a class first'); return; }
    try {
      const res = await authFetch(
        `${API}/locks/student/${student.id}/lesson/${classId}/${unit}/${lessonNum}`,
        { method: 'PUT', body: JSON.stringify({ locked: nextLocked }) }
      );
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const key = `${unit}-${lessonNum}`;
      setLockedKeys(prev => {
        const next = new Set(prev);
        if (nextLocked) next.add(key); else next.delete(key);
        return next;
      });
      toast.success(nextLocked ? 'Lesson locked' : 'Lesson unlocked');
    } catch (err) { toast.error(err.message); }
  };

  const sendWeeklyNow = async () => {
    if (!window.confirm(`Send this week's report now to ${student.parent_email || 'the parent on file'}?`)) return;
    try {
      const res = await authFetch(`${API}/reports/student/${student.id}/send-weekly`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(data.fake ? 'Report logged (no SMTP configured)' : 'Weekly report sent');
    } catch (err) { toast.error(err.message); }
  };

  const openPdf = () => {
    const token = localStorage.getItem('ddash_token');
    fetch(`${API}/reports/student/${student.id}/weekly.pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.blob() : r.json().then(e => { throw new Error(e.error); }))
      .then(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      })
      .catch(err => toast.error(err.message));
  };

  const resetPassword = async () => {
    if (!newPwd || newPwd.length < 6) { toast.error('Enter a password (min 6 chars)'); return; }
    if (!window.confirm(`Reset password for ${student.name}?`)) return;
    try {
      const res = await authFetch(`${API}/users/${student.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: newPwd }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success('Password reset');
      setNewPwd('');
    } catch (err) { toast.error(err.message); }
  };

  const byUnit = {};
  lessons.forEach(l => { (byUnit[l.unit] = byUnit[l.unit] || []).push(l); });

  const overallAcc = (() => {
    const completed = progressRows.filter(p => p.completed === 1);
    if (completed.length === 0) return null;
    return Math.round(completed.reduce((a, r) => a + (r.score || 0), 0) / completed.length);
  })();

  // Certificates for the currently-selected class
  const certForClass = certificates.filter(c => c.class_id === classId);
  const hasCert = (type, unit = null, lessonNum = null) =>
    certForClass.find(c => c.type === type
      && (c.unit ?? null) === unit
      && (c.lesson_num ?? null) === lessonNum);

  const issueCert = async (type, unit = null, lessonNum = null, score = null) => {
    if (!classId) { toast.error('Select a class first'); return; }
    try {
      const res = await authFetch(`${API}/certificates`, {
        method: 'POST',
        body: JSON.stringify({ studentId: student.id, classId, type, unit, lessonNum, score }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      // Reload certs
      const fresh = await authFetch(`${API}/certificates/student/${student.id}`).then(r => r.json());
      setCertificates(fresh.certificates || []);
      toast.success('Certificate issued');
    } catch (err) { toast.error(err.message); }
  };

  const revokeCert = async (certId) => {
    if (!window.confirm('Revoke this certificate?')) return;
    try {
      const res = await authFetch(`${API}/certificates/${certId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      setCertificates(prev => prev.filter(c => c.id !== certId));
      toast.success('Certificate revoked');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <Modal open={open} onClose={onClose} title={student.name} width={680}
      footer={<button onClick={onClose} style={btnPrimary}>Close</button>}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ ...avatarStyle, width: 54, height: 54, fontSize: 18 }}>{initials(student.name)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0b2b5e' }}>{student.name}</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>{student.email}</div>
          <div style={{ fontSize: 13, color: '#334155', marginTop: 4 }}>
            Overall accuracy: <b>{overallAcc == null ? '—' : `${overallAcc}%`}</b>
          </div>
        </div>
        {enrolledClasses.length > 0 && (
          <select
            value={classId || ''}
            onChange={e => setClassId(parseInt(e.target.value, 10))}
            style={{
              padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0',
              fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700,
            }}
          >
            {enrolledClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {enrolledClasses.length === 0 && (
        <div style={{
          padding: 12, background: '#fef3c7', borderRadius: 8, marginBottom: 12,
          fontSize: 13, color: '#92400e',
        }}>
          Student is not enrolled in any class — locks disabled.
        </div>
      )}

      {loading ? (
        <div style={{ color: '#64748b' }}>Loading…</div>
      ) : (
        <>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#0b2b5e', marginBottom: 8 }}>Lessons</div>
          {Object.entries(byUnit).map(([unit, ls]) => (
            <div key={unit} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Unit {unit}
              </div>
              {ls.map(l => {
                const key = `${l.unit}-${l.lesson_num}`;
                const locked = lockedKeys.has(key);
                const acc = accuracyFor(l.unit, l.lesson_num);
                return (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #eef3f9', background: '#f8fafd', marginBottom: 5,
                  }}>
                    <div style={{ flex: 1, fontSize: 13, color: '#1e293b', fontWeight: 600 }}>
                      L{l.lesson_num} · {l.title}
                    </div>
                    <span style={{ fontSize: 12, color: '#64748b', minWidth: 44 }}>
                      {acc == null ? '—' : `${acc}%`}
                    </span>
                    <button
                      onClick={() => toggleLock(l.unit, l.lesson_num, !locked)}
                      style={locked ? chipDanger : chipSuccess}
                    >
                      {locked ? '🔒' : '🔓'}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}

          {/* ── Certificates ───────────────────────────────────── */}
          <div style={{ marginTop: 18, padding: 14, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#166534', marginBottom: 8 }}>
              Certificates
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Course */}
              <CertRow
                label="Course certificate"
                sublabel={overallAcc != null ? `Average ${overallAcc}%` : null}
                cert={hasCert('course')}
                onIssue={() => issueCert('course', null, null, overallAcc)}
                onRevoke={revokeCert}
              />
              {/* Per unit */}
              {Object.keys(byUnit).map(u => {
                const unitNum = Number(u);
                const unitRows = progressRows.filter(p => p.unit === unitNum && p.completed === 1);
                const unitAcc = unitRows.length
                  ? Math.round(unitRows.reduce((a, r) => a + (r.score || 0), 0) / unitRows.length)
                  : null;
                return (
                  <CertRow
                    key={`unit-${u}`}
                    label={`Unit ${u} certificate`}
                    sublabel={unitAcc != null ? `Average ${unitAcc}%` : null}
                    cert={hasCert('unit', unitNum)}
                    onIssue={() => issueCert('unit', unitNum, null, unitAcc)}
                    onRevoke={revokeCert}
                  />
                );
              })}
              {/* Per lesson — collapsed list, each lesson row */}
              <details style={{ marginTop: 6 }}>
                <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#166534' }}>
                  Per-lesson certificates ({lessons.length})
                </summary>
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {lessons.map(l => {
                    const acc = accuracyFor(l.unit, l.lesson_num);
                    return (
                      <CertRow
                        key={`l-${l.unit}-${l.lesson_num}`}
                        label={`U${l.unit}L${l.lesson_num} · ${l.title}`}
                        sublabel={acc != null ? `Score ${acc}%` : null}
                        cert={hasCert('lesson', l.unit, l.lesson_num)}
                        onIssue={() => issueCert('lesson', l.unit, l.lesson_num, acc)}
                        onRevoke={revokeCert}
                        compact
                      />
                    );
                  })}
                </div>
              </details>
            </div>
          </div>

          <StudentNotesTimeline studentId={student.id} />

          <div style={{ marginTop: 18, padding: 14, background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#075985', marginBottom: 8 }}>
              Weekly parent report
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginBottom: 10 }}>
              Parent email: <b>{student.parent_email || '(none on file)'}</b>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={sendWeeklyNow}
                disabled={!student.parent_email}
                style={{
                  ...btnPrimary,
                  background: student.parent_email ? '#0284c7' : '#94a3b8',
                  cursor: student.parent_email ? 'pointer' : 'not-allowed',
                }}
              >
                Send now
              </button>
              <button onClick={openPdf} style={{ ...btnPrimary, background: '#64748b' }}>
                Preview PDF
              </button>
            </div>
          </div>

          {role === 'admin' && (
            <div style={{ marginTop: 18, padding: 14, background: '#fff7ed', borderRadius: 10, border: '1px solid #fed7aa' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#9a3412', marginBottom: 8 }}>
                Reset password
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="New password"
                  style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1.5px solid #fed7aa', fontFamily: 'var(--font)', fontSize: 14 }}
                />
                <button onClick={resetPassword} style={{ ...btnPrimary, background: '#ea580c' }}>Reset</button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

function CertRow({ label, sublabel, cert, onIssue, onRevoke, compact = false }) {
  const issued = !!cert;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: compact ? '6px 10px' : '8px 12px',
      borderRadius: 8,
      background: issued ? '#fff' : 'rgba(255,255,255,0.5)',
      border: '1px solid #d1fae5',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: 11, color: '#64748b' }}>{sublabel}</div>
        )}
      </div>
      {issued ? (
        <>
          <span style={{
            fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 9999,
            background: '#dcfce7', color: '#166534',
          }}>Issued</span>
          <button onClick={() => onRevoke(cert.id)} style={{
            padding: '4px 10px', borderRadius: 8, border: '1px solid #fecaca',
            background: '#fff', color: '#b91c1c', fontSize: 11, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font)',
          }}>Revoke</button>
        </>
      ) : (
        <button onClick={onIssue} style={{
          padding: '5px 12px', borderRadius: 8, border: 'none',
          background: '#16a34a', color: '#fff', fontSize: 11.5, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--font)',
        }}>Issue</button>
      )}
    </div>
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
const chipDanger = {
  padding: '4px 10px', borderRadius: 999, border: 'none',
  background: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontSize: 14,
  cursor: 'pointer',
};
const chipSuccess = {
  padding: '4px 10px', borderRadius: 999, border: 'none',
  background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 14,
  cursor: 'pointer',
};
