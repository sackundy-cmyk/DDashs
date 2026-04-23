// ============================================================
//  src/pages/admin/Dashboard.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

export default function AdminDashboard() {
  const { authFetch } = useAuth();
  const [data,    setData]    = useState({ teachers: [], students: [], classes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch(`${API}/users?role=teacher`).then(r => r.json()),
      authFetch(`${API}/students`).then(r => r.json()),
      authFetch(`${API}/classes`).then(r => r.json()),
    ]).then(([td, sd, cd]) => {
      setData({ teachers: td.users || [], students: sd.students || [], classes: cd.classes || [] });
    }).finally(() => setLoading(false));
  }, []);

  const avgAccuracy = data.students.length
    ? Math.round(data.students.reduce((a, s) => a + (s.avg_score || 0), 0) / data.students.length)
    : 0;

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading…</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* Stats */}
      <div className={s.statsGrid}>
        {[
          { icon: '🎓', label: 'Total Teachers', value: data.teachers.length, bg: '#dbeafe', fg: '#1e40af' },
          { icon: '👥', label: 'Total Students', value: data.students.length, bg: '#d1fae5', fg: '#065f46' },
          { icon: '📚', label: 'Total Classes',  value: data.classes.length,  bg: '#ede9fe', fg: '#5b21b6' },
          { icon: '🎯', label: 'Platform Avg',   value: `${avgAccuracy}%`,     bg: '#fef9c3', fg: '#854d0e' },
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
        {/* Teachers summary */}
        <div className={s.card}>
          <div className={s.cardTitle}>Teachers</div>
          <table className={s.table}>
            <thead><tr><th>Name</th><th>Email</th></tr></thead>
            <tbody>
              {data.teachers.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong></td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{t.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Classes summary */}
        <div className={s.card}>
          <div className={s.cardTitle}>Classes Overview</div>
          <table className={s.table}>
            <thead><tr><th>Class</th><th>Teacher</th><th>Students</th></tr></thead>
            <tbody>
              {data.classes.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: c.color || '#2563eb', flexShrink: 0,
                      }} />
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{c.teacher_name}</td>
                  <td>{c.student_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent students needing help */}
      <div className={s.card}>
        <div className={s.cardTitle}>Students Needing Attention</div>
        <table className={s.table}>
          <thead>
            <tr><th>Student</th><th>Email</th><th>Classes</th><th>Avg Score</th><th>Status</th></tr>
          </thead>
          <tbody>
            {data.students
              .filter(st => (st.avg_score || 0) < 60)
              .slice(0, 8)
              .map(st => (
                <tr key={st.id}>
                  <td><strong>{st.name}</strong></td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{st.email}</td>
                  <td>{st.class_count || 0}</td>
                  <td>{st.avg_score ? `${Math.round(st.avg_score)}%` : '—'}</td>
                  <td>
                    <span className={`${s.pill} ${(st.avg_score || 0) < 40 ? s.pillRed : s.pillYellow}`}>
                      {(st.avg_score || 0) < 40 ? 'Needs Help' : 'Fair'}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
