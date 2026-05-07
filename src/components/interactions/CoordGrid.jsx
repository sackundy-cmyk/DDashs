// ============================================================
//  CoordGrid.jsx
//  Interactive SVG coordinate grid for geometry lessons.
//
//  Props:
//    size        : number   — grid goes 0..size on each axis (default 10)
//    cellPx      : number   — px per grid cell in rendered SVG (default 36)
//    prePoints   : [{x,y,label,colour}] — pre-placed dots (shown on load)
//    preLines    : [{from:{x,y}, to:{x,y}, colour}] — pre-drawn line segments
//    mirror      : { axis:'x'|'y', value:number } | null — dashed mirror line
//    interactive : bool — allow click-to-place (default false)
//    maxPoints   : number — max dots student can place (default size*size)
//    onPointPlace: fn([{x,y}]) — called with updated student points array
//    locked      : bool — disable interaction (after check)
//    colour      : string — colour for student-placed dots (default '#F97316')
// ============================================================

import { useState, useCallback } from 'react';

const MARGIN = 32; // space for axis labels

export default function CoordGrid({
  size = 10,
  cellPx = 36,
  prePoints = [],
  preLines = [],
  mirror = null,
  interactive = false,
  maxPoints,
  onPointPlace,
  locked = false,
  colour = '#F97316',
}) {
  const [studentPoints, setStudentPoints] = useState([]);

  const svgSize = MARGIN + cellPx * size;
  const max = maxPoints ?? size * size;

  // Convert grid coords to SVG coords
  const gx = (x) => MARGIN + x * cellPx;
  const gy = (y) => cellPx * size - y * cellPx; // y is flipped (0 at bottom)

  const handleClick = useCallback((e) => {
    if (!interactive || locked) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const rawX = e.clientX - rect.left - MARGIN;
    const rawY = e.clientY - rect.top;
    const cellX = Math.round(rawX / cellPx);
    const cellY = Math.round((cellPx * size - rawY) / cellPx);
    if (cellX < 0 || cellX > size || cellY < 0 || cellY > size) return;

    setStudentPoints(prev => {
      const exists = prev.findIndex(p => p.x === cellX && p.y === cellY);
      let next;
      if (exists !== -1) {
        // Toggle off
        next = prev.filter((_, i) => i !== exists);
      } else {
        if (prev.length >= max) {
          // Replace last point
          next = [...prev.slice(0, max - 1), { x: cellX, y: cellY }];
        } else {
          next = [...prev, { x: cellX, y: cellY }];
        }
      }
      onPointPlace?.(next);
      return next;
    });
  }, [interactive, locked, cellPx, size, max, onPointPlace]);

  // Build grid lines
  const gridLines = [];
  for (let i = 0; i <= size; i++) {
    // Vertical
    gridLines.push(<line key={`v${i}`} x1={gx(i)} y1={0} x2={gx(i)} y2={gy(0)} stroke="#CBD5E1" strokeWidth={i === 0 ? 2 : 1} />);
    // Horizontal
    gridLines.push(<line key={`h${i}`} x1={MARGIN} y1={gy(i)} x2={gx(size)} y2={gy(i)} stroke="#CBD5E1" strokeWidth={i === 0 ? 2 : 1} />);
  }

  // Axis labels
  const xLabels = [];
  const yLabels = [];
  for (let i = 0; i <= size; i++) {
    xLabels.push(
      <text key={i} x={gx(i)} y={gy(0) + 18} textAnchor="middle" fontSize={11} fontWeight={i === 0 ? 700 : 400} fill="#334155" fontFamily="var(--font)">
        {i}
      </text>
    );
    yLabels.push(
      <text key={i} x={MARGIN - 8} y={gy(i) + 4} textAnchor="end" fontSize={11} fontWeight={i === 0 ? 700 : 400} fill="#334155" fontFamily="var(--font)">
        {i}
      </text>
    );
  }
  // Axis arrow labels
  const axisLabels = (
    <>
      <text x={gx(size) + 10} y={gy(0) + 4} fontSize={13} fontWeight={800} fill="#1E293B" fontFamily="var(--font)">x</text>
      <text x={MARGIN - 8} y={-8} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1E293B" fontFamily="var(--font)">y</text>
    </>
  );

  // Pre-drawn lines
  const drawnLines = preLines.map((l, i) => (
    <line
      key={i}
      x1={gx(l.from.x)} y1={gy(l.from.y)}
      x2={gx(l.to.x)}   y2={gy(l.to.y)}
      stroke={l.colour || '#7C3AED'} strokeWidth={2.5} strokeLinecap="round"
    />
  ));

  // Mirror line
  let mirrorLine = null;
  if (mirror) {
    if (mirror.axis === 'x') {
      // Vertical mirror at x = value
      mirrorLine = <line x1={gx(mirror.value)} y1={0} x2={gx(mirror.value)} y2={gy(0)} stroke="#DC2626" strokeWidth={2} strokeDasharray="8 5" />;
    } else {
      // Horizontal mirror at y = value
      mirrorLine = <line x1={MARGIN} y1={gy(mirror.value)} x2={gx(size)} y2={gy(mirror.value)} stroke="#DC2626" strokeWidth={2} strokeDasharray="8 5" />;
    }
  }

  // Pre-placed dots
  const preDots = prePoints.map((p, i) => (
    <g key={i}>
      <circle cx={gx(p.x)} cy={gy(p.y)} r={6} fill={p.colour || '#7C3AED'} />
      {p.label && (
        <text x={gx(p.x) + 9} y={gy(p.y) - 6} fontSize={12} fontWeight={700} fill={p.colour || '#7C3AED'} fontFamily="var(--font)">
          {p.label}
        </text>
      )}
    </g>
  ));

  // Student-placed dots
  const studentDots = studentPoints.map((p, i) => (
    <g key={i}>
      <circle cx={gx(p.x)} cy={gy(p.y)} r={7} fill={colour} stroke="white" strokeWidth={2} style={{ cursor: 'pointer' }} />
      <text x={gx(p.x) + 10} y={gy(p.y) - 6} fontSize={11} fontWeight={700} fill={colour} fontFamily="var(--font)">
        ({p.x},{p.y})
      </text>
    </g>
  ));

  // Clickable intersection overlay (visible dots when hovering)
  const hitTargets = interactive && !locked
    ? Array.from({ length: size + 1 }, (_, xi) =>
        Array.from({ length: size + 1 }, (_, yi) => (
          <circle
            key={`${xi}-${yi}`}
            cx={gx(xi)} cy={gy(yi)} r={cellPx / 2}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
          />
        ))
      )
    : null;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        width={svgSize + 20}
        height={svgSize + 24}
        viewBox={`0 ${-24} ${svgSize + 20} ${svgSize + 24}`}
        style={{ display: 'block', margin: '0 auto', touchAction: 'none' }}
        onClick={handleClick}
      >
        <g>
          {gridLines}
          {drawnLines}
          {mirrorLine}
          {preDots}
          {studentDots}
          {hitTargets}
          {xLabels}
          {yLabels}
          {axisLabels}
        </g>
      </svg>
    </div>
  );
}
