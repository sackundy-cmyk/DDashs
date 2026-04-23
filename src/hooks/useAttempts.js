// ============================================================
//  useAttempts.js — per-question attempt counter
//  NOTE: shouldReveal always returns false — answers are never
//  shown to students. Students may keep trying indefinitely.
// ============================================================

import { useState, useCallback } from 'react';

export function useAttempts() {
  const [counts, setCounts] = useState({});

  const increment = useCallback((key) => {
    setCounts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  }, []);

  const getAtt = useCallback((key) => counts[key] || 0, [counts]);

  // Always false — correct answers are never revealed to students
  const shouldReveal = useCallback(() => false, []);

  return { getAtt, increment, shouldReveal, counts };
}
