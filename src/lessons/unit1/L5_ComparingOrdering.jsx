// ============================================================
//  lessons/unit1/L5_ComparingOrdering.jsx
//  Unit 1 · Lesson 5: Comparing and Ordering Decimals
//  2 sections:
//    s1  Order 3 numbers — some smallest-first, some largest-first
//    s2  Order 4 numbers — always smallest first
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── s1: Order 3 numbers ──────────────────────────────────────
// order:'asc'  → smallest first  □ < □ < □
// order:'desc' → largest first   □ > □ > □
const ORDER3_Q = [
  { lbl:'a', nums:['17.451','17.47','17.5'],   order:'asc',
    ans:['17.451','17.47','17.5'],
    guided:true, hint:'All start with 17. Compare tenths → both .4. Hundredths: 5 < 7. Then 17.5 = 17.500, the largest.' },
  { lbl:'b', nums:['28.93','28.927','20.845'], order:'asc',
    ans:['20.845','28.927','28.93'],
    guided:true, hint:'Units differ: 20 < 28, so 20.845 is smallest. Compare 28.927 vs 28.930 — .927 < .930.' },
  { lbl:'c', nums:['0.933','0.098','0.903'],   order:'asc',  ans:['0.098','0.903','0.933'] },
  { lbl:'d', nums:['7.444','7.058','7.94'],    order:'asc',  ans:['7.058','7.444','7.94'] },
  { lbl:'e', nums:['27.52','27.091','27.089'], order:'desc', ans:['27.52','27.091','27.089'] },
  { lbl:'f', nums:['14.67','14.649','14.269'], order:'desc', ans:['14.67','14.649','14.269'] },
  { lbl:'g', nums:['29.23','29.241','29.238'], order:'desc', ans:['29.241','29.238','29.23'] },
  { lbl:'h', nums:['4.009','4.109','40.1'],    order:'desc', ans:['40.1','4.109','4.009'] },
];

// ── s2: Order 4 numbers — always smallest first ───────────────
const ORDER4_Q = [
  { lbl:'a', nums:['11.085','11.516','11.805','11.85'],
    ans:['11.085','11.516','11.805','11.85'],
    guided:true, hint:'All start with 11. Tenths: 0 < 5 < 8 = 8. For the two 11.8 values — hundredths: 0 < 5, so 11.805 < 11.85.' },
  { lbl:'b', nums:['0.125','0.109','0.87','0.111'],
    ans:['0.109','0.111','0.125','0.87'],
    guided:true, hint:'Tenths: 0, 0, 8, 0 — so 0.87 is largest. Compare the three 0.1xx values by hundredths: 0 < 1 < 2.' },
  { lbl:'c', nums:['7.268','7.6','7.29','7.608'],    ans:['7.268','7.29','7.6','7.608'] },
  { lbl:'d', nums:['20.32','20.123','20.09','20.299'],ans:['20.09','20.123','20.299','20.32'] },
];

// ── Helpers ──────────────────────────────────────────────────
function grp(arr,n){ const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out; }
function sh(a){ const x=[...a]; for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];} return x; }

// ── Cloud-shaped draggable number chip ───────────────────────
function CloudChip({ value, disabled }) {
  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => {
        if (disabled) { e.preventDefault(); return; }
        e.dataTransfer.setData('text/plain', `order:${value}`);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: disabled
          ? 'linear-gradient(135deg,#E2E8F0,#CBD5E1)'
          : 'linear-gradient(135deg,#1E40AF,#1565C0)',
        color: disabled ? '#94A3B8' : '#fff',
        border: `2.5px solid ${disabled ? '#CBD5E1' : '#1E3A8A'}`,
        borderRadius: '48% 52% 44% 56% / 56% 44% 56% 44%',
        padding: 'clamp(6px,1.5vw,10px) clamp(10px,3vw,20px)',
        fontSize: 'clamp(14px,3vw,18px)', fontWeight: 900,
        fontFamily: 'var(--font)',
        cursor: disabled ? 'default' : 'grab',
        userSelect: 'none',
        opacity: disabled ? 0.35 : 1,
        transition: 'all .15s',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(30,64,175,0.30)',
        minWidth: 'clamp(56px,14vw,76px)', textAlign: 'center',
      }}
    >
      {value}
    </div>
  );
}

// ── Drop zone for ordering boxes ─────────────────────────────
function OrderDrop({ value, state, onDrop, onClick }) {
  const [over, setOver] = useState(false);
  const locked = state === 'correct';
  const bg = state === 'correct' ? 'var(--green-bg)' : state === 'wrong' ? 'var(--red-bg)'
    : over ? '#EEF4FF' : value ? '#F0F7FF' : '#F8FAFF';
  const bd = state === 'correct' ? '2.5px solid var(--green)' : state === 'wrong' ? '2.5px solid var(--red)'
    : over ? '2.5px solid var(--blue)' : value ? '2.5px solid var(--blue)' : '2.5px dashed #94A3B8';
  const color = state === 'correct' ? 'var(--green)' : state === 'wrong' ? 'var(--red)'
    : value ? '#1E40AF' : '#94A3B8';
  return (
    <div
      onDragOver={e => { e.preventDefault(); if(!locked) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault(); setOver(false);
        if (locked) return;
        const d = e.dataTransfer.getData('text/plain');
        if (d.startsWith('order:')) onDrop(d.slice(6));
      }}
      onClick={() => !locked && value && onClick && onClick()}
      style={{
        minWidth: 'clamp(52px,13vw,88px)', height: 'clamp(38px,7.5vw,50px)', borderRadius: 10,
        border: bd, background: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'clamp(13px,3vw,18px)', fontWeight: 900,
        padding: '0 clamp(4px,1.5vw,10px)',
        fontFamily: 'var(--font)',
        cursor: value && !locked ? 'pointer' : 'default',
        transition: 'all .2s',
      }}
      title={value && !locked ? 'Click to remove' : ''}
    >
      {value || '?'}
    </div>
  );
}

export default function L5_ComparingOrdering() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // Shuffle pool display order once on mount
  const [pools] = useState(() => ({
    s1: Object.fromEntries(ORDER3_Q.map(q => [q.lbl, sh(q.nums)])),
    s2: Object.fromEntries(ORDER4_Q.map(q => [q.lbl, sh(q.nums)])),
  }));

  // ── s1 state ──
  const s1Filled = state.s1Filled || {}, setS1Filled = setField('s1Filled');
  const s1St     = state.s1St     || {}, setS1St     = setField('s1St');
  const s1FB     = state.s1FB     || {}, setS1FB     = setField('s1FB');

  // ── s2 state ──
  const s2Filled = state.s2Filled || {}, setS2Filled = setField('s2Filled');
  const s2St     = state.s2St     || {}, setS2St     = setField('s2St');
  const s2FB     = state.s2FB     || {}, setS2FB     = setField('s2FB');

  // ── Drop / clear handlers ────────────────────────────────────
  const makeDropAt = (filled, setFilled, slots, st) => (lbl, idx) => (val) => {
    if (st[lbl] === 'correct') return;
    setFilled(p => {
      const a = [...(p[lbl] || Array(slots).fill(undefined))];
      const existing = a.indexOf(val);
      if (existing !== -1) a[existing] = undefined;
      a[idx] = val;
      return { ...p, [lbl]: a };
    });
  };
  const makeClear = (filled, setFilled, slots, st) => (lbl, idx) => () => {
    if (st[lbl] === 'correct') return;
    setFilled(p => {
      const a = [...(p[lbl] || Array(slots).fill(undefined))];
      a[idx] = undefined;
      return { ...p, [lbl]: a };
    });
  };

  const s1DropAt = makeDropAt(s1Filled, setS1Filled, 3, s1St);
  const s1Clear  = makeClear(s1Filled, setS1Filled, 3, s1St);
  const s2DropAt = makeDropAt(s2Filled, setS2Filled, 4, s2St);
  const s2Clear  = makeClear(s2Filled, setS2Filled, 4, s2St);

  // ── s1 check ─────────────────────────────────────────────────
  const checkS1Group = (ga, gi) => {
    increment(`s1g${gi}`); const att = getAtt(`s1g${gi}`) + 1;
    let ok = 0;
    const ns = { ...s1St };
    ga.forEach(q => {
      const filled = s1Filled[q.lbl] || [];
      const correct = q.ans.every((a, i) => filled[i] === a);
      if (correct) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setS1St(p => { const x={...p}; if(x[q.lbl]==='wrong') delete x[q.lbl]; return x; }), 1200);
      }
    });
    setS1St(ns);
    const total = ga.length;
    let fb;
    if (ok === total)  fb = { type:'correct', text:`🎉 ${ok}/${total} correct! Great ordering!` };
    else if (att >= 3) fb = { type:'hint',    text:'Keep trying! Line up the decimal points and compare digit by digit from left to right.' };
    else if (att === 2)fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Start with the leftmost digit that differs between the numbers.` };
    else               fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Compare tenths first, then hundredths, then thousandths.` };
    setS1FB(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const allG = grp(ORDER3_Q, 2);
      const correctGroups = Object.values({ ...s1FB, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= allG.length)
        prog.markDone('s1', { correct: ORDER3_Q.length, total: ORDER3_Q.length, attempts: att });
    }
  };

  // ── s2 check ─────────────────────────────────────────────────
  const checkS2Group = (ga, gi) => {
    increment(`s2g${gi}`); const att = getAtt(`s2g${gi}`) + 1;
    let ok = 0;
    const ns = { ...s2St };
    ga.forEach(q => {
      const filled = s2Filled[q.lbl] || [];
      const correct = q.ans.every((a, i) => filled[i] === a);
      if (correct) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setS2St(p => { const x={...p}; if(x[q.lbl]==='wrong') delete x[q.lbl]; return x; }), 1200);
      }
    });
    setS2St(ns);
    const total = ga.length;
    let fb;
    if (ok === total)  fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
    else if (att >= 3) fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2)fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Compare place by place — tenths first, then hundredths, then thousandths.` };
    else               fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Pad shorter decimals with zeros before comparing (e.g. 7.6 = 7.600).` };
    setS2FB(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const allG = grp(ORDER4_Q, 2);
      const correctGroups = Object.values({ ...s2FB, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= allG.length)
        prog.markDone('s2', { correct: ORDER4_Q.length, total: ORDER4_Q.length, attempts: att });
    }
  };

  const s1Groups = grp(ORDER3_Q, 2);
  const s2Groups = grp(ORDER4_Q, 2);

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 1 · Lesson 5 · Comparing Decimals" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Compare and order decimal numbers up to thousandths using the < and > signs"/>
        <ExplainPanel title="Key Concept: Comparing Decimals">
          <RuleBox>
            <strong>Compare digit by digit, left to right.</strong><br/>
            1. Same whole number? → Compare <strong>tenths</strong>.<br/>
            2. Same tenths? → Compare <strong>hundredths</strong>.<br/>
            3. Same hundredths? → Compare <strong>thousandths</strong>.<br/>
            💡 Tip: Pad shorter decimals with zeros — <strong>7.6 = 7.600</strong> and <strong>14.67 = 14.670</strong>.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* ── s1: Order 3 numbers ── */}
        <SectionCard badge={1}
          title="Write each set of numbers in order"
          tagType="drag" tagLabel="Drag"
          subtitle="Drag the cloud numbers into the boxes in the correct order. ★ Guided a & b"
          score={prog.done['s1']}>
          {s1Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const filled  = s1Filled[q.lbl] || [undefined, undefined, undefined];
                const usedSet = new Set(filled.filter(Boolean));
                const sign    = q.order === 'asc' ? '<' : '>';
                const label   = q.order === 'asc' ? 'smallest → largest' : 'largest → smallest';
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    {q.guided && (
                      <div style={{ background:'var(--amber-bg)', border:'1px solid var(--amber-border)', borderRadius:8, padding:'8px 12px', fontSize:14, color:'var(--amber)', fontWeight:700, marginBottom:10 }}>
                        💡 {q.hint}
                      </div>
                    )}
                    <QItemLabel>
                      <LblCircle letter={q.lbl}/>
                      <span style={{ fontSize:20, fontWeight:700, color:'var(--muted)' }}>Start with the <strong style={{ color: q.order === 'asc' ? 'var(--blue-dark)' : '#DC2626' }}>{label}</strong></span>
                    </QItemLabel>

                    {/* Pool row */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:16, padding:'12px 0' }}>
                      {pools.s1[q.lbl].map(v => (
                        <CloudChip key={v} value={v} disabled={usedSet.has(v) || s1St[q.lbl] === 'correct'}/>
                      ))}
                    </div>

                    {/* Drop boxes row — each [box + sign] is a flex item so they wrap as a pair */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      {[0,1,2].map(idx => (
                        <div key={idx} style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <OrderDrop
                            value={filled[idx]}
                            state={s1St[q.lbl]}
                            onDrop={s1DropAt(q.lbl, idx)}
                            onClick={s1Clear(q.lbl, idx)}
                          />
                          {idx < 2 && (
                            <span style={{ fontSize:'clamp(16px,4vw,24px)', fontWeight:900, color: q.order === 'asc' ? 'var(--blue-dark)' : '#DC2626', lineHeight:1 }}>
                              {sign}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkS1Group(ga, gi)} disabled={prog.done['s1']}/>
              {s1FB[gi] && <FeedbackBox type={s1FB[gi].type} message={s1FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s2: Order 4 numbers ── */}
        <SectionCard badge={2}
          title="Write each set of numbers in order — smallest first"
          tagType="drag" tagLabel="Drag"
          subtitle="Drag all four clouds into the boxes, smallest on the left. ★ Guided a & b"
          score={prog.done['s2']}>
          {s2Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const filled  = s2Filled[q.lbl] || [undefined, undefined, undefined, undefined];
                const usedSet = new Set(filled.filter(Boolean));
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    {q.guided && (
                      <div style={{ background:'var(--amber-bg)', border:'1px solid var(--amber-border)', borderRadius:8, padding:'8px 12px', fontSize:14, color:'var(--amber)', fontWeight:700, marginBottom:10 }}>
                        💡 {q.hint}
                      </div>
                    )}
                    <QItemLabel>
                      <LblCircle letter={q.lbl}/>
                      <span style={{ fontSize:20, fontWeight:700, color:'var(--muted)' }}>
                        Smallest <strong style={{ color:'var(--blue-dark)' }}>→</strong> Largest
                      </span>
                    </QItemLabel>

                    {/* Pool row */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:16, padding:'12px 0' }}>
                      {pools.s2[q.lbl].map(v => (
                        <CloudChip key={v} value={v} disabled={usedSet.has(v) || s2St[q.lbl] === 'correct'}/>
                      ))}
                    </div>

                    {/* Drop boxes row — each [box + sign] is a flex item so they wrap as a pair */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      {[0,1,2,3].map(idx => (
                        <div key={idx} style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <OrderDrop
                            value={filled[idx]}
                            state={s2St[q.lbl]}
                            onDrop={s2DropAt(q.lbl, idx)}
                            onClick={s2Clear(q.lbl, idx)}
                          />
                          {idx < 3 && (
                            <span style={{ fontSize:'clamp(16px,4vw,24px)', fontWeight:900, color:'var(--blue-dark)', lineHeight:1 }}>{'<'}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkS2Group(ga, gi)} disabled={prog.done['s2']}/>
              {s2FB[gi] && <FeedbackBox type={s2FB[gi].type} message={s2FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Well done! You can compare and order decimals using < and > with confidence!" />}
      </div>
    </div>
  );
}
