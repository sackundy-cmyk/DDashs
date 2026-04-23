// ============================================================
//  src/components/charts/SvgBarChart.jsx — hand-rolled bar chart
// ============================================================

export default function SvgBarChart({
  data = [],              // [{ label, value, color? }]
  height = 220,
  maxValue,
  format = v => `${v}`,
  emptyText = 'No data yet.',
}) {
  if (!data.length) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>{emptyText}</div>;
  }

  const w = 640;
  const h = height;
  const padL = 32, padR = 12, padT = 16, padB = 40;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const max = maxValue ?? Math.max(1, ...data.map(d => d.value ?? 0));
  const bw = plotW / data.length;

  // 4 gridlines
  const grid = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    y: padT + plotH * (1 - f),
    v: Math.round(max * f),
  }));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="bar chart">
      {grid.map(g => (
        <g key={g.v}>
          <line x1={padL} x2={w - padR} y1={g.y} y2={g.y} stroke="#eef3f9" />
          <text x={padL - 6} y={g.y + 4} fontSize="10" textAnchor="end" fill="#94a3b8">{g.v}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const v = d.value ?? 0;
        const bh = max ? (v / max) * plotH : 0;
        const x = padL + i * bw + 6;
        const bwidth = Math.max(1, bw - 12);
        const y = padT + plotH - bh;
        return (
          <g key={d.label + i}>
            <rect x={x} y={y} width={bwidth} height={bh} rx={6} fill={d.color || '#2563eb'} />
            <text x={x + bwidth / 2} y={padT + plotH + 16} textAnchor="middle" fontSize="11" fill="#64748b">
              {d.label}
            </text>
            {v ? (
              <text x={x + bwidth / 2} y={y - 4} textAnchor="middle" fontSize="10" fill="#0b2b5e" fontWeight="700">
                {format(v)}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
