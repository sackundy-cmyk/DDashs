// ============================================================
//  src/pages/admin/Settings.jsx — admin settings
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import { useToast } from '../../components/Toast.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

export default function AdminSettings() {
  const { user, authFetch } = useAuth();
  const toast = useToast();
  const [classes, setClasses]   = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [testTo, setTestTo]     = useState(user?.email || '');
  const [cronRunning, setCronRunning] = useState(false);

  const load = () => Promise.all([
    authFetch(`${API}/classes`).then(r => r.json()),
    authFetch(`${API}/students`).then(r => r.json()),
  ]).then(([cd, sd]) => {
    setClasses(cd.classes || []);
    setStudents(sd.students || []);
  });

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const saveStudent = async (st, patch) => {
    try {
      const res = await authFetch(`${API}/users/${st.id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success('Saved');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const sendTest = async () => {
    try {
      const res = await authFetch(`${API}/users/send-test-email`, {
        method: 'POST',
        body: JSON.stringify({ to: testTo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(data.fake ? 'Test mail logged to server console (no SMTP configured)' : 'Test email sent');
    } catch (err) { toast.error(err.message); }
  };

  const runCron = async () => {
    setCronRunning(true);
    try {
      const res = await authFetch(`${API}/reports/cron/run-now`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const sent = data.results.filter(r => r.ok).length;
      toast.success(`Weekly job ran: ${sent}/${data.results.length} sent`);
    } catch (err) { toast.error(err.message); }
    finally { setCronRunning(false); }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0b2b5e', margin: 0 }}>Settings</h2>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
          Platform settings, email delivery, and parent contacts
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading…</div>
      ) : (
        <>
          <div className={s.card}>
            <div className={s.cardTitle}>Admin profile</div>
            <div style={{ color: '#0b2b5e', fontWeight: 700 }}>{user.name}</div>
            <div style={{ color: '#64748b', fontSize: 13 }}>{user.email}</div>
          </div>

          <div className={s.card}>
            <div className={s.cardTitle}>Email delivery</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="email"
                value={testTo}
                onChange={e => setTestTo(e.target.value)}
                style={{
                  flex: 1, minWidth: 220, padding: '10px 14px', borderRadius: 10,
                  border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit',
                }}
              />
              <button
                onClick={sendTest}
                style={{
                  background: '#2563eb', color: 'white', border: 'none',
                  padding: '10px 18px', borderRadius: 40, fontWeight: 700,
                  fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Send test email
              </button>
              <button
                onClick={runCron}
                disabled={cronRunning}
                style={{
                  background: cronRunning ? '#94a3b8' : '#7c3aed', color: 'white', border: 'none',
                  padding: '10px 18px', borderRadius: 40, fontWeight: 700,
                  fontSize: 14, cursor: cronRunning ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}
              >
                {cronRunning ? 'Running…' : 'Run weekly job now'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>
              Weekly parent report cron is scheduled for Sundays 18:00 server time. Without SMTP env vars, mails log to console.
            </p>
          </div>

          <div className={s.card}>
            <div className={s.cardTitle}>Weekly reports — parent contacts</div>
            <div style={{ overflowX: 'auto' }}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Parent email</th>
                    <th>Phone</th>
                    <th>Weekly report</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(st => (
                    <SettingsStudentRow key={st.id} st={st} onSave={saveStudent} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.card}>
            <div className={s.cardTitle}>All classes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {classes.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', background: '#f8fafd',
                  border: '1.5px solid #eef3f9', borderRadius: 12,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0b2b5e' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {c.teacher_name} · {c.student_count} students · {c.lesson_count} lessons
                    </div>
                  </div>
                  <span className={`${s.pill} ${s.pillBlue}`}>Active</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function SettingsStudentRow({ st, onSave }) {
  const [email, setEmail] = useState(st.parent_email || '');
  const [phone, setPhone] = useState(st.phone || '');
  const [enabled, setEnabled] = useState(st.weekly_report_enabled ?? 1);

  const dirty = email !== (st.parent_email || '')
             || phone !== (st.phone || '')
             || enabled !== (st.weekly_report_enabled ?? 1);

  return (
    <tr>
      <td><strong>{st.name}</strong></td>
      <td>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="parent@example.com"
          style={{ width: 220, padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }}
        />
      </td>
      <td>
        <input
          type="tel" value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="(optional)"
          style={{ width: 140, padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit' }}
        />
      </td>
      <td>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!enabled} onChange={e => setEnabled(e.target.checked ? 1 : 0)} />
          <span style={{ fontSize: 12, color: '#64748b' }}>{enabled ? 'On' : 'Off'}</span>
        </label>
        {dirty && (
          <button
            onClick={() => onSave(st, { parent_email: email || null, phone: phone || null, weekly_report_enabled: enabled })}
            style={{
              marginLeft: 10, padding: '5px 12px', borderRadius: 20,
              background: '#2563eb', color: 'white', border: 'none',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Save
          </button>
        )}
      </td>
    </tr>
  );
}
