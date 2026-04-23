// ============================================================
//  src/pages/teacher/Dashboard.jsx
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import SvgBarChart from '../../components/charts/SvgBarChart.jsx';
import SvgLineChart from '../../components/charts/SvgLineChart.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

const UNITS = [
  { id: 1, title: 'Decimals' },
  { id: 2, title: 'Algebra & Patterns' },
  { id: 3, title: 'Multiples, Factors & Primes' },
  { id: 5, title: 'Mental & Written Calculations' },
];

export default function TeacherDashboard() {
  const { authFetch } = useAuth();
  const [classes,  setClasses]  = useState([]);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [classFilter, setClassFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [report, setReport] = useState(null); // filter-scoped aggregate

  useEffect(() => {
    Promise.all([
      authFetch(`${API}/classes`).then(r => r.json()),
      authFetch(`${API}/students`).then(r => r.json()),
    ]).then(([cd, sd]) => {
      setClasses(cd.classes || []);
      setStudents(sd.students || []);
    }).finally(() => setLoading(false));
  }, []);

  // Refetch report aggregate when filters change and a specific class is picked
  useEffect(() => {
    if (classFilter === 'all') { setReport(null); return; }
    const url = `${API}/reports/class/${classFilter}${unitFilter !== 'all' ? `?unit=${unitFilter}` : ''}`;
    authFetch(url).then(r => r.json()).then(setReport).catch(() => setReport(null));
  }, [classFilter, unitFilter]);

  const filteredStudents = useMemo(() => {
    if (classFilter === 'all') return students;
    return students.filter(st => (st.class_ids || []).includes(+classFilter) ||
                                  st.class_id === +classFilter ||
                                  st.classes?.some?.(c => c.id === +classFilter));
  }, [students, classFilter]);

  const totalStudents = filteredStudents.length;
  const avgAccuracy   = report
    ? (report.perStudent.length
        ? Math.round(report.perStudent.reduce((a, s) => a + (s.accuracy || 0), 0) / report.perStudent.length)
        : 0)
    : (filteredStudents.length
        ? Math.round(filteredStudents.reduce((a, st) => a + (st.avg_score || 0), 0) / filteredStudents.length)
        : 0);
  const needHelp = (report ? report.perStudent : filteredStudents)
    .filter(s => ((report ? s.accuracy : s.avg_score) || 0) < 50).length;

  const chartData = (report ? report.perStudent : filteredStudents).slice(0, 10).map(s => ({
    label: (s.name || '').split(' ')[0],
    value: Math.round((report ? s.accuracy : s.avg_score) || 0),
    color: ((report ? s.accuracy : s.avg_score) || 0) >= 80 ? '#16a34a'
         : ((report ? s.accuracy : s.avg_score) || 0) >= 50 ? '#2563eb'
         : '#dc2626',
  }));

  const trendData = report?.trend?.map(t => ({ label: t.label, value: t.accuracy })) || [];

  const weakStudents = (report ? report.perStudent : filteredStudents)
    .filter(s => ((report ? s.accuracy : s.avg_score) || 0) < 60)
    .sort((a, b) => ((report ? a.accuracy : a.avg_score) || 0) - ((report ? b.accuracy : b.avg_score) || 0))
    .slice(0, 5);

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading…</div>
    </DashboardLayout>
  );

  const selectStyle = {
    padding: '8px 14px', borderRadius: 40, border: '1.5px solid #e2e8f0',
    fontSize: 13, fontFamily: 'inherit', background: 'white', cursor: 'pointer', outline: 'none',
  };

  return (
    <DashboardLayout>
      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Filter
        </span>
        <select value={classFilter} onChange={e => { setClassFilter(e.target.value); setUnitFilter('all'); }} style={selectStyle}>
          <option value="all">All classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={unitFilter}
          onChange={e => setUnitFilter(e.target.value)}
          style={{ ...selectStyle, opacity: classFilter === 'all' ? 0.5 : 1 }}
          disabled={classFilter === 'all'}
        >
          <option value="all">All units</option>
          {UNITS.map(u => <option key={u.id} value={u.id}>Unit {u.id} — {u.title}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className={s.statsGrid}>
        {[
          { icon: '📚', label: 'My Classes',    value: classes.length,  bg: '#dbeafe', fg: '#1e40af' },
          { icon: '👥', label: 'Total Students', value: totalStudents,   bg: '#d1fae5', fg: '#065f46' },
          { icon: '🎯', label: 'Avg Accuracy',   value: `${avgAccuracy}%`, bg: '#ede9fe', fg: '#5b21b6' },
          { icon: '⚠️', label: 'Need Help',       value: needHelp,        bg: '#fef3c7', fg: '#92400e' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        <div className={s.card}>
          <div className={s.cardTitle}>Student Accuracy {unitFilter !== 'all' ? `— Unit ${unitFilter}` : ''}</div>
          <SvgBarChart
            data={chartData}
            height={220}
            maxValue={100}
            format={v => `${v}%`}
            emptyText="No progress data yet."
          />
        </div>

        <div className={s.card}>
          <div className={s.cardTitle}>Needs Attention</div>
          {weakStudents.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 14 }}>All students doing well!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {weakStudents.map(st => (
                <div key={st.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: '#fff7f7', borderRadius: 12,
                  border: '1px solid #fee2e2',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{st.name}</div>
                  <span className={`${s.pill} ${s.pillRed}`}>
                    {Math.round((report ? st.accuracy : st.avg_score) || 0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trend line (only when a class is picked) */}
      {classFilter !== 'all' && (
        <div className={s.card} style={{ marginTop: 24 }}>
          <div className={s.cardTitle}>Class accuracy — last 8 weeks</div>
          <SvgLineChart data={trendData} height={220} emptyText="Not enough historical data yet." />
        </div>
      )}

      <div className={s.card} style={{ marginTop: 24 }}>
        <div className={s.cardTitle}>My Classes</div>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Class</th>
              <th>Grade</th>
              <th>Students</th>
              <th>Lessons</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls.id}>
                <td><strong>{cls.name}</strong></td>
                <td>{cls.grade}</td>
                <td>{cls.student_count}</td>
                <td>{cls.lesson_count}</td>
                <td><span className={`${s.pill} ${s.pillGreen}`}>Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
