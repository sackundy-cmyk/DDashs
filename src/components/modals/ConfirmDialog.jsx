// ============================================================
//  ConfirmDialog — generic destructive-action confirmation
// ============================================================

import Modal from '../Modal.jsx';

export default function ConfirmDialog({
  open, onClose, onConfirm,
  title, message,
  confirmLabel = 'Confirm', danger = true,
}) {
  if (!open) return null;

  const btn = {
    padding: '10px 22px', borderRadius: 8, border: 'none',
    fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
  };

  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <p style={{ color: '#475569', lineHeight: 1.6, marginTop: 0 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
        <button onClick={onClose} style={{ ...btn, background: '#f1f5f9', color: '#475569' }}>
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          style={{ ...btn, background: danger ? '#dc2626' : '#2563eb', color: '#fff' }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
