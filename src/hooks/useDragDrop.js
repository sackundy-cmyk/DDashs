// ============================================================
//  useDragDrop.js — shared drag source state
// ============================================================

import { useRef, useCallback } from 'react';

/**
 * Minimal drag-and-drop coordinator.
 * Uses HTML5 dataTransfer; compatible with touch polyfills.
 */
export function useDragDrop() {
  const dragData = useRef(null);

  const onDragStart = useCallback((data) => (e) => {
    dragData.current = data;
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const onDrop = useCallback((handler) => (e) => {
    e.preventDefault();
    let data = dragData.current;
    if (!data) {
      try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
    }
    handler(data);
    dragData.current = null;
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  return { onDragStart, onDrop, onDragOver };
}
