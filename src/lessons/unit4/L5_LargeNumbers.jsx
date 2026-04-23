// ============================================================
//  lessons/unit4/L5_LargeNumbers.jsx
//  Unit 4 · Lesson 5: Large Numbers
//  S1 (a–h): word problems, digit-drag, pairs
//  S2 (a–g): mixed drag + MCQ using five given numbers
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         GuidedHint, FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { shuffle } from '../../utils/shuffleUtils.js';

function grp(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// ── Section 1: large number word problems ──
const Q1 = [
  { lbl:'a', text:'What is 489,342 added to 342,098?',                      ans:831440,  guided:true,  hint:'Line up digits: 489342 + 342098. Add column by column from right. Answer: 831440.' },
  { lbl:'b', text:'What is the sum of 548,192 and 267,209?',                 ans:815401,  guided:true,  hint:'548192 + 267209. Work right to left — carry when needed. Answer: 815401.' },
  { lbl:'c', text:'Add together 3,290,037 and 1,692,205.',                   ans:4982242 },
  { lbl:'d', text:'What is the total of 416,239; 294,998 and 187,409?',      ans:898646 },
  { lbl:'e', text:'What is the difference between 592,344 and 143,908?',     ans:448436 },
  { lbl:'f', text:'Subtract 210,955 from 649,209.',                          ans:438254 },
  { lbl:'g', text:'What is 3,402,996 less than 7,821,009?',                  ans:4418013 },
  { lbl:'h', text:'What is 7,093,855 take away 4,523,108?',                  ans:2570747 },
];

// ── Section 2: given numbers ──
const GIVEN = [7973326, 3098765, 396409, 690884, 732098];

const Q2_AB = [
  { lbl:'a', text:'What is the total of all the even numbers?',  ans:9396308, guided:true,  hint:'Even: 7973326, 690884, 732098. 7973326 + 690884 = 8664210, then + 732098 = 9396308.' },
  { lbl:'b', text:'What is the total of all the odd numbers?',   ans:3495174, guided:true,  hint:'Odd: 3098765 and 396409. 3098765 + 396409 = 3495174.' },
];

const Q2_C_RAW = {
  lbl:'c',
  text:'What is the largest total that can be made by adding two of these numbers?',
  opts:['11072091', '8705424', '8664210', '11071901'],
  ans:0,
};

const Q2_D_RAW = {
  lbl:'d',
  text:'Which three numbers have a total of 9,060,619?',
  opts:['7973326 + 690884 + 396409', '3098765 + 732098 + 396409', '7973326 + 732098 + 396409', '3098765 + 690884 + 732098'],
  ans:0,
};

const Q2_E = { lbl:'e', text:'What is the difference between the largest and smallest numbers?', ans:7576917 };

const Q2_FG_RAW = [
  {
    lbl:'f',
    text:'What is the difference between the two odd numbers?',
    opts:['2702356', '2702565', '7576917', '3495174'],
    ans:0,
  },
  {
    lbl:'g',
    text:'Which two numbers have a difference of 41,214?',
    opts:['732098 and 690884', '7973326 and 3098765', '396409 and 732098', '3098765 and 690884'],
    ans:0,
  },
];

export default function L5_LargeNumbers() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // Shuffle MCQ options at init
  const [q2cOpts] = useState(() => shuffle(Q2_C_RAW.opts.map((text, id) => ({ id, text }))));
  const [q2dOpts] = useState(() => shuffle(Q2_D_RAW.opts.map((text, id) => ({ id, text }))));
  const [q2fgOpts] = useState(() =>
    Object.fromEntries(Q2_FG_RAW.map(q => [q.lbl, shuffle(q.opts.map((text, id) => ({ id, text })))]))
  );

  // ── Section 1 state ──
  const q1D         = state.q1D         || {}, setQ1D         = setField('q1D');
  const q1St        = state.q1St        || {}, setQ1St        = setField('q1St');
  const q1FB        = state.q1FB        || {}, setQ1FB        = setField('q1FB');
  const q1GroupDone = state.q1GroupDone || {}, setQ1GroupDone = setField('q1GroupDone');

  // ── Section 2 drag state (a, b, e) ──
  const q2D         = state.q2D         || {}, setQ2D         = setField('q2D');
  const q2DrSt      = state.q2DrSt      || {}, setQ2DrSt      = setField('q2DrSt');

  // ── Section 2 MCQ state (c, d, f, g) ──
  const q2McqSel    = state.q2McqSel    || {}, setQ2McqSel    = setField('q2McqSel');
  const q2McqSt     = state.q2McqSt     || {}, setQ2McqSt     = setField('q2McqSt');

  // ── Section 2 feedback & group completion ──
  const q2FB        = state.q2FB        || {}, setQ2FB        = setField('q2FB');
  const q2GroupDone = state.q2GroupDone || {}, setQ2GroupDone = setField('q2GroupDone');

  const q1Groups = grp(Q1, 2);

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
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Align digits by place value and work column by column.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Read the key word: added/sum/total → +; difference/subtract/less than/take away → −` };
    }
    setQ1FB(p => ({ ...p, [gi]: fb }));
  };

  // ── Section 2 drag helpers ──
  const q2Val  = lbl => { const d = q2D[lbl] || []; return d.length ? parseInt(d.join(''), 10) : null; };
  const q2Drop = lbl => raw => {
    if (q2DrSt[lbl] === 'correct') return;
    if (raw === 'del') setQ2D(p => ({ ...p, [lbl]: (p[lbl]||[]).slice(0,-1) }));
    else if (raw.startsWith('digit:')) setQ2D(p => ({ ...p, [lbl]: [...(p[lbl]||[]), raw.split(':')[1]] }));
  };
  const q2Rm = lbl => i => {
    if (q2DrSt[lbl] === 'correct') return;
    setQ2D(p => { const a = [...(p[lbl]||[])]; a.splice(i,1); return { ...p, [lbl]: a }; });
  };

  const checkQ2Drag = (grpArr, gi, key) => {
    increment(`q2g${gi}`); const att = getAtt(`q2g${gi}`) + 1;
    let ok = 0; const ns = { ...q2DrSt };
    grpArr.forEach(q => {
      const v = q2Val(q.lbl);
      if (v === q.ans) { ns[q.lbl] = 'correct'; ok++; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setQ2DrSt(p => { const s = {...p}; if (s[q.lbl]==='wrong') delete s[q.lbl]; return s; }), 1200);
      }
    });
    setQ2DrSt(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      const nd = { ...q2GroupDone, [gi]:true };
      setQ2GroupDone(nd);
      if (nd[0] && nd[1] && nd[2] && nd[3] && nd[4]) prog.markDone('s2', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Check which numbers are even (end in 0,2,4,6,8) and which are odd.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Go back to the list of five numbers and identify even/odd.` };
    }
    setQ2FB(p => ({ ...p, [gi]: fb }));
  };

  // ── Section 2 MCQ helpers ──
  const q2McqOptState = (lbl, optId) => {
    const k = `${lbl}-${optId}`;
    if (q2McqSt[k] === 'correct') return 'correct';
    if (q2McqSt[k] === 'wrong')   return 'wrong';
    if (q2McqSel[lbl] === optId)  return 'selected';
    return 'default';
  };

  const checkQ2Mcq = (grpArr, gi, ansMap) => {
    increment(`q2mcqg${gi}`); const att = getAtt(`q2mcqg${gi}`) + 1;
    let ok = 0; const ns = { ...q2McqSt };
    grpArr.forEach(q => {
      const sel = q2McqSel[q.lbl];
      if (sel === q.ans) { ns[`${q.lbl}-${sel}`] = 'correct'; ok++; }
      else if (sel !== undefined) { ns[`${q.lbl}-${sel}`] = 'wrong'; }
    });
    setQ2McqSt(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      const nd = { ...q2GroupDone, [gi]:true };
      setQ2GroupDone(nd);
      if (nd[0] && nd[1] && nd[2] && nd[3] && nd[4]) prog.markDone('s2', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Try calculating each option with the given numbers.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Work out each option using the five numbers above.` };
    }
    setQ2FB(p => ({ ...p, [gi]: fb }));
  };

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 4 · Lesson 5" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Add and subtract large numbers up to millions, and analyse a set of numbers to solve problems"/>
        <ExplainPanel title="Key Concept: Column Addition & Subtraction with Large Numbers">
          <RuleBox>
            <strong>Always estimate first</strong> — round to the nearest thousand or ten-thousand.<br/>
            Line up digits by <strong>place value</strong>. Carry or borrow carefully column by column.<br/>
            Key words: <em>sum, total, add together</em> → +; &nbsp;<em>difference, subtract, take away, less than</em> → −
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* ── Section 1 ── */}
        <SectionCard badge={1} title="Answer these — remember to estimate first!" tagType="drag" tagLabel="Drag Digits"
          subtitle="Read each word problem and drag digits to build your answer. Check after each pair. ★ Guided: a & b">
          {q1Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette paletteId={`q1p${gi}`}/>
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
                          digits={q1D[q.lbl]||[]}
                          zoneState={q1St[q.lbl]||'default'}
                          onDrop={q1Drop(q.lbl)}
                          onRemove={q1Rm(q.lbl)}
                        />
                      </div>
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
        <SectionCard badge={2} title="Use these numbers to answer the problems" tagType="mcq" tagLabel="Mixed"
          subtitle="Use the five numbers below. ★ Guided: a & b">

          {/* Given numbers display */}
          <div style={{
            display:'flex', flexWrap:'wrap', gap:10, padding:'12px 16px 4px',
            marginBottom:4,
          }}>
            {GIVEN.map(n => (
              <span key={n} style={{
                background:'var(--blue-light)', border:'2px solid var(--border)',
                borderRadius:8, padding:'4px 14px',
                fontSize:20, fontWeight:900, color:'var(--text)',
              }}>{n.toLocaleString()}</span>
            ))}
          </div>

          {/* Group 0: a & b — drag */}
          <QGroup title="Questions A & B">
            <DigitPalette paletteId="q2abp"/>
            {Q2_AB.map((q, qi) => (
              <QItem key={q.lbl} last={qi === Q2_AB.length - 1}>
                {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                <QItemLabel>
                  <LblCircle letter={q.lbl}/>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <span style={{ fontSize:17, fontWeight:700, color:'var(--text)' }}>{q.text}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}>=</span>
                      <DigitDropZone
                        digits={q2D[q.lbl]||[]}
                        zoneState={q2DrSt[q.lbl]||'default'}
                        onDrop={q2Drop(q.lbl)}
                        onRemove={q2Rm(q.lbl)}
                      />
                    </div>
                  </div>
                </QItemLabel>
              </QItem>
            ))}
            <CheckButton label="✓ Check A & B" onClick={() => checkQ2Drag(Q2_AB, 0)}/>
            {q2FB[0] && <FeedbackBox type={q2FB[0].type} message={q2FB[0].text}/>}
          </QGroup>

          {/* Group 1: c — MCQ */}
          <QGroup title="Question C">
            <QItem last>
              <QItemLabel>
                <LblCircle letter="c"/>
                <span style={{ fontSize:17, fontWeight:700, color:'var(--text)' }}>{Q2_C_RAW.text}</span>
              </QItemLabel>
              <MCQOptions
                options={q2cOpts.map(o => ({ id:o.id, label:o.text, state:q2McqOptState('c', o.id) }))}
                onSelect={id => { if (q2McqSt[`c-${id}`] !== 'correct') setQ2McqSel(p => ({ ...p, c:id })); }}
              />
            </QItem>
            <CheckButton label="✓ Check C"
              onClick={() => checkQ2Mcq([{ lbl:'c', ans:Q2_C_RAW.ans }], 1)}/>
            {q2FB[1] && <FeedbackBox type={q2FB[1].type} message={q2FB[1].text}/>}
          </QGroup>

          {/* Group 2: d — MCQ */}
          <QGroup title="Question D">
            <QItem last>
              <QItemLabel>
                <LblCircle letter="d"/>
                <span style={{ fontSize:17, fontWeight:700, color:'var(--text)' }}>{Q2_D_RAW.text}</span>
              </QItemLabel>
              <MCQOptions
                options={q2dOpts.map(o => ({ id:o.id, label:o.text, state:q2McqOptState('d', o.id) }))}
                onSelect={id => { if (q2McqSt[`d-${id}`] !== 'correct') setQ2McqSel(p => ({ ...p, d:id })); }}
              />
            </QItem>
            <CheckButton label="✓ Check D"
              onClick={() => checkQ2Mcq([{ lbl:'d', ans:Q2_D_RAW.ans }], 2)}/>
            {q2FB[2] && <FeedbackBox type={q2FB[2].type} message={q2FB[2].text}/>}
          </QGroup>

          {/* Group 3: e — drag */}
          <QGroup title="Question E">
            <DigitPalette paletteId="q2ep"/>
            <QItem last>
              <QItemLabel>
                <LblCircle letter="e"/>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <span style={{ fontSize:17, fontWeight:700, color:'var(--text)' }}>{Q2_E.text}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:20, fontWeight:800, color:'var(--text)' }}>=</span>
                    <DigitDropZone
                      digits={q2D['e']||[]}
                      zoneState={q2DrSt['e']||'default'}
                      onDrop={q2Drop('e')}
                      onRemove={q2Rm('e')}
                    />
                  </div>
                </div>
              </QItemLabel>
            </QItem>
            <CheckButton label="✓ Check E"
              onClick={() => checkQ2Drag([Q2_E], 3)}/>
            {q2FB[3] && <FeedbackBox type={q2FB[3].type} message={q2FB[3].text}/>}
          </QGroup>

          {/* Group 4: f & g — MCQ */}
          <QGroup title="Questions F & G">
            {Q2_FG_RAW.map((q, qi) => (
              <QItem key={q.lbl} last={qi === Q2_FG_RAW.length - 1}>
                <QItemLabel>
                  <LblCircle letter={q.lbl}/>
                  <span style={{ fontSize:17, fontWeight:700, color:'var(--text)' }}>{q.text}</span>
                </QItemLabel>
                <MCQOptions
                  options={q2fgOpts[q.lbl].map(o => ({ id:o.id, label:o.text, state:q2McqOptState(q.lbl, o.id) }))}
                  onSelect={id => { if (q2McqSt[`${q.lbl}-${id}`] !== 'correct') setQ2McqSel(p => ({ ...p, [q.lbl]:id })); }}
                />
              </QItem>
            ))}
            <CheckButton label="✓ Check F & G"
              onClick={() => checkQ2Mcq(Q2_FG_RAW, 4)}/>
            {q2FB[4] && <FeedbackBox type={q2FB[4].type} message={q2FB[4].text}/>}
          </QGroup>
        </SectionCard>

        {prog.allDone && <Summary message="Well done! You can add and subtract large numbers and analyse number sets."/>}
      </div>
    </div>
  );
}
