// ============================================================
//  mathUtils.js — D-DASH shared maths helpers
// ============================================================

/** Check if n is prime */
export function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

/** Get all primes up to max (inclusive) */
export function getPrimesUpTo(max) {
  const primes = [];
  for (let i = 2; i <= max; i++) if (isPrime(i)) primes.push(i);
  return primes;
}

/** Get all factors of n in ascending order */
export function getFactors(n) {
  const f = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i);
  return f;
}

/** Greatest common divisor */
export function gcd(a, b) {
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

/** Lowest common multiple of two numbers */
export function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

/** LCM of an array of numbers */
export function lcmArray(nums) {
  return nums.reduce((acc, n) => lcm(acc, n), nums[0]);
}

/** Common factors of an array of numbers */
export function getCommonFactors(nums) {
  let f = getFactors(nums[0]);
  for (let i = 1; i < nums.length; i++) {
    const fi = getFactors(nums[i]);
    f = f.filter(x => fi.includes(x));
  }
  return f;
}

/** Highest common factor of an array of numbers */
export function hcf(nums) {
  const cf = getCommonFactors(nums);
  return cf[cf.length - 1];
}

/** Common multiples of two numbers up to max */
export function getCommonMultiples(a, b, max = 100) {
  const l = lcm(a, b);
  const result = [];
  for (let v = l; v <= max; v += l) result.push(v);
  return result;
}

/** Common multiples of three numbers up to max */
export function getCommonMultiples3(a, b, c, max = 100) {
  const l = lcmArray([a, b, c]);
  const result = [];
  for (let v = l; v <= max; v += l) result.push(v);
  return result;
}

/** Check if n is a square number */
export function isSquare(n) {
  const s = Math.sqrt(n);
  return Number.isInteger(s);
}

/** Get all square numbers up to max */
export function getSquaresUpTo(max) {
  const squares = [];
  for (let i = 1; i * i <= max; i++) squares.push(i * i);
  return squares;
}

/**
 * Safely evaluate a maths expression string.
 * Replaces × → *, ÷ → /, − → -
 * Returns null on error.
 */
export function evalExpr(s) {
  const sanitised = s
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/[^0-9+\-*/().\s]/g, ''); // strip anything unexpected
  try {
    // eslint-disable-next-line no-new-func
    return Function('"use strict"; return (' + sanitised + ')')();
  } catch {
    return null;
  }
}

/** Round to n decimal places */
export function round(val, places = 2) {
  return Math.round(val * 10 ** places) / 10 ** places;
}
