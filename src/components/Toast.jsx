// ============================================================
//  Toast.jsx — in-app toast queue + useToast() hook
// ============================================================

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ToastCtx = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, opts = {}) => {
    const id = nextId++;
    const toast = {
      id,
      message,
      kind: opts.kind || 'info', // 'info' | 'success' | 'error'
      duration: opts.duration ?? 3000,
    };
    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const api = {
    toast:   (msg, opts) => pushToast(msg, opts),
    success: (msg, opts) => pushToast(msg, { ...opts, kind: 'success' }),
    error:   (msg, opts) => pushToast(msg, { ...opts, kind: 'error' }),
    info:    (msg, opts) => pushToast(msg, { ...opts, kind: 'info' }),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 1100,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast.duration) return;
    const id = setTimeout(onDismiss, toast.duration);
    return () => clearTimeout(id);
  }, [toast.duration, onDismiss]);

  const palette = {
    success: { bg: '#16a34a', fg: '#fff' },
    error:   { bg: '#dc2626', fg: '#fff' },
    info:    { bg: '#0f172a', fg: '#fff' },
  }[toast.kind] || { bg: '#0f172a', fg: '#fff' };

  return (
    <div
      role="status"
      style={{
        pointerEvents: 'auto',
        background: palette.bg, color: palette.fg,
        padding: '10px 14px', borderRadius: 10,
        fontFamily: 'var(--font)', fontWeight: 700, fontSize: 14,
        boxShadow: '0 10px 24px rgba(15,23,42,0.25)',
        minWidth: 220, maxWidth: 380,
      }}
    >
      {toast.message}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Safe fallback when used outside provider (e.g. during tests)
    return { toast: () => {}, success: () => {}, error: () => {}, info: () => {} };
  }
  return ctx;
}
