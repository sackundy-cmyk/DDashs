// ============================================================
//  NumberLineNode.jsx — resizable Konva number line
// ============================================================
import { Group, Line, Circle, Text, Rect } from 'react-konva';

const TICK_H    = 14;
const HALF_TICK = 8;
const AXIS_Y    = 30;

export default function NumberLineNode({ obj, isSelected, onSelect, onUpdate, onDelete, tool }) {
  const start = obj.start ?? 0;
  const end   = obj.end   ?? 20;
  const w     = obj.w     ?? 500;
  const step  = obj.step  ?? 1;

  const handleDragEnd = (e) => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() });
  const handleTransformEnd = (e) => {
    const node = e.target;
    onUpdate(obj.id, {
      x: node.x(), y: node.y(),
      w: Math.max(100, w * node.scaleX()),
      scaleX: 1, scaleY: 1,
      rotation: node.rotation(),
    });
    node.scaleX(1);
    node.scaleY(1);
  };

  const range   = end - start || 1;
  const pxPerU  = w / range;

  const ticks = [];
  for (let v = start; v <= end; v += step) {
    const x = (v - start) * pxPerU;
    const isMajor = Number.isInteger(v);
    ticks.push({ x, v, isMajor });
  }

  return (
    <Group
      id={obj.id}
      x={obj.x}
      y={obj.y}
      rotation={obj.rotation || 0}
      draggable={tool === 'select'}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      onClick={() => { if (tool === 'select') onSelect(obj.id); }}
    >
      {/* Main axis line */}
      <Line
        points={[-20, AXIS_Y, w + 20, AXIS_Y]}
        stroke="#1E2130"
        strokeWidth={2.5}
        lineCap="round"
      />

      {/* Arrow right */}
      <Line points={[w + 14, AXIS_Y - 6, w + 22, AXIS_Y, w + 14, AXIS_Y + 6]} stroke="#1E2130" strokeWidth={2} fill="#1E2130" closed />
      {/* Arrow left */}
      <Line points={[-14, AXIS_Y - 6, -22, AXIS_Y, -14, AXIS_Y + 6]} stroke="#1E2130" strokeWidth={2} fill="#1E2130" closed />

      {/* Ticks + labels */}
      {ticks.map((t, i) => (
        <Group key={i}>
          <Line
            points={[t.x, AXIS_Y - (t.isMajor ? TICK_H : HALF_TICK), t.x, AXIS_Y + (t.isMajor ? TICK_H : HALF_TICK)]}
            stroke={t.isMajor ? '#1E2130' : '#94A3B8'}
            strokeWidth={t.isMajor ? 2 : 1}
          />
          {t.isMajor && (
            <Text
              x={t.x - 16}
              y={AXIS_Y + TICK_H + 2}
              width={32}
              text={String(t.v)}
              fontSize={11}
              fontFamily="Nunito, sans-serif"
              fontStyle="bold"
              fill="#1E2130"
              align="center"
            />
          )}
        </Group>
      ))}

      {/* Extend handles (draggable circles to extend range) */}
      <Circle
        x={-20} y={AXIS_Y} radius={7}
        fill="#4f8ef7" stroke="white" strokeWidth={1.5}
        draggable
        onDragMove={(e) => {
          e.cancelBubble = true;
          const dx = e.target.x() - (-20);
          const newStart = Math.round(start - dx / pxPerU);
          if (newStart < end - 1) onUpdate(obj.id, { start: newStart });
          e.target.x(-20);
          e.target.y(AXIS_Y);
        }}
        title="Drag to extend left"
      />
      <Circle
        x={w + 20} y={AXIS_Y} radius={7}
        fill="#4f8ef7" stroke="white" strokeWidth={1.5}
        draggable
        onDragMove={(e) => {
          e.cancelBubble = true;
          const dx = e.target.x() - (w + 20);
          const newEnd = Math.round(end + dx / pxPerU);
          if (newEnd > start + 1) onUpdate(obj.id, { end: newEnd });
          e.target.x(w + 20);
          e.target.y(AXIS_Y);
        }}
        title="Drag to extend right"
      />

      {/* Delete badge */}
      {isSelected && (
        <Group x={w + 14} y={-10} onClick={e => { e.cancelBubble = true; onDelete(obj.id); }}>
          <Rect width={18} height={18} fill="#e74c3c" cornerRadius={9} />
          <Text text="✕" fontSize={10} fill="white" x={4} y={3} />
        </Group>
      )}
    </Group>
  );
}
