// ============================================================
//  Toolbar.jsx — right-side vertical floating toolbar
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
  { id: 'select',    icon: '↖', label: 'Select / Pan' },
  { id: 'pen',       icon: '✏', label: 'Pen'          },
  { id: 'line',      icon: '╱', label: 'Line'         },
  { id: 'highlight', icon: '🖍', label: 'Highlight'   },
  { id: 'eraser',    icon: '⌫', label: 'Eraser'       },
  { id: 'text',      icon: 'T', label: 'Text'         },
  { id: 'circle',    icon: '○', label: 'Circle'       },
  { id: 'rect',      icon: '□', label: 'Rectangle'    },
  { id: 'triangle',  icon: '△', label: 'Triangle'     },
];

const INSTRUMENTS = [
  { id: 'ruler',      label: '📏', full: 'Ruler'        },
  { id: 'protractor', label: '📐', full: 'Protractor'   },
  { id: 'abacus',     label: '🧮', full: 'Abacus'       },
  { id: 'numberline', label: '↔',  full: 'Number Line'  },
  { id: 'table',      label: '⊞',  full: 'Table'        },
  { id: 'multitable', label: '✕',  full: '×Table'       },
];

function fmt(s) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
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
  panelOpen, onPanelToggle,
}) {
  const [mathOpen,  setMathOpen]  = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);

  return (
    <>
      {/* ── Scrollable tool strip ── */}
      <div className="wb-tool-strip">

        {/* Tools */}
        {TOOLS.map(t => (
          <button
            key={t.id}
            className={`wbt-btn${tool === t.id ? ' active' : ''}`}
            onClick={() => setTool(t.id)}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}

        <div className="wbt-sep" />

        {/* Colors — 2-column grid */}
        <div className="wbt-color-grid">
          {COLORS.map(c => (
            <div
              key={c.hex}
              className={`wbt-color-dot${drawColor === c.hex ? ' active' : ''}`}
              style={{ background: c.hex }}
              onClick={() => setDrawColor(c.hex)}
              title={c.name}
            />
          ))}
        </div>

        <div className="wbt-sep" />

        {/* Brush sizes */}
        <div className="wbt-brushes">
          {BRUSH_SIZES.map(b => (
            <div
              key={b.size}
              className={`wbt-brush${brushSize === b.size ? ' active' : ''}`}
              style={{ width: b.dot, height: b.dot }}
              onClick={() => setBrushSize(b.size)}
              title={`Size ${b.size}`}
            />
          ))}
        </div>

        <div className="wbt-sep" />

        {/* Board modes */}
        <button
          className={`wbt-btn-wide${mode === 'whiteboard' ? ' mode-active' : ''}`}
          onClick={() => setMode('whiteboard')}
          title="Free Whiteboard"
        >✏ Free</button>
        <button
          className={`wbt-btn-wide${mode === 'coordinate' ? ' mode-active' : ''}`}
          onClick={() => setMode(mode === 'coordinate' ? 'whiteboard' : 'coordinate')}
          title="Coordinate Plane"
        >⊹ Coord</button>
        <button
          className={`wbt-btn-wide${mode === 'equation' ? ' mode-active' : ''}`}
          onClick={() => setMode(mode === 'equation' ? 'whiteboard' : 'equation')}
          title="Equation Rows"
        >≡ Eq</button>

        {/* Coord quadrant sub-toggle */}
        {mode === 'coordinate' && (
          <>
            <button
              className={`wbt-btn-wide${coordQuadrant === 'q1' ? ' mode-active' : ''}`}
              onClick={() => setCoordQuadrant('q1')}
              title="Quadrant 1 only"
            >Q1</button>
            <button
              className={`wbt-btn-wide${coordQuadrant === 'all' ? ' mode-active' : ''}`}
              onClick={() => setCoordQuadrant('all')}
              title="All 4 quadrants"
            >All Q</button>
          </>
        )}

        <div className="wbt-sep" />

        {/* Math instruments — collapsible */}
        <span
          className="wbt-label wbt-label-toggle"
          onClick={() => setMathOpen(o => !o)}
          title={mathOpen ? 'Hide math tools' : 'Show math tools'}
        >
          Math {mathOpen ? '▲' : '▼'}
        </span>
        {mathOpen && INSTRUMENTS.map(inst => (
          <button
            key={inst.id}
            className="wbt-inst-btn"
            onClick={() => onAddInstrument(inst.id)}
            title={`Add ${inst.full}`}
          >
            {inst.label} {inst.full}
          </button>
        ))}

        <div className="wbt-sep" />

        {/* Actions */}
        <button className="wbt-btn" onClick={onUndo}    title="Undo">↩</button>
        <button className="wbt-btn" onClick={onRedo}    title="Redo">↪</button>
        <button className="wbt-btn" onClick={onSavePNG} title="Save PNG">💾</button>
        <button
          className={`wbt-btn${fsMode ? ' active' : ''}`}
          onClick={onFullscreen}
          title={fsMode ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {fsMode ? '✕' : '⛶'}
        </button>

        <div className="wbt-sep" />

        {/* Timer — collapsible */}
        <span
          className="wbt-label wbt-label-toggle"
          onClick={() => setTimerOpen(o => !o)}
          title={timerOpen ? 'Hide timer' : 'Show timer'}
        >
          ⏱ {timerOpen ? '▲' : '▼'}
        </span>
        {timerOpen && (
          <>
            {timerActive && (
              <span className={`wbt-timer-display${timerSecs < 60 ? ' urgent' : ''}`}>
                {fmt(timerSecs)}
              </span>
            )}
            <button
              className={`wbt-btn${timerActive ? ' active' : ''}`}
              onClick={onTimerToggle}
              title={timerActive ? (timerRunning ? 'Pause' : 'Resume') : 'Start Timer'}
            >
              {timerActive ? (timerRunning ? '⏸' : '▶') : '⏱'}
            </button>
            {timerActive && (
              <button className="wbt-btn" onClick={onTimerReset} title="Reset">⏹</button>
            )}
            {!timerActive && [5, 10, 15, 20].map(m => (
              <button
                key={m}
                className="wbt-btn-wide"
                onClick={() => onTimerPreset(m * 60)}
                title={`${m} min timer`}
              >
                {m}m
              </button>
            ))}
          </>
        )}

        <div className="wbt-sep" />
        <button className="wbt-btn danger" onClick={onClear} title="Clear Board">🗑</button>

        {/* Spacer so clear isn't at the very bottom */}
        <div style={{ height: 8 }} />
      </div>

      {/* ── Card panel toggle — pinned to bottom of rail ── */}
      <button
        className={`wb-panel-toggle${panelOpen ? ' open' : ''}`}
        onClick={onPanelToggle}
        title={panelOpen ? 'Close card panel' : 'Open card panel (numbers & operators)'}
      >
        {panelOpen ? '✕' : '≡'}
      </button>
    </>
  );
}
