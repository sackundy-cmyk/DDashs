// ============================================================
//  src/pages/admin/Reports.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import SvgBarChart from '../../components/charts/SvgBarChart.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

const UNITS = [
  { id: 1, title: 'Decimals' },
  { id: 2, title: 'Algebra & Patterns' },
  { id: 3, title: 'Multiples, Factors & Primes' },
  { id: 5, title: 'Mental & Written Calculations' },
];

export default function AdminReports() {
  const { authFetch } = useAuth();
  const [classes,   setClasses]   = useState([]);
  const [classId,   setClassId]   = useState('');
  const [unit,      setUnit]      = useState('all');
  const [search,    setSearch]    = useState('');
  const [students,  setStudents]  = useState([]);
  const [report,    setReport]    = useState(null);
  const [generated, setGenerated] = useState(false);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    authFetch(`${API}/classes`).then(r => r.json()).then(d => {
      const list = d.classes || [];
      setClasses(list);
      if (list.length) setClassId(String(list[0].id));
    });
  }, []);

  const generate = async () => {
    setLoading(true);
    if (!classId) {
      const res = await authFetch(`${API}/students`);
      const data = await res.json();
      setStudents(data.students || []);
      setReport(null);
    } else {
      const [sRes, rRes] = await Promise.all([
        authFetch(`${API}/classes/${classId}/students`).then(r => r.json()),
        authFetch(`${API}/reports/class/${classId}${unit !== 'all' ? `?unit=${unit}` : ''}`).then(r => r.json()),
      ]);
      setStudents(sRes.students || []);
      setReport(rRes);
    }
    setGenerated(true);
    setLoading(false);
  };

  const openPdf = (studentId) => {
    const token = localStorage.getItem('ddash_token');
    fetch(`${API}/reports/student/${studentId}/weekly.pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.blob() : r.json().then(e => { throw new Error(e.error); }))
      .then(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      })
      .catch(err => alert(err.message));
  };

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Sections Completed', 'Avg Score (%)', 'Last Active'],
      ...students.map(st => [
        st.name, st.email,
        st.sections_done ?? st.sections_completed ?? 0,
        st.avg_score ? Math.round(st.avg_score) : 0,
        st.last_active ? new Date(st.last_active).toLocaleDateString() : 'Never',
      ]),
    ];
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'ddash-admin-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const selectedClass = classes.find(c => String(c.id) === classId);
  const visible = students.filter(st => {
    const q = search.toLowerCase();
    return !q || (st.name || '').toLowerCase().includes(q) || (st.email || '').toLowerCase().includes(q);
  });

  const selectStyle = {
    flex: 1, padding: '12px 18px', borderRadius: 40,
    border: '1.5px solid #e2e8f0', fontSize: 15,
    fontFamily: 'inherit', background: 'white', outline: 'none', cursor: 'pointer',
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0b2b5e', margin: 0 }}>Platform Reports</h2>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
          Generate and export performance data across the entire platform
        </p>
      </div>

      <div className={s.card}>
        <div className={s.cardTitle}>Report Settings</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={classId} onChange={e => setClassId(e.target.value)} style={selectStyle}>
            <option value="">All Classes (Platform-wide)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={unit}
            onChange={e => setUnit(e.target.value)}
            style={{ ...selectStyle, opacity: classId ? 1 : 0.5 }}
            disabled={!classId}
          >
            <option value="all">All units</option>
            {UNITS.map(u => <option key={u.id} value={u.id}>Unit {u.id} — {u.title}</option>)}
          </select>
          <input
            type="text"
            placeholder="Search students…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...selectStyle, cursor: 'text', minWidth: 180 }}
          />
          <button
            onClick={generate}
            disabled={loading}
            style={{
              background: loading ? '#93c5fd' : '#2563eb', color: 'white',
              border: 'none', padding: '12px 28px', borderRadius: 40,
              fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Generating…' : 'Generate →'}
          </button>
          {generated && (
            <button
              onClick={exportCSV}
              style={{
                background: '#16a34a', color: 'white', border: 'none',
                padding: '12px 24px', borderRadius: 40, fontWeight: 700,
                fontSize: 15, cursor: 'pointer',
              }}
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {generated && report && (report.perUnit || []).length > 0 && (
        <div className={s.card}>
          <div className={s.cardTitle}>Accuracy by Unit</div>
          <SvgBarChart
            data={(report.perUnit || []).map(u => ({
              label: `U${u.unit}`,
              value: Math.round(u.accuracy || 0),
              color: (u.accuracy || 0) >= 80 ? '#16a34a' : (u.accuracy || 0) >= 50 ? '#2563eb' : '#dc2626',
            }))}
            maxValue={100}
            format={v => `${v}%`}
          />
        </div>
      )}

      {generated && (
        <div className={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className={s.cardTitle} style={{ margin: 0 }}>
              {classId ? selectedClass?.name : 'All Students'} — {visible.length} records
              {unit !== 'all' && classId ? ` · Unit ${unit}` : ''}
            </div>
            <span className={`${s.pill} ${s.pillBlue}`}>
              Platform avg: {visible.length
                ? Math.round(visible.reduce((a, st) => a + (st.avg_score || 0), 0) / visible.length)
                : 0}%
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Student</th><th>Email</th>
                  <th>Sections Done</th><th>Avg Score</th>
                  <th>Last Active</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(st => {
                  const score = st.avg_score;
                  const cls = score === null ? s.pillGray
                    : score >= 80 ? s.pillGreen : score >= 60 ? s.pillBlue
                    : score >= 40 ? s.pillYellow : s.pillRed;
                  const lbl = score === null ? 'No data'
                    : score >= 80 ? 'Excellent' : score >= 60 ? 'Good'
                    : score >= 40 ? 'Fair' : 'Needs Help';
                  return (
                    <tr key={st.id}>
                      <td><strong>{st.name}</strong></td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>{st.email}</td>
                      <td>{st.sections_done ?? st.sections_completed ?? 0}</td>
                      <td>{score ? `${Math.round(score)}%` : '—'}</td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>
                        {st.last_active ? new Date(st.last_active).toLocaleDateString() : 'Never'}
                      </td>
                      <td><span className={`${s.pill} ${cls}`}>{lbl}</span></td>
                      <td>
                        <button
                          onClick={() => openPdf(st.id)}
                          style={{
                            padding: '5px 12px', borderRadius: 20, border: '1px solid #e2e8f0',
                            background: 'white', fontSize: 12, fontWeight: 600,
                            color: '#475569', cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
