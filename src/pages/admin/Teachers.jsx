// ============================================================
//  src/pages/admin/Teachers.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import AddTeacherModal from '../../components/modals/AddTeacherModal.jsx';
import EditTeacherModal from '../../components/modals/EditTeacherModal.jsx';
import ConfirmDialog from '../../components/modals/ConfirmDialog.jsx';
import { useToast } from '../../components/Toast.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

export default function AdminTeachers() {
  const { authFetch } = useAuth();
  const toast = useToast();

  const [active,   setActive]   = useState([]);
  const [deleted,  setDeleted]  = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [tab,      setTab]      = useState('active');
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);

  const [addOpen,       setAddOpen]       = useState(false);
  const [editModal,     setEditModal]     = useState({ open: false, teacher: null });
  const [deleteDialog,  setDeleteDialog]  = useState({ open: false, teacher: null });

  const reload = async () => {
    const [tAll, tDeleted, cData] = await Promise.all([
      authFetch(`${API}/users?role=teacher`).then(r => r.json()),
      authFetch(`${API}/users?role=teacher&includeDeleted=1`).then(r => r.json()),
      authFetch(`${API}/classes`).then(r => r.json()),
    ]);
    setActive(tAll.users || []);
    setDeleted((tDeleted.users || []).filter(t => !!t.deleted_at));
    setClasses(cData.classes || []);
  };

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  const resetPassword = async (t) => {
    const pwd = window.prompt(`Enter a new password for ${t.name}:`);
    if (!pwd) return;
    try {
      const res = await authFetch(`${API}/users/${t.id}/reset-password`, {
        method: 'POST', body: JSON.stringify({ password: pwd }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success(`Password reset for ${t.name}`);
    } catch (err) { toast.error(err.message); }
  };

  const doDelete = async () => {
    const t = deleteDialog.teacher;
    if (!t) return;
    try {
      const res = await authFetch(`${API}/users/${t.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.status === 409 && data.blockingClassIds) {
        const names = data.blockingClassIds
          .map(id => classes.find(c => c.id === id)?.name || `Class #${id}`)
          .join(', ');
        toast.error(`Cannot delete: teacher still owns active classes (${names}). Archive or reassign them first.`);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(`${t.name} moved to Deleted`);
      reload();
    } catch (err) { toast.error(err.message); }
  };

  const doRestore = async (t) => {
    try {
      const res = await authFetch(`${API}/users/${t.id}/restore`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success(`${t.name} restored`);
      reload();
    } catch (err) { toast.error(err.message); }
  };

  const list = tab === 'active' ? active : deleted;
  const visible = list.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const tabBtn = (value, label) => (
    <button
      onClick={() => { setTab(value); setSearch(''); }}
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
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0b2b5e', margin: 0 }}>Teachers</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            {active.length} active Â· {deleted.length} deleted
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}
        >
          + Add Teacher
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {tabBtn('active',  `Active (${active.length})`)}
        {tabBtn('deleted', `Deleted (${deleted.length})`)}
      </div>

      <div className={s.searchBar} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search teachersâ€¦"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={s.searchInput}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loadingâ€¦</div>
      ) : visible.length === 0 ? (
        <div className={s.card} style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: '#94a3b8', margin: 0 }}>
            {tab === 'deleted' ? 'No deleted teachers.' : 'No teachers found.'}
          </p>
        </div>
      ) : (
        <div className={s.cardGrid}>
          {visible.map(t => {
            const initials = t.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const myClasses = classes.filter(c => c.teacher_id === t.id);
            const isDeleted = tab === 'deleted';

            return (
              <div key={t.id} style={{
                background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 20,
                boxShadow: '0 1px 4px rgba(0,20,50,0.05)',
                opacity: isDeleted ? 0.75 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                    background: isDeleted
                      ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                      : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: 'white',
                  }}>{initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0b2b5e', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {t.name}
                      {isDeleted && (
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#64748b', borderRadius: 6, padding: '2px 7px' }}>
                          DELETED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.email}</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                  <strong>{myClasses.length}</strong> class{myClasses.length !== 1 ? 'es' : ''} assigned
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 28, marginBottom: 14 }}>
                  {myClasses.map(c => (
                    <span key={c.id} style={{
                      fontSize: 12, padding: '4px 10px', borderRadius: 20,
                      background: (c.color || '#1CB0F6') + '20',
                      color: c.color || '#1CB0F6', fontWeight: 600,
                    }}>
                      {c.name}
                    </span>
                  ))}
                  {myClasses.length === 0 && (
                    <span className={`${s.pill} ${s.pillGray}`}>No classes</span>
                  )}
                </div>

                {!isDeleted ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => setEditModal({ open: true, teacher: t })}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 600, color: '#1e293b', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => resetPassword(t)}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Reset PW
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ open: true, teacher: t })}
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #fecaca', background: '#fff5f5', fontSize: 13, fontWeight: 600, color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => doRestore(t)}
                    style={{ width: '100%', padding: '9px', borderRadius: 40, border: '1.5px solid #bbf7d0', background: '#f0fdf4', fontSize: 13, fontWeight: 600, color: '#16a34a', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Restore
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddTeacherModal
        open={addOpen}
        classes={classes}
        onClose={() => setAddOpen(false)}
        onCreated={reload}
      />
      <EditTeacherModal
        open={editModal.open}
        teacher={editModal.teacher}
        onClose={() => setEditModal({ open: false, teacher: null })}
        onSaved={reload}
      />
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, teacher: null })}
        onConfirm={doDelete}
        title="Delete teacher"
        message={`Delete "${deleteDialog.teacher?.name}"? If they still own active classes you will be told which ones to reassign first.`}
        confirmLabel="Delete"
      />
    </DashboardLayout>
  );
}
