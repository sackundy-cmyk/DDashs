// ============================================================
//  interactions/VennDiagrams.jsx
//  Venn2Diagram — 2 circles (left / both / right)
//  Venn3Diagram — 3 circles (7 zones + outside)
// ============================================================

import React, { useState } from 'react';

/* ─── shared placed-item pill ─────────────────────────────── */
function ZoneItem({ value, state, onClick }) {
  const s = {
    ok:      { bg: 'var(--green-bg)', border: '2px solid var(--green)', color: 'var(--green)' },
    bad:     { bg: 'var(--red-bg)',   border: '2px solid var(--red)',   color: 'var(--red)'   },
    rev:     { bg: 'var(--green-bg)', border: '2px dashed var(--green)',color: 'var(--green)' },
    placed:  { bg: '#fff',            border: '2px solid #64748B',      color: '#1E293B'      },
  }[state || 'placed'];

  return (
    <span
      onClick={state === 'placed' ? onClick : undefined}
      style={{
        ...s, borderRadius: 999, padding: '3px 9px',
        fontSize: 13, fontWeight: 900, cursor: state === 'placed' ? 'pointer' : 'default',
        display: 'inline-block', margin: 2,
      }}
    >
      {value}
    </span>
  );
}

/* ─── Venn2Diagram ────────────────────────────────────────── */
export function Venn2Diagram({ leftLabel, rightLabel, numbers, onComplete }) {
  // placed: { [num]: 'left' | 'both' | 'right' | null }
  const [placed, setPlaced] = useState({});
  const [states, setStates] = useState({});   // num → 'ok'|'bad'|'rev'
  const [over, setOver]     = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [att, setAtt]       = useState(0);

  const getZoneNums = (zone) => Object.entries(placed).filter(([, z]) => z === zone).map(([n]) => parseInt(n));

  const placeNum = (num, zone) => {
    setPlaced(prev => ({ ...prev, [num]: zone }));
  };
  const returnNum = (num) => {
    setPlaced(prev => ({ ...prev, [num]: null }));
    setStates(prev => { const s = { ...prev }; delete s[num]; return s; });
  };

  const makeDrop = (zone) => ({
    onDragOver: (e) => { e.preventDefault(); setOver(zone); },
    onDragLeave: () => setOver(null),
    onDrop: (e) => {
      e.preventDefault(); setOver(null);
      const data = e.dataTransfer.getData('text/plain');
      try { const { num } = JSON.parse(data); placeNum(num, zone); } catch {}
    },
  });

  const check = () => {
    const newAtt = att + 1;
    setAtt(newAtt);
    let correct = 0;
    const newStates = {};

    numbers.forEach(n => {
      const inLeft  = n % parseInt(leftLabel.replace(/\D/g, '')) === 0;
      const inRight = n % parseInt(rightLabel.replace(/\D/g, '')) === 0;
      const expected = inLeft && inRight ? 'both' : inLeft ? 'left' : inRight ? 'right' : null;
      if (expected && placed[n] === expected) { newStates[n] = 'ok'; correct++; }
      else if (expected) {
        newStates[n] = newAtt >= 3 ? 'rev' : 'bad';
        if (newAtt >= 3) placeNum(n, expected);
      }
    });
    setStates(newStates);

    const total = numbers.filter(n => {
      const l = parseInt(leftLabel.replace(/\D/g, '')), r = parseInt(rightLabel.replace(/\D/g, ''));
      return n % l === 0 || n % r === 0;
    }).length;

    if (correct === total) {
      setFeedback({ type: 'correct', text: `🎉 Perfect! All ${total} numbers in the right section!` });
      if (onComplete) onComplete({ correct, total });
    } else if (newAtt >= 3) {
      setFeedback({ type: 'hint', text: '✅ Correct placements revealed. Middle = multiples of BOTH numbers.' });
      if (onComplete) onComplete({ correct, total });
    } else if (newAtt === 2) {
      setFeedback({ type: 'hint', text: `💡 ${correct}/${total} correct. Numbers divisible by BOTH go in the middle!` });
    } else {
      setFeedback({ type: 'wrong', text: `✗ Some wrong. Is the number in the left, right, or both circles?` });
    }
  };

  const zoneDropStyle = (zone) => ({
    outline: over === zone ? '3px dashed var(--green)' : 'none',
    outlineOffset: 2, borderRadius: 8,
  });

  return (
    <div>
      {/* Bubble bank */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8,
        background: 'var(--blue-light)', border: '1.5px solid var(--border)',
        borderRadius: 10, padding: '10px 12px', marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', width: '100%', marginBottom: 4 }}>
          🃏 Drag each number into the correct section
        </div>
        {numbers.map(n => placed[n] ? null : (
          <div
            key={n}
            draggable
            onDragStart={(e) => { e.dataTransfer.setData('text/plain', JSON.stringify({ num: n })); }}
            style={{
              background: '#fff', border: '2.5px solid var(--blue)', borderRadius: 999,
              padding: '6px 14px', fontSize: 15, fontWeight: 900, color: 'var(--blue-dark)',
              cursor: 'grab', userSelect: 'none',
            }}
          >
            {n}
          </div>
        ))}
      </div>

      {/* SVG + overlay */}
      <div style={{ position: 'relative', maxWidth: 560 }}>
        <svg viewBox="0 0 560 308" style={{ width: '100%' }}>
          <rect x="5" y="5" width="550" height="298" rx="12" fill="#F8FAFF" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="200" cy="154" r="130" fill="rgba(251,146,60,.2)" stroke="#FB923C" strokeWidth="2.5" />
          <circle cx="360" cy="154" r="130" fill="rgba(250,204,21,.22)" stroke="#EAB308" strokeWidth="2.5" />
          <text x="70"  y="270" fontFamily="Nunito,sans-serif" fontSize="13" fontWeight="800" fill="#C2410C">{leftLabel}</text>
          <text x="370" y="270" fontFamily="Nunito,sans-serif" fontSize="13" fontWeight="800" fill="#A16207">{rightLabel}</text>
        </svg>
        {/* Left zone */}
        <div {...makeDrop('left')} style={{ position:'absolute', left:'5%', top:'15%', width:'30%', height:'70%', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', ...zoneDropStyle('left') }}>
          {getZoneNums('left').map(n => <ZoneItem key={n} value={n} state={states[n]} onClick={() => returnNum(n)} />)}
        </div>
        {/* Both zone */}
        <div {...makeDrop('both')} style={{ position:'absolute', left:'37%', top:'15%', width:'26%', height:'70%', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', ...zoneDropStyle('both') }}>
          {getZoneNums('both').map(n => <ZoneItem key={n} value={n} state={states[n]} onClick={() => returnNum(n)} />)}
        </div>
        {/* Right zone */}
        <div {...makeDrop('right')} style={{ position:'absolute', left:'65%', top:'15%', width:'30%', height:'70%', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', ...zoneDropStyle('right') }}>
          {getZoneNums('right').map(n => <ZoneItem key={n} value={n} state={states[n]} onClick={() => returnNum(n)} />)}
        </div>
      </div>

      {/* Check */}
      <div style={{ marginTop: 12 }}>
        <button onClick={check} style={{
          background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 10,
          padding: '12px 26px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          ✓ Check Venn Diagram
        </button>
        {feedback && (
          <div style={{
            background: feedback.type === 'correct' ? 'var(--green-bg)' : feedback.type === 'wrong' ? 'var(--red-bg)' : 'var(--amber-bg)',
            color: feedback.type === 'correct' ? 'var(--green)' : feedback.type === 'wrong' ? 'var(--red)' : 'var(--amber)',
            border: `1.5px solid ${feedback.type === 'correct' ? 'var(--green-border)' : feedback.type === 'wrong' ? 'var(--red-border)' : 'var(--amber-border)'}`,
            borderRadius: 10, padding: '12px 16px', fontSize: 15, fontWeight: 700, marginTop: 10,
          }}>
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}
