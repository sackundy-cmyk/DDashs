// ============================================================
//  BulkImportStudentsModal — paste CSV, preview, commit
//  Expected CSV columns (header row optional):
//    name, email, password, parent_email, phone
// ============================================================

import { useState } from 'react';
import Modal from '../Modal.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../Toast.jsx';

const API = import.meta.env.VITE_API_URL || '/api';

function parseCSV(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const firstCols = lines[0].toLowerCase().split(',').map(s => s.trim());
  const hasHeader = firstCols.includes('name') || firstCols.includes('email');
  const data = hasHeader ? lines.slice(1) : lines;
  return data.map(line => {
    const [name, email, password, parent_email, phone] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    return { name: name || '', email: email || '', password: password || '', parent_email: parent_email || '', phone: phone || '' };
  });
}

function validateRow(row) {
  const errs = [];
  if (!row.name) errs.push('name missing');
  if (!row.email || !row.email.includes('@')) errs.push('invalid email');
  return errs;
}

export default function BulkImportStudentsModal({ open, classes, onClose, onImported }) {
  const { authFetch } = useAuth();
  const toast = useToast();
  const [csv,     setCsv]     = useState('');
  const [rows,    setRows]    = useState([]);
  const [classId, setClassId] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [result,  setResult]  = useState(null);

  const preview = () => {
    const parsed = parseCSV(csv);
    setRows(parsed.map(r => ({ ...r, errors: validateRow(r) })));
    setResult(null);
  };

  const commit = async () => {
    const valid = rows.filter(r => r.errors.length === 0);
    if (valid.length === 0) { toast.error('No valid rows to import'); return; }
    setSaving(true);
    try {
      const res = await authFetch(`${API}/users/bulk-import`, {
        method: 'POST',
        body: JSON.stringify({ classId: classId || null, rows: valid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data);
      onImported();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const reset = () => { setCsv(''); setRows([]); setResult(null); setClassId(''); };

  const input = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Bulk Import Students" width={600}>
      {result ? (
        <div>
          <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: '#15803d' }}>Import complete</div>
            <div style={{ fontSize: 13, color: '#166534', marginTop: 4 }}>
              {result.created} created · {result.skipped} skipped (duplicate email)
              {result.errors?.length > 0 && ` · ${result.errors.length} errors`}
            </div>
          </div>
          <button onClick={() => { reset(); onClose(); }} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Done</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
              Paste CSV with columns: <strong>name, email, password, parent_email, phone</strong>
              <br />First row can be a header (will be auto-detected). Password defaults to <code>Ddash@123</code> if empty.
            </div>
            <textarea
              value={csv}
              onChange={e => { setCsv(e.target.value); setRows([]); }}
              rows={6}
              placeholder={`Alice Smith, alice@school.com, Pass@123, parent@home.com, +1555000001\nBob Jones, bob@school.com`}
              style={{ ...input, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>Enrol in class (optional)</div>
              <select style={{ ...input, cursor: 'pointer' }} value={classId} onChange={e => setClassId(e.target.value)}>
                <option value="">— No class —</option>
                {(classes || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={preview} disabled={!csv.trim()} style={{ padding: '9px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: '#475569', width: '100%', opacity: !csv.trim() ? 0.5 : 1 }}>
                Preview
              </button>
            </div>
          </div>

          {rows.length > 0 && (
            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafd' }}>
                    {['', 'Name', 'Email', 'Password', 'Parent Email'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#334155', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={{ background: r.errors.length ? '#fef2f2' : 'white' }}>
                      <td style={{ padding: '6px 10px', width: 20 }}>{r.errors.length ? '✗' : '✓'}</td>
                      <td style={{ padding: '6px 10px' }}>{r.name || <em style={{ color: '#ef4444' }}>missing</em>}</td>
                      <td style={{ padding: '6px 10px' }}>{r.email || <em style={{ color: '#ef4444' }}>missing</em>}</td>
                      <td style={{ padding: '6px 10px', color: '#64748b' }}>{r.password || '(default)'}</td>
                      <td style={{ padding: '6px 10px', color: '#64748b' }}>{r.parent_email || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {rows.length > 0 && (
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {rows.filter(r => r.errors.length === 0).length} valid · {rows.filter(r => r.errors.length > 0).length} invalid (will be skipped)
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => { reset(); onClose(); }} style={{ padding: '10px 20px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: '#475569' }}>Cancel</button>
            <button
              onClick={commit}
              disabled={saving || rows.filter(r => r.errors.length === 0).length === 0}
              style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', opacity: saving || rows.filter(r => r.errors.length === 0).length === 0 ? 0.5 : 1 }}
            >
              {saving ? 'Importing…' : `Import ${rows.filter(r => r.errors.length === 0).length} Students`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
