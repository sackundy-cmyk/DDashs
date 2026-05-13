// ============================================================
//  AbacusNode.jsx — interactive 10×10 abacus (click to slide)
// ============================================================
import { Group, Rect, Line, Circle, Text } from 'react-konva';

const ROWS       = 10;
const BEADS_PER  = 10;
const BEAD_R     = 9;
const ROW_H      = 26;
const ROD_LEFT   = 32;   // x where rod starts
const ROD_RIGHT  = 232;  // x where rod ends
const BEAD_GAP   = 20;   // horizontal spacing
const AB_W       = ROD_RIGHT + 10;
const AB_H       = ROWS * ROW_H + 20;

// Colours per row (rainbow-ish)
const ROW_COLORS = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c','#3498db','#9b59b6','#e91e8c','#00bcd4','#95a5a6'];

export default function AbacusNode({ obj, isSelected, onSelect, onUpdate, onDelete, tool }) {
  const beads = obj.beads || Array.from({ length: ROWS }, () => Array(BEADS_PER).fill(false));

  const handleDragEnd = (e) => onUpdate(obj.id, { x: e.target.x(), y: e.target.y() });
  const handleTransformEnd = (e) => {
    const node = e.target;
    onUpdate(obj.id, { x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
  };

  const toggleBead = (row, col) => {
    if (tool !== 'select') return;
    const next = beads.map((r, ri) => ri === row ? r.map((b, ci) => ci === col ? !b : b) : r);
    onUpdate(obj.id, { beads: next });
  };

  return (
    <Group
      id={obj.id}
      x={obj.x}
      y={obj.y}
      scaleX={obj.scaleX || 1}
      scaleY={obj.scaleY || 1}
      rotation={obj.rotation || 0}
      draggable={tool === 'select'}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      onClick={() => { if (tool === 'select') onSelect(obj.id); }}
    >
      {/* Frame */}
      <Rect
        width={AB_W}
        height={AB_H}
        fill="#fdf6e3"
        stroke="#c4883a"
        strokeWidth={2}
        cornerRadius={6}
        shadowBlur={isSelected ? 12 : 5}
        shadowColor="rgba(0,0,0,.2)"
      />

      {/* Title bar */}
      <Rect x={0} y={0} width={AB_W} height={20} fill="#c4883a" cornerRadius={[6, 6, 0, 0]} />
      <Text x={4} y={4} text="Abacus" fontSize={11} fontFamily="Nunito, sans-serif" fontStyle="bold" fill="white" />
      <Text x={AB_W - 50} y={4} text="Click beads" fontSize={9} fontFamily="Nunito, sans-serif" fill="rgba(255,255,255,.6)" />

      {/* Rows */}
      {beads.map((row, ri) => {
        const y = 20 + ri * ROW_H + ROW_H / 2;
        const counted = row.filter(Boolean).length;
        return (
          <Group key={ri}>
            {/* Rod */}
            <Line
              points={[ROD_LEFT, y, ROD_RIGHT, y]}
              stroke="#b0824a"
              strokeWidth={2}
            />
            {/* Row label */}
            <Text
              x={2} y={y - 8}
              width={28}
              text={String(ri + 1)}
              fontSize={11}
              fontFamily="Nunito, sans-serif"
              fontStyle="bold"
              fill="#6b4c1e"
              align="right"
            />
            {/* Count display */}
            <Text
              x={ROD_RIGHT + 4}
              y={y - 8}
              text={String(counted)}
              fontSize={11}
              fontFamily="Nunito, sans-serif"
              fontStyle="bold"
              fill={counted > 0 ? ROW_COLORS[ri] : '#aaa'}
            />
            {/* Beads */}
            {row.map((active, ci) => {
              const bx = active
                ? ROD_LEFT + ci * BEAD_GAP + BEAD_R        // counted side (left)
                : ROD_RIGHT - (BEADS_PER - 1 - ci) * BEAD_GAP - BEAD_R; // free side (right)
              return (
                <Circle
                  key={ci}
                  x={bx}
                  y={y}
                  radius={BEAD_R}
                  fill={active ? ROW_COLORS[ri] : '#ccc'}
                  stroke={active ? ROW_COLORS[ri].replace(')', ',0.6)').replace('rgb','rgba') : '#bbb'}
                  strokeWidth={1}
                  onClick={e => { e.cancelBubble = true; toggleBead(ri, ci); }}
                  onTap={e => { e.cancelBubble = true; toggleBead(ri, ci); }}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
          </Group>
        );
      })}

      {/* Delete badge */}
      {isSelected && (
        <Group x={AB_W - 8} y={-10} onClick={e => { e.cancelBubble = true; onDelete(obj.id); }}>
          <Rect width={18} height={18} fill="#e74c3c" cornerRadius={9} />
          <Text text="✕" fontSize={10} fill="white" x={4} y={3} />
        </Group>
      )}
    </Group>
  );
}
