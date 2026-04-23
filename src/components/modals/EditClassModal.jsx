// ============================================================
//  EditClassModal — edit an existing class
// ============================================================

import { useState, useEffect } from 'react';
import Modal from '../Modal.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../Toast.jsx';
import curriculum from '../../data/curriculum.json';

const API = import.meta.env.VITE_API_URL || '/api';

const ALL_LESSONS = curriculum.units.flatMap(u =>
  u.lessons.map(l => ({ unit: u.id, lessonNum: l.id, title: l.title }))
);

const COLORS = ['#1E6FD9','#7C3AED','#16A34A','#D97706','#DC2626','#0891B2','#9333EA','#65A30D'];

export default function EditClassModal({ open, cls, teachers, onClose, onUpdated }) {
  const { authFetch } = useAuth();
  const toast = useToast();

  const [name,      setName]      = useState('');
  const [grade,     setGrade]     = useState('');
  const [desc,      setDesc]      = useState('');
  const [color,     setColor]     = useState('#1E6FD9');
  const [teacherId, setTeacherId] = useState('');
  const [selected,  setSelected]  = useState(new Set());
  const [saving,    setSaving]    = useState(false);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (!open || !cls) return;
    setName(cls.name || '');
    setGrade(cls.grade || '');
    setDesc(cls.description || '');
    setColor(cls.color || '#1E6FD9');
    setTeacherId(cls.teacher_id ? String(cls.teacher_id) : '');

    setLoading(true);
    authFetch(`${API}/classes/${cls.id}`)
      .then(r => r.json())
      .then(data => {
        const keys = new Set(
          (data.lessons || []).map(l => `${l.unit}-${l.lesson_num}`)
        );
        setSelected(keys);
      })
      .catch(() => setSelected(new Set()))
      .finally(() => setLoading(false));
  }, [open, cls?.id]);

  const toggleLesson = (key) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const submit = async () => {
    if (!name.trim()) { toast.error('Class name is required'); return; }
    setSaving(true);
    try {
      const metaRes = await authFetch(`${API}/classes/${cls.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          grade: grade || null,
          description: desc || null,
          color,
          teacherId: teacherId ? parseInt(teacherId, 10) : null,
        }),
      });
      if (!metaRes.ok) throw new Error((await metaRes.json()).error || 'Failed to update class');

      const lessonRefs = [...selected].map(key => {
        const [u, l] = key.split('-').map(Number);
        const lesson = ALL_LESSONS.find(x => x.unit === u && x.lessonNum === l);
        return { unit: u, lessonNum: l, title: lesson?.title || '' };
      });
      const lessonsRes = await authFetch(`${API}/classes/${cls.id}/lessons/bulk`, {
        method: 'POST',
        body: JSON.stringify({ lessonRefs }),
      });
      if (!lessonsRes.ok) throw new Error((await lessonsRes.json()).error || 'Failed to update lessons');

      toast.success(`Class "${name}" updated`);
      onUpdated();
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const input = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' };
  const label = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 };

  return (
    <Modal open={open} onClose={onClose} title="Edit Class" width={520}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <span style={label}>Class Name *</span>
            <input style={input} value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <span style={label}>Grade</span>
              <input style={input} value={grade} onChange={e => setGrade(e.target.value)} placeholder="Grade 5" />
            </div>
            <div>
              <span style={label}>Teacher</span>
              <select style={{ ...input, cursor: 'pointer' }} value={teacherId} onChange={e => setTeacherId(e.target.value)}>
                <option value="">— No teacher —</option>
                {(teachers || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <span style={label}>Description</span>
            <input style={input} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional description" />
          </div>

          <div>
            <span style={label}>Colour</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: color === c ? '3px solid #0b2b5e' : '3px solid transparent',
                    transition: 'border-color 0.15s',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <span style={label}>Lessons ({selected.size} selected)</span>
            <div style={{ maxHeight: 200, overflowY: 'auto', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: 8 }}>
              {curriculum.units.map(u => (
                <div key={u.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 4px 2px' }}>
                    Unit {u.id}: {u.title}
                  </div>
                  {u.lessons.map(l => {
                    const key = `${u.id}-${l.id}`;
                    const checked = selected.has(key);
                    return (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: checked ? '#eff6ff' : 'transparent' }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleLesson(key)} style={{ width: 14, height: 14, cursor: 'pointer' }} />
                        <span style={{ fontSize: 13, color: '#1e293b' }}>{l.title}</span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: '#475569' }}>
              Cancel
            </button>
            <button onClick={submit} disabled={saving} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
