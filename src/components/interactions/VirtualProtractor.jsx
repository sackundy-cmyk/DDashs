// ============================================================
//  VirtualProtractor.jsx
//  Draggable SVG protractor for measuring and drawing angles.
//
//  Mode 'measure':
//    - Show an angle diagram (via `angleDeg` prop for display)
//    - Student drags the whole protractor to the vertex, then
//      drags the arm to align with the second ray
//    - onMeasure(deg) called when student confirms
//
//  Mode 'draw':
//    - Fixed baseline ray shown; student drags arm to target angle
//    - onMeasure(deg) called on confirm
//
//  Props:
//    mode       : 'measure' | 'draw'
//    angleDeg   : number  — the actual angle (for validation & draw-mode target display)
//    onMeasure  : fn(deg) — called when student confirms reading
//    tolerance  : number  — degrees of acceptable error (default 3)
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';

const R = 120;        // protractor radius in SVG units
const CX = 140;       // centre x of protractor in SVG
const CY = 160;       // centre y of protractor in SVG (at flat base)
const W  = 280;       // SVG viewBox width
const H  = 200;       // SVG viewBox height

function degToRad(d) { return (d * Math.PI) / 180; }
function radToDeg(r) { return (r * 180) / Math.PI; }

// Point on protractor arc at angle deg (0 = right, 180 = left, measured from baseline)
function arcPoint(deg) {
  const r = degToRad(180 - deg); // flip because SVG y-axis is inverted
  return {
    x: CX + R * Math.cos(degToRad(deg)),
    y: CY - R * Math.sin(degToRad(deg)),
  };
}

// Generate tick marks for protractor
function ticks() {
  const marks = [];
  for (let d = 0; d <= 180; d += 10) {
    const inner = d % 30 === 0 ? R - 16 : R - 8;
    const outer = R;
    const r1 = degToRad(d);
    marks.push({
      x1: CX + inner * Math.cos(r1),
      y1: CY - inner * Math.sin(r1),
      x2: CX + outer * Math.cos(r1),
      y2: CY - outer * Math.sin(r1),
      label: d % 30 === 0 ? d : null,
      lx: CX + (inner - 10) * Math.cos(r1),
      ly: CY - (inner - 10) * Math.sin(r1),
    });
  }
  return marks;
}

export default function VirtualProtractor({
  mode = 'measure',
  angleDeg = 60,
  onMeasure,
  tolerance = 3,
}) {
  // Arm angle that the student sets (0–180 deg)
  const [armDeg, setArmDeg] = useState(mode === 'draw' ? 0 : 90);
  // Protractor drag offset (measure mode — student drags whole tool)
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [confirmed, setConfirmed] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const svgRef = useRef(null);
  const draggingArm = useRef(false);
  const draggingBody = useRef(false);
  const lastPointer = useRef(null);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // ── Pointer math ──────────────────────────────────────────
  const pointerAngle = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return armDeg;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const lx = (clientX - rect.left) * scaleX - offset.x;
    const ly = (clientY - rect.top)  * scaleY - offset.y;
    const dx = lx - CX;
    const dy = -(ly - CY); // flip y
    let deg = radToDeg(Math.atan2(dy, dx));
    if (deg < 0) deg = 0;
    if (deg > 180) deg = 180;
    return Math.round(deg);
  }, [armDeg, offset]);

  // ── Arm drag ──────────────────────────────────────────────
  const onArmPointerDown = useCallback((e) => {
    if (confirmed) return;
    e.preventDefault();
    draggingArm.current = true;
    svgRef.current?.setPointerCapture?.(e.pointerId);
  }, [confirmed]);

  // ── Body drag (measure mode only) ────────────────────────
  const onBodyPointerDown = useCallback((e) => {
    if (confirmed || mode !== 'measure') return;
    e.preventDefault();
    draggingBody.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    svgRef.current?.setPointerCapture?.(e.pointerId);
  }, [confirmed, mode]);

  const onPointerMove = useCallback((e) => {
    if (draggingArm.current) {
      setArmDeg(pointerAngle(e.clientX, e.clientY));
    } else if (draggingBody.current && lastPointer.current) {
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      const svg = svgRef.current;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        setOffset(o => ({ x: o.x + dx * scaleX, y: o.y + dy * scaleY }));
      }
      lastPointer.current = { x: e.clientX, y: e.clientY };
    }
  }, [pointerAngle]);

  const onPointerUp = useCallback(() => {
    draggingArm.current = false;
    draggingBody.current = false;
    lastPointer.current = null;
  }, []);

  // ── Confirm reading ───────────────────────────────────────
  const handleConfirm = () => {
    const diff = Math.abs(armDeg - angleDeg);
    if (diff <= tolerance) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
    setConfirmed(true);
    onMeasure?.(armDeg);
  };

  const armPt = arcPoint(armDeg);
  const tkList = ticks();

  return (
    <div style={{ fontFamily: 'var(--font)', userSelect: 'none' }}>
      {/* Mode label */}
      {mode === 'draw' && (
        <p style={{ textAlign: 'center', fontWeight: 700, color: 'var(--blue)', marginBottom: 4, fontSize: 14 }}>
          Draw <strong>{angleDeg}°</strong> — drag the arm to match
        </p>
      )}

      <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: 480, margin: '0 auto', display: 'block' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', border: 'none', overflow: 'visible', touchAction: 'none', cursor: draggingBody.current ? 'grabbing' : 'default' }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* ── Draw-mode: target angle diagram ── */}
          {mode === 'draw' && (
            <g opacity={0.25}>
              <line x1={CX} y1={CY} x2={CX + 130} y2={CY} stroke="#1E6FD9" strokeWidth={2} />
              <line
                x1={CX} y1={CY}
                x2={CX + 130 * Math.cos(degToRad(angleDeg))}
                y2={CY - 130 * Math.sin(degToRad(angleDeg))}
                stroke="#1E6FD9" strokeWidth={2} strokeDasharray="6 4"
              />
            </g>
          )}

          {/* ── Protractor body (draggable in measure mode) ── */}
          <g
            transform={`translate(${offset.x},${offset.y})`}
            onPointerDown={onBodyPointerDown}
            style={{ cursor: mode === 'measure' ? 'grab' : 'default' }}
          >
            {/* Semicircle fill */}
            <path
              d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY} Z`}
              fill="rgba(219,234,254,0.85)"
              stroke="#93C5FD"
              strokeWidth={1.5}
            />
            {/* Baseline */}
            <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke="#1E293B" strokeWidth={1.5} />
            {/* Centre dot */}
            <circle cx={CX} cy={CY} r={3} fill="#1E293B" />

            {/* Tick marks + labels */}
            {tkList.map((t, i) => (
              <g key={i}>
                <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#1E293B" strokeWidth={t.label !== null ? 1.5 : 1} />
                {t.label !== null && (
                  <text
                    x={t.lx} y={t.ly}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={t.label % 90 === 0 ? 9 : 7.5}
                    fontWeight={t.label % 90 === 0 ? 700 : 400}
                    fill="#1E293B"
                    transform={`rotate(${-(t.label - 90)},${t.lx},${t.ly})`}
                  >
                    {t.label}
                  </text>
                )}
              </g>
            ))}

            {/* ── Arm ── */}
            <g onPointerDown={onArmPointerDown} style={{ cursor: confirmed ? 'default' : 'pointer' }}>
              {/* Arm line */}
              <line
                x1={CX} y1={CY}
                x2={armPt.x} y2={armPt.y}
                stroke={confirmed ? (feedback === 'correct' ? '#16A34A' : '#DC2626') : '#1E6FD9'}
                strokeWidth={3}
                strokeLinecap="round"
              />
              {/* Drag handle circle */}
              <circle
                cx={armPt.x} cy={armPt.y} r={9}
                fill={confirmed ? (feedback === 'correct' ? '#16A34A' : '#DC2626') : '#1E6FD9'}
                opacity={0.9}
              />
            </g>

            {/* Degree readout bubble */}
            <g transform={`translate(${CX + (R * 0.4) * Math.cos(degToRad(armDeg / 2))},${CY - (R * 0.4) * Math.sin(degToRad(armDeg / 2))})`}>
              <rect x={-20} y={-12} width={40} height={22} rx={6} fill="rgba(30,111,217,0.9)" />
              <text x={0} y={5} textAnchor="middle" fill="white" fontSize={11} fontWeight={800}>
                {armDeg}°
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Confirm button */}
      {!confirmed && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button
            onClick={handleConfirm}
            style={{
              background: 'var(--blue)', color: 'white', border: 'none',
              borderRadius: 10, padding: '10px 28px', fontFamily: 'var(--font)',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Confirm {armDeg}°
          </button>
        </div>
      )}

      {/* Feedback */}
      {confirmed && (
        <div style={{
          textAlign: 'center', marginTop: 12, padding: '10px 20px', borderRadius: 10,
          background: feedback === 'correct' ? 'var(--green-bg)' : 'var(--red-bg)',
          border: `2px solid ${feedback === 'correct' ? 'var(--green-border)' : 'var(--red-border)'}`,
          color: feedback === 'correct' ? 'var(--green)' : 'var(--red)',
          fontWeight: 700, fontSize: 15,
        }}>
          {feedback === 'correct'
            ? `✓ Correct! The angle is ${angleDeg}°`
            : `The angle is ${angleDeg}° — you measured ${armDeg}°`}
        </div>
      )}
    </div>
  );
}
