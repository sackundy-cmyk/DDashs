// ============================================================
//  StudentNotesTimeline — note list + add-note input
// ============================================================

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from './Toast.jsx';

const API = import.meta.env.VITE_API_URL || '/api';

export default function StudentNotesTimeline({ studentId }) {
  const { authFetch } = useAuth();
  const toast = useToast();
  const [notes, setNotes]     = useState([]);
  const [body,  setBody]      = useState('');
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (!studentId) return;
    authFetch(`${API}/notes/student/${studentId}`)
      .then(r => r.json())
      .then(d => setNotes(d.notes || []));
  }, [studentId, authFetch]);

  const submit = async () => {
    if (!body.trim()) return;
    setSaving(true);
    try {
      const res = await authFetch(`${API}/notes/student/${studentId}`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const { note } = await res.json();
      setNotes(prev => [note, ...prev]);
      setBody('');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    try {
      const res = await authFetch(`${API}/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#0b2b5e', marginBottom: 10 }}>
        Teacher Notes
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Add a note for the weekly report…"
          rows={2}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8,
            border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit',
            resize: 'vertical', outline: 'none',
          }}
        />
        <button
          onClick={submit}
          disabled={saving || !body.trim()}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#2563eb', color: '#fff', fontWeight: 700,
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            alignSelf: 'flex-end', opacity: saving || !body.trim() ? 0.6 : 1,
          }}
        >Add</button>
      </div>

      {notes.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>No notes yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notes.map(n => (
            <div key={n.id} style={{
              background: '#f8fafd', border: '1px solid #e2e8f0',
              borderRadius: 8, padding: '10px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>{n.body}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  {n.author_name} · {new Date(n.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => remove(n.id)}
                title="Delete note"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', fontSize: 16, padding: '0 4px', lineHeight: 1,
                }}
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
