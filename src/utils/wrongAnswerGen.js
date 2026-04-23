// ============================================================
//  wrongAnswerGen.js — generate plausible distractor answers
// ============================================================

import { shuffle } from './shuffleUtils.js';

/**
 * Generate up to `count` wrong numerical answers near `correct`.
 * Candidates are: ±1, ±2, ±5, ×2, ÷2, ×10, ÷10
 */
export function wrongNums(correct, count = 3) {
  const v = parseFloat(correct);
  const deltas = [1, -1, 2, -2, 5, -5, 10, -10];
  const multipliers = [2, 0.5, 10, 0.1];
  const seen = new Set([String(v)]);
  const candidates = [];

  deltas.forEach(d => {
    const w = parseFloat((v + d).toPrecision(6));
    if (w > 0 && !seen.has(String(w))) { seen.add(String(w)); candidates.push(w); }
  });
  multipliers.forEach(m => {
    const w = parseFloat((v * m).toPrecision(6));
    if (w > 0 && !seen.has(String(w))) { seen.add(String(w)); candidates.push(w); }
  });

  return shuffle(candidates).slice(0, count);
}

/**
 * Generate wrong sets for common-factor MCQ.
 * Returns array of 3 wrong sets.
 */
export function wrongCFSets(correct, firstNumFactors) {
  const correctStr = correct.join(',');
  const wrongs = [];

  // Missing last (the HCF)
  if (correct.length > 1) wrongs.push(correct.slice(0, -1));

  // Replace last with a non-common factor
  const notCommon = firstNumFactors.filter(x => !correct.includes(x));
  if (notCommon.length) {
    wrongs.push([...correct.slice(0, -1), notCommon[0]].sort((a, b) => a - b));
  }

  // Correct + one extra bogus
  wrongs.push([...correct, correct[correct.length - 1] + 1].sort((a, b) => a - b));

  const seen = new Set([correctStr]);
  return wrongs
    .filter(w => { const k = w.join(','); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 3);
}

/**
 * Generate wrong sets for common-multiple MCQ.
 * Returns array of 3 wrong sets.
 */
export function wrongMultipleSets(correct, a, max = 100) {
  const correctStr = correct.join(',');
  // Multiples of just `a` up to max
  const allA = [];
  for (let v = a; v <= max; v += a) if (!correct.includes(v)) allA.push(v);

  const wrongs = [
    correct.length > 1 ? correct.slice(0, -1) : [correct[0] * 2],
    allA.slice(0, Math.min(allA.length, 6)),
    correct.concat([correct[correct.length - 1] + (correct[0] || a)]),
  ];

  const seen = new Set([correctStr]);
  return wrongs
    .filter(w => { const k = w.join(','); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, 3);
}
