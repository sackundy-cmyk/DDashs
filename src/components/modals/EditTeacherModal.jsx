// ============================================================
//  EditTeacherModal — update teacher name/email
// ============================================================

import { useEffect, useState } from 'react';
import Modal from '../Modal.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../Toast.jsx';

const API = import.meta.env.VITE_API_URL || '/api';

export default function EditTeacherModal({ open, teacher, onClose, onSaved }) {
  const { authFetch } = useAuth();
  const toast = useToast();
  const [name,   setName]   = useState('');
  const [email,  setEmail]  = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (teacher) { setName(teacher.name || ''); setEmail(teacher.email || ''); }
  }, [teacher]);

  const submit = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await authFetch(`${API}/users/${teacher.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success(`${name} updated`);
      onSaved();
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const input = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' };
  const label = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 };

  return (
    <Modal open={open} onClose={onClose} title="Edit Teacher" width={420}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <span style={label}>Name</span>
          <input style={input} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <span style={label}>Email</span>
          <input style={input} type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: '#475569' }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
