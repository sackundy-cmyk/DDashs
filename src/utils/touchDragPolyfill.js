// ============================================================
//  utils/touchDragPolyfill.js
//  Translates touch events into HTML5 drag events so all drag
//  interactions work on iOS Safari, Android Chrome, and tablets.
//
//  Call initTouchDrag() once in main.jsx.
// ============================================================

let dragEl = null;
let lastTarget = null;
let ghost = null;

function getTargetElement(x, y) {
  // Temporarily hide the ghost so elementFromPoint finds the underlying element
  if (ghost) ghost.style.visibility = 'hidden';
  const el = document.elementFromPoint(x, y);
  if (ghost) ghost.style.visibility = '';
  return el;
}

function createGhost(sourceEl, x, y) {
  const rect = sourceEl.getBoundingClientRect();
  ghost = sourceEl.cloneNode(true);
  Object.assign(ghost.style, {
    position: 'fixed',
    top:      rect.top + 'px',
    left:     rect.left + 'px',
    width:    rect.width + 'px',
    height:   rect.height + 'px',
    opacity:  '0.75',
    pointerEvents: 'none',
    zIndex:   '9999',
    transform: 'scale(1.08)',
    transition: 'none',
    boxShadow: '0 8px 24px rgba(0,0,0,.25)',
  });
  document.body.appendChild(ghost);
  return ghost;
}

function dispatchDragEvent(type, target, dataTransfer, x, y) {
  const event = new MouseEvent(type, {
    bubbles: true, cancelable: true,
    clientX: x, clientY: y,
  });
  // Attach a minimal dataTransfer shim
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
  target.dispatchEvent(event);
}

export function initTouchDrag() {
  // Only patch if real drag events aren't supported (touch-primary devices)
  if (!('ontouchstart' in window)) return;

  const dataTransferStore = {};
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

  document.addEventListener('touchstart', (e) => {
    const target = e.target.closest('[draggable="true"]');
    if (!target) return;
    dragEl = target;
    sharedDT.data = {};
    dispatchDragEvent('dragstart', dragEl, sharedDT, e.touches[0].clientX, e.touches[0].clientY);
    createGhost(dragEl, e.touches[0].clientX, e.touches[0].clientY);
    dragEl.classList.add('dragging');
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!dragEl) return;
    const touch = e.touches[0];
    const x = touch.clientX, y = touch.clientY;

    // Move ghost
    if (ghost) {
      ghost.style.left = (x - ghost.offsetWidth / 2) + 'px';
      ghost.style.top  = (y - ghost.offsetHeight / 2) + 'px';
    }

    const target = getTargetElement(x, y);
    if (target !== lastTarget) {
      if (lastTarget) dispatchDragEvent('dragleave', lastTarget, sharedDT, x, y);
      if (target)     dispatchDragEvent('dragenter', target, sharedDT, x, y);
      lastTarget = target;
    }
    if (target) dispatchDragEvent('dragover', target, sharedDT, x, y);
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!dragEl) return;
    const touch = e.changedTouches[0];
    const x = touch.clientX, y = touch.clientY;
    const target = getTargetElement(x, y);

    if (target) dispatchDragEvent('drop', target, sharedDT, x, y);
    dispatchDragEvent('dragend', dragEl, sharedDT, x, y);

    dragEl.classList.remove('dragging');
    if (ghost) { ghost.remove(); ghost = null; }
    dragEl = null;
    lastTarget = null;
  }, { passive: true });
}
