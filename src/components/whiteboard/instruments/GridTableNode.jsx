// ============================================================
//  GridTableNode.jsx — draggable HTML grid table
// ============================================================
import { useState, useRef, useCallback } from 'react';

const CELL_W = 56;
const CELL_H = 36;

export default function GridTableNode({ obj, isSelected, onSelect, onUpdate, onDelete, zoom = 1 }) {
  const dragRef    = useRef(null);
  const [dragging, setDragging] = useState(false);
  // dragStart stores initial mouse + obj position so we can compute world-space delta
  const dragStartRef = useRef(null);

  const rows  = obj.rows  || 4;
  const cols  = obj.cols  || 4;
  const cells = obj.cells || Array(rows * cols).fill('');

  const setCell = (idx, val) => {
    const next = cells.map((c, i) => i === idx ? val : c);
    onUpdate(obj.id, { cells: next });
  };

  const addRow = () => {
    const newCells = [...cells, ...Array(cols).fill('')];
    onUpdate(obj.id, { rows: rows + 1, cells: newCells });
  };
  const removeRow = () => {
    if (rows <= 1) return;
    onUpdate(obj.id, { rows: rows - 1, cells: cells.slice(0, (rows - 1) * cols) });
  };
  const addCol = () => {
    const next = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) next.push(cells[r * cols + c] || '');
      next.push('');
    }
    onUpdate(obj.id, { cols: cols + 1, cells: next });
  };
  const removeCol = () => {
    if (cols <= 1) return;
    const next = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 1; c++) next.push(cells[r * cols + c] || '');
    }
    onUpdate(obj.id, { cols: cols - 1, cells: next });
  };

  // Drag handling — divide screen delta by zoom to get world delta
  const onMouseDown = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    e.stopPropagation();
    setDragging(true);
    onSelect(obj.id);
    dragStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, objX: obj.x, objY: obj.y };
  }, [obj.x, obj.y, obj.id, onSelect]);

  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragStartRef.current) return;
    const z = zoom || 1;
    const dx = (e.clientX - dragStartRef.current.mouseX) / z;
    const dy = (e.clientY - dragStartRef.current.mouseY) / z;
    onUpdate(obj.id, { x: dragStartRef.current.objX + dx, y: dragStartRef.current.objY + dy });
  }, [dragging, obj.id, onUpdate, zoom]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  // Attach global listeners while dragging
  const attachedRef = useRef(false);
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
      ref={dragRef}
      className={`wb-table-obj${isSelected ? ' selected' : ''}`}
      style={{ left: obj.x, top: obj.y, transform: `scale(${obj.scaleX || 1})`, transformOrigin: 'top left' }}
      onMouseDown={onMouseDown}
      onClick={() => onSelect(obj.id)}
    >
      {/* Header bar */}
      <div className="wb-table-header">
        <span className="wb-table-title">Table ({rows}×{cols})</span>
        <div className="wb-table-actions">
          <button className="wb-table-action-btn del" onClick={e => { e.stopPropagation(); onDelete(obj.id); }} title="Delete table">✕</button>
        </div>
      </div>

      {/* Grid */}
      <div
        className="wb-table-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, ${CELL_W}px)` }}
      >
        {cells.slice(0, rows * cols).map((val, idx) => (
          <input
            key={idx}
            className="wb-table-cell"
            value={val}
            onChange={e => setCell(idx, e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            style={{ width: CELL_W, height: CELL_H }}
          />
        ))}
      </div>

      {/* Row controls */}
      <div className="wb-table-row-controls">
        <button className="wb-tbl-ctrl-btn" onClick={addRow}>+ Row</button>
        <button className="wb-tbl-ctrl-btn remove" onClick={removeRow} disabled={rows <= 1}>− Row</button>
        <button className="wb-tbl-ctrl-btn" onClick={addCol}>+ Col</button>
        <button className="wb-tbl-ctrl-btn remove" onClick={removeCol} disabled={cols <= 1}>− Col</button>
      </div>
    </div>
  );
}
