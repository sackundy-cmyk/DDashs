// ============================================================
//  shuffleUtils.js — Fisher-Yates shuffle
// ============================================================

/** Return a new shuffled copy of array a */
export function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Pick n random unique items from array */
export function sample(a, n) {
  return shuffle(a).slice(0, n);
}
