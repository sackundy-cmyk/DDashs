// ============================================================
//  src/pages/teacher/Students.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import StudentProfileModal from '../../components/modals/StudentProfileModal.jsx';
import AddStudentModal from '../../components/modals/AddStudentModal.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

function perfLabel(score) {
  if (score === null || score === undefined) return { text: 'No data', cls: s.pillGray };
  if (score >= 80)  return { text: 'Excellent',   cls: s.pillGreen  };
  if (score >= 60)  return { text: 'Good',         cls: s.pillBlue   };
  if (score >= 40)  return { text: 'Fair',         cls: s.pillYellow };
  return             { text: 'Needs Help',          cls: s.pillRed    };
}

function StudentCard({ student, onClick }) {
  const { text, cls: pCls } = perfLabel(student.avg_score);
  const initials = student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const lastActive = student.last_active
    ? new Date(student.last_active).toLocaleDateString()
    : 'Never';

  return (
    <div
      onClick={onClick}
      style={{
      background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 16,
      padding: '20px', boxShadow: '0 1px 4px rgba(0,20,50,0.05)',
      transition: 'box-shadow 0.2s', cursor: 'pointer',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,20,50,0.10)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,20,50,0.05)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #1e40af)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: 'white', flexShrink: 0,
        }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0b2b5e' }}>{student.name}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{student.email}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Classes',    value: student.class_count || 0 },
          { label: 'Avg Score',  value: student.avg_score ? `${Math.round(student.avg_score)}%` : '—' },
          { label: 'Last Active', value: lastActive },
        ].map(item => (
          <div key={item.label} style={{ background: '#f8fafd', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: '#64748b' }}>{item.label}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0b2b5e' }}>{item.value}</div>
          </div>
        ))}
        <div style={{ background: '#f8fafd', borderRadius: 10, padding: '8px 12px' }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Lessons Done</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0b2b5e' }}>{student.lessons_completed ?? 0}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{student.sections_completed ?? 0} sections</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`${s.pill} ${pCls}`}>{text}</span>
      </div>
    </div>
  );
}

export default function TeacherStudents() {
  const { authFetch } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [loading,  setLoading]  = useState(true);
  const [profile, setProfile] = useState({ open: false, student: null });
  const [addOpen, setAddOpen] = useState(false);

  const reload = () => authFetch(`${API}/students`).then(r => r.json())
    .then(d => setStudents(d.students || []));

  useEffect(() => {
    Promise.all([
      authFetch(`${API}/students`).then(r => r.json()),
      authFetch(`${API}/classes`).then(r => r.json()),
    ]).then(([sData, cData]) => {
      setStudents(sData.students || []);
      setClasses(cData.classes || []);
    }).finally(() => setLoading(false));
  }, []);

  const visible = students.filter(st => {
    const matchSearch = st.name.toLowerCase().includes(search.toLowerCase()) ||
                        st.email.toLowerCase().includes(search.toLowerCase());
    const score = st.avg_score;
    const matchFilter = filter === 'all'    ? true
      : filter === 'excellent' ? (score ?? 0) >= 80
      : filter === 'good'      ? (score ?? 0) >= 60 && (score ?? 0) < 80
      : filter === 'needshelp' ? (score ?? 0) < 60 || score === null
      : true;
    return matchSearch && matchFilter;
  });

  const selectStyle = {
    padding: '10px 16px', borderRadius: 40, border: '1.5px solid #e2e8f0',
    fontSize: 14, fontFamily: 'inherit', cursor: 'pointer', background: 'white', outline: 'none',
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0b2b5e', margin: 0 }}>Students</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            {students.length} students across your classes
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          style={{
            padding: '10px 16px', borderRadius: 8, border: 'none',
            background: '#2563eb', color: '#fff', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
          }}
        >+ Add Student</button>
      </div>

      <div className={s.searchBar}>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={s.searchInput}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Students</option>
          <option value="excellent">Excellent (≥80%)</option>
          <option value="good">Good (60–79%)</option>
          <option value="needshelp">Needs Help (&lt;60%)</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading…</div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
            Showing {visible.length} of {students.length} students
          </p>
          <div className={s.cardGrid}>
            {visible.map(st => (
              <StudentCard key={st.id} student={st} onClick={() => setProfile({ open: true, student: st })} />
            ))}
          </div>
          {visible.length === 0 && (
            <div className={s.card} style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: '#64748b' }}>No students match your search.</p>
            </div>
          )}
        </>
      )}

      <StudentProfileModal
        open={profile.open}
        student={profile.student}
        onClose={() => setProfile({ open: false, student: null })}
      />
      <AddStudentModal
        open={addOpen}
        classes={classes}
        onClose={() => setAddOpen(false)}
        onCreated={() => reload()}
      />
    </DashboardLayout>
  );
}
