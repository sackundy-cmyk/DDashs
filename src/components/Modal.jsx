// ============================================================
//  Modal.jsx — generic centered modal with overlay + Esc close
// ============================================================

import { useEffect, useRef } from 'react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 560,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const onBackdrop = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={onBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        role="dialog" aria-modal="true" aria-label={title}
        style={{
          background: '#fff', borderRadius: 14, width: '100%', maxWidth: width,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 18px 40px rgba(15,23,42,0.25)',
          fontFamily: 'var(--font)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid var(--border, #e5e7eb)',
        }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text, #0f172a)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent', border: 'none',
              fontSize: 24, lineHeight: 1, cursor: 'pointer',
              color: 'var(--muted, #64748b)', padding: 4,
            }}
          >×</button>
        </div>

        <div style={{
          padding: '18px 22px', overflowY: 'auto', flex: 1,
          color: 'var(--text, #0f172a)', fontSize: 15,
        }}>
          {children}
        </div>

        {footer && (
          <div style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--border, #e5e7eb)',
            display: 'flex', justifyContent: 'flex-end', gap: 10,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
