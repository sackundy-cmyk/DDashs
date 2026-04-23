// ============================================================
//  src/pages/admin/Students.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import StudentProfileModal from '../../components/modals/StudentProfileModal.jsx';
import AddStudentModal from '../../components/modals/AddStudentModal.jsx';
import BulkImportStudentsModal from '../../components/modals/BulkImportStudentsModal.jsx';
import ConfirmDialog from '../../components/modals/ConfirmDialog.jsx';
import { useToast } from '../../components/Toast.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

function perfLabel(score) {
  if (score === null || score === undefined) return { text: 'No data',   cls: s.pillGray   };
  if (score >= 80)  return { text: 'Excellent', cls: s.pillGreen  };
  if (score >= 60)  return { text: 'Good',       cls: s.pillBlue   };
  if (score >= 40)  return { text: 'Fair',       cls: s.pillYellow };
  return             { text: 'Needs Help',        cls: s.pillRed    };
}

export default function AdminStudents() {
  const { authFetch } = useAuth();
  const toast = useToast();

  const [active,   setActive]   = useState([]);
  const [deleted,  setDeleted]  = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [tab,      setTab]      = useState('active');
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [loading,  setLoading]  = useState(true);

  const [profile,       setProfile]       = useState({ open: false, student: null });
  const [addOpen,       setAddOpen]       = useState(false);
  const [bulkOpen,      setBulkOpen]      = useState(false);
  const [deleteDialog,  setDeleteDialog]  = useState({ open: false, student: null });

  const reload = async () => {
    const [sAll, sDeleted, cData] = await Promise.all([
      authFetch(`${API}/students`).then(r => r.json()),
      authFetch(`${API}/students?includeDeleted=1`).then(r => r.json()),
      authFetch(`${API}/classes`).then(r => r.json()),
    ]);
    const all = sAll.students || [];
    const allWithDeleted = sDeleted.students || [];
    setActive(all);
    setDeleted(allWithDeleted.filter(s => !!s.deleted_at));
    setClasses(cData.classes || []);
  };

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  const resetPassword = async (st, e) => {
    e.stopPropagation();
    const pwd = window.prompt(`Enter a new password for ${st.name}:`);
    if (!pwd) return;
    try {
      const res = await authFetch(`${API}/users/${st.id}/reset-password`, {
        method: 'POST', body: JSON.stringify({ password: pwd }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success(`Password reset for ${st.name}`);
    } catch (err) { toast.error(err.message); }
  };

  const doDelete = async () => {
    const st = deleteDialog.student;
    if (!st) return;
    try {
      const res = await authFetch(`${API}/users/${st.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success(`${st.name} moved to Deleted`);
      reload();
    } catch (err) { toast.error(err.message); }
  };

  const doRestore = async (st, e) => {
    e.stopPropagation();
    try {
      const res = await authFetch(`${API}/users/${st.id}/restore`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success(`${st.name} restored`);
      reload();
    } catch (err) { toast.error(err.message); }
  };

  const list = tab === 'active' ? active : deleted;

  const visible = list.filter(st => {
    const q = search.toLowerCase();
    const matchSearch = st.name.toLowerCase().includes(q) || st.email.toLowerCase().includes(q);
    if (tab === 'deleted') return matchSearch;
    const score = st.avg_score;
    const matchFilter = filter === 'all'       ? true
      : filter === 'excellent'  ? (score ?? 0) >= 80
      : filter === 'good'       ? (score ?? 0) >= 60 && (score ?? 0) < 80
      : filter === 'fair'       ? (score ?? 0) >= 40 && (score ?? 0) < 60
      : filter === 'needshelp'  ? ((score ?? 0) < 40 || score === null)
      : true;
    return matchSearch && matchFilter;
  });

  const selectStyle = {
    padding: '10px 16px', borderRadius: 40, border: '1.5px solid #e2e8f0',
    fontSize: 14, fontFamily: 'inherit', background: 'white', outline: 'none', cursor: 'pointer',
  };

  const tabBtn = (value, label) => (
    <button
      onClick={() => { setTab(value); setSearch(''); setFilter('all'); }}
      style={{
        padding: '8px 20px', borderRadius: 40, border: 'none', cursor: 'pointer',
        fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
        background: tab === value ? '#2563eb' : '#f1f5f9',
        color: tab === value ? '#fff' : '#475569',
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0b2b5e', margin: 0 }}>Students</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            {active.length} active · {deleted.length} deleted
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setBulkOpen(true)}
            style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}
          >
            Bulk Import
          </button>
          <button
            onClick={() => setAddOpen(true)}
            style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}
          >
            + Add Student
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabBtn('active',  `Active (${active.length})`)}
        {tabBtn('deleted', `Deleted (${deleted.length})`)}
      </div>

      <div className={s.searchBar} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={s.searchInput}
        />
        {tab === 'active' && (
          <select value={filter} onChange={e => setFilter(e.target.value)} style={selectStyle}>
            <option value="all">All</option>
            <option value="excellent">Excellent (≥80%)</option>
            <option value="good">Good (60–79%)</option>
            <option value="fair">Fair (40–59%)</option>
            <option value="needshelp">Needs Help (&lt;40%)</option>
          </select>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading…</div>
      ) : (
        <div className={s.card} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Showing {visible.length} of {list.length} {tab === 'deleted' ? 'deleted' : ''} students
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Classes</th>
                  <th>Lessons Done</th>
                  <th>Avg Score</th>
                  <th>Last Active</th>
                  {tab === 'active' && <th>Performance</th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={tab === 'active' ? 8 : 7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                      {tab === 'deleted' ? 'No deleted students.' : 'No students match this filter.'}
                    </td>
                  </tr>
                ) : visible.map(st => {
                  const { text, cls: pCls } = perfLabel(st.avg_score);
                  const initials = st.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr
                      key={st.id}
                      onClick={() => tab === 'active' && setProfile({ open: true, student: st })}
                      style={{ cursor: tab === 'active' ? 'pointer' : 'default', opacity: tab === 'deleted' ? 0.7 : 1 }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: tab === 'deleted'
                              ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                              : 'linear-gradient(135deg, #2563eb, #1e40af)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0,
                          }}>{initials}</div>
                          <strong>{st.name}</strong>
                        </div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>{st.email}</td>
                      <td>{st.class_count || 0}</td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{st.lessons_completed ?? 0}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{st.sections_completed ?? 0} sections</div>
                      </td>
                      <td>{st.avg_score ? `${Math.round(st.avg_score)}%` : '—'}</td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>
                        {st.last_active ? new Date(st.last_active).toLocaleDateString() : 'Never'}
                      </td>
                      {tab === 'active' && (
                        <td><span className={`${s.pill} ${pCls}`}>{text}</span></td>
                      )}
                      <td>
                        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                          {tab === 'active' ? (
                            <>
                              <button
                                onClick={e => resetPassword(st, e)}
                                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                Reset PW
                              </button>
                              <button
                                onClick={() => setDeleteDialog({ open: true, student: st })}
                                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff5f5', fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={e => doRestore(st, e)}
                              style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #bbf7d0', background: '#f0fdf4', fontSize: 12, fontWeight: 600, color: '#16a34a', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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
        onCreated={reload}
      />
      <BulkImportStudentsModal
        open={bulkOpen}
        classes={classes}
        onClose={() => setBulkOpen(false)}
        onImported={reload}
      />
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, student: null })}
        onConfirm={doDelete}
        title="Delete student"
        message={`Delete "${deleteDialog.student?.name}"? Their progress is preserved and you can restore them from the Deleted tab.`}
        confirmLabel="Delete"
      />
    </DashboardLayout>
  );
}
