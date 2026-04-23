// ============================================================
//  interactions/NumberGrid100.jsx
//  1–100 tap grid. Evaluates ONLY tapped cells (never reveals
//  untapped primes). Calls onComplete when all primes found.
// ============================================================

import React, { useState, useCallback } from 'react';
import { isPrime, getPrimesUpTo } from '../../utils/mathUtils.js';
import { FeedbackBox } from '../SharedComponents.jsx';
import { CheckButton } from '../SharedComponents.jsx';

const PRIMES = getPrimesUpTo(100); // 25 primes

const CELL_STYLE = {
  default:  { bg: '#FEFCE8', border: '2px solid #D4C990', color: '#3D3200', cursor: 'pointer' },
  selected: { bg: '#7C3AED', border: '2px solid #5B21B6', color: '#fff',    cursor: 'pointer' },
  correct:  { bg: 'var(--green)',    border: '2px solid #15803D', color: '#fff', cursor: 'default' },
  wrong:    { bg: 'var(--red)',      border: '2px solid #B91C1C', color: '#fff', cursor: 'default' },
  locked:   { bg: '#FEFCE8', border: '2px solid #D4C990', color: '#9CA3AF', cursor: 'default' },
};

export default function NumberGrid100({ onComplete }) {
  const [selected, setSelected] = useState(new Set());
  const [states, setStates] = useState({});   // n → 'correct' | 'wrong'
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const toggle = useCallback((n) => {
    if (locked || states[n] === 'correct') return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
    // Clear wrong state so cell can be re-selected
    if (states[n] === 'wrong') {
      setStates(prev => { const s = { ...prev }; delete s[n]; return s; });
    }
  }, [locked, states]);

  const check = useCallback(() => {
    let correct = 0, wrong = 0;
    const newStates = { ...states };

    selected.forEach(n => {
      if (isPrime(n)) { newStates[n] = 'correct'; correct++; }
      else            { newStates[n] = 'wrong';   wrong++;   }
    });
    setStates(newStates);

    if (wrong === 0 && correct === PRIMES.length) {
      setLocked(true);
      setFeedback({ type: 'correct', text: `🎉 Perfect! You found all ${PRIMES.length} prime numbers up to 100!` });
      if (onComplete) onComplete({ correct, total: PRIMES.length });
    } else if (selected.size === 0) {
      setFeedback({ type: 'wrong', text: 'Tap some numbers in the grid first, then check!' });
    } else if (wrong === 0) {
      setFeedback({ type: 'hint', text: `✓ All ${correct} of your chosen numbers are correct primes! Keep finding more and check again.` });
    } else {
      setFeedback({ type: 'wrong', text: `✓ ${correct} correct. ${wrong} of your choices are NOT prime (shown in red) — deselect them and keep going!` });
    }
  }, [selected, states, onComplete]);

  const getCellState = (n) => {
    if (states[n]) return states[n];
    if (selected.has(n)) return 'selected';
    if (locked) return 'locked';
    return 'default';
  };

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14, fontSize: 13, fontWeight: 700 }}>
        {[
          { label: 'Selected',       bg: '#7C3AED', bd: '#5B21B6' },
          { label: 'Correct prime ✓', bg: 'var(--green)', bd: '#15803D' },
          { label: 'Not a prime ✗',  bg: 'var(--red)', bd: '#B91C1C' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: l.bg, border: `2px solid ${l.bd}` }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
        gap: 4, marginBottom: 16, maxWidth: 600,
      }}>
        {Array.from({ length: 100 }, (_, i) => i + 1).map(n => {
          const s = CELL_STYLE[getCellState(n)] || CELL_STYLE.default;
          return (
            <div
              key={n}
              onClick={() => n !== 1 && toggle(n)}
              title={n === 1 ? '1 is not a prime number' : ''}
              style={{
                aspectRatio: 1, borderRadius: 8, background: s.bg,
                border: s.border, color: n === 1 ? '#9CA3AF' : s.color,
                fontSize: 14, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: n === 1 ? 'default' : s.cursor,
                transition: 'all .15s', userSelect: 'none',
                opacity: n === 1 ? 0.45 : 1,
              }}
            >
              {n}
            </div>
          );
        })}
      </div>

      <CheckButton label="✓ Check My Prime Numbers" onClick={check} disabled={locked} />
      {feedback && <FeedbackBox type={feedback.type} message={feedback.text} />}
    </div>
  );
}
