// ============================================================
//  CardPanel.jsx — right panel with collapsible card groups
// ============================================================
import { useState } from 'react';

const CARD_COLORS = ['#1e2130','#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#e91e8c','#00bcd4'];

// Font sizes for cards in the panel based on text length
const panelFontSize = (text) => {
  if (text.length <= 2)  return '1.4rem';
  if (text.length <= 4)  return '1rem';
  if (text.length <= 8)  return '.78rem';
  if (text.length <= 12) return '.68rem';
  return '.62rem';
};

const GROUPS = [
  {
    id: 'numbers',
    label: 'Numbers',
    color: '#1e2130',
    cards: ['0','1','2','3','4','5','6','7','8','9','·',','],
  },
  {
    id: 'operators',
    label: 'Operators',
    color: '#1565C0',
    cards: ['+','−','×','÷','=','(',')','%','x²','√'],
  },
  {
    id: 'pv-whole',
    label: 'Place Value (Whole)',
    color: '#065f46',
    cards: ['Ones','Tens','Hundreds','Thousands','Ten Thousands','Hundred Thousands','Millions'],
  },
  {
    id: 'pv-decimal',
    label: 'Place Value (Decimal)',
    color: '#1d4ed8',
    cards: ['Tenths','Hundredths','Thousandths','Ten Thousandths'],
  },
  {
    id: 'fractions',
    label: 'Fractions',
    color: '#6d28d9',
    cards: ['Numerator','Denominator','Fraction Bar'],
  },
];

export default function CardPanel({ pendingCard, onCardClick, drawColor }) {
  const [openGroups, setOpenGroups] = useState({ numbers: true, operators: true, 'pv-whole': false, 'pv-decimal': false, fractions: false });

  const toggle = (id) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside className="wb-panel" role="complementary">
      <div style={{ padding: '8px 8px 4px', fontSize: '.62rem', fontWeight: 800, color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.06)', marginBottom: 2 }}>
        Card Panel
      </div>
      {GROUPS.map(group => (
        <div key={group.id} className="wb-group">
          <div
            className={`wb-group-header ${openGroups[group.id] ? 'open' : ''}`}
            onClick={() => toggle(group.id)}
          >
            <span>{group.label}</span>
            <span className="chevron">{openGroups[group.id] ? '▲' : '▼'}</span>
          </div>

          {openGroups[group.id] && (
            <div className="wb-group-cards">
              {group.cards.map(val => {
                const isPending = pendingCard?.val === val && pendingCard?.group === group.id;
                return (
                  <button
                    key={val}
                    className={`wb-src-card${isPending ? ' pending-match' : ''}`}
                    style={{
                      color: group.color,
                      fontSize: panelFontSize(val),
                      borderLeft: `3px solid ${group.color}20`,
                    }}
                    onClick={() => onCardClick({ val, color: drawColor, group: group.id })}
                    title={`Click then click on board to place`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </aside>
  );
}
