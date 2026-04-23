// ============================================================
//  lessons/unit2/L1_Sequences.jsx
//  Unit 2 · Lesson 1: Sequences
//  s1: drag 2 missing terms at the END of each sequence (6 items)
//  s2: drag chips to fill gaps in the MIDDLE of each sequence (6 items)
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

// ── s1: continue sequence (2 missing terms at the end) ──
// Numbers chosen to be larger (4–6 digit) for grade 5 difficulty.
const SEQ_END = [
  { lbl:'a', known:[1250, 1500, 1750, 2000],     next:[2250, 2500],     guided:true,  hint:'+250 each step.' },
  { lbl:'b', known:[12500, 11250, 10000, 8750],  next:[7500, 6250],     guided:true,  hint:'−1250 each step.' },
  { lbl:'c', known:[6, 12, 24, 48],              next:[96, 192] },
  { lbl:'d', known:[100000, 50000, 25000, 12500],next:[6250, 3125] },
  { lbl:'e', known:[34050, 34060, 34070, 34080], next:[34090, 34100] },
  { lbl:'f', known:[125, 250, 500, 1000],        next:[2000, 4000] },
];

// ── s2: gaps in the middle (drag from a 6-card pool) ──
// `seq` is the full 6-element sequence; `gaps` lists the indices that are blank.
const SEQ_MID = [
  { lbl:'a', seq:[1200, 1400, 1600, 1800, 2000, 2200], gaps:[2,3],
    distractors:[1700, 2100], guided:true,
    hint:'+200 each step. The two gaps fall between 1400 and 2000.' },
  { lbl:'b', seq:[5000, 4500, 4000, 3500, 3000, 2500], gaps:[1,4],
    distractors:[3700, 4200], guided:true,
    hint:'−500 each step.' },
  { lbl:'c', seq:[3, 6, 12, 24, 48, 96], gaps:[2,4],
    distractors:[18, 60] },
  { lbl:'d', seq:[10000, 9000, 8000, 7000, 6000, 5000], gaps:[1,2,3],
    distractors:[8500, 7500, 6500] },
  { lbl:'e', seq:[150, 300, 450, 600, 750, 900], gaps:[2,5],
    distractors:[500, 800] },
  { lbl:'f', seq:[81, 27, 9, 3, 1, 0.333], gaps:[1,3],
    distractors:[18, 6] },
];

function grp(arr,n){ const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out; }
function shuffle(a){ const x=[...a]; for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];} return x; }

// Generic chip + drop-zone helpers ───────────────────────────────────
function NumChipBank({ values, used, source, qLbl }) {
  return (
    <div style={{ background:'var(--blue-light)', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 12px', marginBottom:10 }}>
      <div style={{ fontSize:11, fontWeight:800, color:'var(--blue)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.4px' }}>
        🎯 Pool for {qLbl.toUpperCase()}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
        {values.map(v => {
          const isUsed = used.has(String(v));
          return (
            <div
              key={v}
              draggable={!isUsed}
              onDragStart={e => {
                if (isUsed) { e.preventDefault(); return; }
                e.dataTransfer.setData('text/plain', `${source}:${v}`);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              style={{
                background: isUsed ? '#CBD5E1' : 'var(--blue)',
                color: '#fff',
                border: `2px solid ${isUsed ? '#94A3B8' : 'var(--blue-dark)'}`,
                borderRadius: 9, padding: '7px 14px',
                fontSize: 16, fontWeight: 800,
                cursor: isUsed ? 'default' : 'grab',
                opacity: isUsed ? 0.35 : 1, userSelect: 'none', transition: 'transform .1s',
              }}>
              {v}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NumDrop({ value, state, source, onDrop, onClear }) {
  const [over, setOver] = useState(false);
  const bg = state === 'correct' ? 'var(--green-bg)' : state === 'wrong' ? 'var(--red-bg)' : over ? 'var(--blue-light)' : value !== undefined ? '#EEF4FF' : '#F8FAFF';
  const bd = state === 'correct' ? '2.5px solid var(--green)' : state === 'wrong' ? '2.5px solid var(--red)' : over ? '2.5px solid var(--blue)' : value !== undefined ? '2.5px solid var(--blue)' : '2.5px dashed var(--border)';
  const color = state === 'correct' ? 'var(--green)' : state === 'wrong' ? 'var(--red)' : value !== undefined ? 'var(--blue)' : 'var(--muted)';
  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault(); setOver(false);
        const d = e.dataTransfer.getData('text/plain');
        if (d.startsWith(`${source}:`)) onDrop(d.slice(source.length + 1));
      }}
      onClick={() => value !== undefined && onClear()}
      style={{
        minWidth: 76, height: 44, borderRadius: 9,
        border: bd, background: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, fontWeight: 800, padding: '0 10px',
        cursor: value !== undefined ? 'pointer' : 'default', transition: 'all .2s',
      }}>
      {value !== undefined ? value : '?'}
    </div>
  );
}

export default function L1_Sequences() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // s1 state — { lbl: [val, val] }
  const s1F  = state.s1F  || {}, setS1F  = setField('s1F');
  const s1St = state.s1St || {}, setS1St = setField('s1St');
  const s1FB = state.s1FB || {}, setS1FB = setField('s1FB');
  // Stable per-question pools.
  const [s1Bank] = useState(() => Object.fromEntries(SEQ_END.map(q => {
    // Pool: 2 correct + 4 distractors near the answer.
    const a = q.next[0], b = q.next[1];
    const step = b - a;
    const pool = shuffle([a, b, a + step, b + step, a - step, Math.round(a * 1.1)].map(x => Math.round(x * 1000) / 1000));
    return [q.lbl, [...new Set(pool)].slice(0, 6)];
  })));

  // s2 state — { lbl: { gapIdx: val } }
  const s2F  = state.s2F  || {}, setS2F  = setField('s2F');
  const s2St = state.s2St || {}, setS2St = setField('s2St');
  const s2FB = state.s2FB || {}, setS2FB = setField('s2FB');
  const [s2Bank] = useState(() => Object.fromEntries(SEQ_MID.map(q => {
    const correct = q.gaps.map(i => q.seq[i]);
    return [q.lbl, shuffle([...correct, ...q.distractors]).slice(0, 6)];
  })));

  // ═══ s1 handlers ═══
  const s1DropAt = (lbl, slot) => (raw) => {
    if (s1St[lbl] === 'correct') return;
    setS1F(p => {
      const a = [...(p[lbl] || [undefined, undefined])];
      a[slot] = isNaN(Number(raw)) ? raw : Number(raw);
      return { ...p, [lbl]: a };
    });
  };
  const s1Clear = (lbl, slot) => () => {
    if (s1St[lbl] === 'correct') return;
    setS1F(p => {
      const a = [...(p[lbl] || [undefined, undefined])];
      a[slot] = undefined;
      return { ...p, [lbl]: a };
    });
  };
  const checkS1Group = (ga, gi) => {
    increment(`s1g${gi}`); const att = getAtt(`s1g${gi}`) + 1;
    let ok = 0; const ns = { ...s1St };
    ga.forEach(q => {
      const f = s1F[q.lbl] || [];
      const correct = Number(f[0]) === q.next[0] && Number(f[1]) === q.next[1];
      if (correct) { ns[q.lbl] = 'correct'; ok++; }
      else { ns[q.lbl] = 'wrong'; setTimeout(() => setS1St(p => { const x={...p}; if (x[q.lbl]==='wrong') delete x[q.lbl]; return x; }), 1200); }
    });
    setS1St(ns);
    const total = ga.length;
    let fb;
    if (ok === total)  fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
    else if (att >= 3) fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2)fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Find the gap (or ratio) between consecutive terms.` };
    else               fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Subtract two adjacent known terms — that's your step.` };
    setS1FB(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const allG = grp(SEQ_END, 2);
      const correctGroups = Object.values({ ...s1FB, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= allG.length) {
        prog.markDone('s1', { correct: SEQ_END.length, total: SEQ_END.length, attempts: att });
      }
    }
  };

  // ═══ s2 handlers ═══
  const s2DropAt = (lbl, gapIdx) => (raw) => {
    if (s2St[lbl] === 'correct') return;
    setS2F(p => ({
      ...p,
      [lbl]: { ...(p[lbl] || {}), [gapIdx]: isNaN(Number(raw)) ? raw : Number(raw) },
    }));
  };
  const s2Clear = (lbl, gapIdx) => () => {
    if (s2St[lbl] === 'correct') return;
    setS2F(p => {
      const obj = { ...(p[lbl] || {}) };
      delete obj[gapIdx];
      return { ...p, [lbl]: obj };
    });
  };
  const checkS2Group = (ga, gi) => {
    increment(`s2g${gi}`); const att = getAtt(`s2g${gi}`) + 1;
    let ok = 0; const ns = { ...s2St };
    ga.forEach(q => {
      const f = s2F[q.lbl] || {};
      const allOk = q.gaps.every(idx => Number(f[idx]) === q.seq[idx]);
      if (allOk) { ns[q.lbl] = 'correct'; ok++; }
      else { ns[q.lbl] = 'wrong'; setTimeout(() => setS2St(p => { const x={...p}; if (x[q.lbl]==='wrong') delete x[q.lbl]; return x; }), 1200); }
    });
    setS2St(ns);
    const total = ga.length;
    let fb;
    if (ok === total)  fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
    else if (att >= 3) fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2)fb = { type:'hint',    text:`💡 ${ok}/${total} correct. The known terms next to each gap tell you the rule.` };
    else               fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Look at adjacent known numbers to find the step.` };
    setS2FB(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const allG = grp(SEQ_MID, 2);
      const correctGroups = Object.values({ ...s2FB, [gi]: fb }).filter(f => f.type === 'correct').length;
      if (correctGroups >= allG.length) {
        prog.markDone('s2', { correct: SEQ_MID.length, total: SEQ_MID.length, attempts: att });
      }
    }
  };

  const s1Groups = grp(SEQ_END, 2);
  const s2Groups = grp(SEQ_MID, 2);

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 2 · Lesson 1" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Identify, continue and complete number sequences"/>
        <ExplainPanel title="Key Concept: Sequences">
          <RuleBox>
            A <strong>sequence</strong> follows a rule. Find the rule by looking at how each term changes.<br/>
            <strong>1250, 1500, 1750, 2000…</strong> → +250 each step.<br/>
            <strong>5000, 4500, 4000, 3500…</strong> → −500 each step.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* ── s1: continue at end ── */}
        <SectionCard badge={1} title="Continue each sequence — write the next two terms"
          tagType="drag" tagLabel="Drag Chips"
          subtitle="Drag two chips from the pool into the empty boxes. ★ Guided a & b"
          score={prog.done['s1']}>
          {s1Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const filled = s1F[q.lbl] || [undefined, undefined];
                const used = new Set(filled.filter(v => v !== undefined).map(String));
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    {q.guided && (
                      <div style={{ background:'var(--amber-bg)', border:'1px solid var(--amber-border)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'var(--amber)', fontWeight:700, marginBottom:8 }}>
                        💡 {q.hint}
                      </div>
                    )}
                    <QItemLabel><LblCircle letter={q.lbl}/></QItemLabel>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', margin:'10px 0' }}>
                      {q.known.map((v, i) => (
                        <React.Fragment key={i}>
                          <div style={{ background:'#EEF4FF', border:'2px solid var(--border)', borderRadius:8, padding:'7px 12px', fontSize:16, fontWeight:800 }}>{v}</div>
                          <span style={{ color:'var(--muted)', fontWeight:700 }}>→</span>
                        </React.Fragment>
                      ))}
                      <NumDrop value={filled[0]} state={s1St[q.lbl]} source={`s1${q.lbl}`}
                        onDrop={s1DropAt(q.lbl, 0)} onClear={s1Clear(q.lbl, 0)}/>
                      <span style={{ color:'var(--muted)', fontWeight:700 }}>→</span>
                      <NumDrop value={filled[1]} state={s1St[q.lbl]} source={`s1${q.lbl}`}
                        onDrop={s1DropAt(q.lbl, 1)} onClear={s1Clear(q.lbl, 1)}/>
                    </div>
                    <NumChipBank values={s1Bank[q.lbl]} used={used} source={`s1${q.lbl}`} qLbl={q.lbl}/>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkS1Group(ga, gi)} disabled={prog.done['s1']}/>
              {s1FB[gi] && <FeedbackBox type={s1FB[gi].type} message={s1FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s2: gaps in the middle ── */}
        <SectionCard badge={2} title="Fill in the missing terms inside each sequence"
          tagType="drag" tagLabel="Drag Chips"
          subtitle="Drag chips from the pool into the gaps. Each pool contains the correct numbers + a few extras. ★ Guided a & b"
          score={prog.done['s2']}>
          {s2Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const filled = s2F[q.lbl] || {};
                const used = new Set(Object.values(filled).filter(v => v !== undefined).map(String));
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    {q.guided && (
                      <div style={{ background:'var(--amber-bg)', border:'1px solid var(--amber-border)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'var(--amber)', fontWeight:700, marginBottom:8 }}>
                        💡 {q.hint}
                      </div>
                    )}
                    <QItemLabel><LblCircle letter={q.lbl}/></QItemLabel>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', margin:'10px 0' }}>
                      {q.seq.map((v, i) => {
                        const isGap = q.gaps.includes(i);
                        const sep = i < q.seq.length - 1 ? <span style={{ color:'var(--muted)', fontWeight:700 }}>→</span> : null;
                        if (isGap) {
                          return (
                            <React.Fragment key={i}>
                              <NumDrop value={filled[i]} state={s2St[q.lbl]} source={`s2${q.lbl}`}
                                onDrop={s2DropAt(q.lbl, i)} onClear={s2Clear(q.lbl, i)}/>
                              {sep}
                            </React.Fragment>
                          );
                        }
                        return (
                          <React.Fragment key={i}>
                            <div style={{ background:'#EEF4FF', border:'2px solid var(--border)', borderRadius:8, padding:'7px 12px', fontSize:16, fontWeight:800 }}>{v}</div>
                            {sep}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <NumChipBank values={s2Bank[q.lbl]} used={used} source={`s2${q.lbl}`} qLbl={q.lbl}/>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`} onClick={() => checkS2Group(ga, gi)} disabled={prog.done['s2']}/>
              {s2FB[gi] && <FeedbackBox type={s2FB[gi].type} message={s2FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Excellent! You can identify and complete number sequences!" />}
      </div>
    </div>
  );
}
