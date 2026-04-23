// ============================================================
//  __tests__/utils.test.js — shuffle + feedback utils
// ============================================================

import { describe, it, expect } from 'vitest';
import { shuffle, sample } from '../utils/shuffleUtils.js';
import { FB, feedbackType, standardMessage } from '../utils/feedbackUtils.js';

// ── shuffle ──────────────────────────────────────────────────
describe('shuffle', () => {
  it('returns array of same length', () => {
    const arr = [1,2,3,4,5];
    expect(shuffle(arr)).toHaveLength(arr.length);
  });

  it('does not mutate original', () => {
    const arr = [1,2,3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  it('contains all original elements', () => {
    const arr = [10,20,30,40,50];
    const result = shuffle(arr);
    arr.forEach(v => expect(result).toContain(v));
  });
});

describe('sample', () => {
  it('returns requested number of items', () => {
    const arr = [1,2,3,4,5,6,7,8];
    expect(sample(arr, 3)).toHaveLength(3);
  });

  it('items are from original array', () => {
    const arr = [1,2,3,4,5];
    const result = sample(arr, 3);
    result.forEach(v => expect(arr).toContain(v));
  });

  it('no duplicates in sample', () => {
    const arr = [1,2,3,4,5,6,7,8,9,10];
    const result = sample(arr, 5);
    const unique = new Set(result);
    expect(unique.size).toBe(5);
  });
});

// ── feedbackType ─────────────────────────────────────────────
describe('feedbackType', () => {
  it('returns CORRECT when allCorrect is true', () =>
    expect(feedbackType(1, true)).toBe(FB.CORRECT));

  it('returns WRONG on attempt 1, not all correct', () =>
    expect(feedbackType(1, false)).toBe(FB.WRONG));

  it('returns HINT on attempt 2', () =>
    expect(feedbackType(2, false)).toBe(FB.HINT));

  it('returns HINT on attempt 3+', () => {
    expect(feedbackType(3, false)).toBe(FB.HINT);
    expect(feedbackType(5, false)).toBe(FB.HINT);
  });
});

// ── standardMessage ──────────────────────────────────────────
describe('standardMessage', () => {
  it('returns correct type when all correct', () => {
    const msg = standardMessage(1, 5, 5);
    expect(msg.type).toBe(FB.CORRECT);
    expect(msg.text).toContain('5/5');
  });

  it('returns wrong type on attempt 1 with errors', () => {
    const msg = standardMessage(1, 3, 5);
    expect(msg.type).toBe(FB.WRONG);
  });

  it('returns hint on attempt 2', () => {
    const msg = standardMessage(2, 3, 5, 'Try harder');
    expect(msg.type).toBe(FB.HINT);
    expect(msg.text).toContain('3/5');
    expect(msg.text).toContain('Try harder');
  });

  it('returns hint with revealed flag', () => {
    const msg = standardMessage(3, 2, 5, '', true);
    expect(msg.type).toBe(FB.HINT);
    expect(msg.text).toContain('revealed');
  });
});
