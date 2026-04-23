// ============================================================
//  src/components/charts/SvgLineChart.jsx — simple trend line
// ============================================================

export default function SvgLineChart({
  data = [],              // [{ label, value }]
  height = 220,
  color = '#2563eb',
  format = v => v == null ? '—' : `${Math.round(v)}%`,
  emptyText = 'No data yet.',
}) {
  const points = data.filter(d => d.value != null);
  if (points.length < 2) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>{emptyText}</div>;
  }

  const w = 640, h = height;
  const padL = 34, padR = 14, padT = 16, padB = 34;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const max = Math.max(100, ...points.map(p => p.value));
  const min = Math.min(0,   ...points.map(p => p.value));
  const range = Math.max(1, max - min);

  const xAt = (i) => padL + (i / (data.length - 1)) * plotW;
  const yAt = (v) => padT + plotH - ((v - min) / range) * plotH;

  const path = data.map((d, i) =>
    d.value == null ? null : `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(d.value)}`
  ).filter(Boolean).join(' ');

  const area = `${path} L${xAt(data.length - 1)},${padT + plotH} L${xAt(0)},${padT + plotH} Z`;

  const grid = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: padT + plotH * (1 - f),
    v: Math.round(min + range * f),
  }));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="line chart">
      <defs>
        <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid.map(g => (
        <g key={g.v}>
          <line x1={padL} x2={w - padR} y1={g.y} y2={g.y} stroke="#eef3f9" />
          <text x={padL - 6} y={g.y + 4} fontSize="10" textAnchor="end" fill="#94a3b8">{g.v}</text>
        </g>
      ))}
      <path d={area} fill="url(#lineFill)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i}>
          {d.value != null && (
            <circle cx={xAt(i)} cy={yAt(d.value)} r={3.5} fill={color} stroke="white" strokeWidth="1.5" />
          )}
          <text x={xAt(i)} y={padT + plotH + 18} fontSize="10" textAnchor="middle" fill="#64748b">
            {d.label}
          </text>
        </g>
      ))}
      {points.length && (
        <text x={w - padR} y={padT + 10} fontSize="11" textAnchor="end" fill="#0b2b5e" fontWeight="700">
          Latest: {format(points[points.length - 1].value)}
        </text>
      )}
    </svg>
  );
}
