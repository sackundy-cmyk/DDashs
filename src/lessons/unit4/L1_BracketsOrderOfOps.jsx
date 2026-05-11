// ============================================================
//  lessons/unit4/L1_BracketsOrderOfOps.jsx
//  Unit 4 · Lesson 1: Brackets & Order of Operations
//  S1: compute bracket expressions (digit-drag, pairs)
//  S2: MCQ — place brackets to make 18 (pairs)
//  S3: missing number — single digit drag (per question)
//  S4: two different bracket placements (TwoPartAnswer, per question)
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         GuidedHint, FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { TwoPartAnswer } from '../../components/interactions/TwoPartAnswer.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { evalExpr } from '../../utils/mathUtils.js';
import { shuffle } from '../../utils/shuffleUtils.js';

function grp(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// ── Section 1 data ──
const Q1 = [
  { lbl:'a', expr:'(37 − 13) + 4',        ans:28, guided:true,  hint:'First 37 − 13 = 24, then add 4.' },
  { lbl:'b', expr:'84 − (17 + 32)',         ans:35, guided:true,  hint:'First 17 + 32 = 49 inside brackets, then 84 − 49.' },
  { lbl:'c', expr:'(43 − 15) × 2',          ans:56 },
  { lbl:'d', expr:'56 − (48 − 19)',         ans:27 },
  { lbl:'e', expr:'3 × (29 − 15)',          ans:42 },
  { lbl:'f', expr:'(14 + 56) ÷ 2',          ans:35 },
  { lbl:'g', expr:'(48 + 83) − (53 + 45)',  ans:33 },
  { lbl:'h', expr:'(9 × 4) ÷ (23 − 19)',    ans:9  },
  { lbl:'i', expr:'(57 − 39) + (93 − 66)',  ans:45 },
  { lbl:'j', expr:'(6 × 15) ÷ (94 − 84)',   ans:9  },
];

// ── Section 2 data ──
// opts[0] = wrong placement, opts[1] = correct placement (ans:1 before shuffle)
const Q2_RAW = [
  { lbl:'a', expr:'49 − 34 − 3',   opts:['(49 − 34) − 3',  '49 − (34 − 3)']  },
  { lbl:'b', expr:'84 − 55 − 11',  opts:['84 − (55 − 11)', '(84 − 55) − 11'] },
  { lbl:'c', expr:'53 − 39 + 4',   opts:['53 − (39 + 4)',   '(53 − 39) + 4']  },
  { lbl:'d', expr:'72 − 36 − 18',  opts:['72 − (36 − 18)', '(72 − 36) − 18'] },
  { lbl:'e', expr:'84 − 26 − 40',  opts:['84 − (26 − 40)', '(84 − 26) − 40'] },
  { lbl:'f', expr:'90 − 86 − 14',  opts:['(90 − 86) − 14', '90 − (86 − 14)'] },
];
const Q2 = Q2_RAW.map(q => ({ ...q, ans: 1 }));

// ── Section 3 data ──
const Q3 = [
  { lbl:'a', display:'(? × 4) − 1 = 11',        ans:3, guided:true,  hint:'Work backwards: 11 + 1 = 12, then 12 ÷ 4 = ?' },
  { lbl:'b', display:'10 − (? × 3) = 4',         ans:2, guided:true,  hint:'Work backwards: 10 − 4 = 6, then 6 ÷ 3 = ?' },
  { lbl:'c', display:'(4 × 2) + (? × 3) = 17',   ans:3 },
  { lbl:'d', display:'(? × 5) − (5 × 4) = 10',   ans:6 },
  { lbl:'e', display:'12 ÷ (? × 2) = 2',          ans:3 },
  { lbl:'f', display:'(? × 5) ÷ 2 = 10',          ans:4 },
];

// ── Section 4 data ──
const Q4 = [
  { lbl:'a', raw:'19 × 2 + 4',   p1:'(19 × 2) + 4',   p2:'19 × (2 + 4)'   },
  { lbl:'b', raw:'80 − 46 − 10', p1:'(80 − 46) − 10',  p2:'80 − (46 − 10)' },
  { lbl:'c', raw:'13 + 11 × 5',  p1:'(13 + 11) × 5',   p2:'13 + (11 × 5)'  },
  { lbl:'d', raw:'96 ÷ 4 + 2',   p1:'(96 ÷ 4) + 2',    p2:'96 ÷ (4 + 2)'   },
  { lbl:'e', raw:'39 − 14 + 13', p1:'(39 − 14) + 13',  p2:'39 − (14 + 13)' },
  { lbl:'f', raw:'8 × 14 − 6',   p1:'(8 × 14) − 6',    p2:'8 × (14 − 6)'   },
  { lbl:'g', raw:'56 − 4 × 10',  p1:'(56 − 4) × 10',   p2:'56 − (4 × 10)'  },
  { lbl:'h', raw:'45 ÷ 3 + 2',   p1:'(45 ÷ 3) + 2',    p2:'45 ÷ (3 + 2)'   },
].map(q => ({
  ...q,
  ans1: Math.round(evalExpr(q.p1) * 100) / 100,
  ans2: Math.round(evalExpr(q.p2) * 100) / 100,
}));

export default function L1_BracketsOrderOfOps() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(4, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── Section 1 state ──
  const q1D         = state.q1D         || {}, setQ1D         = setField('q1D');
  const q1St        = state.q1St        || {}, setQ1St        = setField('q1St');
  const q1FB        = state.q1FB        || {}, setQ1FB        = setField('q1FB');
  const q1GroupDone = state.q1GroupDone || {}, setQ1GroupDone = setField('q1GroupDone');

  // ── Section 2 state ──
  const [q2Opts] = useState(() =>
    Object.fromEntries(Q2.map(q => [q.lbl, shuffle([{ id:0, text:q.opts[0] }, { id:1, text:q.opts[1] }])]))
  );
  const q2Sel       = state.q2Sel       || {}, setQ2Sel       = setField('q2Sel');
  const q2St        = state.q2St        || {}, setQ2St        = setField('q2St');
  const q2FB        = state.q2FB        || {}, setQ2FB        = setField('q2FB');
  const q2GroupDone = state.q2GroupDone || {}, setQ2GroupDone = setField('q2GroupDone');

  // ── Section 3 state ──
  const q3D       = state.q3D       || {}, setQ3D       = setField('q3D');
  const q3St      = state.q3St      || {}, setQ3St      = setField('q3St');
  const q3FB      = state.q3FB      || {}, setQ3FB      = setField('q3FB');
  const q3Correct = state.q3Correct || {}, setQ3Correct = setField('q3Correct');

  // ── Section 4 state ──
  const q4D       = state.q4D       || {}, setQ4D       = setField('q4D');
  const q4St      = state.q4St      || {}, setQ4St      = setField('q4St');
  const q4FB      = state.q4FB      || {}, setQ4FB      = setField('q4FB');
  const q4Correct = state.q4Correct || {}, setQ4Correct = setField('q4Correct');

  const q1Groups = grp(Q1, 2);
  const q2Groups = grp(Q2, 2);

  // ── Section 1 helpers ──
  const q1Val  = lbl => { const d = q1D[lbl] || []; return d.length ? parseInt(d.join(''), 10) : null; };
  const q1Drop = lbl => raw => {
    if (q1St[lbl] === 'correct') return;
    if (raw === 'del') setQ1D(p => ({ ...p, [lbl]: (p[lbl]||[]).slice(0,-1) }));
    else if (raw.startsWith('digit:')) setQ1D(p => ({ ...p, [lbl]: [...(p[lbl]||[]), raw.split(':')[1]] }));
  };
  const q1Rm = lbl => i => {
    if (q1St[lbl] === 'correct') return;
    setQ1D(p => { const a = [...(p[lbl]||[])]; a.splice(i,1); return { ...p, [lbl]: a }; });
  };

  const checkQ1 = (grpArr, gi) => {
    increment(`q1g${gi}`); const att = getAtt(`q1g${gi}`) + 1;
    let ok = 0; const ns = { ...q1St };
    grpArr.forEach(q => {
      const v = q1Val(q.lbl);
      if (v === q.ans) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setQ1St(p => { const s = {...p}; if (s[q.lbl]==='wrong') delete s[q.lbl]; return s; }), 1200);
      }
    });
    setQ1St(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      const nd = { ...q1GroupDone, [gi]:true };
      setQ1GroupDone(nd);
      if (q1Groups.every((_, i) => nd[i])) prog.markDone('s1', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Calculate inside brackets first!` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Work through the brackets step by step.` };
    }
    setQ1FB(p => ({ ...p, [gi]: fb }));
  };

  // ── Section 2 helpers ──
  const q2OptState = (lbl, optId) => {
    const k = `${lbl}-${optId}`;
    if (q2St[k] === 'correct') return 'correct';
    if (q2St[k] === 'wrong')   return 'wrong';
    if (q2Sel[lbl] === optId)  return 'selected';
    return 'default';
  };

  const checkQ2 = (grpArr, gi) => {
    increment(`q2g${gi}`); const att = getAtt(`q2g${gi}`) + 1;
    let ok = 0; const ns = { ...q2St };
    grpArr.forEach(q => {
      const sel = q2Sel[q.lbl];
      if (sel === q.ans) { ns[`${q.lbl}-${sel}`] = 'correct'; ok++; }
      else if (sel !== undefined) { ns[`${q.lbl}-${sel}`] = 'wrong'; }
    });
    setQ2St(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      const nd = { ...q2GroupDone, [gi]:true };
      setQ2GroupDone(nd);
      if (q2Groups.every((_, i) => nd[i])) prog.markDone('s2', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Which version gives exactly 18? Try both mentally.` };
    } else {
      fb = { type:'wrong', text:'✗ Think carefully — which bracket placement gives exactly 18?' };
    }
    setQ2FB(p => ({ ...p, [gi]: fb }));
  };

  // ── Section 3 helpers ──
  const q3Val  = lbl => { const d = q3D[lbl] || []; return d.length ? parseInt(d.join(''), 10) : null; };
  const q3Drop = lbl => raw => {
    if (q3St[lbl] === 'correct') return;
    if (raw === 'del') setQ3D(p => ({ ...p, [lbl]: (p[lbl]||[]).slice(0,-1) }));
    else if (raw.startsWith('digit:')) setQ3D(p => ({ ...p, [lbl]: [...(p[lbl]||[]), raw.split(':')[1]] }));
  };
  const q3Rm = lbl => i => {
    if (q3St[lbl] === 'correct') return;
    setQ3D(p => { const a = [...(p[lbl]||[])]; a.splice(i,1); return { ...p, [lbl]: a }; });
  };

  const checkQ3 = q => {
    increment(`q3_${q.lbl}`); const att = getAtt(`q3_${q.lbl}`) + 1;
    const v = q3Val(q.lbl); let fb;
    if (v === q.ans) {
      setQ3St(p => ({ ...p, [q.lbl]:'correct' }));
      fb = { type:'correct', text:`🎉 Correct! The missing number is ${q.ans}.` };
      const nc = { ...q3Correct, [q.lbl]:true };
      setQ3Correct(nc);
      if (Q3.every(qq => nc[qq.lbl])) prog.markDone('s3', '✓');
    } else {
      setQ3St(p => ({ ...p, [q.lbl]:'wrong' }));
      setTimeout(() => setQ3St(p => { const s = {...p}; if (s[q.lbl]==='wrong') delete s[q.lbl]; return s; }), 1200);
      if (att >= 3)       fb = { type:'hint',  text:'Keep trying! Ask your teacher if you need help.' };
      else if (att === 2) fb = { type:'hint',  text:'💡 Work backwards — undo each operation in reverse order.' };
      else                fb = { type:'wrong', text:'✗ Not correct. Try working backwards from the answer.' };
    }
    setQ3FB(p => ({ ...p, [q.lbl]: fb }));
  };

  // ── Section 4 helpers ──
  const q4Val  = (lbl, part) => { const k = `${lbl}-${part}`; const d = q4D[k]||[]; return d.length ? parseInt(d.join(''),10) : null; };
  const q4Drop = (lbl, part) => raw => {
    const k = `${lbl}-${part}`; if (q4St[k] === 'correct') return;
    if (raw === 'del') setQ4D(p => ({ ...p, [k]: (p[k]||[]).slice(0,-1) }));
    else if (raw.startsWith('digit:')) setQ4D(p => ({ ...p, [k]: [...(p[k]||[]), raw.split(':')[1]] }));
  };
  const q4Rm = (lbl, part) => i => {
    const k = `${lbl}-${part}`; if (q4St[k] === 'correct') return;
    setQ4D(p => { const a = [...(p[k]||[])]; a.splice(i,1); return { ...p, [k]: a }; });
  };

  const checkQ4 = q => {
    increment(`q4_${q.lbl}`); const att = getAtt(`q4_${q.lbl}`) + 1;
    const v1 = q4Val(q.lbl,'1'), v2 = q4Val(q.lbl,'2');
    const ok1 = v1 === q.ans1, ok2 = v2 === q.ans2;
    const ns = { ...q4St };
    ns[`${q.lbl}-1`] = ok1 ? 'correct' : 'wrong';
    ns[`${q.lbl}-2`] = ok2 ? 'correct' : 'wrong';
    setQ4St(ns);
    const correct = (ok1?1:0) + (ok2?1:0); let fb;
    if (correct === 2) {
      fb = { type:'correct', text:`🎉 Both correct! Part 1 = ${q.ans1}, Part 2 = ${q.ans2}` };
      const nc = { ...q4Correct, [q.lbl]:true };
      setQ4Correct(nc);
      if (Q4.every(qq => nc[qq.lbl])) prog.markDone('s4', '✓');
    } else if (att >= 3) {
      fb = { type:'hint',  text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint',  text:`💡 ${correct}/2 correct. Brackets change which operation happens first!` };
    } else {
      fb = { type:'wrong', text:`✗ ${correct}/2 correct. Place brackets to change the order of operations.` };
    }
    setQ4FB(p => ({ ...p, [q.lbl]: fb }));
  };

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 4 · Lesson 1" completed={prog.completedCount} total={4}/>
      <div className="page">
        <ObjectiveCard text="Use brackets correctly and understand how their position changes the answer"/>
        <ExplainPanel title="Key Concept: Brackets (Order of Operations)">
          <RuleBox>
            <strong>Always calculate brackets first!</strong><br/>
            e.g. <strong>(37 − 13) + 4</strong> → 24 + 4 = <strong>28</strong>&emsp;
            but <strong>37 − (13 + 4)</strong> → 37 − 17 = <strong>20</strong><br/>
            <strong>Order:</strong> Brackets → × ÷ → + −
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={4}/>

        {/* ── Section 1 ── */}
        <SectionCard badge={1} title="Write the answer for each of these" tagType="drag" tagLabel="Drag Digits"
          subtitle="Drag digit cards (0–9) to build your answer. ✕ DEL removes the last digit. Check after each pair. ★ Guided: a & b">
          {q1Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette paletteId={`q1p${gi}`}/>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <span style={{ fontSize:20, fontWeight:800 }}>{q.expr} =</span>
                    <DigitDropZone
                      paletteId={`q1p${gi}`}
                      digits={q1D[q.lbl]||[]}
                      zoneState={q1St[q.lbl]||'default'}
                      onDrop={q1Drop(q.lbl)}
                      onRemove={q1Rm(q.lbl)}
                    />
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkQ1(grpArr, gi)}
              />
              {q1FB[gi] && <FeedbackBox type={q1FB[gi].type} message={q1FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── Section 2 ── */}
        <SectionCard badge={2} title="Place the brackets to make the answer 18" tagType="mcq" tagLabel="MCQ"
          subtitle="Choose the bracket placement that gives 18. Calculate mentally — brackets first! Check after each pair. ★ Guided: a & b">
          {q2Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div>
                      <div style={{ fontSize:21, fontWeight:900, color:'var(--text)' }}>{q.expr}</div>
                      <div style={{ fontSize:14, fontWeight:700, color:'var(--muted)', marginTop:2 }}>
                        Which bracket placement gives <strong>18</strong>?
                      </div>
                    </div>
                  </QItemLabel>
                  <MCQOptions
                    options={q2Opts[q.lbl].map(o => ({ id:o.id, label:o.text, state:q2OptState(q.lbl, o.id) }))}
                    onSelect={idx => {
                      if (q2St[`${q.lbl}-${idx}`] !== 'correct') setQ2Sel(p => ({ ...p, [q.lbl]:idx }));
                    }}
                  />
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkQ2(grpArr, gi)}
              />
              {q2FB[gi] && <FeedbackBox type={q2FB[gi].type} message={q2FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── Section 3 ── */}
        <SectionCard badge={3} title="Write the missing numbers" tagType="drag" tagLabel="Drag Digits"
          subtitle="Work backwards using inverse operations. Drag a digit to fill the unknown. One check per question. ★ Guided: a & b">
          <DigitPalette paletteId="q3p"/>
          {Q3.map(q => (
            <QGroup key={q.lbl} title={`Question ${q.lbl.toUpperCase()}`}>
              <QItem>
                {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                <QItemLabel>
                  <LblCircle letter={q.lbl}/>
                  <span style={{ fontSize:21, fontWeight:800 }}>{q.display}</span>
                </QItemLabel>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10, paddingLeft:4 }}>
                  <span style={{ fontSize:17, fontWeight:800, color:'var(--blue)' }}>? =</span>
                  <DigitDropZone
                    paletteId="q3p"
                    digits={q3D[q.lbl]||[]}
                    zoneState={q3St[q.lbl]||'default'}
                    onDrop={q3Drop(q.lbl)}
                    onRemove={q3Rm(q.lbl)}
                  />
                </div>
                <CheckButton
                  label={`✓ Check ${q.lbl.toUpperCase()}`}
                  onClick={() => checkQ3(q)}
                  disabled={q3St[q.lbl] === 'correct'}
                />
                {q3FB[q.lbl] && <FeedbackBox type={q3FB[q.lbl].type} message={q3FB[q.lbl].text}/>}
              </QItem>
            </QGroup>
          ))}
        </SectionCard>

        {/* ── Section 4 ── */}
        <SectionCard badge={4} title="Use brackets to give two different answers" tagType="drag" tagLabel="Drag Digits"
          subtitle="Each calculation can be bracketed two ways. Fill in both answers using the digit palette. One check per question.">
          {Q4.map(q => (
            <QGroup key={q.lbl} title={`Question ${q.lbl.toUpperCase()}`}>
              <QItem>
                <QItemLabel>
                  <LblCircle letter={q.lbl}/>
                  <span style={{ fontSize:22, fontWeight:900 }}>{q.raw}</span>
                </QItemLabel>
                <DigitPalette paletteId={`q4p${q.lbl}`}/>
                <TwoPartAnswer
                  paletteId={`q4p${q.lbl}`}
                  part1Label={q.p1} part2Label={q.p2}
                  digits1={q4D[`${q.lbl}-1`]||[]} digits2={q4D[`${q.lbl}-2`]||[]}
                  state1={q4St[`${q.lbl}-1`]||'default'} state2={q4St[`${q.lbl}-2`]||'default'}
                  onDrop1={q4Drop(q.lbl,'1')} onDrop2={q4Drop(q.lbl,'2')}
                  onRemove1={q4Rm(q.lbl,'1')} onRemove2={q4Rm(q.lbl,'2')}
                />
                <CheckButton
                  label={`✓ Check ${q.lbl.toUpperCase()}`}
                  onClick={() => checkQ4(q)}
                  disabled={q4St[`${q.lbl}-1`]==='correct' && q4St[`${q.lbl}-2`]==='correct'}
                />
                {q4FB[q.lbl] && <FeedbackBox type={q4FB[q.lbl].type} message={q4FB[q.lbl].text}/>}
              </QItem>
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Excellent! You have mastered how brackets change calculations!"/>}
      </div>
    </div>
  );
}
