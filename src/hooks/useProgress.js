// ============================================================
//  useProgress.js — tracks section completion for a lesson
//  Posts to /api/progress with {score: pct, attempts} on markDone
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';

// Attempt-based performance scoring: 1st=100%, 2nd=90%, 3rd=75%, 4th=55%, 5th+=40%
function scoreFromAttempts(att) {
  if (att <= 1) return 100;
  if (att === 2) return 90;
  if (att === 3) return 75;
  if (att === 4) return 55;
  return 40;
}

/**
 * @param {number} totalSections - how many sections the lesson has
 * @param {object} [opts]
 * @param {() => void} [opts.onAllDone] - fired once when every section is complete
 *
 * markDone(sectionId, payload) accepts:
 *   - { correct, total, attempts } → score = scoreFromAttempts(attempts)
 *   - { score }                    → explicit score override (0-100)
 *   - string ("3/5 ✓")            → legacy display label, score=null
 *   - number                       → legacy raw score
 *   - null/undefined               → just marks complete
 */
export function useProgress(totalSections, opts = {}) {
  const [done, setDone] = useState({});
  const allDoneFired = useRef(false);
  const onAllDoneRef = useRef(opts.onAllDone);
  onAllDoneRef.current = opts.onAllDone;

  const markDone = useCallback((sectionId, payload = null) => {
    setDone(prev => {
      if (prev[sectionId]) return prev;

      // ── Normalise payload ──
      let pct = null, correct = null, total = null, attempts = 1, displayLabel = null;
      if (payload && typeof payload === 'object') {
        correct  = Number.isFinite(payload.correct) ? payload.correct : null;
        total    = Number.isFinite(payload.total)   ? payload.total   : null;
        attempts = Number.isFinite(payload.attempts) ? payload.attempts : 1;
        if (Number.isFinite(payload.score)) {
          pct = payload.score; // explicit override
        } else if (correct !== null && total !== null && total > 0) {
          pct = scoreFromAttempts(attempts);
          displayLabel = `${correct}/${total} ✓`;
        }
      } else if (typeof payload === 'string') {
        displayLabel = payload;
      } else if (typeof payload === 'number') {
        pct = payload;
      }

      // ── Fire-and-forget POST to backend (if logged in) ──
      try {
        const token = localStorage.getItem('ddash_token');
        const user  = JSON.parse(localStorage.getItem('ddash_user') || 'null');
        if (token && user?.id) {
          const parts     = window.location.pathname.split('/');
          const li        = parts.indexOf('lesson');
          const unit      = li >= 0 ? (parts[li + 1] || null) : null;
          const lessonKey = li >= 0 ? (parts[li + 2] || null) : null;
          const classId   = new URLSearchParams(window.location.search).get('classId');

          fetch('/api/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              classId:   classId ? parseInt(classId, 10) : null,
              unit:      unit ? parseInt(unit, 10) : null,
              lessonKey,
              sectionId,
              score:     pct,
              attempts,
              completed: true,
            }),
          }).catch(() => {}); // silently ignore network errors
        }
      } catch (_) {}

      return {
        ...prev,
        [sectionId]: { completed: true, pct, correct, total, attempts, label: displayLabel },
      };
    });
  }, []);

  const isDone = useCallback(
    (sectionId) => Boolean(done[sectionId]),
    [done]
  );

  const completedCount = Object.keys(done).length;
  const allDone = completedCount >= totalSections;
  const pct = Math.round((completedCount / totalSections) * 100);

  useEffect(() => {
    if (allDone && !allDoneFired.current) {
      allDoneFired.current = true;
      try { onAllDoneRef.current && onAllDoneRef.current(); } catch {}
    }
  }, [allDone]);

  return { done, markDone, isDone, completedCount, totalSections, allDone, pct };
}
