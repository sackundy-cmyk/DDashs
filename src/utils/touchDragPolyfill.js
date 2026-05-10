// ============================================================
//  utils/touchDragPolyfill.js
//  Translates touch events into HTML5 drag events so all drag
//  interactions work on iOS Safari, Android Chrome, and tablets.
//
//  Key behaviour:
//  • A 200 ms long-press is required before drag starts, so a
//    quick tap or a normal page-scroll never hijacks the touch.
//  • touchmove is registered as { passive: false } so we can
//    call e.preventDefault() and stop the page scrolling while
//    a drag is in progress.
//  • touchcancel cleans up any pending state cleanly.
//
//  Call initTouchDrag() once in main.jsx.
// ============================================================

const HOLD_MS        = 200; // ms hold before drag is confirmed
const MOVE_THRESHOLD = 8;   // px of movement that cancels a pending hold

let dragEl     = null;
let lastTarget = null;
let ghost      = null;
let holdTimer  = null;
let dragActive = false;
let startX     = 0;
let startY     = 0;

function getTargetElement(x, y) {
  if (ghost) ghost.style.visibility = 'hidden';
  const el = document.elementFromPoint(x, y);
  if (ghost) ghost.style.visibility = '';
  return el;
}

function createGhost(sourceEl) {
  const rect = sourceEl.getBoundingClientRect();
  ghost = sourceEl.cloneNode(true);
  Object.assign(ghost.style, {
    position:      'fixed',
    top:           rect.top  + 'px',
    left:          rect.left + 'px',
    width:         rect.width  + 'px',
    height:        rect.height + 'px',
    opacity:       '0.75',
    pointerEvents: 'none',
    zIndex:        '9999',
    transform:     'scale(1.08)',
    transition:    'none',
    boxShadow:     '0 8px 24px rgba(0,0,0,.25)',
  });
  document.body.appendChild(ghost);
}

function dispatchDragEvent(type, target, dataTransfer, x, y) {
  const event = new MouseEvent(type, {
    bubbles: true, cancelable: true,
    clientX: x, clientY: y,
  });
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
  target.dispatchEvent(event);
}

function cancelPending() {
  clearTimeout(holdTimer);
  holdTimer  = null;
  dragEl     = null;
  dragActive = false;
}

function cleanupDrag(dt) {
  if (dragActive && dragEl) {
    dispatchDragEvent('dragend', dragEl, dt, 0, 0);
    dragEl.classList.remove('dragging');
  }
  if (ghost) { ghost.remove(); ghost = null; }
  dragEl     = null;
  lastTarget = null;
  dragActive = false;
  holdTimer  = null;
}

export function initTouchDrag() {
  // Only patch touch-primary devices
  if (!('ontouchstart' in window)) return;

  const sharedDT = {
    data: {},
    setData(type, val)  { this.data[type] = val; },
    getData(type)        { return this.data[type] || ''; },
    get effectAllowed()  { return 'copy'; },
    set effectAllowed(_) {},
    get dropEffect()     { return 'copy'; },
    set dropEffect(_)    {},
    clearData()          { this.data = {}; },
  };

  // ── touchstart — record position and start hold timer ────────
  document.addEventListener('touchstart', (e) => {
    const target = e.target.closest('[draggable="true"]');
    if (!target) return;

    // Cancel any leftover state from a previous incomplete drag
    clearTimeout(holdTimer);
    ghost && ghost.remove();
    ghost      = null;
    dragActive = false;
    lastTarget = null;

    dragEl = target;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    holdTimer = setTimeout(() => {
      // Long-press confirmed — begin drag
      dragActive = true;
      sharedDT.data = {};
      dispatchDragEvent('dragstart', dragEl, sharedDT, startX, startY);
      createGhost(dragEl);
      dragEl.classList.add('dragging');
    }, HOLD_MS);

  }, { passive: true }); // passive OK here — we don't need preventDefault on touchstart

  // ── touchmove — MUST be non-passive so we can stop page scroll ─
  document.addEventListener('touchmove', (e) => {
    if (!dragEl) return;

    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    if (!dragActive) {
      // Hold timer hasn't fired yet.
      // If the finger moved too far it's a scroll gesture — cancel the pending drag.
      const dx = Math.abs(x - startX);
      const dy = Math.abs(y - startY);
      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
        clearTimeout(holdTimer);
        holdTimer  = null;
        dragEl     = null;
      }
      // Let the browser scroll naturally
      return;
    }

    // Drag is active — block the page scroll
    e.preventDefault();

    // Move ghost to follow the finger (centred under touch point)
    if (ghost) {
      ghost.style.left = (x - ghost.offsetWidth  / 2) + 'px';
      ghost.style.top  = (y - ghost.offsetHeight / 2) + 'px';
    }

    const target = getTargetElement(x, y);
    if (target !== lastTarget) {
      if (lastTarget) dispatchDragEvent('dragleave', lastTarget, sharedDT, x, y);
      if (target)     dispatchDragEvent('dragenter', target,     sharedDT, x, y);
      lastTarget = target;
    }
    if (target) dispatchDragEvent('dragover', target, sharedDT, x, y);

  }, { passive: false }); // non-passive — required to call preventDefault

  // ── touchend — complete or cancel drag ───────────────────────
  document.addEventListener('touchend', (e) => {
    clearTimeout(holdTimer);
    holdTimer = null;

    if (!dragEl || !dragActive) {
      dragEl     = null;
      dragActive = false;
      return;
    }

    const touch  = e.changedTouches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    const target = getTargetElement(x, y);

    if (target) dispatchDragEvent('drop', target, sharedDT, x, y);
    dispatchDragEvent('dragend', dragEl, sharedDT, x, y);

    dragEl.classList.remove('dragging');
    if (ghost) { ghost.remove(); ghost = null; }
    dragEl     = null;
    lastTarget = null;
    dragActive = false;

  }, { passive: true });

  // ── touchcancel — abort cleanly (e.g. incoming call, scroll) ─
  document.addEventListener('touchcancel', () => {
    clearTimeout(holdTimer);
    cleanupDrag(sharedDT);
  }, { passive: true });
}
