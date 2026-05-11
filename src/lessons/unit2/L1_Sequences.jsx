// ============================================================
//  lessons/unit2/L1_Sequences.jsx  — Cochin exercises
//  s1: drag 4-chip pool → next 2 terms (Q1 · 5 rows)
//  s2: drag 4-5 chip pool → missing middle terms (Q2 · 6 rows)
//  s3: digit-card input → doubling sequences (Q4 · 4 rows)
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import {
  ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
  FeedbackBox, LblCircle, CheckButton, Summary,
} from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── helpers ──────────────────────────────────────────────────
function grp(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

// ── Section 1 data: count on / back — next 2 terms ───────────
// dis = 2 plausible wrong options (4-chip pool per row)
const SEQ_END = [
  { lbl:'a', known:[281459,281460,281461,281462], next:[281463,281464], step:+1, dis:[281467,281470] },
  { lbl:'b', known:[3470034,3470033,3470032,3470031], next:[3470030,3470029], step:-1, dis:[3470025,3470022] },
  { lbl:'c', known:[9407687,9407688,9407689,9407690], next:[9407691,9407692], step:+1, dis:[9407695,9407698] },
  { lbl:'d', known:[1034066,1034065,1034064,1034063], next:[1034062,1034061], step:-1, dis:[1034057,1034054] },
  { lbl:'e', known:[6418736,6418737,6418738,6418739], next:[6418740,6418741], step:+1, dis:[6418744,6418747] },
];

// ── Section 2 data: fill missing middle terms ─────────────────
// 2-blank rows → 4 chips; 3-blank rows → 5 chips
const SEQ_MID = [
  { lbl:'a', seq:[389450,389452,389454,389456,389458,389460], gaps:[2,3],   dis:[389451,389453] },
  { lbl:'b', seq:[170446,170346,170246,170146,170046,169946], gaps:[1,4],   dis:[170200,169900] },
  { lbl:'c', seq:[405558,406558,407558,408558,409558,410558], gaps:[0,3,5], dis:[404558,411558] },
  { lbl:'d', seq:[7829965,6829965,5829965,4829965,3829965,2829965], gaps:[3,4,5], dis:[1829965,8829965] },
  { lbl:'e', seq:[9277548,9277448,9277348,9277248,9277148,9277048], gaps:[2,3,5], dis:[9276948,9277550] },
  { lbl:'f', seq:[4000570,4000580,4000590,4000600,4000610,4000620], gaps:[1,2,3], dis:[4000560,4000640] },
];

// ── Section 3 data: each number is double the previous ────────
// Full 7-term sequences; positions 0,1 and 5,6 are blanks
const DBL_SEQ = [
  { lbl:'a', seq:[2,4,8,16,32,64,128] },
  { lbl:'b', seq:[11,22,44,88,176,352,704] },
  { lbl:'c', seq:[2.5,5,10,20,40,80,160] },
  { lbl:'d', seq:[7.5,15,30,60,120,240,480] },
];

// ── Inline components ─────────────────────────────────────────
function NumChipBank({ values, used, source }) {
  return (
    <div style={{
      background:'var(--blue-light)', border:'1.5px solid var(--border)',
      borderRadius:10, padding:'10px 12px', marginBottom:10,
    }}>
      <div style={{ fontSize:11, fontWeight:800, color:'var(--blue)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.4px' }}>
        🎯 Drag a chip to each blank
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
                color:'#fff',
                border:`2px solid ${isUsed ? '#94A3B8' : 'var(--blue-dark)'}`,
                borderRadius:9, padding:'7px 18px',
                fontSize:16, fontWeight:800,
                cursor: isUsed ? 'default' : 'grab',
                opacity: isUsed ? 0.35 : 1,
                userSelect:'none',
              }}
            >
              {v.toLocaleString()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NumDrop({ value, state, source, onDrop, onClear }) {
  const [over, setOver] = useState(false);
  const bg =
    state === 'correct' ? 'var(--green-bg)'   :
    state === 'wrong'   ? 'var(--red-bg)'     :
    over                ? 'var(--blue-light)' :
    value !== undefined ? '#EEF4FF'           : '#F8FAFF';
  const bd =
    state === 'correct' ? '2.5px solid var(--green)' :
    state === 'wrong'   ? '2.5px solid var(--red)'   :
    over                ? '2.5px solid var(--blue)'  :
    value !== undefined ? '2.5px solid var(--blue)'  : '2.5px dashed var(--border)';
  const col =
    state === 'correct' ? 'var(--green)' :
    state === 'wrong'   ? 'var(--red)'   :
    value !== undefined ? 'var(--blue)'  : 'var(--muted)';
  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        e.preventDefault(); setOver(false);
        const d = e.dataTransfer.getData('text/plain');
        if (d.startsWith(`${source}:`)) onDrop(d.slice(source.length + 1));
      }}
      onClick={() => value !== undefined && state !== 'correct' && onClear()}
      style={{
        minWidth:90, height:44, borderRadius:9,
        border:bd, background:bg, color:col,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:15, fontWeight:800, padding:'0 10px',
        cursor: value !== undefined && state !== 'correct' ? 'pointer' : 'default',
        transition:'all .2s',
      }}
    >
      {value !== undefined ? Number(value).toLocaleString() : '?'}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function L1_Sequences() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // s1 state
  const s1F  = state.s1F  || {}, setS1F  = setField('s1F');
  const s1St = state.s1St || {}, setS1St = setField('s1St');
  const s1FB = state.s1FB || {}, setS1FB = setField('s1FB');
  const [s1Bank] = useState(() =>
    Object.fromEntries(SEQ_END.map(q =>
      [q.lbl, shuffle([...q.next, ...q.dis])]
    ))
  );

  // s2 state
  const s2F  = state.s2F  || {}, setS2F  = setField('s2F');
  const s2St = state.s2St || {}, setS2St = setField('s2St');
  const s2FB = state.s2FB || {}, setS2FB = setField('s2FB');
  const [s2Bank] = useState(() =>
    Object.fromEntries(SEQ_MID.map(q => {
      const correct = q.gaps.map(i => q.seq[i]);
      return [q.lbl, shuffle([...correct, ...q.dis])];
    }))
  );

  // s3 state
  const s3F  = state.s3F  || {}, setS3F  = setField('s3F');
  const s3St = state.s3St || {}, setS3St = setField('s3St');
  const s3FB = state.s3FB || {}, setS3FB = setField('s3FB');

  // ── s1 handlers ───────────────────────────────────────────────
  const s1Drop = (lbl, slot) => raw => {
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
    increment(`s1g${gi}`);
    const att = getAtt(`s1g${gi}`) + 1;
    // Compute ok BEFORE setState
    let ok = 0;
    ga.forEach(q => {
      const f = s1F[q.lbl] || [];
      if (Number(f[0]) === q.next[0] && Number(f[1]) === q.next[1]) ok++;
    });
    const ns = { ...s1St };
    ga.forEach(q => {
      const f = s1F[q.lbl] || [];
      const correct = Number(f[0]) === q.next[0] && Number(f[1]) === q.next[1];
      if (correct) { ns[q.lbl] = 'correct'; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setS1St(p => { const x = {...p}; if (x[q.lbl] === 'wrong') delete x[q.lbl]; return x; }), 1200);
      }
    });
    setS1St(ns);
    const total = ga.length;
    let fb;
    if (ok === total)   fb = { type:'correct', text:`✓ ${ok}/${total} correct!` };
    else if (att >= 3)  fb = { type:'hint',    text:'Keep trying! Look carefully at whether numbers increase or decrease, and by exactly how much.' };
    else if (att === 2) fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Subtract any two adjacent terms to find the step, then add it twice.` };
    else                fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Count on or back from the last number shown.` };
    const updatedFB = { ...s1FB, [gi]: fb };
    setS1FB(updatedFB);
    if (ok === total) {
      const correctGroups = Object.values(updatedFB).filter(f => f.type === 'correct').length;
      if (correctGroups >= grp(SEQ_END, 2).length) {
        prog.markDone('s1', { correct: SEQ_END.length, total: SEQ_END.length, attempts: att });
      }
    }
  };

  // ── s2 handlers ───────────────────────────────────────────────
  const s2Drop = (lbl, gapIdx) => raw => {
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
    increment(`s2g${gi}`);
    const att = getAtt(`s2g${gi}`) + 1;
    // Compute ok BEFORE setState
    let ok = 0;
    ga.forEach(q => {
      const f = s2F[q.lbl] || {};
      if (q.gaps.every(idx => Number(f[idx]) === q.seq[idx])) ok++;
    });
    const ns = { ...s2St };
    ga.forEach(q => {
      const f = s2F[q.lbl] || {};
      const allOk = q.gaps.every(idx => Number(f[idx]) === q.seq[idx]);
      if (allOk) { ns[q.lbl] = 'correct'; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setS2St(p => { const x = {...p}; if (x[q.lbl] === 'wrong') delete x[q.lbl]; return x; }), 1200);
      }
    });
    setS2St(ns);
    const total = ga.length;
    let fb;
    if (ok === total)   fb = { type:'correct', text:`✓ ${ok}/${total} correct!` };
    else if (att >= 3)  fb = { type:'hint',    text:'Keep trying! Use the known terms on either side of each gap to work out the step.' };
    else if (att === 2) fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Subtract two neighbouring known terms — that gives the step size.` };
    else                fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Find the rule: what is the same each time between consecutive terms?` };
    const updatedFB = { ...s2FB, [gi]: fb };
    setS2FB(updatedFB);
    if (ok === total) {
      const correctGroups = Object.values(updatedFB).filter(f => f.type === 'correct').length;
      if (correctGroups >= grp(SEQ_MID, 2).length) {
        prog.markDone('s2', { correct: SEQ_MID.length, total: SEQ_MID.length, attempts: att });
      }
    }
  };

  // ── s3 handlers ───────────────────────────────────────────────
  const s3Drop = (lbl, pos) => data => {
    const sideKey = `${lbl}-${pos <= 1 ? 'left' : 'right'}`;
    if (s3St[sideKey] === 'correct') return;
    setS3F(p => {
      const row = p[lbl] || {};
      const cur = row[pos] || [];
      let next;
      if (data === 'del') next = cur.slice(0, -1);
      else if (data.startsWith('digit:')) next = [...cur, data.slice(6)];
      else return p;
      return { ...p, [lbl]: { ...row, [pos]: next } };
    });
  };
  const s3Remove = (lbl, pos) => idx => {
    const sideKey = `${lbl}-${pos <= 1 ? 'left' : 'right'}`;
    if (s3St[sideKey] === 'correct') return;
    setS3F(p => {
      const row = p[lbl] || {};
      const cur = row[pos] || [];
      return { ...p, [lbl]: { ...row, [pos]: cur.filter((_, i) => i !== idx) } };
    });
  };
  const checkS3Side = (lbl, side) => {
    const q = DBL_SEQ.find(x => x.lbl === lbl);
    const positions = side === 'left' ? [0, 1] : [5, 6];
    const f = s3F[lbl] || {};
    increment(`s3-${lbl}-${side}`);
    const att = getAtt(`s3-${lbl}-${side}`) + 1;
    // Compute correctness BEFORE setState
    const allCorrect = positions.every(pos => {
      const entered = (f[pos] || []).join('');
      const expected = String(q.seq[pos]);
      return entered === expected;
    });
    const newSt = { ...s3St, [`${lbl}-${side}`]: allCorrect ? 'correct' : 'wrong' };
    setS3St(newSt);
    if (!allCorrect) {
      setTimeout(() => setS3St(p => {
        const x = {...p};
        if (x[`${lbl}-${side}`] === 'wrong') delete x[`${lbl}-${side}`];
        return x;
      }), 1200);
    }
    let fb;
    if (allCorrect)    fb = { type:'correct', text:'✓ Correct!' };
    else if (att >= 3) fb = { type:'hint',    text: side === 'left' ? 'Divide the first visible number by 2 to get the term before it, then divide again.' : 'Multiply the last visible number by 2 to get the next term, then multiply again.' };
    else if (att === 2)fb = { type:'hint',    text:'💡 Each term is double the one before it — work backwards (÷2) for the left blanks and forwards (×2) for the right.' };
    else               fb = { type:'wrong',   text:'✗ Not quite. Remember: every number is exactly double the one before it.' };
    const updatedFB = { ...s3FB, [`${lbl}-${side}`]: fb };
    setS3FB(updatedFB);
    if (allCorrect) {
      const allDone = DBL_SEQ.every(dq =>
        newSt[`${dq.lbl}-left`] === 'correct' && newSt[`${dq.lbl}-right`] === 'correct'
      );
      if (allDone) prog.markDone('s3', { correct: 8, total: 8, attempts: att });
    }
  };

  const s1Groups = grp(SEQ_END, 2);
  const s2Groups = grp(SEQ_MID, 2);
  const s3Groups = grp(DBL_SEQ, 2);

  const Arrow = () => (
    <span style={{ color:'var(--muted)', fontWeight:700, fontSize:18, flexShrink:0 }}>→</span>
  );
  const KnownChip = ({ v }) => (
    <div style={{
      background:'#EEF4FF', border:'2px solid var(--border)',
      borderRadius:8, padding:'7px 12px',
      fontSize:16, fontWeight:800, whiteSpace:'nowrap',
    }}>
      {typeof v === 'number' && Number.isInteger(v) ? v.toLocaleString() : v}
    </div>
  );
  // Amber chip for anchor (known middle) terms in s3
  const AnchorChip = ({ v }) => (
    <div style={{
      background:'#FEF3C7', border:'2px solid #D97706',
      borderRadius:8, padding:'7px 12px',
      fontSize:16, fontWeight:800, color:'#92400E', whiteSpace:'nowrap',
    }}>
      {v}
    </div>
  );

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 2 · Lesson 1" completed={prog.completedCount} total={3} />
      <div className="page">
        <ObjectiveCard text="Identify, continue and complete number sequences" />
        <ExplainPanel title="Key Concept: Sequences">
          <RuleBox>
            A <strong>sequence</strong> follows a rule. Find the rule by looking at how consecutive terms change.<br />
            <strong>Count on:</strong> add the same amount each step. &nbsp;
            <strong>Count back:</strong> subtract each step.<br />
            <strong>Doubling:</strong> multiply each term by 2 to get the next one.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={3} />

        {/* ── Section 1 ── */}
        <SectionCard
          badge={1}
          title="Count on or back — write the next two numbers"
          tagType="drag" tagLabel="Drag Chips"
          subtitle="Find the rule, then drag two chips from the pool into the empty boxes."
          score={prog.done['s1']}
        >
          {s1Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const filled = s1F[q.lbl] || [undefined, undefined];
                const used = new Set(filled.filter(v => v !== undefined).map(String));
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    <QItemLabel><LblCircle letter={q.lbl} /></QItemLabel>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', margin:'10px 0' }}>
                      {q.known.map((v, i) => (
                        <React.Fragment key={i}>
                          <KnownChip v={v} />
                          <Arrow />
                        </React.Fragment>
                      ))}
                      <NumDrop value={filled[0]} state={s1St[q.lbl]} source={`s1${q.lbl}`}
                        onDrop={s1Drop(q.lbl, 0)} onClear={s1Clear(q.lbl, 0)} />
                      <Arrow />
                      <NumDrop value={filled[1]} state={s1St[q.lbl]} source={`s1${q.lbl}`}
                        onDrop={s1Drop(q.lbl, 1)} onClear={s1Clear(q.lbl, 1)} />
                    </div>
                    <NumChipBank values={s1Bank[q.lbl]} used={used} source={`s1${q.lbl}`} />
                  </QItem>
                );
              })}
              <CheckButton
                label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkS1Group(ga, gi)}
                disabled={!!prog.done['s1']}
              />
              {s1FB[gi] && <FeedbackBox type={s1FB[gi].type} message={s1FB[gi].text} />}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── Section 2 ── */}
        <SectionCard
          badge={2}
          title="Find the missing numbers in each sequence"
          tagType="drag" tagLabel="Drag Chips"
          subtitle="Drag chips from the pool into the gaps. 2-blank rows have 4 chips; 3-blank rows have 5 chips."
          score={prog.done['s2']}
        >
          {s2Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const filled = s2F[q.lbl] || {};
                const used = new Set(
                  Object.values(filled).filter(v => v !== undefined).map(String)
                );
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    <QItemLabel><LblCircle letter={q.lbl} /></QItemLabel>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', margin:'10px 0' }}>
                      {q.seq.map((v, i) => {
                        const isGap = q.gaps.includes(i);
                        const sep = i < q.seq.length - 1 ? <Arrow key={`sep${i}`} /> : null;
                        return (
                          <React.Fragment key={i}>
                            {isGap ? (
                              <NumDrop
                                value={filled[i]} state={s2St[q.lbl]}
                                source={`s2${q.lbl}`}
                                onDrop={s2Drop(q.lbl, i)}
                                onClear={s2Clear(q.lbl, i)}
                              />
                            ) : (
                              <KnownChip v={v} />
                            )}
                            {sep}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <NumChipBank values={s2Bank[q.lbl]} used={used} source={`s2${q.lbl}`} />
                  </QItem>
                );
              })}
              <CheckButton
                label={`✓ Check ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkS2Group(ga, gi)}
                disabled={!!prog.done['s2']}
              />
              {s2FB[gi] && <FeedbackBox type={s2FB[gi].type} message={s2FB[gi].text} />}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── Section 3 ── */}
        <SectionCard
          badge={3}
          title="Each number is double the previous — write the missing numbers"
          tagType="drag" tagLabel="Number Cards"
          subtitle="Drag digit cards to build each missing number. The amber numbers are given. Fill the 2 blanks on the left, then the 2 blanks on the right."
          score={prog.done['s3']}
        >
          {s3Groups.map((ga, gi) => (
            <QGroup key={gi} title={`Questions ${ga.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q, qi) => {
                const f = s3F[q.lbl] || {};
                const leftKey  = `${q.lbl}-left`;
                const rightKey = `${q.lbl}-right`;
                const leftSt   = s3St[leftKey]  || 'default';
                const rightSt  = s3St[rightKey] || 'default';
                return (
                  <QItem key={q.lbl} last={qi === ga.length - 1}>
                    <QItemLabel><LblCircle letter={q.lbl} /></QItemLabel>

                    {/* Sequence overview — blanks shown as ? placeholders */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', margin:'8px 0 16px' }}>
                      {q.seq.map((v, i) => (
                        <React.Fragment key={i}>
                          {[0,1,5,6].includes(i) ? (
                            <div style={{
                              minWidth:44, height:38, borderRadius:8,
                              border:'2px dashed #CBD5E1', background:'#F8FAFF',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:18, fontWeight:800, color:'#CBD5E1',
                            }}>?</div>
                          ) : (
                            <AnchorChip v={v} />
                          )}
                          {i < 6 && <Arrow />}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Left and right input areas side by side */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                      {/* Left — 2 blanks before */}
                      <div style={{
                        background:'var(--blue-light)', border:'1.5px solid var(--border)',
                        borderRadius:10, padding:12,
                      }}>
                        <div style={{ fontSize:12, fontWeight:800, color:'var(--blue)', marginBottom:8 }}>
                          ← Fill the 2 numbers BEFORE
                        </div>
                        <DigitPalette paletteId={`s3${q.lbl}L`} />
                        <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                          <DigitDropZone
                            digits={f[0] || []} zoneState={leftSt}
                            onDrop={s3Drop(q.lbl, 0)} onRemove={s3Remove(q.lbl, 0)}
                          />
                          <DigitDropZone
                            digits={f[1] || []} zoneState={leftSt}
                            onDrop={s3Drop(q.lbl, 1)} onRemove={s3Remove(q.lbl, 1)}
                          />
                        </div>
                        <CheckButton
                          label="✓ Check Left"
                          onClick={() => checkS3Side(q.lbl, 'left')}
                          disabled={leftSt === 'correct'}
                        />
                        {s3FB[leftKey] && <FeedbackBox type={s3FB[leftKey].type} message={s3FB[leftKey].text} />}
                      </div>

                      {/* Right — 2 blanks after */}
                      <div style={{
                        background:'#FFF7ED', border:'1.5px solid #D97706',
                        borderRadius:10, padding:12,
                      }}>
                        <div style={{ fontSize:12, fontWeight:800, color:'#92400E', marginBottom:8 }}>
                          Fill the 2 numbers AFTER →
                        </div>
                        <DigitPalette paletteId={`s3${q.lbl}R`} />
                        <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                          <DigitDropZone
                            digits={f[5] || []} zoneState={rightSt}
                            onDrop={s3Drop(q.lbl, 5)} onRemove={s3Remove(q.lbl, 5)}
                          />
                          <DigitDropZone
                            digits={f[6] || []} zoneState={rightSt}
                            onDrop={s3Drop(q.lbl, 6)} onRemove={s3Remove(q.lbl, 6)}
                          />
                        </div>
                        <CheckButton
                          label="✓ Check Right"
                          onClick={() => checkS3Side(q.lbl, 'right')}
                          disabled={rightSt === 'correct'}
                        />
                        {s3FB[rightKey] && <FeedbackBox type={s3FB[rightKey].type} message={s3FB[rightKey].text} />}
                      </div>
                    </div>
                  </QItem>
                );
              })}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && (
          <Summary message="Excellent! You can identify, continue and complete number sequences!" />
        )}
      </div>
    </div>
  );
}
