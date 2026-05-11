// ============================================================
//  lessons/unit4/L4_MentalAddSub.jsx
//  Unit 4 · Lesson 4: Mental Addition & Subtraction
//  S1 (a–h): add in head, digit-drag, pairs
//  S2 (a–h): subtract in head, digit-drag, pairs
//  S3 (a–j): word problems, digit-drag, pairs
// ============================================================

import React from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         GuidedHint, FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

function grp(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// ── Section 1: mental addition ──
const Q1 = [
  { lbl:'a', expr:'69 + 87 =',   ans:156, guided:true,  hint:'Split 87 into 80 + 7. 69 + 80 = 149, then 149 + 7 = 156.' },
  { lbl:'b', expr:'87 + 58 =',   ans:145, guided:true,  hint:'Split 58 into 50 + 8. 87 + 50 = 137, then 137 + 8 = 145.' },
  { lbl:'c', expr:'73 + 68 =',   ans:141 },
  { lbl:'d', expr:'97 + 46 =',   ans:143 },
  { lbl:'e', expr:'109 + 324 =', ans:433 },
  { lbl:'f', expr:'634 + 291 =', ans:925 },
  { lbl:'g', expr:'472 + 283 =', ans:755 },
  { lbl:'h', expr:'659 + 314 =', ans:973 },
];

// ── Section 2: mental subtraction ──
const Q2 = [
  { lbl:'a', expr:'93 − 67 =',   ans:26,  guided:true,  hint:'Count up: 67 → 70 (+3), then 70 → 93 (+23). Answer = 26.' },
  { lbl:'b', expr:'59 − 38 =',   ans:21,  guided:true,  hint:'59 − 30 = 29, then 29 − 8 = 21.' },
  { lbl:'c', expr:'84 − 56 =',   ans:28 },
  { lbl:'d', expr:'95 − 49 =',   ans:46 },
  { lbl:'e', expr:'154 − 129 =', ans:25 },
  { lbl:'f', expr:'579 − 384 =', ans:195 },
  { lbl:'g', expr:'219 − 167 =', ans:52 },
  { lbl:'h', expr:'683 − 468 =', ans:215 },
];

// ── Section 3: word problems ──
const Q3 = [
  { lbl:'a', text:'Add together 398 and 564.',                   ans:962,  guided:true, hint:'398 + 500 = 898, then 898 + 64 = 962.' },
  { lbl:'b', text:'What is 387 and 455 added together?',          ans:842,  guided:true, hint:'387 + 400 = 787, then 787 + 55 = 842.' },
  { lbl:'c', text:'What is the sum of 263 and 389?',              ans:652 },
  { lbl:'d', text:'Total 923 and 188.',                           ans:1111 },
  { lbl:'e', text:'What is the total of 728 and 279?',            ans:1007 },
  { lbl:'f', text:'What is the difference between 934 and 287?',  ans:647 },
  { lbl:'g', text:'What is 375 subtract 218?',                    ans:157 },
  { lbl:'h', text:'What is 631 take away 299?',                   ans:332 },
  { lbl:'i', text:'Subtract 453 from 872.',                       ans:419 },
  { lbl:'j', text:'What is 345 less than 398?',                   ans:53 },
];

export default function L4_MentalAddSub() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── Section 1 state ──
  const q1D         = state.q1D         || {}, setQ1D         = setField('q1D');
  const q1St        = state.q1St        || {}, setQ1St        = setField('q1St');
  const q1FB        = state.q1FB        || {}, setQ1FB        = setField('q1FB');
  const q1GroupDone = state.q1GroupDone || {}, setQ1GroupDone = setField('q1GroupDone');

  // ── Section 2 state ──
  const q2D         = state.q2D         || {}, setQ2D         = setField('q2D');
  const q2St        = state.q2St        || {}, setQ2St        = setField('q2St');
  const q2FB        = state.q2FB        || {}, setQ2FB        = setField('q2FB');
  const q2GroupDone = state.q2GroupDone || {}, setQ2GroupDone = setField('q2GroupDone');

  // ── Section 3 state ──
  const q3D         = state.q3D         || {}, setQ3D         = setField('q3D');
  const q3St        = state.q3St        || {}, setQ3St        = setField('q3St');
  const q3FB        = state.q3FB        || {}, setQ3FB        = setField('q3FB');
  const q3GroupDone = state.q3GroupDone || {}, setQ3GroupDone = setField('q3GroupDone');

  const q1Groups = grp(Q1, 2);
  const q2Groups = grp(Q2, 2);
  const q3Groups = grp(Q3, 2);

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
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Split the second number into tens and units, then add in two steps.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Try adding the tens first, then the units.` };
    }
    setQ1FB(p => ({ ...p, [gi]: fb }));
  };

  // ── Section 2 helpers ──
  const q2Val  = lbl => { const d = q2D[lbl] || []; return d.length ? parseInt(d.join(''), 10) : null; };
  const q2Drop = lbl => raw => {
    if (q2St[lbl] === 'correct') return;
    if (raw === 'del') setQ2D(p => ({ ...p, [lbl]: (p[lbl]||[]).slice(0,-1) }));
    else if (raw.startsWith('digit:')) setQ2D(p => ({ ...p, [lbl]: [...(p[lbl]||[]), raw.split(':')[1]] }));
  };
  const q2Rm = lbl => i => {
    if (q2St[lbl] === 'correct') return;
    setQ2D(p => { const a = [...(p[lbl]||[])]; a.splice(i,1); return { ...p, [lbl]: a }; });
  };

  const checkQ2 = (grpArr, gi) => {
    increment(`q2g${gi}`); const att = getAtt(`q2g${gi}`) + 1;
    let ok = 0; const ns = { ...q2St };
    grpArr.forEach(q => {
      const v = q2Val(q.lbl);
      if (v === q.ans) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setQ2St(p => { const s = {...p}; if (s[q.lbl]==='wrong') delete s[q.lbl]; return s; }), 1200);
      }
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
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Try counting up from the smaller number, or subtract in parts (tens then units).` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Subtract the tens first, then the units.` };
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

  const checkQ3 = (grpArr, gi) => {
    increment(`q3g${gi}`); const att = getAtt(`q3g${gi}`) + 1;
    let ok = 0; const ns = { ...q3St };
    grpArr.forEach(q => {
      const v = q3Val(q.lbl);
      if (v === q.ans) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setQ3St(p => { const s = {...p}; if (s[q.lbl]==='wrong') delete s[q.lbl]; return s; }), 1200);
      }
    });
    setQ3St(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      const nd = { ...q3GroupDone, [gi]:true };
      setQ3GroupDone(nd);
      if (q3Groups.every((_, i) => nd[i])) prog.markDone('s3', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Key words: sum/total/add together → +; difference/subtract/take away/less than → −` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Identify the operation from the key words, then calculate.` };
    }
    setQ3FB(p => ({ ...p, [gi]: fb }));
  };

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 4 · Lesson 4" completed={prog.completedCount} total={3}/>
      <div className="page">
        <ObjectiveCard text="Practise mental addition and subtraction, and solve word problems using key vocabulary"/>
        <ExplainPanel title="Key Concept: Mental Maths Strategies">
          <RuleBox>
            <strong>Addition:</strong> split — e.g. 69 + 87 = 69 + 80 + 7 = 156<br/>
            <strong>Subtraction:</strong> count up or subtract in parts — e.g. 93 − 67: 67→70→93<br/>
            <strong>Word problems:</strong> <em>sum, total, add together</em> → +; &nbsp;<em>difference, subtract, take away, less than</em> → −
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={3}/>

        {/* ── Section 1 ── */}
        <SectionCard badge={1} title="Add these in your head" tagType="drag" tagLabel="Drag Digits"
          subtitle="Drag digits to build each answer. Check after each pair. ★ Guided: a & b">
          {q1Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette paletteId={`q1p${gi}`}/>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}>{q.expr}</span>
                      <DigitDropZone
                        paletteId={`q1p${gi}`}
                        digits={q1D[q.lbl]||[]}
                        zoneState={q1St[q.lbl]||'default'}
                        onDrop={q1Drop(q.lbl)}
                        onRemove={q1Rm(q.lbl)}
                      />
                    </div>
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
        <SectionCard badge={2} title="Subtract these in your head" tagType="drag" tagLabel="Drag Digits"
          subtitle="Drag digits to build each answer. Check after each pair. ★ Guided: a & b">
          {q2Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette paletteId={`q2p${gi}`}/>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}>{q.expr}</span>
                      <DigitDropZone
                        paletteId={`q2p${gi}`}
                        digits={q2D[q.lbl]||[]}
                        zoneState={q2St[q.lbl]||'default'}
                        onDrop={q2Drop(q.lbl)}
                        onRemove={q2Rm(q.lbl)}
                      />
                    </div>
                  </QItemLabel>
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
        <SectionCard badge={3} title="Read and answer these" tagType="drag" tagLabel="Drag Digits"
          subtitle="Read each word problem carefully, then drag digits to build your answer. Check after each pair. ★ Guided: a & b">
          {q3Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette paletteId={`q3p${gi}`}/>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <span style={{ fontSize:17, fontWeight:700, color:'var(--text)' }}>{q.text}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}>=</span>
                        <DigitDropZone
                          paletteId={`q3p${gi}`}
                          digits={q3D[q.lbl]||[]}
                          zoneState={q3St[q.lbl]||'default'}
                          onDrop={q3Drop(q.lbl)}
                          onRemove={q3Rm(q.lbl)}
                        />
                      </div>
                    </div>
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkQ3(grpArr, gi)}
              />
              {q3FB[gi] && <FeedbackBox type={q3FB[gi].type} message={q3FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Excellent! You can add and subtract mentally and solve word problems."/>}
      </div>
    </div>
  );
}
