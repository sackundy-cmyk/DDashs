// ──────────────────────────────────────────────────────────────
//  digitPickState.js
//  Module-level selection store for the click-to-place digit
//  palette interaction. Scoped by paletteId so multiple palettes
//  on the same page stay independent.
// ──────────────────────────────────────────────────────────────

const _store = new Map(); // paletteId → { selected: string|null, subs: Set<fn> }

function _slot(pid) {
  if (!_store.has(pid)) _store.set(pid, { selected: null, subs: new Set() });
  return _store.get(pid);
}

export const digitPickState = {
  /** Current selected digit (null if none) */
  get(pid) {
    return _store.get(pid)?.selected ?? null;
  },

  /** Select digit, or deselect if it's already selected */
  toggle(pid, digit) {
    const s = _slot(pid);
    const next = s.selected === digit ? null : digit;
    s.selected = next;
    s.subs.forEach(fn => fn(next));
  },

  /** Deselect without changing anything else */
  clear(pid) {
    const s = _store.get(pid);
    if (s && s.selected !== null) {
      s.selected = null;
      s.subs.forEach(fn => fn(null));
    }
  },

  /** Subscribe to selection changes; returns unsubscribe fn */
  sub(pid, fn) {
    const s = _slot(pid);
    s.subs.add(fn);
    return () => s.subs.delete(fn);
  },
};
