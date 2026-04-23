// ============================================================
//  utils/a11y.js — accessibility helpers
// ============================================================

/**
 * Make a div behave like a button for keyboard users.
 * Fires onClick when Enter or Space is pressed.
 */
export function keyboardButton(onClick) {
  return {
    role: 'button',
    tabIndex: 0,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick && onClick(e);
      }
    },
  };
}

/**
 * Generate a readable description of a drag target.
 */
export function dropZoneProps(label) {
  return {
    role:        'region',
    'aria-label': label,
    'aria-dropeffect': 'copy',
  };
}

/**
 * Announce a message to screen readers via a live region.
 * Pass the message string; the region auto-clears after 3 seconds.
 */
let liveEl = null;
export function announce(message) {
  if (typeof document === 'undefined') return;
  if (!liveEl) {
    liveEl = document.createElement('div');
    Object.assign(liveEl.style, {
      position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden',
    });
    liveEl.setAttribute('aria-live', 'polite');
    liveEl.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveEl);
  }
  liveEl.textContent = message;
  setTimeout(() => { if (liveEl) liveEl.textContent = ''; }, 3000);
}
