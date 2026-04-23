// ============================================================
//  interactions/TwoPartAnswer.jsx
//  Two panel answer display: Part 1 (purple) + Part 2 (orange)
//  Used in Unit 5 Lesson 1 Q4
// ============================================================

import React from 'react';
import { DigitDropZone } from './DigitComponents.jsx';

/**
 * @param {string}   part1Label   - expression string e.g. "(19 × 2) + 4"
 * @param {string}   part2Label   - expression string e.g. "19 × (2 + 4)"
 * @param {string[]} digits1      - digits in part 1 zone
 * @param {string[]} digits2      - digits in part 2 zone
 * @param {string}   state1       - zone state for part 1
 * @param {string}   state2       - zone state for part 2
 * @param {function} onDrop1      - drop handler part 1
 * @param {function} onDrop2      - drop handler part 2
 * @param {function} onRemove1    - remove digit part 1
 * @param {function} onRemove2    - remove digit part 2
 */
export function TwoPartAnswer({
  part1Label, part2Label,
  digits1, digits2,
  state1, state2,
  onDrop1, onDrop2,
  onRemove1, onRemove2,
}) {
  return (
    <div>
      {/* Part 1 — purple */}
      <div style={{
        borderRadius: 10, padding: '14px 16px', marginBottom: 10,
        background: '#FDF4FF', border: '1.5px solid #E9D5FF',
      }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--purple)', marginBottom: 10 }}>
          Part 1
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', display: 'block', marginBottom: 10 }}>
          {part1Label} =
        </div>
        <DigitDropZone digits={digits1} zoneState={state1} onDrop={onDrop1} onRemove={onRemove1} />
      </div>

      {/* Part 2 — orange */}
      <div style={{
        borderRadius: 10, padding: '14px 16px', marginBottom: 10,
        background: '#FFF7ED', border: '1.5px solid #FED7AA',
      }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--orange)', marginBottom: 10 }}>
          Part 2
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', display: 'block', marginBottom: 10 }}>
          {part2Label} =
        </div>
        <DigitDropZone digits={digits2} zoneState={state2} onDrop={onDrop2} onRemove={onRemove2} />
      </div>
    </div>
  );
}
