// ============================================================
//  src/pages/admin/Classes.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import LessonDetailModal from '../../components/modals/LessonDetailModal.jsx';
import AddClassModal from '../../components/modals/AddClassModal.jsx';
import EditClassModal from '../../components/modals/EditClassModal.jsx';
import ConfirmDialog from '../../components/modals/ConfirmDialog.jsx';
import { useToast } from '../../components/Toast.jsx';
import s from '../../components/DashboardLayout.module.css';

const API = import.meta.env.VITE_API_URL || '/api';

function ClassRow({ cls, isArchived, onOpenLesson, onEdit, onArchive, onRestore }) {
  const { authFetch } = useAuth();
  const [open,   setOpen]   = useState(false);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    if (detail) { setOpen(v => !v); return; }
    const res = await authFetch(`${API}/classes/${cls.id}`);
    const data = await res.json();
    setDetail(data);
    setOpen(true);
  };

  const byUnit = {};
  (detail?.lessons || []).forEach(l => { (byUnit[l.unit] = byUnit[l.unit] || []).push(l); });

  const stopProp = fn => e => { e.stopPropagation(); fn(); };

  return (
    <div style={{ marginBottom: 12, opacity: isArchived ? 0.75 : 1 }}>
      <div
        onClick={load}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: '#f8fafd',
          border: '1.5px solid #e2e8f0', borderRadius: open ? '14px 14px 0 0' : 14,
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
            background: cls.color || '#2563eb',
          }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0b2b5e', display: 'flex', alignItems: 'center', gap: 8 }}>
              {cls.name}
              {isArchived && (
                <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#64748b', borderRadius: 6, padding: '2px 7px', letterSpacing: '0.04em' }}>
                  ARCHIVED
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {[cls.grade, cls.teacher_name, `${cls.student_count ?? 0} students`, `${cls.lesson_count ?? 0} lessons`].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {!isArchived && (
            <>
              <button
                onClick={stopProp(() => onEdit(cls))}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#1e293b' }}
              >
                Edit
              </button>
              <button
                onClick={stopProp(() => onArchive(cls))}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #fecaca', background: '#fff5f5', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#dc2626' }}
              >
                Archive
              </button>
            </>
          )}
          {isArchived && (
            <button
              onClick={stopProp(() => onRestore(cls))}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #bbf7d0', background: '#f0fdf4', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#16a34a' }}
            >
              Restore
            </button>
          )}
          <span style={{ fontSize: 18, marginLeft: 4, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : '' }}>▼</span>
        </div>
      </div>

      {open && (
        <div style={{
          border: '1.5px solid #e2e8f0', borderTop: 'none',
          borderRadius: '0 0 14px 14px', background: 'white', padding: '16px 20px',
        }}>
          {Object.keys(byUnit).length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>No lessons assigned to this class.</p>
          ) : Object.entries(byUnit).map(([unit, lessons]) => (
            <div key={unit} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Unit {unit}
              </div>
              {lessons.map(l => (
                <div
                  key={l.id}
                  onClick={() => !isArchived && onOpenLesson(cls, l)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10,
                    background: '#f8fafd', marginBottom: 6,
                    border: '1px solid #eef3f9',
                    cursor: isArchived ? 'default' : 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                    {l.order_index + 1}. {l.title}
                  </div>
                  {!isArchived && <div style={{ fontSize: 12, color: '#64748b' }}>Manage students &amp; locks →</div>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminClasses() {
  const { authFetch } = useAuth();
  const toast = useToast();

  const [active,   setActive]   = useState([]);
  const [archived, setArchived] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [tab,      setTab]      = useState('active');
  const [loading,  setLoading]  = useState(true);

  const [lessonModal, setLessonModal] = useState({ open: false, classId: null, lesson: null });
  const [addOpen,     setAddOpen]     = useState(false);
  const [editModal,   setEditModal]   = useState({ open: false, cls: null });
  const [archiveDialog, setArchiveDialog] = useState({ open: false, cls: null });

  const reload = async () => {
    const [classRes, teacherRes] = await Promise.all([
      authFetch(`${API}/classes?includeArchived=1`).then(r => r.json()),
      authFetch(`${API}/users?role=teacher`).then(r => r.json()),
    ]);
    const all = classRes.classes || [];
    setActive(all.filter(c => !c.archived_at));
    setArchived(all.filter(c => !!c.archived_at));
    setTeachers(teacherRes.users || []);
  };

  useEffect(() => { reload().finally(() => setLoading(false)); }, []);

  const openLesson = (cls, l) => setLessonModal({
    open: true, classId: cls.id,
    lesson: { unit: l.unit, lesson_num: l.lesson_num, title: l.title },
  });

  const doArchive = async () => {
    const cls = archiveDialog.cls;
    if (!cls) return;
    try {
      const res = await authFetch(`${API}/classes/${cls.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success(`"${cls.name}" archived`);
      reload();
    } catch (err) { toast.error(err.message); }
  };

  const doRestore = async (cls) => {
    try {
      const res = await authFetch(`${API}/classes/${cls.id}/restore`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success(`"${cls.name}" restored`);
      reload();
    } catch (err) { toast.error(err.message); }
  };

  const list = tab === 'active' ? active : archived;

  const tabBtn = (value, label) => (
    <button
      onClick={() => setTab(value)}
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
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0b2b5e', margin: 0 }}>Classes</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>
            {active.length} active · {archived.length} archived
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          style={{ padding: '10px 22px', borderRadius: 40, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          + New Class
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabBtn('active',   `Active (${active.length})`)}
        {tabBtn('archived', `Archived (${archived.length})`)}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading…</div>
      ) : list.length === 0 ? (
        <div className={s.card} style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: '#64748b', margin: 0 }}>
            {tab === 'active' ? 'No active classes. Click "+ New Class" to create one.' : 'No archived classes.'}
          </p>
        </div>
      ) : (
        list.map(cls => (
          <ClassRow
            key={cls.id}
            cls={cls}
            isArchived={tab === 'archived'}
            onOpenLesson={openLesson}
            onEdit={cls => setEditModal({ open: true, cls })}
            onArchive={cls => setArchiveDialog({ open: true, cls })}
            onRestore={doRestore}
          />
        ))
      )}

      <AddClassModal
        open={addOpen}
        teachers={teachers}
        onClose={() => setAddOpen(false)}
        onCreated={() => { reload(); setTab('active'); }}
      />

      <EditClassModal
        open={editModal.open}
        cls={editModal.cls}
        teachers={teachers}
        onClose={() => setEditModal({ open: false, cls: null })}
        onUpdated={reload}
      />

      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, cls: null })}
        onConfirm={doArchive}
        title="Archive class"
        message={`Archive "${archiveDialog.cls?.name}"? Students will lose access. You can restore it later.`}
        confirmLabel="Archive"
      />

      <LessonDetailModal
        open={lessonModal.open}
        classId={lessonModal.classId}
        lesson={lessonModal.lesson}
        onClose={() => setLessonModal({ open: false, classId: null, lesson: null })}
      />
    </DashboardLayout>
  );
}
