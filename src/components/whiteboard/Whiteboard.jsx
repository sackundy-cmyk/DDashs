// ============================================================
//  Whiteboard.jsx — main orchestrator
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Stage, Layer, Line, Rect as KRect, Circle as KCircle,
  RegularPolygon, Group, Text as KText, Transformer,
} from 'react-konva';

import Toolbar       from './Toolbar.jsx';
import CardPanel     from './CardPanel.jsx';
import EquationRows, { makeInitialRow } from './EquationRows.jsx';
import RulerNode      from './instruments/RulerNode.jsx';
import ProtractorNode from './instruments/ProtractorNode.jsx';
import AbacusNode     from './instruments/AbacusNode.jsx';
import NumberLineNode from './instruments/NumberLineNode.jsx';
import GridTableNode  from './instruments/GridTableNode.jsx';
import MultiTableNode from './instruments/MultiTableNode.jsx';
import './whiteboard.css';

// ── Utilities ────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const CARD_COLORS = [
  '#1e2130','#e74c3c','#3498db','#2ecc71',
  '#f39c12','#9b59b6','#e91e8c','#00bcd4',
];
const CARD_H = 44;
const COORD_PX = 40;

function getCardFs(val) {
  const n = val.length;
  if (n <= 2)  return 32;
  if (n <= 4)  return 22;
  if (n <= 8)  return 15;
  if (n <= 12) return 13;
  return 11;
}
function getCardW(val) {
  const n = val.length;
  if (n <= 2)  return 54;
  if (n <= 4)  return Math.max(60, n * 18);
  return Math.max(70, n * 11);
}
function ghostFontSize(val) {
  const n = val.length;
  if (n <= 2)  return '1.8rem';
  if (n <= 5)  return '1.2rem';
  if (n <= 10) return '.9rem';
  return '.75rem';
}

// ── CoordGrid ─────────────────────────────────────────────────
function CoordGrid({ w, h, quadrant }) {
  const ox = quadrant === 'q1' ? 50 : Math.round(w / 2);
  const oy = quadrant === 'q1' ? h - 50 : Math.round(h / 2);

  const maxX = Math.ceil((w - ox) / COORD_PX) + 1;
  const minX = quadrant === 'q1' ? 0 : -Math.ceil(ox / COORD_PX) - 1;
  const maxY = Math.ceil(oy / COORD_PX) + 1;
  const minY = quadrant === 'q1' ? 0 : -Math.ceil((h - oy) / COORD_PX) - 1;

  const gridLines = [];
  const ticks = [];
  const labels = [];

  for (let i = minX; i <= maxX; i++) {
    const x = ox + i * COORD_PX;
    gridLines.push(
      <Line key={`gv${i}`} points={[x, 0, x, h]}
        stroke="rgba(100,130,200,.15)" strokeWidth={1} listening={false} />
    );
    ticks.push(
      <Line key={`tx${i}`} points={[x, oy - 4, x, oy + 4]}
        stroke="#1E2130" strokeWidth={1} listening={false} />
    );
    if (i !== 0) {
      labels.push(
        <KText key={`lx${i}`} x={x - 10} y={oy + 6} width={20}
          text={String(i)} fontSize={10} fontFamily="Nunito, sans-serif"
          fontStyle="bold" fill="#1E2130" align="center" listening={false} />
      );
    }
  }
  for (let j = minY; j <= maxY; j++) {
    const y = oy - j * COORD_PX;
    gridLines.push(
      <Line key={`gh${j}`} points={[0, y, w, y]}
        stroke="rgba(100,130,200,.15)" strokeWidth={1} listening={false} />
    );
    ticks.push(
      <Line key={`ty${j}`} points={[ox - 4, y, ox + 4, y]}
        stroke="#1E2130" strokeWidth={1} listening={false} />
    );
    if (j !== 0) {
      labels.push(
        <KText key={`ly${j}`} x={ox + 5} y={y - 7}
          text={String(j)} fontSize={10} fontFamily="Nunito, sans-serif"
          fontStyle="bold" fill="#1E2130" listening={false} />
      );
    }
  }

  return (
    <Group listening={false}>
      {gridLines}
      {/* X axis */}
      <Line points={[quadrant === 'q1' ? ox : 0, oy, w, oy]}
        stroke="#1E2130" strokeWidth={2} listening={false} />
      {/* Y axis */}
      <Line points={[ox, quadrant === 'q1' ? oy : h, ox, 0]}
        stroke="#1E2130" strokeWidth={2} listening={false} />
      {/* Arrow X-right */}
      <Line points={[w - 10, oy - 5, w, oy, w - 10, oy + 5]}
        stroke="#1E2130" strokeWidth={2} closed fill="#1E2130" listening={false} />
      {/* Arrow Y-up */}
      <Line points={[ox - 5, 10, ox, 0, ox + 5, 10]}
        stroke="#1E2130" strokeWidth={2} closed fill="#1E2130" listening={false} />
      {ticks}
      {labels}
    </Group>
  );
}

// ── BoardCard ─────────────────────────────────────────────────
function BoardCard({ obj, isSelected, onSelect, onUpdate, onDelete, tool, onHover, onHoverLeave, zoom, stagePos }) {
  const w  = obj.w  || getCardW(obj.val);
  const h  = obj.h  || CARD_H;
  const fs = obj.fontSize || getCardFs(obj.val);

  return (
    <Group
      id={obj.id}
      x={obj.x}
      y={obj.y}
      draggable={tool === 'select'}
      onClick={e => { e.cancelBubble = true; if (tool === 'select') onSelect(obj.id); }}
      onDragEnd={e => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() })}
      onMouseEnter={e => {
        const rect = e.target.getStage().container().getBoundingClientRect();
        const z = zoom || 1;
        const sp = stagePos || { x: 0, y: 0 };
        onHover(obj.id, {
          x: rect.left + obj.x * z + sp.x + (w * z) / 2,
          y: rect.top  + obj.y * z + sp.y,
        });
      }}
      onMouseLeave={() => onHoverLeave()}
    >
      <KRect
        width={w} height={h}
        fill={obj.fill || 'white'}
        stroke={isSelected ? '#4f8ef7' : 'rgba(0,0,0,.1)'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={8}
        shadowBlur={isSelected ? 10 : 4}
        shadowColor="rgba(0,0,0,.15)"
      />
      <KText
        x={4} y={0} width={w - 8} height={h}
        text={obj.val}
        fontSize={fs}
        fontFamily="Nunito, sans-serif"
        fontStyle="900"
        fill={obj.color || '#1e2130'}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Group>
  );
}

// ── BoardShape ────────────────────────────────────────────────
function BoardShape({ obj, isSelected, onSelect, onUpdate, onDelete, tool }) {
  const common = {
    id: obj.id,
    x: obj.x,
    y: obj.y,
    fill: obj.fill || 'transparent',
    stroke: obj.stroke || '#1e2130',
    strokeWidth: obj.strokeWidth || 3,
    draggable: tool === 'select',
    onClick: e => { e.cancelBubble = true; if (tool === 'select') onSelect(obj.id); },
    onDragEnd: e => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() }),
    shadowBlur: isSelected ? 10 : 0,
    shadowColor: 'rgba(79,142,247,.5)',
  };
  if (obj.shape === 'circle') {
    return <KCircle {...common} radius={obj.radius || 40} />;
  }
  if (obj.shape === 'rect') {
    return <KRect {...common} width={obj.w || 80} height={obj.h || 60} cornerRadius={3} />;
  }
  if (obj.shape === 'triangle') {
    return <RegularPolygon {...common} sides={3} radius={obj.radius || 45} rotation={obj.rotation || 0} />;
  }
  return null;
}

// ── BoardText ─────────────────────────────────────────────────
function BoardText({ obj, isSelected, onSelect, onUpdate, tool }) {
  return (
    <KText
      id={obj.id}
      x={obj.x} y={obj.y}
      text={obj.val}
      fontSize={obj.fontSize || 22}
      fontFamily="Nunito, sans-serif"
      fontStyle="bold"
      fill={obj.color || '#1e2130'}
      draggable={tool === 'select'}
      onClick={e => { e.cancelBubble = true; if (tool === 'select') onSelect(obj.id); }}
      onDragEnd={e => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() })}
      shadowBlur={isSelected ? 10 : 0}
      shadowColor="rgba(79,142,247,.5)"
    />
  );
}

// ── CoordPoint ────────────────────────────────────────────────
function CoordPoint({ obj, isSelected, onSelect, onDelete, tool }) {
  return (
    <Group
      id={obj.id}
      x={obj.x} y={obj.y}
      onClick={e => { e.cancelBubble = true; if (tool === 'select') onSelect(obj.id); }}
    >
      <KCircle radius={5} fill={obj.color || '#e74c3c'} stroke="white" strokeWidth={1.5} />
      <KText
        x={8} y={-10}
        text={`(${obj.cx}, ${obj.cy})`}
        fontSize={11}
        fontFamily="Nunito, sans-serif"
        fontStyle="bold"
        fill={obj.color || '#e74c3c'}
        listening={false}
      />
      {isSelected && (
        <Group
          x={10} y={-24}
          onClick={e => { e.cancelBubble = true; onDelete(obj.id); }}
        >
          <KRect width={16} height={16} fill="#e74c3c" cornerRadius={8} />
          <KText text="✕" fontSize={9} fill="white" x={3} y={2} listening={false} />
        </Group>
      )}
    </Group>
  );
}

// ── EquationGroupNode ─────────────────────────────────────────
function EquationGroupNode({ obj, isSelected, onSelect, onUpdate, onDelete, tool }) {
  const GAP = 4;
  let offsetX = GAP;
  const cardLayouts = obj.cards.map(card => {
    const w = card.w || getCardW(card.val);
    const layout = { ...card, w, offsetX };
    offsetX += w + GAP;
    return layout;
  });
  const totalW = offsetX + GAP;
  const totalH = CARD_H + 8;

  return (
    <Group
      id={obj.id}
      x={obj.x}
      y={obj.y}
      draggable={tool === 'select'}
      onClick={e => { e.cancelBubble = true; if (tool === 'select') onSelect(obj.id); }}
      onDragEnd={e => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() })}
    >
      {/* Background tray */}
      <KRect
        width={totalW} height={totalH}
        fill="rgba(30,33,48,.07)"
        stroke={isSelected ? '#4f8ef7' : 'rgba(79,142,247,.25)'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={8}
        shadowBlur={isSelected ? 10 : 3}
        shadowColor="rgba(0,0,0,.12)"
        dash={isSelected ? undefined : [5, 3]}
      />
      {/* Individual cards */}
      {cardLayouts.map((card, i) => (
        <Group key={i} x={card.offsetX} y={4}>
          <KRect
            width={card.w} height={CARD_H}
            fill="white"
            stroke="rgba(0,0,0,.08)"
            strokeWidth={1}
            cornerRadius={6}
          />
          <KText
            x={4} y={0} width={card.w - 8} height={CARD_H}
            text={card.val}
            fontSize={card.fontSize || getCardFs(card.val)}
            fontFamily="Nunito, sans-serif"
            fontStyle="900"
            fill={card.color || '#1e2130'}
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </Group>
      ))}
      {/* Delete badge when selected */}
      {isSelected && (
        <Group
          x={totalW - 18} y={-10}
          onClick={e => { e.cancelBubble = true; onDelete(obj.id); }}
        >
          <KRect width={18} height={18} fill="#e74c3c" cornerRadius={9} />
          <KText text="✕" fontSize={10} fill="white" x={3} y={2} listening={false} />
        </Group>
      )}
    </Group>
  );
}

// ── CardHoverControls ─────────────────────────────────────────
function CardHoverControls({ obj, pos, onSizePlus, onSizeMinus, onColorChange, onDelete, onMouseEnter, onMouseLeave }) {
  if (!obj || !pos) return null;
  return (
    <div
      className="wb-card-controls"
      style={{ left: pos.x, top: Math.max(10, pos.y - 42) }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button className="wb-card-ctrl-btn size-plus"  onClick={onSizePlus}  title="Bigger">A+</button>
      <button className="wb-card-ctrl-btn size-minus" onClick={onSizeMinus} title="Smaller">A−</button>
      {CARD_COLORS.map(c => (
        <div
          key={c}
          className={`wb-color-swatch${obj.color === c ? ' picked' : ''}`}
          style={{ background: c }}
          onClick={() => onColorChange(c)}
          title="Change color"
        />
      ))}
      <button className="wb-card-ctrl-btn del" onClick={onDelete} title="Delete">✕</button>
    </div>
  );
}

// ── Main Whiteboard ───────────────────────────────────────────
export default function Whiteboard() {
  // ── Drawing tool state
  const [tool,       setTool]       = useState('select');
  const [drawColor,  setDrawColor]  = useState('#1e2130');
  const [brushSize,  setBrushSize]  = useState(4);

  // ── Board objects
  const [strokes,  setStrokes]  = useState([]);
  const [objects,  setObjects]  = useState([]);
  const [eqRows,   setEqRows]   = useState(() => [makeInitialRow()]);

  // ── Ephemeral drawing
  const [curStroke,    setCurStroke]    = useState(null);
  const [previewShape, setPreviewShape] = useState(null);

  // ── Selection & hover
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId,  setHoveredId]  = useState(null);
  const [hoveredPos, setHoveredPos] = useState(null);

  // ── Pending card placement
  const [pendingCard, setPendingCard] = useState(null);
  const [ghostPos,    setGhostPos]   = useState(null);

  // ── Text tool
  const [textInput, setTextInput] = useState(null); // { x, y, val } in world coords

  // ── Board mode
  const [mode,          setMode]          = useState('whiteboard');
  const [coordQuadrant, setCoordQuadrant] = useState('q1');

  // ── Zoom & pan
  const [zoom,     setZoom]     = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // ── Timer
  const [timerSecs,    setTimerSecs]    = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerActive,  setTimerActive]  = useState(false);

  // ── UI
  const [showClear, setShowClear] = useState(false);
  const [fsMode,    setFsMode]    = useState(false);
  const [stageSize, setStageSize] = useState({ w: 800, h: 600 });

  // ── Refs
  const stageRef       = useRef(null);
  const trRef          = useRef(null);
  const boardRef       = useRef(null);
  const timerIntervalRef = useRef(null);
  const hoverTORef     = useRef(null);
  const historyRef     = useRef([]);
  const histIdxRef     = useRef(-1);

  // boardRef2: always-current copy for stale-closure-free history snapshots
  const boardRef2      = useRef({ strokes: [], objects: [], eqRows: [makeInitialRow()] });

  // Drawing refs (to avoid stale closures in Konva event handlers)
  const isDrawingRef   = useRef(false);
  const curStrokeRef   = useRef(null);
  const shapeStartRef  = useRef(null);
  const pendingCardRef = useRef(null);
  const textAreaRef    = useRef(null);
  const fsModeRef      = useRef(false);

  // Zoom / pan refs
  const zoomRef         = useRef(1);
  const stagePosRef     = useRef({ x: 0, y: 0 });
  const isPanningRef    = useRef(false);
  const panMovedRef     = useRef(false);
  const lastPointerRef  = useRef({ x: 0, y: 0 });

  // ── Zoom/stagePos helpers ──────────────────────────────────
  const updateZoom = useCallback((z) => { zoomRef.current = z; setZoom(z); }, []);
  const updateStagePos = useCallback((p) => { stagePosRef.current = p; setStagePos(p); }, []);

  // ── boardRef2 sync helpers ────────────────────────────────
  const updateStrokes = useCallback((next) => {
    boardRef2.current.strokes = next;
    setStrokes(next);
  }, []);
  const updateObjects = useCallback((next) => {
    boardRef2.current.objects = next;
    setObjects(next);
  }, []);
  const updateEqRows = useCallback((next) => {
    boardRef2.current.eqRows = next;
    setEqRows(next);
  }, []);

  const pushHistory = useCallback(() => {
    const snap     = JSON.stringify(boardRef2.current);
    const trimmed  = historyRef.current.slice(0, histIdxRef.current + 1);
    trimmed.push(snap);
    if (trimmed.length > 30) trimmed.shift();
    historyRef.current = trimmed;
    histIdxRef.current = trimmed.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (histIdxRef.current <= 0) return;
    histIdxRef.current -= 1;
    const snap = JSON.parse(historyRef.current[histIdxRef.current]);
    boardRef2.current = snap;
    setStrokes(snap.strokes);
    setObjects(snap.objects);
    setEqRows(snap.eqRows);
    setSelectedId(null);
  }, []);

  const redo = useCallback(() => {
    if (histIdxRef.current >= historyRef.current.length - 1) return;
    histIdxRef.current += 1;
    const snap = JSON.parse(historyRef.current[histIdxRef.current]);
    boardRef2.current = snap;
    setStrokes(snap.strokes);
    setObjects(snap.objects);
    setEqRows(snap.eqRows);
    setSelectedId(null);
  }, []);

  // ── Initial history push ──────────────────────────────────
  useEffect(() => { pushHistory(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stage size observer ───────────────────────────────────
  useEffect(() => {
    if (!boardRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStageSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    ro.observe(boardRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Text tool: force focus after canvas steals it ────────
  useEffect(() => {
    if (textInput === null) return;
    const t = setTimeout(() => textAreaRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [textInput]);

  // ── Sync pendingCard to ref ───────────────────────────────
  useEffect(() => { pendingCardRef.current = pendingCard; }, [pendingCard]);

  // ── Global mousemove: ghost card ─────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (pendingCardRef.current) setGhostPos({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener('mousemove', handler);
    return () => document.removeEventListener('mousemove', handler);
  }, []);

  // ── Keep fsMode ref in sync (used in ESC handler) ────────
  useEffect(() => { fsModeRef.current = fsMode; }, [fsMode]);

  // ── Escape: cancel pending card / text input / fullscreen ─
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setPendingCard(null);
        setGhostPos(null);
        setTextInput(null);
        if (fsModeRef.current) setFsMode(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Timer interval ────────────────────────────────────────
  useEffect(() => {
    if (!timerRunning) return;
    timerIntervalRef.current = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) {
          setTimerRunning(false);
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.start();
            osc.stop(ctx.currentTime + 0.45);
          } catch {}
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerIntervalRef.current);
  }, [timerRunning]);

  // ── Transformer attachment ────────────────────────────────
  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    if (!selectedId) {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
      return;
    }
    const obj = boardRef2.current.objects.find(o => o.id === selectedId);
    if (!obj || obj.type === 'card' || obj.type === 'text' || obj.type === 'point' || obj.type === 'equationgroup') {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
      return;
    }
    const node = stageRef.current.findOne('#' + selectedId);
    if (node) {
      trRef.current.nodes([node]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, objects]);

  // ── Object CRUD ───────────────────────────────────────────
  const handleUpdate = useCallback((id, patch) => {
    const next = boardRef2.current.objects.map(o => o.id === id ? { ...o, ...patch } : o);
    updateObjects(next);
  }, [updateObjects]);

  const handleDelete = useCallback((id) => {
    pushHistory();
    updateObjects(boardRef2.current.objects.filter(o => o.id !== id));
    setSelectedId(s => s === id ? null : s);
    setHoveredId(h => h === id ? null : h);
  }, [pushHistory, updateObjects]);

  // ── Add instrument ────────────────────────────────────────
  const handleAddInstrument = useCallback((instId) => {
    // Place at center of current viewport
    const cx = (stageSize.w / 2 - stagePosRef.current.x) / zoomRef.current;
    const cy = (stageSize.h / 2 - stagePosRef.current.y) / zoomRef.current;
    pushHistory();
    const base = { id: uid(), scaleX: 1, scaleY: 1, rotation: 0 };
    let newObj;
    switch (instId) {
      case 'ruler':      newObj = { ...base, type: 'ruler',      x: cx - 200, y: cy,        w: 400 }; break;
      case 'protractor': newObj = { ...base, type: 'protractor', x: cx - 130, y: cy - 130,  radius: 130 }; break;
      case 'abacus':     newObj = { ...base, type: 'abacus',     x: cx - 125, y: cy - 130,  beads: Array.from({ length: 10 }, () => Array(10).fill(false)) }; break;
      case 'numberline': newObj = { ...base, type: 'numberline', x: cx - 250, y: cy,        start: 0, end: 10, w: 500, step: 1 }; break;
      case 'table':      newObj = { ...base, type: 'gridtable',  x: cx - 120, y: cy - 80,   rows: 4, cols: 4, cells: Array(16).fill('') }; break;
      case 'multitable': newObj = { ...base, type: 'multitable', x: cx - 210, y: cy - 170 }; break;
      default: return;
    }
    updateObjects([...boardRef2.current.objects, newObj]);
  }, [stageSize, pushHistory, updateObjects]);

  // ── Card click in panel ───────────────────────────────────
  const handleCardClick = useCallback((card) => {
    setPendingCard(prev => prev?.val === card.val && prev?.group === card.group ? null : card);
  }, []);

  const placePendingCard = useCallback((x, y) => {
    const card = pendingCardRef.current;
    if (!card) return;
    pushHistory();
    const w = getCardW(card.val);
    updateObjects([...boardRef2.current.objects, {
      id: uid(), type: 'card',
      x: x - w / 2, y: y - CARD_H / 2,
      val: card.val, color: card.color || '#1e2130',
      fill: 'white', w, h: CARD_H,
      fontSize: getCardFs(card.val),
    }]);
    setPendingCard(null);
    setGhostPos(null);
  }, [pushHistory, updateObjects]);

  // ── Zoom handlers ─────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    const oldScale = zoomRef.current;
    const factor = e.evt.deltaY < 0 ? 1.12 : 1 / 1.12;
    const newScale = Math.min(4, Math.max(0.2, oldScale * factor));
    const mousePointTo = {
      x: (pointer.x - stagePosRef.current.x) / oldScale,
      y: (pointer.y - stagePosRef.current.y) / oldScale,
    };
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    updateZoom(newScale);
    updateStagePos(newPos);
  }, [updateZoom, updateStagePos]);

  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(4, zoomRef.current * 1.25);
    const cx = stageSize.w / 2;
    const cy = stageSize.h / 2;
    const mousePointTo = {
      x: (cx - stagePosRef.current.x) / zoomRef.current,
      y: (cy - stagePosRef.current.y) / zoomRef.current,
    };
    updateZoom(newScale);
    updateStagePos({ x: cx - mousePointTo.x * newScale, y: cy - mousePointTo.y * newScale });
  }, [stageSize, updateZoom, updateStagePos]);

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(0.2, zoomRef.current / 1.25);
    const cx = stageSize.w / 2;
    const cy = stageSize.h / 2;
    const mousePointTo = {
      x: (cx - stagePosRef.current.x) / zoomRef.current,
      y: (cy - stagePosRef.current.y) / zoomRef.current,
    };
    updateZoom(newScale);
    updateStagePos({ x: cx - mousePointTo.x * newScale, y: cy - mousePointTo.y * newScale });
  }, [stageSize, updateZoom, updateStagePos]);

  const handleZoomReset = useCallback(() => {
    updateZoom(1);
    updateStagePos({ x: 0, y: 0 });
  }, [updateZoom, updateStagePos]);

  // ── Stage event handlers ──────────────────────────────────
  // Returns pointer position in WORLD coordinates
  const getPointerPos = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = stage.getPointerPosition() || { x: 0, y: 0 };
    return {
      x: (pos.x - stagePosRef.current.x) / zoomRef.current,
      y: (pos.y - stagePosRef.current.y) / zoomRef.current,
    };
  };

  const handleStageMouseDown = (e) => {
    const pos = getPointerPos();

    // Pending card placement
    if (pendingCardRef.current) {
      placePendingCard(pos.x, pos.y);
      return;
    }

    if (tool === 'select') {
      if (e.target === stageRef.current) {
        // Start potential pan
        isPanningRef.current = true;
        panMovedRef.current  = false;
        lastPointerRef.current = stageRef.current.getPointerPosition(); // screen coords
      }
      return;
    }

    if (tool === 'text') {
      setTextInput({ x: pos.x, y: pos.y, val: '' });
      return;
    }

    if (['circle', 'rect', 'triangle'].includes(tool)) {
      shapeStartRef.current = pos;
      isDrawingRef.current  = true;
      return;
    }

    if (['pen', 'line', 'highlight', 'eraser'].includes(tool)) {
      isDrawingRef.current = true;
      const stroke = {
        id: uid(), tool,
        color: tool === 'eraser' ? '#000000' : drawColor,
        strokeWidth: tool === 'highlight' ? brushSize * 5
          : tool === 'eraser' ? brushSize * 4
          : brushSize,
        opacity: tool === 'highlight' ? 0.35 : 1,
        globalCompositeOperation: tool === 'eraser' ? 'destination-out' : 'source-over',
        points: [pos.x, pos.y],
      };
      curStrokeRef.current = stroke;
      setCurStroke(stroke);
    }
  };

  const handleStageMouseMove = () => {
    // Panning
    if (isPanningRef.current) {
      const screenPos = stageRef.current?.getPointerPosition();
      if (!screenPos) return;
      const dx = screenPos.x - lastPointerRef.current.x;
      const dy = screenPos.y - lastPointerRef.current.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) panMovedRef.current = true;
      if (panMovedRef.current) {
        const newPos = { x: stagePosRef.current.x + dx, y: stagePosRef.current.y + dy };
        updateStagePos(newPos);
        lastPointerRef.current = screenPos;
      }
      return;
    }

    if (!isDrawingRef.current) return;
    const pos = getPointerPos();

    if (['pen', 'highlight', 'eraser'].includes(tool) && curStrokeRef.current) {
      const updated = { ...curStrokeRef.current, points: [...curStrokeRef.current.points, pos.x, pos.y] };
      curStrokeRef.current = updated;
      setCurStroke(updated);
      return;
    }

    if (tool === 'line' && curStrokeRef.current) {
      const [sx, sy] = curStrokeRef.current.points;
      const updated = { ...curStrokeRef.current, points: [sx, sy, pos.x, pos.y] };
      curStrokeRef.current = updated;
      setCurStroke(updated);
      return;
    }

    if (['circle', 'rect', 'triangle'].includes(tool) && shapeStartRef.current) {
      setPreviewShape({ tool, start: shapeStartRef.current, end: pos, color: drawColor, sw: brushSize });
    }
  };

  const handleStageMouseUp = () => {
    // End panning
    if (isPanningRef.current) {
      isPanningRef.current = false;
      // If no movement, treat as click → handleStageClick will handle deselect/point
      return;
    }

    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (['pen', 'line', 'highlight', 'eraser'].includes(tool) && curStrokeRef.current) {
      const stroke = curStrokeRef.current;
      pushHistory();
      updateStrokes([...boardRef2.current.strokes, stroke]);
      curStrokeRef.current = null;
      setCurStroke(null);
      return;
    }

    if (['circle', 'rect', 'triangle'].includes(tool) && shapeStartRef.current && previewShape) {
      const newObj = makeShapeFromPreview(previewShape);
      if (newObj) {
        pushHistory();
        updateObjects([...boardRef2.current.objects, newObj]);
      }
      shapeStartRef.current = null;
      setPreviewShape(null);
    }
  };

  // Handles background clicks: deselect + coord point plotting
  const handleStageClick = (e) => {
    // After panning, ignore click
    if (panMovedRef.current) { panMovedRef.current = false; return; }
    if (e.target !== stageRef.current) return;

    if (mode === 'coordinate' && tool === 'select') {
      setSelectedId(null);
      if (pendingCardRef.current) return;
      const pos = getPointerPos();
      const ox  = coordQuadrant === 'q1' ? 50 : stageSize.w / 2;
      const oy  = coordQuadrant === 'q1' ? stageSize.h - 50 : stageSize.h / 2;
      const cx  = Math.round((pos.x - ox) / COORD_PX);
      const cy  = Math.round((oy - pos.y) / COORD_PX);
      if (coordQuadrant === 'q1' && (cx < 0 || cy < 0)) return;
      pushHistory();
      updateObjects([...boardRef2.current.objects, {
        id: uid(), type: 'point',
        x: ox + cx * COORD_PX, y: oy - cy * COORD_PX,
        cx, cy, color: drawColor,
      }]);
      return;
    }

    if (tool === 'select') {
      setSelectedId(null);
    }
  };

  // ── Shape helpers ─────────────────────────────────────────
  function makeShapeFromPreview(preview) {
    if (!preview) return null;
    const { tool: t, start, end, color, sw } = preview;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const base = { id: uid(), type: 'shape', stroke: color, strokeWidth: sw, fill: 'transparent' };
    if (t === 'circle') {
      const radius = Math.max(5, Math.sqrt(dx * dx + dy * dy) / 2);
      return { ...base, shape: 'circle', x: (start.x + end.x) / 2, y: (start.y + end.y) / 2, radius };
    }
    if (t === 'rect') {
      const w = Math.abs(dx), h = Math.abs(dy);
      if (w < 5 || h < 5) return null;
      return { ...base, shape: 'rect', x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), w, h };
    }
    if (t === 'triangle') {
      const radius = Math.max(10, Math.sqrt(dx * dx + dy * dy) / 2);
      return { ...base, shape: 'triangle', x: (start.x + end.x) / 2, y: (start.y + end.y) / 2, radius };
    }
    return null;
  }

  function renderPreviewShape() {
    if (!previewShape) return null;
    const { tool: t, start, end, color, sw } = previewShape;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const common = { stroke: color, strokeWidth: sw, fill: 'transparent', listening: false, opacity: 0.65, dash: [6, 3] };
    if (t === 'circle') {
      return <KCircle {...common} x={(start.x + end.x) / 2} y={(start.y + end.y) / 2} radius={Math.max(2, Math.sqrt(dx * dx + dy * dy) / 2)} />;
    }
    if (t === 'rect') {
      return <KRect {...common} x={Math.min(start.x, end.x)} y={Math.min(start.y, end.y)} width={Math.abs(dx)} height={Math.abs(dy)} />;
    }
    if (t === 'triangle') {
      return <RegularPolygon {...common} sides={3} x={(start.x + end.x) / 2} y={(start.y + end.y) / 2} radius={Math.max(5, Math.sqrt(dx * dx + dy * dy) / 2)} />;
    }
    return null;
  }

  // ── Text commit ───────────────────────────────────────────
  const commitText = useCallback(() => {
    if (!textInput?.val?.trim()) { setTextInput(null); return; }
    pushHistory();
    updateObjects([...boardRef2.current.objects, {
      id: uid(), type: 'text',
      x: textInput.x, y: textInput.y,
      val: textInput.val, color: drawColor, fontSize: 22,
    }]);
    setTextInput(null);
  }, [textInput, drawColor, pushHistory, updateObjects]);

  // ── Card hover controls ───────────────────────────────────
  const handleCardHover = useCallback((id, pos) => {
    clearTimeout(hoverTORef.current);
    setHoveredId(id);
    setHoveredPos(pos);
  }, []);
  const handleCardHoverLeave = useCallback(() => {
    hoverTORef.current = setTimeout(() => { setHoveredId(null); setHoveredPos(null); }, 300);
  }, []);
  const handleControlsEnter = useCallback(() => clearTimeout(hoverTORef.current), []);
  const handleControlsLeave = useCallback(() => {
    hoverTORef.current = setTimeout(() => { setHoveredId(null); setHoveredPos(null); }, 300);
  }, []);

  const handleCardSizePlus = useCallback(() => {
    if (!hoveredId) return;
    const obj = boardRef2.current.objects.find(o => o.id === hoveredId);
    if (!obj) return;
    handleUpdate(hoveredId, {
      fontSize: Math.min(48, (obj.fontSize || getCardFs(obj.val)) + 4),
      w: Math.min(260, (obj.w || getCardW(obj.val)) + 18),
      h: Math.min(80,  (obj.h || CARD_H) + 8),
    });
  }, [hoveredId, handleUpdate]);

  const handleCardSizeMinus = useCallback(() => {
    if (!hoveredId) return;
    const obj = boardRef2.current.objects.find(o => o.id === hoveredId);
    if (!obj) return;
    handleUpdate(hoveredId, {
      fontSize: Math.max(10, (obj.fontSize || getCardFs(obj.val)) - 4),
      w: Math.max(36, (obj.w || getCardW(obj.val)) - 18),
      h: Math.max(28, (obj.h || CARD_H) - 8),
    });
  }, [hoveredId, handleUpdate]);

  const handleCardColor = useCallback((color) => {
    if (!hoveredId) return;
    handleUpdate(hoveredId, { color });
  }, [hoveredId, handleUpdate]);

  // ── Equation rows ─────────────────────────────────────────
  const handleEqPlace = useCallback((rowId, slotId, card) => {
    pushHistory();
    updateEqRows(boardRef2.current.eqRows.map(row =>
      row.id === rowId
        ? { ...row, slots: row.slots.map(s => s.id === slotId ? { ...s, card } : s) }
        : row
    ));
    setPendingCard(null);
    setGhostPos(null);
  }, [pushHistory, updateEqRows]);

  const handleEqRemoveCard = useCallback((rowId, slotId) => {
    pushHistory();
    updateEqRows(boardRef2.current.eqRows.map(row =>
      row.id === rowId
        ? { ...row, slots: row.slots.map(s => s.id === slotId ? { ...s, card: null } : s) }
        : row
    ));
  }, [pushHistory, updateEqRows]);

  const handleEqRemoveRow = useCallback((rowId) => {
    pushHistory();
    const next = boardRef2.current.eqRows.filter(r => r.id !== rowId);
    updateEqRows(next.length ? next : [makeInitialRow()]);
  }, [pushHistory, updateEqRows]);

  const handleEqAddRow = useCallback(() => {
    pushHistory();
    updateEqRows([...boardRef2.current.eqRows, makeInitialRow()]);
  }, [pushHistory, updateEqRows]);

  // Add equation row to board as a draggable group
  const handleEqAddToBoard = useCallback((rowId) => {
    const row = boardRef2.current.eqRows.find(r => r.id === rowId);
    if (!row) return;
    const filledSlots = row.slots.filter(s => s.card);
    if (!filledSlots.length) return;

    const cards = filledSlots.map(s => ({
      val:      s.card.val,
      color:    s.card.color || '#1e2130',
      w:        getCardW(s.card.val),
      fontSize: getCardFs(s.card.val),
    }));

    // Place at center of current visible viewport (world coords)
    const visibleCx = (stageSize.w / 2 - stagePosRef.current.x) / zoomRef.current;
    const visibleCy = (stageSize.h / 2 - stagePosRef.current.y) / zoomRef.current;
    const totalW = cards.reduce((acc, c) => acc + c.w + 4, 8);

    pushHistory();
    updateObjects([...boardRef2.current.objects, {
      id: uid(), type: 'equationgroup',
      x: visibleCx - totalW / 2,
      y: visibleCy - (CARD_H + 8) / 2,
      cards,
    }]);
  }, [stageSize, pushHistory, updateObjects]);

  // ── Save PNG ──────────────────────────────────────────────
  const handleSavePNG = () => {
    if (!stageRef.current) return;
    const url = stageRef.current.toDataURL({ pixelRatio: 2 });
    const a   = document.createElement('a');
    a.download = `whiteboard-${Date.now()}.png`;
    a.href = url;
    a.click();
  };

  // ── Fullscreen (CSS overlay — hides DashboardLayout sidebar/topbar)
  const handleFullscreen = () => setFsMode(f => !f);

  // ── Clear ─────────────────────────────────────────────────
  const confirmClear = () => {
    pushHistory();
    updateStrokes([]);
    updateObjects([]);
    updateEqRows([makeInitialRow()]);
    setSelectedId(null);
    setShowClear(false);
  };

  // ── Timer ─────────────────────────────────────────────────
  const handleTimerPreset = (secs) => {
    setTimerSecs(secs);
    setTimerActive(true);
    setTimerRunning(true);
  };
  const handleTimerToggle = () => { if (timerActive) setTimerRunning(r => !r); };
  const handleTimerReset  = () => { setTimerRunning(false); setTimerActive(false); setTimerSecs(0); };

  // ── Partition objects ─────────────────────────────────────
  const htmlObjects  = objects.filter(o => o.type === 'gridtable' || o.type === 'multitable');
  const konvaObjects = objects.filter(o => o.type !== 'gridtable' && o.type !== 'multitable');

  const hoveredObj = objects.find(o => o.id === hoveredId);

  // ── Stage cursor style ────────────────────────────────────
  const stageCursor = pendingCard ? 'crosshair'
    : tool === 'pen' || tool === 'line' || tool === 'highlight' ? 'crosshair'
    : tool === 'eraser' ? 'cell'
    : tool === 'text' ? 'text'
    : tool === 'select' ? 'grab'
    : 'default';

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={`wb-page-wrap${fsMode ? ' wb-fs-mode' : ''}`}>
      {/* ── Toolbar ── */}
      <Toolbar
        tool={tool}           setTool={setTool}
        drawColor={drawColor} setDrawColor={setDrawColor}
        brushSize={brushSize} setBrushSize={setBrushSize}
        mode={mode}           setMode={setMode}
        coordQuadrant={coordQuadrant} setCoordQuadrant={setCoordQuadrant}
        onAddInstrument={handleAddInstrument}
        onUndo={undo}
        onRedo={redo}
        onClear={() => setShowClear(true)}
        onSavePNG={handleSavePNG}
        onFullscreen={handleFullscreen}
        timerSecs={timerSecs}
        timerRunning={timerRunning}
        timerActive={timerActive}
        onTimerToggle={handleTimerToggle}
        onTimerReset={handleTimerReset}
        onTimerPreset={handleTimerPreset}
        fsMode={fsMode}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />

      {/* ── Body ── */}
      <div className="wb-body">
        {/* Board */}
        <div
          ref={boardRef}
          className={`wb-board${pendingCard ? ' placing' : ''}`}
          style={{ cursor: stageCursor }}
        >
          <Stage
            ref={stageRef}
            width={stageSize.w}
            height={stageSize.h}
            x={stagePos.x}
            y={stagePos.y}
            scaleX={zoom}
            scaleY={zoom}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            onClick={handleStageClick}
            onWheel={handleWheel}
          >
            {/* Background layer: coordinate grid */}
            <Layer listening={false}>
              {mode === 'coordinate' && (
                <CoordGrid w={stageSize.w} h={stageSize.h} quadrant={coordQuadrant} />
              )}
            </Layer>

            {/* Drawing layer: strokes (no hit-detection) */}
            <Layer listening={false}>
              {strokes.map(s => (
                <Line
                  key={s.id}
                  points={s.points}
                  stroke={s.color}
                  strokeWidth={s.strokeWidth}
                  opacity={s.opacity ?? 1}
                  tension={s.tool === 'pen' || s.tool === 'highlight' ? 0.3 : 0}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={s.globalCompositeOperation || 'source-over'}
                />
              ))}
              {curStroke && (
                <Line
                  points={curStroke.points}
                  stroke={curStroke.color}
                  strokeWidth={curStroke.strokeWidth}
                  opacity={curStroke.opacity ?? 1}
                  tension={curStroke.tool === 'pen' || curStroke.tool === 'highlight' ? 0.3 : 0}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={curStroke.globalCompositeOperation || 'source-over'}
                />
              )}
              {renderPreviewShape()}
            </Layer>

            {/* Objects layer */}
            <Layer>
              {konvaObjects.map(obj => {
                const props = {
                  key: obj.id, obj,
                  isSelected: selectedId === obj.id,
                  onSelect: setSelectedId,
                  onUpdate: handleUpdate,
                  onDelete: handleDelete,
                  tool,
                };
                switch (obj.type) {
                  case 'card':
                    return <BoardCard {...props} onHover={handleCardHover} onHoverLeave={handleCardHoverLeave} zoom={zoom} stagePos={stagePos} />;
                  case 'equationgroup': return <EquationGroupNode {...props} />;
                  case 'shape':        return <BoardShape      {...props} />;
                  case 'text':         return <BoardText        {...props} />;
                  case 'ruler':        return <RulerNode        {...props} />;
                  case 'protractor':   return <ProtractorNode   {...props} />;
                  case 'abacus':       return <AbacusNode       {...props} />;
                  case 'numberline':   return <NumberLineNode   {...props} />;
                  case 'point':        return <CoordPoint key={obj.id} obj={obj} isSelected={selectedId === obj.id} onSelect={setSelectedId} onDelete={handleDelete} tool={tool} />;
                  default:             return null;
                }
              })}
              <Transformer
                ref={trRef}
                rotateEnabled={true}
                boundBoxFunc={(oldBox, newBox) =>
                  newBox.width < 20 || newBox.height < 20 ? oldBox : newBox
                }
              />
            </Layer>
          </Stage>

          {/* HTML overlay: table instruments — transformed to match stage zoom/pan */}
          <div
            className="wb-html-layer"
            style={{
              width: stageSize.w,
              height: stageSize.h,
              transform: `translate(${stagePos.x}px, ${stagePos.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {htmlObjects.map(obj =>
              obj.type === 'gridtable' ? (
                <GridTableNode
                  key={obj.id} obj={obj}
                  isSelected={selectedId === obj.id}
                  onSelect={setSelectedId}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  zoom={zoom}
                />
              ) : (
                <MultiTableNode
                  key={obj.id} obj={obj}
                  isSelected={selectedId === obj.id}
                  onSelect={setSelectedId}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  zoom={zoom}
                />
              )
            )}
          </div>

          {/* Text tool input — positioned in screen coords */}
          {textInput && (
            <textarea
              ref={textAreaRef}
              className="wb-text-input"
              rows={1}
              style={{
                left:  textInput.x * zoom + stagePos.x,
                top:   textInput.y * zoom + stagePos.y,
                color: drawColor,
                fontSize: Math.max(14, 22 * zoom) + 'px',
              }}
              value={textInput.val}
              onChange={e => setTextInput(prev => ({ ...prev, val: e.target.value }))}
              onBlur={commitText}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitText(); }
                if (e.key === 'Escape') { e.stopPropagation(); setTextInput(null); }
              }}
              onMouseDown={e => e.stopPropagation()}
            />
          )}

          {/* Mode info strips */}
          {mode === 'coordinate' && (
            <div className="wb-coord-strip">
              <span>⊹ Coordinate Plane — click empty space to plot a point</span>
            </div>
          )}
          {mode === 'equation' && (
            <div className="wb-eq-mode-banner">≡ Equation Row Mode — pick a card, then click a slot below</div>
          )}

          {/* Card hover controls */}
          {hoveredId && hoveredObj?.type === 'card' && (
            <CardHoverControls
              obj={hoveredObj}
              pos={hoveredPos}
              onSizePlus={handleCardSizePlus}
              onSizeMinus={handleCardSizeMinus}
              onColorChange={handleCardColor}
              onDelete={() => handleDelete(hoveredId)}
              onMouseEnter={handleControlsEnter}
              onMouseLeave={handleControlsLeave}
            />
          )}

          {/* Floating timer */}
          {timerActive && (
            <div className="wb-timer-overlay">
              <div className={`wb-timer-digits${timerSecs < 60 ? ' urgent' : ''}`}>
                {String(Math.floor(timerSecs / 60)).padStart(2, '0')}
                :{String(timerSecs % 60).padStart(2, '0')}
              </div>
              <div className="wb-timer-controls">
                <button className="wb-timer-ctrl" onClick={handleTimerToggle}>
                  {timerRunning ? '⏸' : '▶'}
                </button>
                <button className="wb-timer-ctrl" onClick={handleTimerReset}>⏹</button>
              </div>
            </div>
          )}
        </div>

        {/* Card panel — always visible */}
        <CardPanel
          pendingCard={pendingCard}
          onCardClick={handleCardClick}
          drawColor={drawColor}
        />
      </div>

      {/* Equation rows strip */}
      {mode === 'equation' && (
        <EquationRows
          rows={eqRows}
          pendingCard={pendingCard}
          onPlace={handleEqPlace}
          onRemoveCard={handleEqRemoveCard}
          onRemoveRow={handleEqRemoveRow}
          onAddRow={handleEqAddRow}
          onAddToBoard={handleEqAddToBoard}
        />
      )}

      {/* Ghost card follows cursor */}
      {pendingCard && ghostPos && (
        <div
          className="wb-ghost-card"
          style={{
            left: ghostPos.x,
            top: ghostPos.y,
            color: pendingCard.color || '#1e2130',
            fontSize: ghostFontSize(pendingCard.val),
          }}
        >
          {pendingCard.val}
        </div>
      )}

      {/* Clear confirm dialog */}
      {showClear && (
        <div className="wb-overlay-dim" onClick={() => setShowClear(false)}>
          <div className="wb-confirm-box" onClick={e => e.stopPropagation()}>
            <h3>Clear the board?</h3>
            <p>All drawings, cards, and instruments will be removed.<br />This cannot be undone after confirming.</p>
            <div className="wb-confirm-btns">
              <button className="wb-confirm-btn cancel"  onClick={() => setShowClear(false)}>Cancel</button>
              <button className="wb-confirm-btn confirm" onClick={confirmClear}>Clear Board</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
