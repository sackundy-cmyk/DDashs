// ============================================================
//  lessons/unit2/L2_NegativeNumbers.jsx
//  Unit 2 · Lesson 2: Negative Numbers
//  s1: Read negative numbers from 3 number lines (9 arrows, MCQ)
//  s2: Order temperatures coldest → warmest (6 cards, drag)
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── s1: 3 number lines, 9 arrows total ──
const LINES = [
  { id:'L1', min:-10, max:0, step:1, arrows:[
    { lbl:'a', val:-8, guided:true, hint:'Count ticks from −10 towards 0. Each tick = 1.' },
    { lbl:'b', val:-4, guided:true, hint:'Start at 0 and count left. Each step = 1.' },
    { lbl:'c', val:-1, guided:true, hint:'This arrow sits just one step left of 0.' },
  ]},
  { id:'L2', min:-20, max:0, step:2, arrows:[
    { lbl:'d', val:-14 },
    { lbl:'e', val:-8  },
    { lbl:'f', val:-2  },
  ]},
  { id:'L3', min:-100, max:0, step:10, arrows:[
    { lbl:'g', val:-90 },
    { lbl:'h', val:-50 },
    { lbl:'i', val:-30 },
  ]},
];

// ── s2: 6 temperature cards (ordering) ──
const TEMPS = [
  { val: 8.5,  label:'8.5°C'  },
  { val: 6,    label:'6°C'    },
  { val: -8,   label:'−8°C'   },
  { val: -4,   label:'−4°C'   },
  { val: -11,  label:'−11°C'  },
  { val: 1.5,  label:'1.5°C'  },
];
const TEMPS_SORTED = [...TEMPS].sort((a,b) => a.val - b.val); // coldest → warmest

// ── Helpers ──
function shuffle(a){ const x=[...a]; for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];} return x; }

// Build 4-option MCQ for a given arrow value (correct + 3 nearby distractors).
function buildOpts(val, min, max, step) {
  const seen = new Set([val]);
  const tweaks = [-step, step, -2*step, 2*step, -3*step, 3*step];
  const wrongs = [];
  tweaks.forEach(t => { const w = val + t; if (!seen.has(w) && w >= min && w <= max) { seen.add(w); wrongs.push(w); } });
  for (let v = min; v <= max && wrongs.length < 3; v += step) { if (!seen.has(v)) { seen.add(v); wrongs.push(v); } }
  return shuffle([val, ...wrongs.slice(0, 3)]);
}

// SVG number line showing labeled ticks + red arrows at each arrow.val.
function NumberLine({ line }) {
  const W = 620, H = 90, padL = 40, padR = 40;
  const span = line.max - line.min;
  const x = v => padL + ((v - line.min) / span) * (W - padL - padR);
  const ticks = [];
  for (let v = line.min; v <= line.max; v += line.step) ticks.push(v);
  return (
    <div style={{ overflowX:'auto', margin:'6px 0 14px' }}>
      <svg width={W} height={H} style={{ display:'block', minWidth:W }}>
        {/* track */}
        <line x1={padL} y1={50} x2={W - padR} y2={50} stroke="#1E40AF" strokeWidth="2.5"/>
        {/* ticks */}
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={x(v)} y1={44} x2={x(v)} y2={56} stroke="#1E40AF" strokeWidth="2"/>
            {(v === line.min || v === line.max) && <text x={x(v)} y={76} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1E40AF">{v}</text>}
          </g>
        ))}
        {/* arrows */}
        {line.arrows.map(a => (
          <g key={a.lbl}>
            <polygon points={`${x(a.val)},42 ${x(a.val)-8},26 ${x(a.val)+8},26`} fill="#DC2626"/>
            <text x={x(a.val)} y={20} textAnchor="middle" fontSize="15" fontWeight="900" fill="#DC2626">{a.lbl}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function L2_NegativeNumbers() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // s1 state — one MCQ per arrow.
  const s1Sel = state.s1Sel || {}, setS1Sel = setField('s1Sel');
  const s1St  = state.s1St  || {}, setS1St  = setField('s1St');
  const s1FB  = state.s1FB  || {}, setS1FB  = setField('s1FB');

  // Stable option order per arrow.
  const [s1Opts] = useState(() => {
    const out = {};
    LINES.forEach(l => l.arrows.forEach(a => { out[a.lbl] = buildOpts(a.val, l.min, l.max, l.step); }));
    return out;
  });

  // s2 state: track which temp is in which slot (0..5).
  const s2Slots = state.s2Slots || {}, setS2Slots = setField('s2Slots');
  const s2St    = state.s2St    || {}, setS2St    = setField('s2St');
  const s2FB    = state.s2FB    ?? null, setS2FB  = setField('s2FB');
  const [bankOrder] = useState(() => shuffle(TEMPS.map(t => t.val)));

  // ═══ s1 checking ═══
  const checkS1Line = (line) => {
    const key = `s1_${line.id}`;
    increment(key); const att = getAtt(key) + 1;
    let ok = 0; const ns = { ...s1St };
    line.arrows.forEach(a => {
      const sel = s1Sel[a.lbl];
      if (sel === a.val) { ns[`${a.lbl}-${sel}`] = 'correct'; ok++; }
      else if (sel !== undefined) { ns[`${a.lbl}-${sel}`] = 'wrong'; }
    });
    setS1St(ns);
    const total = line.arrows.length;
    let fb;
    if (ok === total)  fb = { type:'correct', text:`🎉 ${ok}/${total} correct on ${line.id}!` };
    else if (att >= 3) fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2)fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Count ticks carefully — on this line each tick is ${line.step}.` };
    else               fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Remember, numbers get smaller as you go left of 0.` };
    setS1FB(p => ({ ...p, [line.id]: fb }));

    // Section complete only when all 3 lines passed.
    if (ok === total) {
      const merged = { ...s1FB, [line.id]: fb };
      const allOk = LINES.every(l => merged[l.id] && merged[l.id].type === 'correct');
      if (allOk) {
        const totalArrows = LINES.reduce((n, l) => n + l.arrows.length, 0);
        prog.markDone('s1', { correct: totalArrows, total: totalArrows, attempts: att });
      }
    }
  };

  // ═══ s2 drag/drop + check ═══
  const s2Drop = (slotIdx) => (rawVal) => {
    const v = Number(rawVal);
    setS2Slots(prev => {
      const ns = { ...prev };
      // If this temp was already in a different slot, clear that slot.
      Object.keys(ns).forEach(k => { if (ns[k] === v) delete ns[k]; });
      ns[slotIdx] = v;
      return ns;
    });
  };
  const s2Clear = (slotIdx) => () => {
    setS2Slots(prev => { const ns = { ...prev }; delete ns[slotIdx]; return ns; });
  };
  const checkS2 = () => {
    increment('s2'); const att = getAtt('s2') + 1;
    let ok = 0; const ns = {};
    TEMPS_SORTED.forEach((t, idx) => {
      if (s2Slots[idx] === t.val) { ns[idx] = 'correct'; ok++; }
      else if (s2Slots[idx] !== undefined) { ns[idx] = 'wrong'; }
    });
    setS2St(ns);
    const total = TEMPS_SORTED.length;
    let fb;
    if (ok === total)  fb = { type:'correct', text:`🎉 ${ok}/${total} correct! Perfect temperature ordering.` };
    else if (att >= 3) fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2)fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Negative temperatures are below zero — −11 is colder than −4.` };
    else               fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Start with the most negative number on the left.` };
    setS2FB(fb);
    if (ok === total) prog.markDone('s2', { correct: total, total, attempts: att });
  };

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 2 · Lesson 2 · Negative Numbers" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Read negative numbers on number lines and order positive and negative temperatures"/>
        <ExplainPanel title="Key Concept: Negative Numbers">
          <RuleBox>
            Numbers less than 0 are <strong>negative</strong>. On a number line, they go to the <strong>left</strong> of zero.<br/>
            A bigger negative number is <strong>smaller</strong>: <strong>−11 &lt; −8 &lt; −4 &lt; 0 &lt; 6</strong>.<br/>
            <strong>Ordering temperatures:</strong> −11°C is colder than −4°C, which is colder than 0°C.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* ── s1: number lines ── */}
        <SectionCard badge={1} title="Write the number each arrow points to"
          tagType="mcq" tagLabel="MCQ"
          subtitle="Read each arrow on the three number lines. ★ Guided arrows a–c"
          score={prog.done['s1']}>
          {LINES.map(line => (
            <QGroup key={line.id} title={`${line.id}: from ${line.min} to ${line.max} (step ${line.step})`}>
              <NumberLine line={line}/>
              {line.arrows.map((a, ai) => {
                const opts = s1Opts[a.lbl].map(o => ({
                  id: String(o), label: String(o),
                  state: s1St[`${a.lbl}-${o}`] || (s1Sel[a.lbl] === o ? 'selected' : 'default'),
                }));
                return (
                  <QItem key={a.lbl} last={ai === line.arrows.length - 1}>
                    {a.guided && (
                      <div style={{ background:'var(--amber-bg)', border:'1px solid var(--amber-border)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'var(--amber)', fontWeight:700, marginBottom:8 }}>
                        💡 {a.hint}
                      </div>
                    )}
                    <QItemLabel>
                      <LblCircle letter={a.lbl}/>
                      <span style={{ fontSize:16, fontWeight:700 }}>Arrow <strong>{a.lbl}</strong> points to:</span>
                    </QItemLabel>
                    <MCQOptions
                      options={opts}
                      onSelect={o => setS1Sel(p => ({ ...p, [a.lbl]: Number(o) }))}
                    />
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${line.id}`} onClick={() => checkS1Line(line)} disabled={prog.done['s1']}/>
              {s1FB[line.id] && <FeedbackBox type={s1FB[line.id].type} message={s1FB[line.id].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s2: temperature ordering ── */}
        <SectionCard badge={2} title="Write these temperatures in order — start with the lowest"
          tagType="drag" tagLabel="Drag & Drop"
          subtitle="Drag the temperature cards into order from coldest (left) to warmest (right)."
          score={prog.done['s2']}>
          {/* Bank (unused temps) */}
          <div style={{ background:'var(--blue-light)', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 12px', marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--blue)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.4px' }}>
              🌡️ Drag cards into the order below
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {bankOrder.map(v => {
                const placed = Object.values(s2Slots).includes(v);
                const t = TEMPS.find(x => x.val === v);
                return (
                  <div
                    key={v}
                    draggable={!placed}
                    onDragStart={e => {
                      if (placed) { e.preventDefault(); return; }
                      e.dataTransfer.setData('text/plain', `temp:${v}`);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    style={{
                      background: placed ? '#CBD5E1' : 'var(--blue)',
                      color:'#fff',
                      border:`2px solid ${placed ? '#94A3B8' : 'var(--blue-dark)'}`,
                      borderRadius:10, padding:'10px 16px',
                      fontSize:18, fontWeight:900,
                      cursor: placed ? 'default' : 'grab',
                      opacity: placed ? 0.35 : 1,
                      userSelect:'none',
                    }}>
                    {t.label}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Slots */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:14 }}>
            <span style={{ fontSize:13, fontWeight:800, color:'var(--blue)' }}>← Coldest</span>
            {[0,1,2,3,4,5].map(idx => {
              const v = s2Slots[idx];
              const t = v !== undefined ? TEMPS.find(x => x.val === v) : null;
              const state = s2St[idx];
              const bg = state === 'correct' ? 'var(--green-bg)' : state === 'wrong' ? 'var(--red-bg)' : v !== undefined ? '#EEF4FF' : '#F8FAFF';
              const bd = state === 'correct' ? '2.5px solid var(--green)' : state === 'wrong' ? '2.5px solid var(--red)' : v !== undefined ? '2.5px solid var(--blue)' : '2.5px dashed var(--border)';
              const color = state === 'correct' ? 'var(--green)' : state === 'wrong' ? 'var(--red)' : v !== undefined ? 'var(--blue)' : 'var(--muted)';
              return (
                <div
                  key={idx}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const d = e.dataTransfer.getData('text/plain');
                    if (d.startsWith('temp:')) s2Drop(idx)(d.slice(5));
                  }}
                  onClick={() => v !== undefined && s2Clear(idx)()}
                  style={{
                    minWidth: 90, height: 52, borderRadius: 10,
                    border: bd, background: bg, color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, fontWeight: 900, padding: '0 10px',
                    cursor: v !== undefined ? 'pointer' : 'default',
                  }}>
                  {t ? t.label : `#${idx + 1}`}
                </div>
              );
            })}
            <span style={{ fontSize:13, fontWeight:800, color:'var(--red)' }}>Warmest →</span>
          </div>
          <CheckButton label="✓ Check order" onClick={checkS2} disabled={prog.done['s2']}/>
          {s2FB && <FeedbackBox type={s2FB.type} message={s2FB.text}/>}
        </SectionCard>

        {prog.allDone && <Summary message="Excellent! You can read negative numbers and order temperatures!" />}
      </div>
    </div>
  );
}
