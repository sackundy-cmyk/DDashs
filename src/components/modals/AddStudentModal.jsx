// ============================================================
//  AddStudentModal — create a student + enrol in class
// ============================================================

import { useState, useEffect } from 'react';
import Modal from '../Modal.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../Toast.jsx';

const API = import.meta.env.VITE_API_URL || '/api';

export default function AddStudentModal({ open, onClose, onCreated, classes = [], defaultClassId }) {
  const { authFetch } = useAuth();
  const toast = useToast();

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPwd]    = useState('');
  const [classId, setClassId] = useState(defaultClassId || '');
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (open) {
      setName(''); setEmail(''); setPwd('');
      setClassId(defaultClassId || (classes[0]?.id ?? ''));
    }
  }, [open, defaultClassId, classes]);

  const submit = async () => {
    if (!name || !email || !password) {
      toast.error('Name, email and password are required');
      return;
    }
    setSaving(true);
    try {
      const res = await authFetch(`${API}/users`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role: 'student', classId: classId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create student');
      toast.success('Student created');
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
      title="Add Student"
      footer={<>
        <button onClick={onClose} disabled={saving} style={btnSecondary}>Cancel</button>
        <button onClick={submit} disabled={saving} style={btnPrimary}>
          {saving ? 'Saving…' : 'Create student'}
        </button>
      </>}
    >
      <Field label="Full name">
        <input value={name} onChange={e => setName(e.target.value)} style={input} placeholder="Emma Chen" />
      </Field>
      <Field label="Email">
        <input value={email} onChange={e => setEmail(e.target.value)} style={input} type="email" placeholder="emma@school.com" />
      </Field>
      <Field label="Initial password">
        <input value={password} onChange={e => setPwd(e.target.value)} style={input} type="text" placeholder="min 6 characters" />
      </Field>
      {classes.length > 0 && (
        <Field label="Enroll in class">
          <select value={classId} onChange={e => setClassId(e.target.value)} style={input}>
            <option value="">No class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
