// ============================================================
//  EquationRows.jsx — equation row snap strip (mode C)
// ============================================================

const uid = () => Math.random().toString(36).slice(2, 9);

// Card display font size
const cardFs = (text) => {
  if (text.length <= 2)  return '1.3rem';
  if (text.length <= 5)  return '.9rem';
  if (text.length <= 10) return '.72rem';
  return '.62rem';
};

const SLOT_COUNT = 8;

function makeRow() {
  return {
    id: 'eq-' + uid(),
    slots: Array.from({ length: SLOT_COUNT }, () => ({ id: 'sl-' + uid(), card: null })),
  };
}

export function makeInitialRow() { return makeRow(); }

export default function EquationRows({ rows, pendingCard, onPlace, onRemoveCard, onRemoveRow, onAddRow, onAddToBoard }) {
  return (
    <div className="wb-eq-area">
      <div className="wb-eq-banner">
        <span>📐 Equation Row Mode</span>
        <button className="wb-eq-add-row" onClick={onAddRow}>+ New Row</button>
      </div>

      {rows.map(row => (
        <div key={row.id} className="wb-eq-row">
          {row.slots.map(slot => (
            <div
              key={slot.id}
              className={`wb-eq-slot${slot.card ? ' filled' : ''}`}
              onClick={() => {
                if (!slot.card && pendingCard) {
                  onPlace(row.id, slot.id, pendingCard);
                }
              }}
              title={slot.card ? slot.card.val : (pendingCard ? `Place "${pendingCard.val}" here` : 'Empty slot')}
            >
              {slot.card && (
                <div className="wb-eq-card" style={{ fontSize: cardFs(slot.card.val) }}>
                  <span style={{ color: slot.card.color, fontFamily: 'Nunito, sans-serif', fontWeight: 900 }}>
                    {slot.card.val}
                  </span>
                  <span
                    className="eq-del"
                    onClick={e => { e.stopPropagation(); onRemoveCard(row.id, slot.id); }}
                    title="Remove card"
                  >✕</span>
                </div>
              )}
              {!slot.card && pendingCard && (
                <span style={{ color: 'rgba(79,142,247,.5)', fontSize: '.7rem', fontWeight: 700 }}>+</span>
              )}
            </div>
          ))}
          <button
            className="wb-eq-to-board"
            onClick={() => onAddToBoard(row.id)}
            title="Add this equation to the board as a draggable group"
          >→ Board</button>
          <button
            className="wb-eq-row-del"
            onClick={() => onRemoveRow(row.id)}
            title="Delete this row"
          >✕</button>
        </div>
      ))}
    </div>
  );
}
