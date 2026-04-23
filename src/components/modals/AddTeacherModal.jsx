// ============================================================
//  AddTeacherModal — admin creates a teacher + assigns classes
// ============================================================

import { useState, useEffect } from 'react';
import Modal from '../Modal.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../Toast.jsx';

const API = import.meta.env.VITE_API_URL || '/api';

export default function AddTeacherModal({ open, onClose, onCreated, classes = [] }) {
  const { authFetch } = useAuth();
  const toast = useToast();

  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [password, setPwd]  = useState('');
  const [selected, setSel]  = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setName(''); setEmail(''); setPwd(''); setSel([]); }
  }, [open]);

  const toggle = (id) => setSel(arr => arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);

  const submit = async () => {
    if (!name || !email || !password) {
      toast.error('Name, email and password are required');
      return;
    }
    setSaving(true);
    try {
      const res = await authFetch(`${API}/users`, {
        method: 'POST',
        body: JSON.stringify({
          name, email, password, role: 'teacher',
          classIds: selected,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create teacher');
      toast.success('Teacher created');
      onCreated?.(data.user);
      onClose?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Teacher"
      footer={<>
        <button onClick={onClose} disabled={saving} style={btnSecondary}>Cancel</button>
        <button onClick={submit} disabled={saving} style={btnPrimary}>
          {saving ? 'Saving…' : 'Create teacher'}
        </button>
      </>}
    >
      <Field label="Full name">
        <input value={name} onChange={e => setName(e.target.value)} style={input} placeholder="Ms. Rodriguez" />
      </Field>
      <Field label="Email">
        <input value={email} onChange={e => setEmail(e.target.value)} style={input} type="email" placeholder="rodriguez@school.com" />
      </Field>
      <Field label="Initial password">
        <input value={password} onChange={e => setPwd(e.target.value)} style={input} type="text" placeholder="min 6 characters" />
      </Field>
      {classes.length > 0 && (
        <Field label="Assign classes">
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            maxHeight: 180, overflowY: 'auto',
            border: '1.5px solid #e2e8f0', borderRadius: 8, padding: 10,
          }}>
            {classes.map(c => (
              <label key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                fontSize: 14,
              }}>
                <input
                  type="checkbox"
                  checked={selected.includes(c.id)}
                  onChange={() => toggle(c.id)}
                />
                {c.name} <span style={{ color: '#64748b' }}>· {c.grade || ''}</span>
              </label>
            ))}
          </div>
        </Field>
      )}
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const input = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1.5px solid #e2e8f0', fontFamily: 'var(--font)', fontSize: 14,
  boxSizing: 'border-box',
};
const btnSecondary = {
  padding: '10px 16px', borderRadius: 8, border: '1.5px solid #e2e8f0',
  background: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
};
const btnPrimary = {
  padding: '10px 16px', borderRadius: 8, border: 'none',
  background: '#2563eb', color: '#fff', fontWeight: 700,
  cursor: 'pointer', fontFamily: 'var(--font)',
};
