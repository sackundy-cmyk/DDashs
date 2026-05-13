// ============================================================
//  ProtractorNode.jsx — Konva semicircle protractor
// ============================================================
import { Group, Shape, Text, Rect } from 'react-konva';

const DEFAULT_R = 130;

export default function ProtractorNode({ obj, isSelected, onSelect, onUpdate, onDelete, tool }) {
  const r = obj.radius || DEFAULT_R;
  const cx = r;
  const cy = r;

  const handleDragEnd = (e) => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() });
  const handleTransformEnd = (e) => {
    const node = e.target;
    onUpdate(obj.id, {
      x: node.x(), y: node.y(),
      radius: Math.max(60, (obj.radius || DEFAULT_R) * node.scaleX()),
      scaleX: 1, scaleY: 1,
      rotation: node.rotation(),
    });
    node.scaleX(1);
    node.scaleY(1);
  };

  // Build degree tick data
  const degTicks = [];
  for (let deg = 0; deg <= 180; deg++) {
    const isMajor = deg % 10 === 0;
    const isMid   = deg % 5 === 0;
    if (!isMid && !isMajor) continue;
    const rad  = (180 - deg) * Math.PI / 180;
    const tickH = isMajor ? 16 : 9;
    const inner = r - tickH;
    degTicks.push({
      deg,
      x1: cx + r     * Math.cos(rad),
      y1: cy - r     * Math.sin(rad),
      x2: cx + inner * Math.cos(rad),
      y2: cy - inner * Math.sin(rad),
      isMajor,
      label: isMajor ? String(deg) : null,
    });
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
      {/* Semi-circle body */}
      <Shape
        width={r * 2}
        height={r + 10}
        shadowBlur={isSelected ? 12 : 5}
        shadowColor="rgba(0,0,0,.18)"
        sceneFunc={(ctx, shape) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, Math.PI, 0, false);
          ctx.closePath();
          ctx.fillStyle = 'rgba(200,230,255,0.82)';
          ctx.fill();
          ctx.strokeStyle = '#3a7ec2';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStrokeShape(shape);
        }}
      />

      {/* Baseline */}
      <Shape
        sceneFunc={(ctx) => {
          ctx.beginPath();
          ctx.moveTo(0, cy);
          ctx.lineTo(r * 2, cy);
          ctx.strokeStyle = '#1a5fa0';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }}
        x={0} y={0} width={r * 2} height={cy}
      />

      {/* Centre mark */}
      <Shape
        sceneFunc={(ctx) => {
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#1a5fa0';
          ctx.fill();
          // Arrow left
          ctx.beginPath();
          ctx.moveTo(cx - 10, cy);
          ctx.lineTo(cx - 20, cy);
          ctx.strokeStyle = '#1a5fa0'; ctx.lineWidth = 1.5; ctx.stroke();
          // Arrow right
          ctx.beginPath();
          ctx.moveTo(cx + 10, cy);
          ctx.lineTo(cx + 20, cy);
          ctx.strokeStyle = '#1a5fa0'; ctx.lineWidth = 1.5; ctx.stroke();
        }}
        x={0} y={0} width={r * 2} height={r}
      />

      {/* Tick marks */}
      <Shape
        sceneFunc={(ctx) => {
          degTicks.forEach(t => {
            ctx.beginPath();
            ctx.moveTo(t.x1, t.y1);
            ctx.lineTo(t.x2, t.y2);
            ctx.strokeStyle = t.isMajor ? '#1a5fa0' : '#5a9fd4';
            ctx.lineWidth = t.isMajor ? 1.5 : 1;
            ctx.stroke();
          });
        }}
        x={0} y={0} width={r * 2} height={r}
      />

      {/* Degree labels at every 30° */}
      {degTicks.filter(t => t.deg % 30 === 0).map(t => {
        const rad = (180 - t.deg) * Math.PI / 180;
        const lx = cx + (r - 26) * Math.cos(rad);
        const ly = cy - (r - 26) * Math.sin(rad);
        return (
          <Text
            key={t.deg}
            x={lx - 14} y={ly - 7}
            width={28} height={14}
            text={`${t.deg}°`}
            fontSize={Math.max(8, r * 0.075)}
            fontFamily="Nunito, sans-serif"
            fontStyle="bold"
            fill="#1a5fa0"
            align="center"
          />
        );
      })}

      {/* 90° label emphasis */}
      <Text
        x={cx - 14}
        y={cy - r + 4}
        width={28}
        text="90°"
        fontSize={Math.max(9, r * 0.082)}
        fontFamily="Nunito, sans-serif"
        fontStyle="bold"
        fill="#1a5fa0"
        align="center"
      />

      {/* Delete badge */}
      {isSelected && (
        <Group x={r * 2 - 8} y={-10} onClick={e => { e.cancelBubble = true; onDelete(obj.id); }}>
          <Rect width={18} height={18} fill="#e74c3c" cornerRadius={9} />
          <Text text="✕" fontSize={10} fill="white" x={4} y={3} />
        </Group>
      )}
    </Group>
  );
}
