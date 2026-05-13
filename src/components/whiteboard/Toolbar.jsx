// ============================================================
//  Toolbar.jsx — top toolbar for the whiteboard
// ============================================================
import { useState } from 'react';

const COLORS = [
  { hex: '#1e2130', name: 'Black'  },
  { hex: '#e74c3c', name: 'Red'    },
  { hex: '#3498db', name: 'Blue'   },
  { hex: '#2ecc71', name: 'Green'  },
  { hex: '#f39c12', name: 'Orange' },
  { hex: '#9b59b6', name: 'Purple' },
  { hex: '#e91e8c', name: 'Pink'   },
  { hex: '#00bcd4', name: 'Cyan'   },
];

const BRUSH_SIZES = [
  { size: 2,  dot: 7  },
  { size: 4,  dot: 11 },
  { size: 8,  dot: 16 },
  { size: 16, dot: 22 },
];

const TOOLS = [
  { id: 'select',    label: 'Select',    icon: '↖' },
  { id: 'pen',       label: 'Pen',       icon: '✏' },
  { id: 'line',      label: 'Line',      icon: '╱' },
  { id: 'highlight', label: 'Highlight', icon: '🖍' },
  { id: 'eraser',    label: 'Eraser',    icon: '⌫' },
  { id: 'text',      label: 'Text',      icon: 'T' },
  { id: 'circle',    label: 'Circle',    icon: '○' },
  { id: 'rect',      label: 'Rect',      icon: '□' },
  { id: 'triangle',  label: 'Triangle',  icon: '△' },
];

const INSTRUMENTS = [
  { id: 'ruler',      label: '📏 Ruler'   },
  { id: 'protractor', label: '📐 Protractor' },
  { id: 'abacus',     label: '🧮 Abacus'  },
  { id: 'numberline', label: '↔ Number Line' },
  { id: 'table',      label: '⊞ Table'   },
  { id: 'multitable', label: '✕ ×Table'  },
];

function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function Toolbar({
  tool, setTool,
  drawColor, setDrawColor,
  brushSize, setBrushSize,
  mode, setMode,
  coordQuadrant, setCoordQuadrant,
  onAddInstrument,
  onUndo, onRedo, onClear, onSavePNG, onFullscreen,
  timerSecs, timerRunning, timerActive,
  onTimerToggle, onTimerReset, onTimerPreset,
  fsMode,
  onZoomIn, onZoomOut, onZoomReset, zoom,
}) {
  const [mathOpen,  setMathOpen]  = useState(true);
  const [timerOpen, setTimerOpen] = useState(true);

  return (
    <div className="wb-toolbar" role="toolbar">

      {/* Drawing tools */}
      <span className="tb-label">Tools</span>
      {TOOLS.map(t => (
        <button
          key={t.id}
          className={`tb-btn${tool === t.id ? ' active' : ''}`}
          onClick={() => setTool(t.id)}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}

      <div className="tb-sep" />

      {/* Colors */}
      <span className="tb-label">Color</span>
      {COLORS.map(c => (
        <div
          key={c.hex}
          className={`tb-color-dot${drawColor === c.hex ? ' active' : ''}`}
          style={{ background: c.hex }}
          onClick={() => setDrawColor(c.hex)}
          title={c.name}
        />
      ))}

      <div className="tb-sep" />

      {/* Brush sizes */}
      <span className="tb-label">Size</span>
      {BRUSH_SIZES.map(b => (
        <div
          key={b.size}
          className={`tb-brush${brushSize === b.size ? ' active' : ''}`}
          style={{ width: b.dot, height: b.dot }}
          onClick={() => setBrushSize(b.size)}
          title={`Size ${b.size}`}
        />
      ))}

      <div className="tb-sep" />

      {/* Instruments — collapsible */}
      <span
        className="tb-label tb-label-toggle"
        onClick={() => setMathOpen(o => !o)}
        title={mathOpen ? 'Hide Math Tools' : 'Show Math Tools'}
      >
        Math {mathOpen ? '▲' : '▼'}
      </span>
      {mathOpen && INSTRUMENTS.map(inst => (
        <button
          key={inst.id}
          className="tb-inst-btn"
          onClick={() => onAddInstrument(inst.id)}
          title={`Add ${inst.label}`}
        >
          {inst.label}
        </button>
      ))}

      <div className="tb-sep" />

      {/* Board modes */}
      <span className="tb-label">Mode</span>
      <button
        className={`tb-btn-wide${mode === 'whiteboard' ? ' mode-active' : ''}`}
        onClick={() => setMode('whiteboard')}
        title="Free Whiteboard"
      >
        ✏ Free
      </button>
      <button
        className={`tb-btn-wide${mode === 'coordinate' ? ' mode-active' : ''}`}
        onClick={() => setMode(mode === 'coordinate' ? 'whiteboard' : 'coordinate')}
        title="Coordinate Plane"
      >
        ⊹ Coords
      </button>
      <button
        className={`tb-btn-wide${mode === 'equation' ? ' mode-active' : ''}`}
        onClick={() => setMode(mode === 'equation' ? 'whiteboard' : 'equation')}
        title="Equation Rows"
      >
        ≡ Eq.Rows
      </button>

      {/* Coord quadrant sub-toggle */}
      {mode === 'coordinate' && (
        <>
          <div className="tb-sep" />
          <button
            className={`tb-btn-wide${coordQuadrant === 'q1' ? ' mode-active' : ''}`}
            onClick={() => setCoordQuadrant('q1')}
            title="Quadrant 1 only"
          >Q1</button>
          <button
            className={`tb-btn-wide${coordQuadrant === 'all' ? ' mode-active' : ''}`}
            onClick={() => setCoordQuadrant('all')}
            title="All 4 quadrants"
          >All Q</button>
        </>
      )}

      <div className="tb-sep" />

      {/* Actions */}
      <button className="tb-btn" onClick={onUndo}  title="Undo (Ctrl+Z)">↩</button>
      <button className="tb-btn" onClick={onRedo}  title="Redo">↪</button>
      <button className="tb-btn" onClick={onSavePNG} title="Save as PNG">💾</button>
      <button
        className={`tb-btn${fsMode ? ' active' : ''}`}
        onClick={onFullscreen}
        title={fsMode ? 'Exit Fullscreen (Esc)' : 'Fullscreen — hides sidebar'}
      >
        {fsMode ? '✕' : '⛶'}
      </button>

      <div className="tb-sep" />

      {/* Zoom controls */}
      <span className="tb-label">Zoom</span>
      <button className="tb-btn" onClick={onZoomOut} title="Zoom Out (scroll ↓)">−</button>
      <span className="tb-zoom-pct">{Math.round((zoom || 1) * 100)}%</span>
      <button className="tb-btn" onClick={onZoomIn}  title="Zoom In (scroll ↑)">+</button>
      <button className="tb-btn-wide" style={{ minWidth: 36 }} onClick={onZoomReset} title="Reset Zoom">1:1</button>

      <div className="tb-sep" />

      {/* Timer — collapsible */}
      <span
        className="tb-label tb-label-toggle"
        onClick={() => setTimerOpen(o => !o)}
        title={timerOpen ? 'Hide Timer' : 'Show Timer'}
      >
        Timer {timerOpen ? '▲' : '▼'}
      </span>
      {timerOpen && (
        <>
          {timerActive && (
            <span className={`tb-timer-display${timerSecs < 60 ? ' urgent' : ''}`}>
              {fmt(timerSecs)}
            </span>
          )}
          <button
            className={`tb-btn${timerActive ? ' active' : ''}`}
            onClick={onTimerToggle}
            title={timerActive ? (timerRunning ? 'Pause' : 'Resume') : 'Start Timer'}
          >
            {timerActive ? (timerRunning ? '⏸' : '▶') : '⏱'}
          </button>
          {timerActive && (
            <button className="tb-btn" onClick={onTimerReset} title="Reset Timer">⏹</button>
          )}
          {!timerActive && (
            <>
              {[5, 10, 15, 20].map(m => (
                <button
                  key={m}
                  className="tb-btn-wide"
                  style={{ minWidth: 36 }}
                  onClick={() => onTimerPreset(m * 60)}
                  title={`${m} min timer`}
                >
                  {m}m
                </button>
              ))}
            </>
          )}
        </>
      )}

      <div className="tb-sep" />
      <button className="tb-btn danger" onClick={onClear} title="Clear Board">🗑</button>
    </div>
  );
}
