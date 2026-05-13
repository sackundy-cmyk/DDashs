// ============================================================
//  RulerNode.jsx — visual Konva ruler (draggable + resizable)
// ============================================================
import { Group, Rect, Line, Text } from 'react-konva';

const RULER_H = 52;
const CM_PX   = 40; // pixels per cm

export default function RulerNode({ obj, isSelected, onSelect, onUpdate, onDelete, tool }) {
  const w = obj.w || 400;

  const handleDragEnd = (e) => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() });
  const handleTransformEnd = (e) => {
    const node = e.target;
    onUpdate(obj.id, {
      x: node.x(), y: node.y(),
      w: Math.max(120, (obj.w || 400) * node.scaleX()),
      scaleX: 1, scaleY: 1,
      rotation: node.rotation(),
    });
    node.scaleX(1);
    node.scaleY(1);
  };

  // Build tick marks
  const ticks = [];
  const steps = Math.floor(w / (CM_PX / 10)); // 1mm steps
  for (let i = 0; i <= steps; i++) {
    const x = i * (CM_PX / 10);
    const isCm  = i % 10 === 0;
    const isHalf = i % 5 === 0;
    const tickH = isCm ? 18 : isHalf ? 12 : 7;
    ticks.push({ x, h: tickH, isCm, label: isCm ? `${i / 10}` : null });
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
      {/* Ruler body */}
      <Rect
        width={w}
        height={RULER_H}
        fill="#f5e6c0"
        stroke="#b5924a"
        strokeWidth={1.5}
        cornerRadius={4}
        shadowBlur={isSelected ? 12 : 4}
        shadowColor="rgba(0,0,0,.2)"
      />

      {/* Scale strip */}
      <Rect x={0} y={RULER_H - 20} width={w} height={20} fill="#e8d4a0" cornerRadius={[0, 0, 4, 4]} />

      {/* Tick marks + labels */}
      {ticks.map((t, i) => (
        <Group key={i}>
          <Line
            points={[t.x, RULER_H - 20, t.x, RULER_H - 20 - t.h]}
            stroke="#6b4c1e"
            strokeWidth={t.isCm ? 1.5 : 1}
          />
          {t.label && (
            <Text
              x={t.x - 8}
              y={RULER_H - 18}
              text={t.label}
              fontSize={9}
              fontFamily="Nunito, sans-serif"
              fontStyle="bold"
              fill="#6b4c1e"
              width={16}
              align="center"
            />
          )}
        </Group>
      ))}

      {/* "cm" label */}
      <Text x={w - 28} y={4} text="cm" fontSize={11} fontFamily="Nunito, sans-serif" fontStyle="bold" fill="#6b4c1e" />

      {/* Delete badge */}
      {isSelected && (
        <Group x={-10} y={-10} onClick={e => { e.cancelBubble = true; onDelete(obj.id); }}>
          <Rect width={18} height={18} fill="#e74c3c" cornerRadius={9} />
          <Text text="✕" fontSize={10} fill="white" x={4} y={3} />
        </Group>
      )}
    </Group>
  );
}
