// ============================================================
//  feedbackUtils.js — shared feedback/state helpers
// ============================================================

/** Feedback types */
export const FB = { CORRECT: 'correct', WRONG: 'wrong', HINT: 'hint' };

/**
 * Determine feedback type based on attempt number.
 * att=1 → wrong, att=2 → hint, att>=3 → hint (reveal)
 */
export function feedbackType(att, allCorrect) {
  if (allCorrect) return FB.CORRECT;
  if (att >= 3) return FB.HINT;
  if (att === 2) return FB.HINT;
  return FB.WRONG;
}

/**
 * Standard 3-attempt messages for drag/digit questions.
 * @param {number} att - current attempt number
 * @param {number} correct - number of correct answers
 * @param {number} total - total answers expected
 * @param {string} [tipText] - optional tip for attempt 2
 * @param {boolean} [revealed] - whether answers were auto-revealed
 */
export function standardMessage(att, correct, total, tipText = '', revealed = false) {
  if (correct === total) {
    return { type: FB.CORRECT, text: `🎉 ${correct}/${total} correct! Well done!` };
  }
  if (revealed) {
    return { type: FB.HINT, text: '✅ Correct answers revealed. Remember: brackets are calculated first!' };
  }
  if (att >= 3) {
    return { type: FB.HINT, text: `✅ Correct answers revealed.` };
  }
  if (att === 2) {
    return { type: FB.HINT, text: `💡 ${correct}/${total} correct. ${tipText}` };
  }
  return { type: FB.WRONG, text: `✗ ${correct}/${total} correct. Try again!` };
}

/** Digit zone state classes */
export const ZONE_STATE = {
  DEFAULT: 'default',
  FILLED:  'filled',
  CORRECT: 'correct',
  WRONG:   'wrong',
  REVEAL:  'reveal',
};
