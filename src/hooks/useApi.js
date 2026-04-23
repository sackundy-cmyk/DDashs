// ============================================================
//  hooks/useApi.js — save progress to the backend API
// ============================================================

import { useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Hook for posting progress records.
 * Silently fails — progress saving must never break the lesson UX.
 *
 * Usage:
 *   const { saveProgress } = useApi('student-abc-123');
 *   saveProgress({ unit:3, lesson:1, sectionId:'s1', score:'8/10', attempts:2, completed:true });
 */
export function useApi(studentId) {
  const queue = useRef([]);
  const isFlushing = useRef(false);

  const flush = useCallback(async () => {
    if (isFlushing.current || queue.current.length === 0) return;
    isFlushing.current = true;
    const batch = [...queue.current];
    queue.current = [];
    for (const record of batch) {
      try {
        await fetch(`${API_BASE}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, ...record }),
        });
      } catch {
        // Silently ignore network errors — platform works offline
      }
    }
    isFlushing.current = false;
  }, [studentId]);

  const saveProgress = useCallback((record) => {
    if (!studentId) return;
    queue.current.push(record);
    // Debounce flush
    setTimeout(flush, 300);
  }, [studentId, flush]);

  return { saveProgress };
}
