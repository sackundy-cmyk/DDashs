// ============================================================
//  lessons/unit7/L1_NumberLineIntegers.jsx
//  Unit 7 · Lesson 1: Integers on a Number Line
//  s1: Read 6 arrows on a number line (digit drag-drop, 3 pairs)
//  s2: Difference between pairs of points (MCQ, 4 questions)
//  s3: Strict inequalities — which integer fits? (MCQ, 2 groups)
//  s4: Non-strict inequalities — which integer fits? (MCQ, 2 groups)
//  s5: Order temperatures lowest → highest (drag-drop)
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── Q1: Number line arrows (−20 to 10, 6 labeled arrows) ──────
const Q1_ARROWS = [
  { lbl: 'a', val: -18, ans: ['-','1','8'] },
  { lbl: 'b', val: -15, ans: ['-','1','5'] },
  { lbl: 'c', val: -12, ans: ['-','1','2'] },
  { lbl: 'd', val:  -4, ans: ['-','4']     },
  { lbl: 'e', val:  -2, ans: ['-','2']     },
  { lbl: 'f', val:   7, ans: ['7']         },
];
// max 2 DigitDropZones per DigitPalette → 3 pairs
const Q1_PAIRS = [
  [Q1_ARROWS[0], Q1_ARROWS[1]],
  [Q1_ARROWS[2], Q1_ARROWS[3]],
  [Q1_ARROWS[4], Q1_ARROWS[5]],
];

// ── Q2: Difference between pairs (MCQ, 1 correct + 3 distractors) ──
const Q2 = [
  { lbl:'a', p1:'a', p2:'c', correct:'6',
    opts:[{id:'6',label:'6'},{id:'4',label:'4'},{id:'8',label:'8'},{id:'30',label:'30'}] },
  { lbl:'b', p1:'d', p2:'e', correct:'2',
    opts:[{id:'2',label:'2'},{id:'6',label:'6'},{id:'1',label:'1'},{id:'4',label:'4'}] },
  { lbl:'c', p1:'b', p2:'f', correct:'22',
    opts:[{id:'22',label:'22'},{id:'20',label:'20'},{id:'24',label:'24'},{id:'8',label:'8'}] },
  { lbl:'d', p1:'e', p2:'a', correct:'16',
    opts:[{id:'16',label:'16'},{id:'18',label:'18'},{id:'14',label:'14'},{id:'20',label:'20'}] },
];

// ── Q3: Strict inequalities (MCQ) ─────────────────────────────
const Q3 = [
  { lbl:'a', display:'−4 < □ < 0',    correct:'-3',
    opts:[{id:'-3',label:'−3'},{id:'-5',label:'−5'},{id:'0',label:'0'},{id:'1',label:'1'}] },
  { lbl:'b', display:'−11 < □ < −8',  correct:'-9',
    opts:[{id:'-9',label:'−9'},{id:'-11',label:'−11'},{id:'-7',label:'−7'},{id:'-12',label:'−12'}] },
  { lbl:'c', display:'−3 < □ < 2',    correct:'0',
    opts:[{id:'0',label:'0'},{id:'-3',label:'−3'},{id:'2',label:'2'},{id:'-4',label:'−4'}] },
  { lbl:'d', display:'−21 < □ < −17', correct:'-19',
    opts:[{id:'-19',label:'−19'},{id:'-21',label:'−21'},{id:'-17',label:'−17'},{id:'-22',label:'−22'}] },
  { lbl:'e', display:'−9 > □ > −12',  correct:'-10',
    opts:[{id:'-10',label:'−10'},{id:'-9',label:'−9'},{id:'-12',label:'−12'},{id:'-13',label:'−13'}] },
  { lbl:'f', display:'−1 > □ > −6',   correct:'-3',
    opts:[{id:'-3',label:'−3'},{id:'-1',label:'−1'},{id:'-6',label:'−6'},{id:'-7',label:'−7'}] },
  { lbl:'g', display:'−5 > □ > −9',   correct:'-7',
    opts:[{id:'-7',label:'−7'},{id:'-5',label:'−5'},{id:'-4',label:'−4'},{id:'-9',label:'−9'}] },
  { lbl:'h', display:'−19 > □ > −23', correct:'-21',
    opts:[{id:'-21',label:'−21'},{id:'-19',label:'−19'},{id:'-23',label:'−23'},{id:'-18',label:'−18'}] },
];
const Q3_G1 = Q3.slice(0, 4);
const Q3_G2 = Q3.slice(4, 8);

// ── Q4: Non-strict inequalities (MCQ) ─────────────────────────
const Q4 = [
  { lbl:'a', display:'−7 ≤ □ ≤ −2',   correct:'-5',
    opts:[{id:'-5',label:'−5'},{id:'-8',label:'−8'},{id:'-1',label:'−1'},{id:'0',label:'0'}] },
  { lbl:'b', display:'−1 ≤ □ ≤ 4',    correct:'2',
    opts:[{id:'2',label:'2'},{id:'-2',label:'−2'},{id:'5',label:'5'},{id:'6',label:'6'}] },
  { lbl:'c', display:'−14 ≤ □ ≤ −8',  correct:'-11',
    opts:[{id:'-11',label:'−11'},{id:'-15',label:'−15'},{id:'-7',label:'−7'},{id:'-6',label:'−6'}] },
  { lbl:'d', display:'−6 ≤ □ ≤ −1',   correct:'-4',
    opts:[{id:'-4',label:'−4'},{id:'-7',label:'−7'},{id:'0',label:'0'},{id:'1',label:'1'}] },
  { lbl:'e', display:'0 ≥ □ ≥ −5',    correct:'-3',
    opts:[{id:'-3',label:'−3'},{id:'-6',label:'−6'},{id:'1',label:'1'},{id:'2',label:'2'}] },
  { lbl:'f', display:'−2 ≥ □ ≥ −4',   correct:'-3',
    opts:[{id:'-3',label:'−3'},{id:'-5',label:'−5'},{id:'-1',label:'−1'},{id:'0',label:'0'}] },
  { lbl:'g', display:'3 ≥ □ ≥ −1',    correct:'1',
    opts:[{id:'1',label:'1'},{id:'-2',label:'−2'},{id:'4',label:'4'},{id:'5',label:'5'}] },
  { lbl:'h', display:'−15 ≥ □ ≥ −19', correct:'-17',
    opts:[{id:'-17',label:'−17'},{id:'-20',label:'−20'},{id:'-14',label:'−14'},{id:'-13',label:'−13'}] },
];
const Q4_G1 = Q4.slice(0, 4);
const Q4_G2 = Q4.slice(4, 8);

// ── Q6: Temperature ordering ───────────────────────────────────
const TEMPS = [
  { val:  38, label: '38°'  },
  { val:  -7, label: '−7°'  },
  { val: -14, label: '−14°' },
  { val:   0, label: '0°'   },
  { val:  27, label: '27°'  },
  { val: -24, label: '−24°' },
];
const TEMPS_SORTED = [...TEMPS].sort((a, b) => a.val - b.val);

function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

// ── SVG number line (−20 to 10) ────────────────────────────────
function Q1NumberLine() {
  const W = 700, H = 100, padL = 50, padR = 50;
  const innerW = W - padL - padR;
  const MIN = -20, MAX = 10, SPAN = MAX - MIN;
  const xOf = v => padL + ((v - MIN) / SPAN) * innerW;

  const ticks = [];
  for (let v = MIN; v <= MAX; v++) ticks.push(v);
  const labeled = [-20, -15, -10, -5, 0, 5, 10];

  return (
    <div style={{ overflowX: 'auto', margin: '6px 0 18px' }}>
      <svg width={W} height={H} style={{ display: 'block', minWidth: W }}>
        {/* track */}
        <line x1={padL - 10} y1={52} x2={W - padR + 10} y2={52} stroke="#1E40AF" strokeWidth="2.5"/>
        {/* right arrowhead */}
        <polygon points={`${W-padR+14},52 ${W-padR+2},46 ${W-padR+2},58`} fill="#1E40AF"/>
        {/* ticks */}
        {ticks.map(v => (
          <line key={v}
            x1={xOf(v)} y1={labeled.includes(v) ? 44 : 48}
            x2={xOf(v)} y2={labeled.includes(v) ? 60 : 56}
            stroke="#1E40AF" strokeWidth={labeled.includes(v) ? 2 : 1}
          />
        ))}
        {/* labels */}
        {labeled.map(v => (
          <text key={v} x={xOf(v)} y={82} textAnchor="middle" fontSize="12" fontWeight="800" fill="#1E40AF">{v}</text>
        ))}
        {/* arrows a–f: letter above, triangle pointing down to the axis */}
        {Q1_ARROWS.map(arrow => (
          <g key={arrow.lbl}>
            <text x={xOf(arrow.val)} y={16} textAnchor="middle" fontSize="14" fontWeight="900" fontStyle="italic" fill="#DC2626">
              {arrow.lbl}
            </text>
            <polygon points={`${xOf(arrow.val)},42 ${xOf(arrow.val)-7},26 ${xOf(arrow.val)+7},26`} fill="#DC2626"/>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Inline chip for letters/numbers referenced inside question text
function Tag({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: '#1E40AF', color: '#fff',
      borderRadius: 7, padding: '1px 10px',
      fontSize: 20, fontWeight: 900,
      margin: '0 3px', lineHeight: 1.4,
      verticalAlign: 'middle',
    }}>
      {children}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════
export default function L1_NumberLineIntegers() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(5, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── s1 state ──
  const q1D  = state.q1D  || {}, setQ1D  = setField('q1D');
  const q1St = state.q1St || {}, setQ1St = setField('q1St');
  const q1FB = state.q1FB || {}, setQ1FB = setField('q1FB');

  // ── s2 state ──
  const q2Sel = state.q2Sel || {}, setQ2Sel = setField('q2Sel');
  const q2St  = state.q2St  || {}, setQ2St  = setField('q2St');
  const q2FB  = state.q2FB  ?? null, setQ2FB = setField('q2FB');

  // ── s3 state ──
  const q3Sel = state.q3Sel || {}, setQ3Sel = setField('q3Sel');
  const q3St  = state.q3St  || {}, setQ3St  = setField('q3St');
  const q3FB  = state.q3FB  || {}, setQ3FB  = setField('q3FB');

  // ── s4 state ──
  const q4Sel = state.q4Sel || {}, setQ4Sel = setField('q4Sel');
  const q4St  = state.q4St  || {}, setQ4St  = setField('q4St');
  const q4FB  = state.q4FB  || {}, setQ4FB  = setField('q4FB');

  // ── s5 state ──
  const [bankOrder] = useState(() => shuffle(TEMPS.map(t => t.val)));
  const q6Slots = state.q6Slots || {}, setQ6Slots = setField('q6Slots');
  const q6St    = state.q6St    || {}, setQ6St    = setField('q6St');
  const q6FB    = state.q6FB    ?? null, setQ6FB  = setField('q6FB');

  // ── s1: drop / remove handlers ────────────────────────────────
  const q1Drop = (lbl) => (raw) => {
    if (q1St[lbl] === 'correct') return;
    if (raw === 'del') {
      if (q1St[lbl] === 'wrong') setQ1St(p => ({ ...p, [lbl]: 'default' }));
      setQ1D(p => ({ ...p, [lbl]: (p[lbl] || []).slice(0, -1) }));
    } else if (raw.startsWith('digit:')) {
      const d = raw.split(':')[1];
      if (q1St[lbl] === 'wrong') setQ1St(p => ({ ...p, [lbl]: 'default' }));
      setQ1D(p => ({ ...p, [lbl]: [...(p[lbl] || []), d] }));
    }
  };

  const q1Remove = (lbl) => (idx) => {
    if (q1St[lbl] === 'correct') return;
    if (q1St[lbl] === 'wrong') setQ1St(p => ({ ...p, [lbl]: 'default' }));
    setQ1D(p => {
      const a = [...(p[lbl] || [])];
      a.splice(idx, 1);
      return { ...p, [lbl]: a };
    });
  };

  // ── s1: check a pair of arrows ─────────────────────────────────
  const checkQ1Pair = (pair, pi) => {
    const key = `q1p${pi}`;
    increment(key);
    const att = getAtt(key) + 1;
    // compute ok BEFORE setState (React async-updater rule)
    let ok = 0;
    pair.forEach(arrow => {
      if ((q1D[arrow.lbl] || []).join('') === arrow.ans.join('')) ok++;
    });
    const ns = { ...q1St };
    pair.forEach(arrow => {
      ns[arrow.lbl] = (q1D[arrow.lbl] || []).join('') === arrow.ans.join('') ? 'correct' : 'wrong';
    });
    setQ1St(ns);
    const total = pair.length;
    let fb;
    if (ok === total)   fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
    else if (att >= 3)  fb = { type:'hint',    text:'Keep trying! Count each small tick carefully — each one is 1 unit.' };
    else if (att === 2) fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Negative numbers sit left of 0. Drag the − card first, then the digits.` };
    else                fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Count the ticks from the nearest labeled value on the line.` };
    setQ1FB(p => ({ ...p, [pi]: fb }));
    if (ok === total) {
      const merged = { ...q1FB, [pi]: fb };
      const allPairsDone = Q1_PAIRS.every((_, idx) => merged[idx]?.type === 'correct');
      if (allPairsDone) prog.markDone('s1', { correct: Q1_ARROWS.length, total: Q1_ARROWS.length, attempts: att });
    }
  };

  // ── s2: check differences ──────────────────────────────────────
  const checkQ2 = () => {
    increment('q2');
    const att = getAtt('q2') + 1;
    let ok = 0;
    Q2.forEach(q => { if (q2Sel[q.lbl] === q.correct) ok++; });
    const ns = { ...q2St };
    Q2.forEach(q => {
      const sel = q2Sel[q.lbl];
      if (sel === q.correct) { ns[`${q.lbl}-${sel}`] = 'correct'; }
      else if (sel)          { ns[`${q.lbl}-${sel}`] = 'wrong'; }
    });
    setQ2St(ns);
    const total = Q2.length;
    let fb;
    if (ok === total)   fb = { type:'correct', text:`🎉 All ${total} correct! You can find differences on a number line.` };
    else if (att >= 3)  fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Difference = count the steps between the two points.` };
    else                fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Use your Q1 answers and count the distance between each pair.` };
    setQ2FB(fb);
    if (ok === total) prog.markDone('s2', { correct: total, total, attempts: att });
  };

  // ── s3: check strict inequality group ─────────────────────────
  const checkQ3Group = (grp, gi) => {
    const key = `q3g${gi}`;
    increment(key);
    const att = getAtt(key) + 1;
    let ok = 0;
    grp.forEach(q => { if (q3Sel[q.lbl] === q.correct) ok++; });
    const ns = { ...q3St };
    grp.forEach(q => {
      const sel = q3Sel[q.lbl];
      if (sel === q.correct) { ns[`${q.lbl}-${sel}`] = 'correct'; }
      else if (sel)          { ns[`${q.lbl}-${sel}`] = 'wrong'; }
    });
    setQ3St(ns);
    const total = grp.length;
    let fb;
    if (ok === total)   fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
    else if (att >= 3)  fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Strict inequalities (< and >) do NOT include the boundary values.` };
    else                fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Find an integer strictly between the two given values.` };
    setQ3FB(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const merged = { ...q3FB, [gi]: fb };
      if ([0,1].every(g => merged[g]?.type === 'correct'))
        prog.markDone('s3', { correct: Q3.length, total: Q3.length, attempts: att });
    }
  };

  // ── s4: check non-strict inequality group ─────────────────────
  const checkQ4Group = (grp, gi) => {
    const key = `q4g${gi}`;
    increment(key);
    const att = getAtt(key) + 1;
    let ok = 0;
    grp.forEach(q => { if (q4Sel[q.lbl] === q.correct) ok++; });
    const ns = { ...q4St };
    grp.forEach(q => {
      const sel = q4Sel[q.lbl];
      if (sel === q.correct) { ns[`${q.lbl}-${sel}`] = 'correct'; }
      else if (sel)          { ns[`${q.lbl}-${sel}`] = 'wrong'; }
    });
    setQ4St(ns);
    const total = grp.length;
    let fb;
    if (ok === total)   fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
    else if (att >= 3)  fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type:'hint',    text:`💡 ${ok}/${total} correct. Non-strict inequalities (≤ and ≥) DO include the boundary values.` };
    else                fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. Find an integer that satisfies the inequality (boundaries are included).` };
    setQ4FB(p => ({ ...p, [gi]: fb }));
    if (ok === total) {
      const merged = { ...q4FB, [gi]: fb };
      if ([0,1].every(g => merged[g]?.type === 'correct'))
        prog.markDone('s4', { correct: Q4.length, total: Q4.length, attempts: att });
    }
  };

  // ── s5: temperature drag handlers ─────────────────────────────
  const q6Drop = (slotIdx) => (rawVal) => {
    const v = Number(rawVal);
    setQ6Slots(prev => {
      const ns = { ...prev };
      Object.keys(ns).forEach(k => { if (ns[k] === v) delete ns[k]; });
      ns[slotIdx] = v;
      return ns;
    });
  };
  const q6Clear = (slotIdx) => () => {
    setQ6Slots(prev => { const ns = { ...prev }; delete ns[slotIdx]; return ns; });
  };

  // ── s5: check temperature order ───────────────────────────────
  const checkQ6 = () => {
    increment('q6');
    const att = getAtt('q6') + 1;
    let ok = 0;
    TEMPS_SORTED.forEach((t, idx) => { if (q6Slots[idx] === t.val) ok++; });
    const ns = {};
    TEMPS_SORTED.forEach((t, idx) => {
      if (q6Slots[idx] === t.val)         ns[idx] = 'correct';
      else if (q6Slots[idx] !== undefined) ns[idx] = 'wrong';
    });
    setQ6St(ns);
    const total = TEMPS_SORTED.length;
    let fb;
    if (ok === total)   fb = { type:'correct', text:`🎉 ${ok}/${total} correct! Perfect temperature ordering from lowest to highest.` };
    else if (att >= 3)  fb = { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
    else if (att === 2) fb = { type:'hint',    text:`💡 ${ok}/${total} correct. More negative = colder = lower. Start with −24° on the far left.` };
    else                fb = { type:'wrong',   text:`✗ ${ok}/${total} correct. The most negative number is the lowest temperature. Order from most negative to most positive.` };
    setQ6FB(fb);
    if (ok === total) prog.markDone('s5', { correct: total, total, attempts: att });
  };

  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      <Header lessonChip="Unit 1 · Lesson 1 · Integers on a Number Line" completed={prog.completedCount} total={5}/>
      <div className="page">
        <ObjectiveCard text="Read and locate integers on a number line, find differences between points, compare using inequalities, and order positive and negative numbers"/>
        <ExplainPanel title="Key Concept: Integers on a Number Line">
          <RuleBox>
            <strong>Integers</strong> are whole numbers — positive, negative, or zero.<br/>
            On a number line, numbers <strong>increase to the right</strong> and <strong>decrease to the left</strong>.<br/>
            Example: <strong>−18 &lt; −12 &lt; −4 &lt; 0 &lt; 7</strong><br/>
            <strong>Difference</strong> between two integers = count the steps between them on the number line.<br/>
            <strong>Strict</strong> (&lt; / &gt;): boundary values are NOT included. &nbsp;
            <strong>Non-strict</strong> (≤ / ≥): boundary values ARE included.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={5}/>

        {/* ── s1: Q1 Number line reading ── */}
        <SectionCard badge={1}
          title="To which number does each arrow point?"
          tagType="drag" tagLabel="Drag Digits"
          subtitle="Drag digit cards to build each answer. Use the − card for negative numbers. ★ Pairs: (a, b) · (c, d) · (e, f)"
          score={prog.done['s1']}>
          <Q1NumberLine/>
          {Q1_PAIRS.map((pair, pi) => (
            <QGroup key={pi} title={`Questions ${pair.map(a => a.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette paletteId={`q1pal${pi}`} decimal={false} minus={true}/>
              {pair.map((arrow, ai) => (
                <QItem key={arrow.lbl} last={ai === pair.length - 1}>
                  <QItemLabel>
                    <LblCircle letter={arrow.lbl}/>
                    <span style={{ fontSize: 22, fontWeight: 700 }}>
                      Arrow <Tag>{arrow.lbl}</Tag> points to:
                    </span>
                    <DigitDropZone
                      digits={q1D[arrow.lbl] || []}
                      zoneState={q1St[arrow.lbl] || 'default'}
                      onDrop={q1Drop(arrow.lbl)}
                      onRemove={q1Remove(arrow.lbl)}
                    />
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${pair.map(a => a.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkQ1Pair(pair, pi)}
                disabled={prog.done['s1']}
              />
              {q1FB[pi] && <FeedbackBox type={q1FB[pi].type} message={q1FB[pi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s2: Q2 Differences ── */}
        <SectionCard badge={2}
          title="Look at the number line above. Write the difference between these numbers."
          tagType="mcq" tagLabel="MCQ"
          subtitle="Use your Q1 answers to calculate the difference between each pair of points."
          score={prog.done['s2']}>
          <QGroup title="Questions A – D">
            {Q2.map((q, qi) => {
              const opts = q.opts.map(o => ({
                ...o,
                state: q2St[`${q.lbl}-${o.id}`] || (q2Sel[q.lbl] === o.id ? 'selected' : 'default'),
              }));
              return (
                <QItem key={q.lbl} last={qi === Q2.length - 1}>
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <span style={{ fontSize: 22, fontWeight: 700 }}>
                      Difference between <Tag>{q.p1}</Tag> and <Tag>{q.p2}</Tag>
                    </span>
                  </QItemLabel>
                  <MCQOptions
                    options={opts}
                    onSelect={o => setQ2Sel(p => ({ ...p, [q.lbl]: o }))}
                  />
                </QItem>
              );
            })}
            <CheckButton label="✓ Check A – D" onClick={checkQ2} disabled={prog.done['s2']}/>
            {q2FB && <FeedbackBox type={q2FB.type} message={q2FB.text}/>}
          </QGroup>
        </SectionCard>

        {/* ── s3: Q3 Strict inequalities ── */}
        <SectionCard badge={3}
          title="Which integers could go in the boxes?"
          tagType="mcq" tagLabel="MCQ"
          subtitle="Each inequality uses < or > (strict — boundaries NOT included). Choose one valid integer."
          score={prog.done['s3']}>
          {[Q3_G1, Q3_G2].map((grp, gi) => (
            <QGroup key={gi} title={`Questions ${grp.map(q => q.lbl.toUpperCase()).join(', ')}`}>
              {grp.map((q, qi) => {
                const opts = q.opts.map(o => ({
                  ...o,
                  state: q3St[`${q.lbl}-${o.id}`] || (q3Sel[q.lbl] === o.id ? 'selected' : 'default'),
                }));
                return (
                  <QItem key={q.lbl} last={qi === grp.length - 1}>
                    <QItemLabel>
                      <LblCircle letter={q.lbl}/>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        background: '#EFF6FF', border: '2.5px solid #1E40AF',
                        borderRadius: 12, padding: '8px 20px',
                      }}>
                        <span style={{ fontSize: 26, fontWeight: 900, fontFamily: 'monospace', color: '#1E3A8A', letterSpacing: '0.04em' }}>
                          {q.display}
                        </span>
                      </div>
                    </QItemLabel>
                    <MCQOptions
                      options={opts}
                      onSelect={o => setQ3Sel(p => ({ ...p, [q.lbl]: o }))}
                    />
                  </QItem>
                );
              })}
              <CheckButton
                label={`✓ Check ${grp.map(q => q.lbl.toUpperCase()).join(', ')}`}
                onClick={() => checkQ3Group(grp, gi)}
                disabled={prog.done['s3']}
              />
              {q3FB[gi] && <FeedbackBox type={q3FB[gi].type} message={q3FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s4: Q4 Non-strict inequalities ── */}
        <SectionCard badge={4}
          title="Which integers could go in the boxes?"
          tagType="mcq" tagLabel="MCQ"
          subtitle="Each inequality uses ≤ or ≥ (non-strict — boundaries ARE included). Choose one valid integer."
          score={prog.done['s4']}>
          {[Q4_G1, Q4_G2].map((grp, gi) => (
            <QGroup key={gi} title={`Questions ${grp.map(q => q.lbl.toUpperCase()).join(', ')}`}>
              {grp.map((q, qi) => {
                const opts = q.opts.map(o => ({
                  ...o,
                  state: q4St[`${q.lbl}-${o.id}`] || (q4Sel[q.lbl] === o.id ? 'selected' : 'default'),
                }));
                return (

                  <QItem key={q.lbl} last={qi === grp.length - 1}>
                    <QItemLabel>
                      <LblCircle letter={q.lbl}/>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center',
                        background: '#EFF6FF', border: '2.5px solid #1E40AF',
                        borderRadius: 12, padding: '8px 20px',
                      }}>
                        <span style={{ fontSize: 26, fontWeight: 900, fontFamily: 'monospace', color: '#1E3A8A', letterSpacing: '0.04em' }}>
                          {q.display}
                        </span>
                      </div>
                    </QItemLabel>
                    <MCQOptions
                      options={opts}
                      onSelect={o => setQ4Sel(p => ({ ...p, [q.lbl]: o }))}
                    />
                  </QItem>
                );
              })}
              <CheckButton
                label={`✓ Check ${grp.map(q => q.lbl.toUpperCase()).join(', ')}`}
                onClick={() => checkQ4Group(grp, gi)}
                disabled={prog.done['s4']}
              />
              {q4FB[gi] && <FeedbackBox type={q4FB[gi].type} message={q4FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── s5: Q6 Temperature ordering ── */}
        <SectionCard badge={5}
          title="Write these temperatures in order, starting with the lowest."
          tagType="drag" tagLabel="Drag & Order"
          subtitle="Drag the temperature cards into the slots — lowest on the left, highest on the right."
          score={prog.done['s5']}>
          {/* card bank */}
          <div style={{ background:'var(--blue-light)', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 12px', marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.4px' }}>
              🌡️ Drag cards into the order slots below (lowest first)
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {bankOrder.map(v => {
                const placed = Object.values(q6Slots).includes(v);
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
                      color: '#fff',
                      border: `2px solid ${placed ? '#94A3B8' : 'var(--blue-dark)'}`,
                      borderRadius: 10, padding: '12px 20px',
                      fontSize: 22, fontWeight: 900,
                      cursor: placed ? 'default' : 'grab',
                      opacity: placed ? 0.35 : 1,
                      userSelect: 'none',
                    }}>
                    {t.label}
                  </div>
                );
              })}
            </div>
          </div>
          {/* order slots */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:14 }}>
            <span style={{ fontSize:16, fontWeight:800, color:'var(--blue)' }}>← Lowest</span>
            {[0,1,2,3,4,5].map(idx => {
              const v = q6Slots[idx];
              const t = v !== undefined ? TEMPS.find(x => x.val === v) : null;
              const slotState = q6St[idx];
              const bg    = slotState==='correct' ? 'var(--green-bg)' : slotState==='wrong' ? 'var(--red-bg)' : v!==undefined ? '#EEF4FF' : '#F8FAFF';
              const bd    = slotState==='correct' ? '2.5px solid var(--green)' : slotState==='wrong' ? '2.5px solid var(--red)' : v!==undefined ? '2.5px solid var(--blue)' : '2.5px dashed var(--border)';
              const color = slotState==='correct' ? 'var(--green)' : slotState==='wrong' ? 'var(--red)' : v!==undefined ? 'var(--blue)' : 'var(--muted)';
              return (
                <div
                  key={idx}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const d = e.dataTransfer.getData('text/plain');
                    if (d.startsWith('temp:')) q6Drop(idx)(d.slice(5));
                  }}
                  onClick={() => v !== undefined && q6Clear(idx)()}
                  style={{
                    minWidth: 90, height: 58, borderRadius: 10,
                    border: bd, background: bg, color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 900, padding: '0 12px',
                    cursor: v !== undefined ? 'pointer' : 'default',
                  }}>
                  {t ? t.label : `#${idx + 1}`}
                </div>
              );
            })}
            <span style={{ fontSize:16, fontWeight:800, color:'var(--red)' }}>Highest →</span>
          </div>
          <CheckButton label="✓ Check order" onClick={checkQ6} disabled={prog.done['s5']}/>
          {q6FB && <FeedbackBox type={q6FB.type} message={q6FB.text}/>}
        </SectionCard>

        {prog.allDone && (
          <Summary message="Excellent! You can read integers on a number line, find differences, compare with inequalities, and order temperatures!"/>
        )}
      </div>
    </div>
  );
}
