// ============================================================
//  Whiteboard.jsx — main orchestrator
// ============================================================
import { useState, useRef, useEffect, useCallback, memo } from 'react';
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

// ── Constants ─────────────────────────────────────────────────
const uid      = () => Math.random().toString(36).slice(2, 9);
const STAGE_W  = 3000;
const STAGE_H  = 2500;
const CARD_H   = 40;
const COORD_PX = 40;

const CARD_COLORS = [
  '#1e2130','#e74c3c','#3498db','#2ecc71',
  '#f39c12','#9b59b6','#e91e8c','#00bcd4',
];

// ── Helpers ───────────────────────────────────────────────────
function getCardFs(val) {
  const n = (val || '').length;
  if (n <= 2)  return 28;
  if (n <= 4)  return 20;
  if (n <= 8)  return 14;
  if (n <= 12) return 12;
  return 10;
}
function getCardW(val) {
  const n = (val || '').length;
  if (n <= 2)  return 48;
  if (n <= 4)  return Math.max(56, n * 16);
  return Math.max(64, n * 10);
}
function ghostFontSize(val) {
  const n = (val || '').length;
  if (n <= 2)  return '1.8rem';
  if (n <= 5)  return '1.2rem';
  if (n <= 10) return '.9rem';
  return '.75rem';
}

// Compute readable text color from background
function textOnBg(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#1e2130' : '#ffffff';
}

// ── CoordGrid ─────────────────────────────────────────────────
function CoordGrid({ w, h, quadrant }) {
  const ox = quadrant === 'q1' ? 50 : Math.round(w / 2);
  const oy = quadrant === 'q1' ? h - 50 : Math.round(h / 2);
  const maxX = Math.ceil((w - ox) / COORD_PX) + 1;
  const minX = quadrant === 'q1' ? 0 : -Math.ceil(ox / COORD_PX) - 1;
  const maxY = Math.ceil(oy / COORD_PX) + 1;
  const minY = quadrant === 'q1' ? 0 : -Math.ceil((h - oy) / COORD_PX) - 1;

  const gridLines = [], ticks = [], labels = [];

  for (let i = minX; i <= maxX; i++) {
    const x = ox + i * COORD_PX;
    gridLines.push(<Line key={`gv${i}`} points={[x, 0, x, h]} stroke="rgba(100,130,200,.15)" strokeWidth={1} listening={false} />);
    ticks.push(<Line key={`tx${i}`} points={[x, oy - 4, x, oy + 4]} stroke="#1E2130" strokeWidth={1} listening={false} />);
    if (i !== 0) labels.push(<KText key={`lx${i}`} x={x - 10} y={oy + 6} width={20} text={String(i)} fontSize={10} fontFamily="Nunito,sans-serif" fontStyle="bold" fill="#1E2130" align="center" listening={false} />);
  }
  for (let j = minY; j <= maxY; j++) {
    const y = oy - j * COORD_PX;
    gridLines.push(<Line key={`gh${j}`} points={[0, y, w, y]} stroke="rgba(100,130,200,.15)" strokeWidth={1} listening={false} />);
    ticks.push(<Line key={`ty${j}`} points={[ox - 4, y, ox + 4, y]} stroke="#1E2130" strokeWidth={1} listening={false} />);
    if (j !== 0) labels.push(<KText key={`ly${j}`} x={ox + 5} y={y - 7} text={String(j)} fontSize={10} fontFamily="Nunito,sans-serif" fontStyle="bold" fill="#1E2130" listening={false} />);
  }

  return (
    <Group listening={false}>
      {gridLines}
      <Line points={[quadrant === 'q1' ? ox : 0, oy, w, oy]} stroke="#1E2130" strokeWidth={2} listening={false} />
      <Line points={[ox, quadrant === 'q1' ? oy : h, ox, 0]} stroke="#1E2130" strokeWidth={2} listening={false} />
      <Line points={[w - 10, oy - 5, w, oy, w - 10, oy + 5]} stroke="#1E2130" strokeWidth={2} closed fill="#1E2130" listening={false} />
      <Line points={[ox - 5, 10, ox, 0, ox + 5, 10]} stroke="#1E2130" strokeWidth={2} closed fill="#1E2130" listening={false} />
      {ticks}{labels}
    </Group>
  );
}

// ── BoardCard ─────────────────────────────────────────────────
const BoardCard = memo(function BoardCard({ obj, isSelected, onSelect, onUpdate, onDelete, tool, onShowControls }) {
  const w  = obj.w  || getCardW(obj.val);
  const h  = obj.h  || CARD_H;
  const fs = obj.fontSize || getCardFs(obj.val);
  const bg = obj.fill  || 'white';
  const fg = obj.color || '#1e2130';

  return (
    <Group
      id={obj.id}
      x={obj.x} y={obj.y}
      draggable={tool === 'select'}
      onClick={e => {
        e.cancelBubble = true;
        if (tool === 'select') {
          onSelect(obj.id);
          // Show controls on tap/click (works for both mouse and touch)
          const stage = e.target.getStage();
          const rect  = stage.container().getBoundingClientRect();
          onShowControls(obj.id, { x: rect.left + obj.x + w / 2, y: rect.top + obj.y });
        }
      }}
      onDragEnd={e => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() })}
      onMouseEnter={e => {
        if (tool !== 'select') return;
        const rect = e.target.getStage().container().getBoundingClientRect();
        onShowControls(obj.id, { x: rect.left + obj.x + w / 2, y: rect.top + obj.y });
      }}
    >
      <KRect
        width={w} height={h}
        fill={bg}
        stroke={isSelected ? '#4f8ef7' : 'rgba(0,0,0,.12)'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={7}
        shadowBlur={isSelected ? 8 : 3}
        shadowColor="rgba(0,0,0,.15)"
      />
      <KText
        x={2} y={0} width={w - 4} height={h}
        text={obj.val}
        fontSize={fs}
        fontFamily="Nunito,sans-serif"
        fontStyle="900"
        fill={fg}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Group>
  );
});

// ── BoardShape ────────────────────────────────────────────────
const BoardShape = memo(function BoardShape({ obj, isSelected, onSelect, onUpdate, onDelete, tool }) {
  const shapeProps = {
    fill: obj.fill || 'transparent',
    stroke: obj.stroke || '#1e2130',
    strokeWidth: obj.strokeWidth || 3,
    shadowBlur: isSelected ? 8 : 0,
    shadowColor: 'rgba(79,142,247,.5)',
    listening: false,
  };

  // Delete badge position (top-right of bounding box)
  const delX = obj.shape === 'rect'   ? (obj.w || 80)
             : obj.shape === 'circle' ? (obj.radius || 40)
             : (obj.radius || 45);
  const delY = obj.shape === 'rect' ? 0 : -(obj.radius || 40);

  return (
    <Group
      id={obj.id}
      x={obj.x} y={obj.y}
      draggable={tool === 'select'}
      onClick={e => { e.cancelBubble = true; if (tool === 'select') onSelect(obj.id); }}
      onDragEnd={e => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() })}
    >
      {obj.shape === 'circle'   && <KCircle {...shapeProps} radius={obj.radius || 40} />}
      {obj.shape === 'rect'     && <KRect {...shapeProps} width={obj.w || 80} height={obj.h || 60} cornerRadius={3} />}
      {obj.shape === 'triangle' && <RegularPolygon {...shapeProps} sides={3} radius={obj.radius || 45} rotation={obj.rotation || 0} />}

      {/* Delete button when selected */}
      {isSelected && (
        <Group x={delX} y={delY - 12} onClick={e => { e.cancelBubble = true; onDelete(obj.id); }}>
          <KRect width={22} height={22} fill="#e74c3c" cornerRadius={11} />
          <KText text="✕" fontSize={12} fill="white" x={4} y={3} listening={false} />
        </Group>
      )}
    </Group>
  );
});

// ── BoardText ─────────────────────────────────────────────────
const BoardText = memo(function BoardText({ obj, isSelected, onSelect, onUpdate, tool }) {
  return (
    <KText
      id={obj.id}
      x={obj.x} y={obj.y}
      text={obj.val}
      fontSize={obj.fontSize || 22}
      fontFamily="Nunito,sans-serif"
      fontStyle="bold"
      fill={obj.color || '#1e2130'}
      draggable={tool === 'select'}
      onClick={e => { e.cancelBubble = true; if (tool === 'select') onSelect(obj.id); }}
      onDragEnd={e => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() })}
      shadowBlur={isSelected ? 8 : 0}
      shadowColor="rgba(79,142,247,.5)"
    />
  );
});

// ── CoordPoint ────────────────────────────────────────────────
const CoordPoint = memo(function CoordPoint({ obj, isSelected, onSelect, onDelete, tool }) {
  return (
    <Group id={obj.id} x={obj.x} y={obj.y}
      onClick={e => { e.cancelBubble = true; if (tool === 'select') onSelect(obj.id); }}
    >
      <KCircle radius={5} fill={obj.color || '#e74c3c'} stroke="white" strokeWidth={1.5} />
      <KText x={8} y={-10} text={`(${obj.cx}, ${obj.cy})`} fontSize={11} fontFamily="Nunito,sans-serif" fontStyle="bold" fill={obj.color || '#e74c3c'} listening={false} />
      {isSelected && (
        <Group x={10} y={-24} onClick={e => { e.cancelBubble = true; onDelete(obj.id); }}>
          <KRect width={16} height={16} fill="#e74c3c" cornerRadius={8} />
          <KText text="✕" fontSize={9} fill="white" x={3} y={2} listening={false} />
        </Group>
      )}
    </Group>
  );
});

// ── EquationGroupNode ─────────────────────────────────────────
const EquationGroupNode = memo(function EquationGroupNode({ obj, isSelected, onSelect, onUpdate, onDelete, tool }) {
  const GAP = 4;
  let offsetX = GAP;
  const layouts = obj.cards.map(card => {
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
      x={obj.x} y={obj.y}
      draggable={tool === 'select'}
      onClick={e => { e.cancelBubble = true; if (tool === 'select') onSelect(obj.id); }}
      onDragEnd={e => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() })}
    >
      <KRect width={totalW} height={totalH} fill="rgba(30,33,48,.07)"
        stroke={isSelected ? '#4f8ef7' : 'rgba(79,142,247,.3)'}
        strokeWidth={isSelected ? 2 : 1} cornerRadius={8}
        shadowBlur={isSelected ? 8 : 2} shadowColor="rgba(0,0,0,.1)"
        dash={isSelected ? undefined : [5, 3]}
      />
      {layouts.map((card, i) => (
        <Group key={i} x={card.offsetX} y={4}>
          <KRect width={card.w} height={CARD_H} fill={card.fill || 'white'} stroke="rgba(0,0,0,.08)" strokeWidth={1} cornerRadius={6} />
          <KText x={2} y={0} width={card.w - 4} height={CARD_H} text={card.val}
            fontSize={card.fontSize || getCardFs(card.val)} fontFamily="Nunito,sans-serif" fontStyle="900"
            fill={card.color || '#1e2130'} align="center" verticalAlign="middle" listening={false}
          />
        </Group>
      ))}
      {isSelected && (
        <Group x={totalW - 18} y={-10} onClick={e => { e.cancelBubble = true; onDelete(obj.id); }}>
          <KRect width={18} height={18} fill="#e74c3c" cornerRadius={9} />
          <KText text="✕" fontSize={10} fill="white" x={3} y={2} listening={false} />
        </Group>
      )}
    </Group>
  );
});

// ── CardHoverControls ─────────────────────────────────────────
const CardHoverControls = memo(function CardHoverControls({ obj, pos, onSizePlus, onSizeMinus, onColorChange, onDelete }) {
  if (!obj || !pos) return null;
  return (
    <div
      className="wb-card-controls"
      style={{ left: pos.x, top: Math.max(10, pos.y - 46) }}
      onPointerDown={e => e.stopPropagation()}
    >
      <button className="wb-card-ctrl-btn size-plus"  onClick={onSizePlus}  title="Bigger">A+</button>
      <button className="wb-card-ctrl-btn size-minus" onClick={onSizeMinus} title="Smaller">A−</button>
      {CARD_COLORS.map(c => (
        <div
          key={c}
          className={`wb-color-swatch${obj.fill === c ? ' picked' : ''}`}
          style={{ background: c }}
          onClick={() => onColorChange(c)}
          title="Card background color"
        />
      ))}
      <button className="wb-card-ctrl-btn del" onClick={onDelete} title="Delete">✕</button>
    </div>
  );
});

// ── Main Whiteboard ───────────────────────────────────────────
export default function Whiteboard() {
  // ── Tool state
  const [tool,      setTool]      = useState('select');
  const [drawColor, setDrawColor] = useState('#1e2130');
  const [brushSize, setBrushSize] = useState(4);

  // ── Board data
  const [strokes,  setStrokes]  = useState([]);
  const [objects,  setObjects]  = useState([]);
  const [eqRows,   setEqRows]   = useState(() => [makeInitialRow()]);

  // ── Drawing in-progress
  const [curStroke,    setCurStroke]    = useState(null);
  const [previewShape, setPreviewShape] = useState(null);

  // ── Selection & card controls
  const [selectedId,    setSelectedId]    = useState(null);
  const [controlsId,    setControlsId]    = useState(null);
  const [controlsPos,   setControlsPos]   = useState(null);

  // ── Pending card placement
  const [pendingCard, setPendingCard] = useState(null);
  const [ghostPos,    setGhostPos]    = useState(null);

  // ── Text tool
  const [textInput, setTextInput] = useState(null); // { x, y, val }

  // ── Board mode
  const [mode,          setMode]          = useState('whiteboard');
  const [coordQuadrant, setCoordQuadrant] = useState('q1');

  // ── Timer
  const [timerSecs,    setTimerSecs]    = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerActive,  setTimerActive]  = useState(false);

  // ── UI
  const [showClear,  setShowClear]  = useState(false);
  const [fsMode,     setFsMode]     = useState(false);
  const [panelOpen,  setPanelOpen]  = useState(false);

  // ── Refs
  const stageRef         = useRef(null);
  const trRef            = useRef(null);
  const boardRef         = useRef(null);
  const timerIntervalRef = useRef(null);
  const controlsTORef    = useRef(null);
  const historyRef       = useRef([]);
  const histIdxRef       = useRef(-1);
  const boardRef2        = useRef({ strokes: [], objects: [], eqRows: [makeInitialRow()] });

  // Drawing refs (avoid stale closures in Konva handlers)
  const isDrawingRef   = useRef(false);
  const curStrokeRef   = useRef(null);
  const shapeStartRef  = useRef(null);
  const pendingCardRef = useRef(null);
  const textAreaRef    = useRef(null);
  const fsModeRef      = useRef(false);
  const toolRef        = useRef('select');

  // Panning refs
  const isPanningRef   = useRef(false);
  const panMovedRef    = useRef(false);
  const lastPanPt      = useRef({ x: 0, y: 0 });

  // Keep toolRef current
  useEffect(() => { toolRef.current = tool; }, [tool]);

  // ── boardRef2 sync ────────────────────────────────────────
  const updateStrokes = useCallback((next) => { boardRef2.current.strokes = next; setStrokes(next); }, []);
  const updateObjects = useCallback((next) => { boardRef2.current.objects = next; setObjects(next); }, []);
  const updateEqRows  = useCallback((next) => { boardRef2.current.eqRows  = next; setEqRows(next);  }, []);

  // ── History ───────────────────────────────────────────────
  const pushHistory = useCallback(() => {
    const snap    = JSON.stringify(boardRef2.current);
    const trimmed = historyRef.current.slice(0, histIdxRef.current + 1);
    trimmed.push(snap);
    if (trimmed.length > 30) trimmed.shift();
    historyRef.current  = trimmed;
    histIdxRef.current  = trimmed.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (histIdxRef.current <= 0) return;
    histIdxRef.current -= 1;
    const snap = JSON.parse(historyRef.current[histIdxRef.current]);
    boardRef2.current = snap;
    setStrokes(snap.strokes); setObjects(snap.objects); setEqRows(snap.eqRows);
    setSelectedId(null);
  }, []);

  const redo = useCallback(() => {
    if (histIdxRef.current >= historyRef.current.length - 1) return;
    histIdxRef.current += 1;
    const snap = JSON.parse(historyRef.current[histIdxRef.current]);
    boardRef2.current = snap;
    setStrokes(snap.strokes); setObjects(snap.objects); setEqRows(snap.eqRows);
    setSelectedId(null);
  }, []);

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => { pushHistory(); }, []); // eslint-disable-line

  // Text focus fix
  useEffect(() => {
    if (textInput === null) return;
    const t = setTimeout(() => textAreaRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [textInput]);

  useEffect(() => { pendingCardRef.current = pendingCard; }, [pendingCard]);

  // Ghost card follows cursor
  useEffect(() => {
    const h = (e) => { if (pendingCardRef.current) setGhostPos({ x: e.clientX, y: e.clientY }); };
    document.addEventListener('pointermove', h);
    return () => document.removeEventListener('pointermove', h);
  }, []);

  useEffect(() => { fsModeRef.current = fsMode; }, [fsMode]);

  // Escape key
  useEffect(() => {
    const h = (e) => {
      if (e.key !== 'Escape') return;
      setPendingCard(null); setGhostPos(null); setTextInput(null);
      setControlsId(null); setControlsPos(null);
      if (fsModeRef.current) setFsMode(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Timer
  useEffect(() => {
    if (!timerRunning) return;
    timerIntervalRef.current = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) {
          setTimerRunning(false);
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.connect(ctx.destination); osc.frequency.value = 880;
            osc.start(); osc.stop(ctx.currentTime + 0.45);
          } catch {}
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerIntervalRef.current);
  }, [timerRunning]);

  // Transformer attachment
  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    if (!selectedId) { trRef.current.nodes([]); trRef.current.getLayer()?.batchDraw(); return; }
    const obj = boardRef2.current.objects.find(o => o.id === selectedId);
    if (!obj || ['card','text','point','equationgroup'].includes(obj.type)) {
      trRef.current.nodes([]); trRef.current.getLayer()?.batchDraw(); return;
    }
    const node = stageRef.current.findOne('#' + selectedId);
    if (node) { trRef.current.nodes([node]); trRef.current.getLayer()?.batchDraw(); }
  }, [selectedId, objects]);

  // Auto-dismiss controls when clicking elsewhere
  useEffect(() => {
    const h = () => {
      clearTimeout(controlsTORef.current);
      controlsTORef.current = setTimeout(() => {
        setControlsId(null); setControlsPos(null);
      }, 3000);
    };
    document.addEventListener('pointerdown', h, true);
    return () => document.removeEventListener('pointerdown', h, true);
  }, []);

  // ── CRUD ─────────────────────────────────────────────────
  const handleUpdate = useCallback((id, patch) => {
    updateObjects(boardRef2.current.objects.map(o => o.id === id ? { ...o, ...patch } : o));
  }, [updateObjects]);

  const handleDelete = useCallback((id) => {
    pushHistory();
    updateObjects(boardRef2.current.objects.filter(o => o.id !== id));
    setSelectedId(s => s === id ? null : s);
    setControlsId(c => c === id ? null : c);
  }, [pushHistory, updateObjects]);

  // ── Add instrument ────────────────────────────────────────
  const handleAddInstrument = useCallback((instId) => {
    const board = boardRef.current;
    const cx = board ? board.scrollLeft + board.clientWidth / 2 : 400;
    const cy = board ? board.scrollTop  + board.clientHeight / 2 : 300;
    pushHistory();
    const base = { id: uid(), scaleX: 1, scaleY: 1, rotation: 0 };
    let newObj;
    switch (instId) {
      case 'ruler':      newObj = { ...base, type:'ruler',      x:cx-200, y:cy,      w:400 }; break;
      case 'protractor': newObj = { ...base, type:'protractor', x:cx-130, y:cy-130,  radius:130 }; break;
      case 'abacus':     newObj = { ...base, type:'abacus',     x:cx-125, y:cy-130,  beads:Array.from({length:10},()=>Array(10).fill(false)) }; break;
      case 'numberline': newObj = { ...base, type:'numberline', x:cx-250, y:cy,      start:0, end:10, w:500, step:1 }; break;
      case 'table':      newObj = { ...base, type:'gridtable',  x:cx-120, y:cy-80,   rows:4, cols:4, cells:Array(16).fill('') }; break;
      case 'multitable': newObj = { ...base, type:'multitable', x:cx-210, y:cy-170 }; break;
      default: return;
    }
    updateObjects([...boardRef2.current.objects, newObj]);
  }, [pushHistory, updateObjects]);

  // ── Card placement ────────────────────────────────────────
  const handleCardClick = useCallback((card) => {
    setPendingCard(prev => prev?.val === card.val && prev?.group === card.group ? null : card);
  }, []);

  const placePendingCard = useCallback((x, y) => {
    const card = pendingCardRef.current;
    if (!card) return;
    pushHistory();
    const w = getCardW(card.val);
    updateObjects([...boardRef2.current.objects, {
      id:uid(), type:'card',
      x: x - w / 2, y: y - CARD_H / 2,
      val:card.val, color:'#1e2130', fill:'white',
      w, h:CARD_H, fontSize:getCardFs(card.val),
    }]);
    setPendingCard(null); setGhostPos(null);
  }, [pushHistory, updateObjects]);

  // ── getPointerPos — simple world coords (no zoom math) ───
  const getPointerPos = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    return stage.getPointerPosition() || { x: 0, y: 0 };
  };

  // ── Stage pointer handlers ────────────────────────────────
  const handleStagePointerDown = (e) => {
    // Prevent browser scroll during drawing
    if (toolRef.current !== 'select') e.evt.preventDefault?.();

    const pos = getPointerPos();

    if (pendingCardRef.current) { placePendingCard(pos.x, pos.y); return; }

    if (toolRef.current === 'select') {
      if (e.target === stageRef.current) {
        // Dismiss card controls
        setControlsId(null); setControlsPos(null);
        // Start pan
        isPanningRef.current = true;
        panMovedRef.current  = false;
        lastPanPt.current = { x: e.evt.clientX, y: e.evt.clientY };
      }
      return;
    }

    if (toolRef.current === 'text') {
      setTextInput({ x: pos.x, y: pos.y, val: '' });
      return;
    }

    if (['circle','rect','triangle'].includes(toolRef.current)) {
      shapeStartRef.current = pos;
      isDrawingRef.current  = true;
      return;
    }

    if (['pen','line','highlight','eraser'].includes(toolRef.current)) {
      isDrawingRef.current = true;
      const stroke = {
        id: uid(), tool: toolRef.current,
        color: toolRef.current === 'eraser' ? '#ffffff' : drawColor,
        strokeWidth: toolRef.current === 'highlight' ? brushSize * 5
                   : toolRef.current === 'eraser'    ? brushSize * 6
                   : brushSize,
        opacity: toolRef.current === 'highlight' ? 0.35 : 1,
        globalCompositeOperation: toolRef.current === 'eraser' ? 'destination-out' : 'source-over',
        points: [pos.x, pos.y],
      };
      curStrokeRef.current = stroke;
      setCurStroke(stroke);
    }
  };

  const handleStagePointerMove = (e) => {
    // Panning
    if (isPanningRef.current) {
      const dx = e.evt.clientX - lastPanPt.current.x;
      const dy = e.evt.clientY - lastPanPt.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 1) panMovedRef.current = true;
      if (panMovedRef.current && boardRef.current) {
        boardRef.current.scrollLeft -= dx;
        boardRef.current.scrollTop  -= dy;
        lastPanPt.current = { x: e.evt.clientX, y: e.evt.clientY };
      }
      return;
    }

    if (!isDrawingRef.current) return;
    const pos = getPointerPos();

    if (['pen','highlight','eraser'].includes(toolRef.current) && curStrokeRef.current) {
      const updated = { ...curStrokeRef.current, points: [...curStrokeRef.current.points, pos.x, pos.y] };
      curStrokeRef.current = updated;
      setCurStroke(updated);
      return;
    }
    if (toolRef.current === 'line' && curStrokeRef.current) {
      const [sx, sy] = curStrokeRef.current.points;
      const updated = { ...curStrokeRef.current, points: [sx, sy, pos.x, pos.y] };
      curStrokeRef.current = updated;
      setCurStroke(updated);
      return;
    }
    if (['circle','rect','triangle'].includes(toolRef.current) && shapeStartRef.current) {
      setPreviewShape({ tool: toolRef.current, start: shapeStartRef.current, end: pos, color: drawColor, sw: brushSize });
    }
  };

  const handleStagePointerUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (['pen','line','highlight','eraser'].includes(toolRef.current) && curStrokeRef.current) {
      pushHistory();
      updateStrokes([...boardRef2.current.strokes, curStrokeRef.current]);
      curStrokeRef.current = null; setCurStroke(null);
      return;
    }
    if (['circle','rect','triangle'].includes(toolRef.current) && shapeStartRef.current && previewShape) {
      const newObj = makeShapeFromPreview(previewShape);
      if (newObj) { pushHistory(); updateObjects([...boardRef2.current.objects, newObj]); }
      shapeStartRef.current = null; setPreviewShape(null);
    }
  };

  // Click on stage background
  const handleStageClick = (e) => {
    if (panMovedRef.current) { panMovedRef.current = false; return; }
    if (e.target !== stageRef.current) return;

    if (mode === 'coordinate' && toolRef.current === 'select') {
      setSelectedId(null);
      if (pendingCardRef.current) return;
      const pos = getPointerPos();
      const ox = coordQuadrant === 'q1' ? 50 : STAGE_W / 2;
      const oy = coordQuadrant === 'q1' ? STAGE_H - 50 : STAGE_H / 2;
      const cx = Math.round((pos.x - ox) / COORD_PX);
      const cy = Math.round((oy - pos.y) / COORD_PX);
      if (coordQuadrant === 'q1' && (cx < 0 || cy < 0)) return;
      pushHistory();
      updateObjects([...boardRef2.current.objects, {
        id:uid(), type:'point', x:ox+cx*COORD_PX, y:oy-cy*COORD_PX, cx, cy, color:drawColor,
      }]);
      return;
    }
    if (toolRef.current === 'select') setSelectedId(null);
  };

  // ── Shape factory ─────────────────────────────────────────
  function makeShapeFromPreview(preview) {
    if (!preview) return null;
    const { tool: t, start, end, color, sw } = preview;
    const dx = end.x - start.x, dy = end.y - start.y;
    const base = { id:uid(), type:'shape', stroke:color, strokeWidth:sw, fill:'transparent' };
    if (t === 'circle')   return { ...base, shape:'circle',   x:(start.x+end.x)/2, y:(start.y+end.y)/2, radius:Math.max(5, Math.sqrt(dx*dx+dy*dy)/2) };
    if (t === 'rect')     { const w=Math.abs(dx),h=Math.abs(dy); if(w<5||h<5) return null; return { ...base, shape:'rect', x:Math.min(start.x,end.x), y:Math.min(start.y,end.y), w, h }; }
    if (t === 'triangle') return { ...base, shape:'triangle', x:(start.x+end.x)/2, y:(start.y+end.y)/2, radius:Math.max(10, Math.sqrt(dx*dx+dy*dy)/2) };
    return null;
  }

  function renderPreviewShape() {
    if (!previewShape) return null;
    const { tool:t, start, end, color, sw } = previewShape;
    const dx = end.x-start.x, dy = end.y-start.y;
    const c = { stroke:color, strokeWidth:sw, fill:'transparent', listening:false, opacity:.65, dash:[6,3] };
    if (t === 'circle')   return <KCircle {...c} x={(start.x+end.x)/2} y={(start.y+end.y)/2} radius={Math.max(2,Math.sqrt(dx*dx+dy*dy)/2)} />;
    if (t === 'rect')     return <KRect   {...c} x={Math.min(start.x,end.x)} y={Math.min(start.y,end.y)} width={Math.abs(dx)} height={Math.abs(dy)} />;
    if (t === 'triangle') return <RegularPolygon {...c} sides={3} x={(start.x+end.x)/2} y={(start.y+end.y)/2} radius={Math.max(5,Math.sqrt(dx*dx+dy*dy)/2)} />;
    return null;
  }

  // ── Text commit ───────────────────────────────────────────
  const commitText = useCallback(() => {
    if (!textInput?.val?.trim()) { setTextInput(null); return; }
    pushHistory();
    updateObjects([...boardRef2.current.objects, {
      id:uid(), type:'text', x:textInput.x, y:textInput.y,
      val:textInput.val, color:drawColor, fontSize:22,
    }]);
    setTextInput(null);
  }, [textInput, drawColor, pushHistory, updateObjects]);

  // ── Card controls ─────────────────────────────────────────
  const handleShowControls = useCallback((id, pos) => {
    clearTimeout(controlsTORef.current);
    setControlsId(id);
    setControlsPos(pos);
  }, []);

  const handleCardSizePlus = useCallback(() => {
    if (!controlsId) return;
    const obj = boardRef2.current.objects.find(o => o.id === controlsId);
    if (!obj) return;
    handleUpdate(controlsId, {
      fontSize: Math.min(48, (obj.fontSize || getCardFs(obj.val)) + 4),
      w: Math.min(260, (obj.w || getCardW(obj.val)) + 16),
      h: Math.min(80,  (obj.h || CARD_H) + 6),
    });
  }, [controlsId, handleUpdate]);

  const handleCardSizeMinus = useCallback(() => {
    if (!controlsId) return;
    const obj = boardRef2.current.objects.find(o => o.id === controlsId);
    if (!obj) return;
    handleUpdate(controlsId, {
      fontSize: Math.max(10, (obj.fontSize || getCardFs(obj.val)) - 4),
      w: Math.max(36, (obj.w || getCardW(obj.val)) - 16),
      h: Math.max(28, (obj.h || CARD_H) - 6),
    });
  }, [controlsId, handleUpdate]);

  const handleCardColor = useCallback((color) => {
    if (!controlsId) return;
    // Background changes; text auto-flips for readability
    handleUpdate(controlsId, { fill: color, color: textOnBg(color) });
  }, [controlsId, handleUpdate]);

  // ── Equation rows ─────────────────────────────────────────
  const handleEqPlace = useCallback((rowId, slotId, card) => {
    pushHistory();
    updateEqRows(boardRef2.current.eqRows.map(r =>
      r.id !== rowId ? r : { ...r, slots: r.slots.map(s => s.id === slotId ? { ...s, card } : s) }
    ));
    setPendingCard(null); setGhostPos(null);
  }, [pushHistory, updateEqRows]);

  const handleEqRemoveCard = useCallback((rowId, slotId) => {
    pushHistory();
    updateEqRows(boardRef2.current.eqRows.map(r =>
      r.id !== rowId ? r : { ...r, slots: r.slots.map(s => s.id === slotId ? { ...s, card: null } : s) }
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

  const handleEqAddToBoard = useCallback((rowId) => {
    const row = boardRef2.current.eqRows.find(r => r.id === rowId);
    if (!row) return;
    const filledSlots = row.slots.filter(s => s.card);
    if (!filledSlots.length) return;
    const board = boardRef.current;
    const cx = board ? board.scrollLeft + board.clientWidth / 2 : STAGE_W / 2;
    const cy = board ? board.scrollTop  + board.clientHeight / 2 : STAGE_H / 2;
    const cards = filledSlots.map(s => ({
      val: s.card.val, color: '#1e2130', fill: 'white',
      w: getCardW(s.card.val), fontSize: getCardFs(s.card.val),
    }));
    const totalW = cards.reduce((a, c) => a + c.w + 4, 8);
    pushHistory();
    updateObjects([...boardRef2.current.objects, {
      id:uid(), type:'equationgroup',
      x: cx - totalW / 2, y: cy - (CARD_H + 8) / 2,
      cards,
    }]);
  }, [pushHistory, updateObjects]);

  // ── Save PNG ──────────────────────────────────────────────
  const handleSavePNG = () => {
    if (!stageRef.current) return;
    const url = stageRef.current.toDataURL({ pixelRatio: 2 });
    const a = document.createElement('a');
    a.download = `whiteboard-${Date.now()}.png`;
    a.href = url; a.click();
  };

  const handleFullscreen = () => setFsMode(f => !f);

  const confirmClear = () => {
    pushHistory();
    updateStrokes([]); updateObjects([]); updateEqRows([makeInitialRow()]);
    setSelectedId(null); setShowClear(false);
  };

  const handleTimerPreset  = (s) => { setTimerSecs(s); setTimerActive(true); setTimerRunning(true); };
  const handleTimerToggle  = () => { if (timerActive) setTimerRunning(r => !r); };
  const handleTimerReset   = () => { setTimerRunning(false); setTimerActive(false); setTimerSecs(0); };

  // ── Partition objects ─────────────────────────────────────
  const htmlObjs  = objects.filter(o => o.type === 'gridtable' || o.type === 'multitable');
  const konvaObjs = objects.filter(o => o.type !== 'gridtable' && o.type !== 'multitable');
  const controlsObj = objects.find(o => o.id === controlsId);

  const isDrawingTool = tool !== 'select';

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={`wb-page-wrap${fsMode ? ' wb-fs-mode' : ''}`}>

      {/* ── Body: board + right rail ── */}
      <div className="wb-body">

        {/* Scrollable board */}
        <div
          ref={boardRef}
          className={`wb-board${isDrawingTool ? ' drawing-mode' : ''}`}
        >
          <Stage
            ref={stageRef}
            width={STAGE_W}
            height={STAGE_H}
            onPointerDown={handleStagePointerDown}
            onPointerMove={handleStagePointerMove}
            onPointerUp={handleStagePointerUp}
            onClick={handleStageClick}
            style={{ display: 'block' }}
          >
            {/* Background: coord grid */}
            <Layer listening={false}>
              {mode === 'coordinate' && <CoordGrid w={STAGE_W} h={STAGE_H} quadrant={coordQuadrant} />}
            </Layer>

            {/* Strokes layer */}
            <Layer listening={false}>
              {strokes.map(s => (
                <Line key={s.id} points={s.points}
                  stroke={s.color} strokeWidth={s.strokeWidth}
                  opacity={s.opacity ?? 1}
                  tension={s.tool === 'pen' || s.tool === 'highlight' ? 0.3 : 0}
                  lineCap="round" lineJoin="round"
                  globalCompositeOperation={s.globalCompositeOperation || 'source-over'}
                />
              ))}
              {curStroke && (
                <Line points={curStroke.points}
                  stroke={curStroke.color} strokeWidth={curStroke.strokeWidth}
                  opacity={curStroke.opacity ?? 1}
                  tension={curStroke.tool === 'pen' || curStroke.tool === 'highlight' ? 0.3 : 0}
                  lineCap="round" lineJoin="round"
                  globalCompositeOperation={curStroke.globalCompositeOperation || 'source-over'}
                />
              )}
              {renderPreviewShape()}
            </Layer>

            {/* Objects layer */}
            <Layer>
              {konvaObjs.map(obj => {
                const props = {
                  key:obj.id, obj,
                  isSelected: selectedId === obj.id,
                  onSelect: setSelectedId,
                  onUpdate: handleUpdate,
                  onDelete: handleDelete,
                  tool,
                };
                switch (obj.type) {
                  case 'card':          return <BoardCard {...props} onShowControls={handleShowControls} />;
                  case 'equationgroup': return <EquationGroupNode {...props} />;
                  case 'shape':         return <BoardShape {...props} />;
                  case 'text':          return <BoardText  {...props} />;
                  case 'ruler':         return <RulerNode  {...props} />;
                  case 'protractor':    return <ProtractorNode {...props} />;
                  case 'abacus':        return <AbacusNode {...props} />;
                  case 'numberline':    return <NumberLineNode {...props} />;
                  case 'point':         return <CoordPoint key={obj.id} obj={obj} isSelected={selectedId===obj.id} onSelect={setSelectedId} onDelete={handleDelete} tool={tool} />;
                  default:              return null;
                }
              })}
              <Transformer ref={trRef} rotateEnabled={true}
                boundBoxFunc={(o,n) => n.width < 20 || n.height < 20 ? o : n}
              />
            </Layer>
          </Stage>

          {/* HTML overlay: tables */}
          <div className="wb-html-layer" style={{ width: STAGE_W, height: STAGE_H }}>
            {htmlObjs.map(obj =>
              obj.type === 'gridtable' ? (
                <GridTableNode key={obj.id} obj={obj} isSelected={selectedId===obj.id}
                  onSelect={setSelectedId} onUpdate={handleUpdate} onDelete={handleDelete} />
              ) : (
                <MultiTableNode key={obj.id} obj={obj} isSelected={selectedId===obj.id}
                  onSelect={setSelectedId} onUpdate={handleUpdate} onDelete={handleDelete} />
              )
            )}
          </div>

          {/* Text input */}
          {textInput && (
            <textarea
              ref={textAreaRef}
              className="wb-text-input"
              rows={1}
              style={{ left: textInput.x, top: textInput.y, color: drawColor, fontSize: '22px' }}
              value={textInput.val}
              onChange={e => setTextInput(p => ({ ...p, val: e.target.value }))}
              onBlur={commitText}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitText(); }
                if (e.key === 'Escape') { e.stopPropagation(); setTextInput(null); }
              }}
              onPointerDown={e => e.stopPropagation()}
            />
          )}

          {/* Mode strips */}
          {mode === 'coordinate' && (
            <div className="wb-coord-strip">
              <span>⊹ Coordinate Plane — tap empty space to plot a point</span>
            </div>
          )}
          {mode === 'equation' && (
            <div className="wb-eq-mode-banner">≡ Equation Row Mode — pick a card, then tap a slot below</div>
          )}

          {/* Card controls (tap or hover) */}
          {controlsId && controlsObj?.type === 'card' && (
            <CardHoverControls
              obj={controlsObj}
              pos={controlsPos}
              onSizePlus={handleCardSizePlus}
              onSizeMinus={handleCardSizeMinus}
              onColorChange={handleCardColor}
              onDelete={() => handleDelete(controlsId)}
            />
          )}

          {/* Floating timer */}
          {timerActive && (
            <div className="wb-timer-overlay">
              <div className={`wb-timer-digits${timerSecs < 60 ? ' urgent' : ''}`}>
                {String(Math.floor(timerSecs / 60)).padStart(2,'0')}:{String(timerSecs % 60).padStart(2,'0')}
              </div>
              <div className="wb-timer-controls">
                <button className="wb-timer-ctrl" onClick={handleTimerToggle}>{timerRunning ? '⏸' : '▶'}</button>
                <button className="wb-timer-ctrl" onClick={handleTimerReset}>⏹</button>
              </div>
            </div>
          )}
        </div>

        {/* Card drawer — slides over board */}
        <div className={`wb-card-drawer${panelOpen ? ' open' : ''}`}>
          <CardPanel
            pendingCard={pendingCard}
            onCardClick={handleCardClick}
            drawColor={drawColor}
          />
        </div>

        {/* Right tool rail */}
        <div className="wb-right-rail">
          <Toolbar
            tool={tool}           setTool={setTool}
            drawColor={drawColor} setDrawColor={setDrawColor}
            brushSize={brushSize} setBrushSize={setBrushSize}
            mode={mode}           setMode={setMode}
            coordQuadrant={coordQuadrant} setCoordQuadrant={setCoordQuadrant}
            onAddInstrument={handleAddInstrument}
            onUndo={undo} onRedo={redo}
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
            panelOpen={panelOpen}
            onPanelToggle={() => setPanelOpen(p => !p)}
          />
        </div>
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

      {/* Ghost card */}
      {pendingCard && ghostPos && (
        <div className="wb-ghost-card" style={{
          left: ghostPos.x, top: ghostPos.y,
          color: pendingCard.color || '#1e2130',
          fontSize: ghostFontSize(pendingCard.val),
        }}>
          {pendingCard.val}
        </div>
      )}

      {/* Clear confirm */}
      {showClear && (
        <div className="wb-overlay-dim" onClick={() => setShowClear(false)}>
          <div className="wb-confirm-box" onClick={e => e.stopPropagation()}>
            <h3>Clear the board?</h3>
            <p>All drawings, cards, and instruments will be removed.</p>
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
