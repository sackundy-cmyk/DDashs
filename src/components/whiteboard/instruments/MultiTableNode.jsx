// ============================================================
//  MultiTableNode.jsx — draggable 10×10 multiplication table
// ============================================================
import { useState, useRef, useCallback } from 'react';

const CELL_W = 38;
const CELL_H = 30;
const SIZE   = 11; // 10×10 grid + header row/col

function buildCells() {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (r === 0 && c === 0) { cells.push({ type: 'corner', val: '×' }); continue; }
      if (r === 0) { cells.push({ type: 'header', val: String(c) }); continue; }
      if (c === 0) { cells.push({ type: 'header', val: String(r) }); continue; }
      cells.push({ type: 'data', val: String(r * c) });
    }
  }
  return cells;
}

const CELLS = buildCells();

export default function MultiTableNode({ obj, isSelected, onSelect, onUpdate, onDelete, zoom = 1 }) {
  const [dragging, setDragging] = useState(false);
  const attachedRef  = useRef(false);
  const dragStartRef = useRef(null);

  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragStartRef.current) return;
    const z = zoom || 1;
    const dx = (e.clientX - dragStartRef.current.mouseX) / z;
    const dy = (e.clientY - dragStartRef.current.mouseY) / z;
    onUpdate(obj.id, { x: dragStartRef.current.objX + dx, y: dragStartRef.current.objY + dy });
  }, [dragging, obj.id, onUpdate, zoom]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  if (dragging && !attachedRef.current) {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    attachedRef.current = true;
  }
  if (!dragging && attachedRef.current) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    attachedRef.current = false;
  }

  return (
    <div
      className={`wb-table-obj${isSelected ? ' selected' : ''}`}
      style={{ left: obj.x, top: obj.y, transform: `scale(${obj.scaleX || 1})`, transformOrigin: 'top left', cursor: 'move' }}
      onMouseDown={(e) => {
        e.stopPropagation();
        setDragging(true);
        onSelect(obj.id);
        dragStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, objX: obj.x, objY: obj.y };
      }}
      onClick={() => onSelect(obj.id)}
    >
      {/* Header bar */}
      <div className="wb-table-header">
        <span className="wb-table-title">Multiplication Table (10×10)</span>
        <div className="wb-table-actions">
          <button className="wb-table-action-btn del" onClick={e => { e.stopPropagation(); onDelete(obj.id); }} title="Delete">✕</button>
        </div>
      </div>

      {/* Grid */}
      <div
        className="wb-table-grid"
        style={{ gridTemplateColumns: `repeat(${SIZE}, ${CELL_W}px)` }}
        onMouseDown={e => e.stopPropagation()}
      >
        {CELLS.map((cell, i) => (
          <div
            key={i}
            className={`wb-table-cell${cell.type !== 'data' ? ' header-cell' : ''}`}
            style={{
              width: CELL_W,
              height: CELL_H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '.8rem',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: cell.type !== 'data' ? 900 : 700,
              background: cell.type === 'corner' ? '#0a3d7a' : cell.type === 'header' ? '#1e6fd9' : 'white',
              color: cell.type !== 'data' ? 'white' : '#1e293b',
              border: '1px solid #e2e8f0',
              cursor: 'default',
              userSelect: 'none',
            }}
          >
            {cell.val}
          </div>
        ))}
      </div>
    </div>
  );
}
