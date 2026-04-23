// ============================================================
//  __tests__/mathUtils.test.js
//  Run with: npx vitest run
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  isPrime, getPrimesUpTo,
  getFactors, gcd, lcm, lcmArray,
  getCommonFactors, hcf,
  getCommonMultiples, getCommonMultiples3,
  isSquare, getSquaresUpTo,
  evalExpr, round,
} from '../utils/mathUtils.js';

// ── isPrime ──────────────────────────────────────────────────
describe('isPrime', () => {
  it('returns false for 1', () => expect(isPrime(1)).toBe(false));
  it('returns true for 2', () => expect(isPrime(2)).toBe(true));
  it('returns true for 3', () => expect(isPrime(3)).toBe(true));
  it('returns false for 4', () => expect(isPrime(4)).toBe(false));
  it('returns true for 97', () => expect(isPrime(97)).toBe(true));
  it('returns false for 100', () => expect(isPrime(100)).toBe(false));
});

describe('getPrimesUpTo', () => {
  it('returns 25 primes up to 100', () => {
    const primes = getPrimesUpTo(100);
    expect(primes).toHaveLength(25);
    expect(primes[0]).toBe(2);
    expect(primes[primes.length - 1]).toBe(97);
  });
});

// ── getFactors ───────────────────────────────────────────────
describe('getFactors', () => {
  it('factors of 12', () => expect(getFactors(12)).toEqual([1,2,3,4,6,12]));
  it('factors of 7 (prime)', () => expect(getFactors(7)).toEqual([1,7]));
  it('factors of 36', () => expect(getFactors(36)).toEqual([1,2,3,4,6,9,12,18,36]));
  it('factors of 1', () => expect(getFactors(1)).toEqual([1]));
});

// ── gcd / lcm ────────────────────────────────────────────────
describe('gcd', () => {
  it('gcd(12, 8) = 4',   () => expect(gcd(12, 8)).toBe(4));
  it('gcd(9, 6) = 3',    () => expect(gcd(9, 6)).toBe(3));
  it('gcd(7, 13) = 1',   () => expect(gcd(7, 13)).toBe(1));
  it('gcd(100, 25) = 25',() => expect(gcd(100, 25)).toBe(25));
});

describe('lcm', () => {
  it('lcm(4, 6) = 12',   () => expect(lcm(4, 6)).toBe(12));
  it('lcm(5, 8) = 40',   () => expect(lcm(5, 8)).toBe(40));
  it('lcm(3, 9) = 9',    () => expect(lcm(3, 9)).toBe(9));
  it('lcm(7, 13) = 91',  () => expect(lcm(7, 13)).toBe(91));
});

describe('lcmArray', () => {
  it('lcm of [2,3,4] = 12',  () => expect(lcmArray([2,3,4])).toBe(12));
  it('lcm of [4,6,9] = 36',  () => expect(lcmArray([4,6,9])).toBe(36));
  it('lcm of [2,4,8] = 8',   () => expect(lcmArray([2,4,8])).toBe(8));
});

// ── getCommonFactors / hcf ───────────────────────────────────
describe('getCommonFactors', () => {
  it('CF of [12, 18] = [1,2,3,6]', () =>
    expect(getCommonFactors([12, 18])).toEqual([1,2,3,6]));
  it('CF of [27, 45] = [1,3,9]', () =>
    expect(getCommonFactors([27, 45])).toEqual([1,3,9]));
  it('CF of [7, 13] = [1]', () =>
    expect(getCommonFactors([7, 13])).toEqual([1]));
  it('CF of [12, 36, 48] = [1,2,3,4,6,12]', () =>
    expect(getCommonFactors([12, 36, 48])).toEqual([1,2,3,4,6,12]));
});

describe('hcf', () => {
  it('HCF of [12, 42] = 6',   () => expect(hcf([12, 42])).toBe(6));
  it('HCF of [27, 45] = 9',   () => expect(hcf([27, 45])).toBe(9));
  it('HCF of [36, 48] = 12',  () => expect(hcf([36, 48])).toBe(12));
  it('HCF of [14, 42] = 14',  () => expect(hcf([14, 42])).toBe(14));
});

// ── getCommonMultiples ───────────────────────────────────────
describe('getCommonMultiples', () => {
  it('CM(3,4) up to 100 = [12,24,36,48,60,72,84,96]', () =>
    expect(getCommonMultiples(3, 4, 100)).toEqual([12,24,36,48,60,72,84,96]));
  it('CM(6,10) up to 100 = [30,60,90]', () =>
    expect(getCommonMultiples(6, 10, 100)).toEqual([30,60,90]));
  it('CM(5,7) up to 100 = [35,70]', () =>
    expect(getCommonMultiples(5, 7, 100)).toEqual([35,70]));
});

describe('getCommonMultiples3', () => {
  it('CM(2,4,8) up to 100 has LCM 8', () => {
    const result = getCommonMultiples3(2, 4, 8, 100);
    expect(result[0]).toBe(8);
    expect(result.every(n => n % 8 === 0)).toBe(true);
  });
  it('CM(4,6,9) up to 100 = [36, 72]', () =>
    expect(getCommonMultiples3(4, 6, 9, 100)).toEqual([36, 72]));
});

// ── isSquare / getSquaresUpTo ────────────────────────────────
describe('isSquare', () => {
  it('1,4,9,16,25,36,49,64,81,100 are square', () => {
    [1,4,9,16,25,36,49,64,81,100].forEach(n => expect(isSquare(n)).toBe(true));
  });
  it('2,3,5,10,24,46,50 are not square', () => {
    [2,3,5,10,24,46,50].forEach(n => expect(isSquare(n)).toBe(false));
  });
});

describe('getSquaresUpTo', () => {
  it('squares up to 100 = 10 values ending in 100', () => {
    const sq = getSquaresUpTo(100);
    expect(sq).toHaveLength(10);
    expect(sq).toEqual([1,4,9,16,25,36,49,64,81,100]);
  });
});

// ── evalExpr ─────────────────────────────────────────────────
describe('evalExpr', () => {
  it('(4 × 5) + 3 = 23',    () => expect(evalExpr('(4 × 5) + 3')).toBe(23));
  it('84 − (17 + 32) = 35', () => expect(evalExpr('84 − (17 + 32)')).toBe(35));
  it('(6 × 15) ÷ (94 − 84) = 9', () =>
    expect(evalExpr('(6 × 15) ÷ (94 − 84)')).toBe(9));
  it('returns null on bad input', () => expect(evalExpr('abc')).toBeNull());
});

// ── round ────────────────────────────────────────────────────
describe('round', () => {
  it('round(3.456, 2) = 3.46',  () => expect(round(3.456, 2)).toBe(3.46));
  it('round(2.715, 1) = 2.7',   () => expect(round(2.715, 1)).toBe(2.7));
  it('round(10, 0) = 10',       () => expect(round(10, 0)).toBe(10));
});
