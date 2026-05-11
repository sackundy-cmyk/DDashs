// ============================================================
//  lessons/unit5/L1_Brackets.jsx
//  Unit 5 · Lesson 1: Brackets
//  Q1: digit-drag answers  Q2: MCQ bracket position
//  Q3: 2-step missing num  Q4: two-part bracket answers
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         GuidedHint, FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { TwoStepQuestion } from '../../components/interactions/TwoStepQuestion.jsx';
import { TwoPartAnswer } from '../../components/interactions/TwoPartAnswer.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { evalExpr } from '../../utils/mathUtils.js';
import { shuffle } from '../../utils/shuffleUtils.js';

// ── Q1 data ──
const Q1 = [
  { lbl:'a', expr:'(37 − 13) + 4',          ans:28,  guided:true,  hint:'First 37 − 13, then add 4.' },
  { lbl:'b', expr:'84 − (17 + 32)',          ans:35,  guided:true,  hint:'First 17 + 32 inside brackets, then subtract from 84.' },
  { lbl:'c', expr:'(43 − 15) × 2',           ans:56,  guided:false },
  { lbl:'d', expr:'56 − (48 − 19)',          ans:27,  guided:false },
  { lbl:'e', expr:'3 × (29 − 15)',           ans:42,  guided:false },
  { lbl:'f', expr:'(14 + 56) ÷ 2',           ans:35,  guided:false },
  { lbl:'g', expr:'(48 + 83) − (53 + 45)',   ans:33,  guided:false },
  { lbl:'h', expr:'(9 × 4) ÷ (23 − 19)',     ans:9,   guided:false },
  { lbl:'i', expr:'(57 − 39) + (93 − 66)',   ans:45,  guided:false },
  { lbl:'j', expr:'(6 × 15) ÷ (94 − 84)',    ans:9,   guided:false },
];

// ── Q2 data ──
const Q2_RAW = [
  { lbl:'a', opts:['(49 − 34) − 3', '49 − (34 − 3)'] },
  { lbl:'b', opts:['(84 − 55) − 11','84 − (55 − 11)'] },
  { lbl:'c', opts:['(53 − 39) + 4', '53 − (39 + 4)'] },
  { lbl:'d', opts:['(84 − 26) − 40','84 − (26 − 40)'] },
  { lbl:'e', opts:['(90 − 86) − 14','90 − (86 − 14)'] },
];
const Q2 = Q2_RAW.map(q => {
  const v0 = evalExpr(q.opts[0]), v1 = evalExpr(q.opts[1]);
  return { ...q, ans: Math.round(v0) === 18 ? 0 : 1 };
});

// ── Q3 data ──
const Q3 = [
  { lbl:'a', display:'(? × 4) − 1 = 11', ans:3,  guided:true,  hint:'Work backwards: 11 + 1 = 12, then 12 ÷ 4 = ?',
    s1q:'To find ?, first undo the "− 1" by doing what to 11?',
    s1opts:[{id:'0',label:'11 + 1 = 12'},{id:'1',label:'11 − 1 = 10'},{id:'2',label:'11 × 1 = 11'},{id:'3',label:'11 ÷ 1 = 11'}],
    s1ans:'0', s2q:'Now divide 12 by 4 to find ?' },
  { lbl:'b', display:'10 − (? × 3) = 4', ans:2,  guided:true,  hint:'10 − 4 = 6, so ? × 3 = 6, so ? = 6 ÷ 3',
    s1q:'To find ?, first undo the "10 −" by doing what?',
    s1opts:[{id:'0',label:'10 − 4 = 6'},{id:'1',label:'10 + 4 = 14'},{id:'2',label:'4 − 10 = −6'},{id:'3',label:'4 × 10 = 40'}],
    s1ans:'0', s2q:'Now divide 6 by 3 to find ?' },
  { lbl:'c', display:'(4 × 2) + (? × 3) = 17', ans:3, guided:false,
    s1q:'4 × 2 = 8. So (? × 3) = 17 − 8 = ?',
    s1opts:[{id:'0',label:'17 − 8 = 9'},{id:'1',label:'17 + 8 = 25'},{id:'2',label:'17 × 8 = 136'},{id:'3',label:'17 ÷ 8 = 2'}],
    s1ans:'0', s2q:'Now divide 9 by 3 to find ?' },
  { lbl:'d', display:'(? × 5) − (5 × 4) = 10', ans:6, guided:false,
    s1q:'5 × 4 = 20. So (? × 5) = 10 + 20 = ?',
    s1opts:[{id:'0',label:'10 + 20 = 30'},{id:'1',label:'20 − 10 = 10'},{id:'2',label:'10 × 20 = 200'},{id:'3',label:'20 ÷ 10 = 2'}],
    s1ans:'0', s2q:'Now divide 30 by 5 to find ?' },
  { lbl:'e', display:'12 ÷ (? × 2) = 2', ans:3, guided:false,
    s1q:'To find ? × 2, rearrange: 12 ÷ 2 = ?',
    s1opts:[{id:'0',label:'12 ÷ 2 = 6'},{id:'1',label:'12 + 2 = 14'},{id:'2',label:'12 − 2 = 10'},{id:'3',label:'12 × 2 = 24'}],
    s1ans:'0', s2q:'Now divide 6 by 2 to find ?' },
  { lbl:'f', display:'(? × 5) ÷ 2 = 10', ans:4, guided:false,
    s1q:'To undo "÷ 2", multiply: 10 × 2 = ?',
    s1opts:[{id:'0',label:'10 × 2 = 20'},{id:'1',label:'10 ÷ 2 = 5'},{id:'2',label:'10 + 2 = 12'},{id:'3',label:'10 − 2 = 8'}],
    s1ans:'0', s2q:'Now divide 20 by 5 to find ?' },
];

// ── Q4 data ──
const Q4 = [
  { lbl:'a', raw:'19 × 2 + 4',  p1:'(19 × 2) + 4', p2:'19 × (2 + 4)' },
  { lbl:'b', raw:'80 − 46 − 10',p1:'(80 − 46) − 10',p2:'80 − (46 − 10)' },
  { lbl:'c', raw:'13 + 11 × 5', p1:'(13 + 11) × 5', p2:'13 + (11 × 5)' },
  { lbl:'d', raw:'96 ÷ 4 + 2',  p1:'(96 ÷ 4) + 2',  p2:'96 ÷ (4 + 2)' },
  { lbl:'e', raw:'39 − 14 + 13',p1:'(39 − 14) + 13',p2:'39 − (14 + 13)' },
  { lbl:'f', raw:'8 × 14 − 6',  p1:'(8 × 14) − 6',  p2:'8 × (14 − 6)' },
  { lbl:'g', raw:'56 − 4 × 10', p1:'(56 − 4) × 10', p2:'56 − (4 × 10)' },
  { lbl:'h', raw:'45 ÷ 3 + 2',  p1:'(45 ÷ 3) + 2',  p2:'45 ÷ (3 + 2)' },
].map(q => ({ ...q, ans1: Math.round(evalExpr(q.p1) * 100) / 100, ans2: Math.round(evalExpr(q.p2) * 100) / 100 }));

function grp(arr, n) {
  const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out;
}

export default function L1_Brackets() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(4, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // Digit zones for Q1, Q3, Q4
  const q1D  = state.q1D  || {}, setQ1D  = setField('q1D');
  const q1St = state.q1St || {}, setQ1St = setField('q1St');
  const q1FB = state.q1FB || {}, setQ1FB = setField('q1FB');

  const [q2Opts] = useState(() =>
    Object.fromEntries(Q2.map(q => [q.lbl, shuffle([{id:0,text:q.opts[0]},{id:1,text:q.opts[1]}])]))
  );
  const q2Sel = state.q2Sel || {}, setQ2Sel = setField('q2Sel');
  const q2St  = state.q2St  || {}, setQ2St  = setField('q2St');
  const q2FB  = state.q2FB  || {}, setQ2FB  = setField('q2FB');

  const q3D  = state.q3D  || {}, setQ3D  = setField('q3D');
  const q3St = state.q3St || {}, setQ3St = setField('q3St');
  const q3FB = state.q3FB || {}, setQ3FB = setField('q3FB');

  const q4D  = state.q4D  || {}, setQ4D  = setField('q4D');
  const q4St = state.q4St || {}, setQ4St = setField('q4St');
  const q4FB = state.q4FB || {}, setQ4FB = setField('q4FB');

  // ─ Q1 helpers ─
  const q1Drop = (lbl) => (raw) => {
    if (q1St[lbl] === 'correct') return;
    if (raw === 'del') setQ1D(p => ({ ...p, [lbl]: (p[lbl]||[]).slice(0,-1) }));
    else if (raw.startsWith('digit:')) setQ1D(p => ({ ...p, [lbl]: [...(p[lbl]||[]), raw.split(':')[1]] }));
  };
  const q1Rm = (lbl) => (i) => {
    if (q1St[lbl] === 'correct') return;
    setQ1D(p => { const a=[...(p[lbl]||[])];a.splice(i,1);return{...p,[lbl]:a}; });
  };
  const q1Val = (lbl) => { const d=(q1D[lbl]||[]); return d.length?parseInt(d.join(''),10):null; };

  const checkQ1 = (grpArr, gi) => {
    increment(`q1g${gi}`); const att = getAtt(`q1g${gi}`)+1;
    let ok=0; const ns={...q1St};
    grpArr.forEach(q=>{
      const v=q1Val(q.lbl);
      if(v===q.ans){ns[q.lbl]='correct';ok++;}
      else{
        ns[q.lbl]='wrong';
        setTimeout(()=>setQ1St(p=>{const s={...p};if(s[q.lbl]==='wrong')delete s[q.lbl];return s;}),1200);
      }
    });
    setQ1St(ns);
    const total=grpArr.length;
    let fb;
    if(ok===total)    fb={type:'correct',text:`🎉 ${ok}/${total} correct!`};
    else if(att>=3)   fb={type:'hint',   text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2)  fb={type:'hint',   text:`💡 ${ok}/${total} correct. Work through brackets step by step.`};
    else              fb={type:'wrong',  text:`✗ ${ok}/${total} correct. Calculate inside brackets first!`};
    setQ1FB(p=>({...p,[gi]:fb}));
    if(ok===total){
      const allG=grp(Q1,2);
      if(Object.keys({...q1FB,[gi]:fb}).length>=allG.length) prog.markDone('s1','✓');
    }
  };

  // ─ Q2 helpers ─
  const q2Select = (lbl, idx) => {
    if(q2St[`${lbl}-${idx}`]==='correct'||q2St[`${lbl}-${idx}`]==='wrong') return;
    setQ2Sel(p=>({...p,[lbl]:idx}));
  };
  const checkQ2 = (grpArr,gi) => {
    increment(`q2g${gi}`); const att=getAtt(`q2g${gi}`)+1;
    let ok=0; const ns={...q2St};
    grpArr.forEach(q=>{
      const sel=q2Sel[q.lbl];
      if(sel===q.ans){ns[`${q.lbl}-${sel}`]='correct';ok++;}
      else{
        if(sel!==undefined) ns[`${q.lbl}-${sel}`]='wrong';
      }
    });
    setQ2St(ns);
    const total=grpArr.length;
    let fb;
    if(ok===total)   fb={type:'correct',text:`🎉 ${ok}/${total} correct!`};
    else if(att>=3)  fb={type:'hint',   text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2) fb={type:'hint',   text:`💡 ${ok}/${total} correct. Calculate mentally — brackets first!`};
    else             fb={type:'wrong',  text:'✗ Work out each option in your head — brackets first!'};
    setQ2FB(p=>({...p,[gi]:fb}));
    if(ok===total){
      if(Object.keys({...q2FB,[gi]:fb}).length>=grp(Q2,2).length) prog.markDone('s2','✓');
    }
  };

  // ─ Q3 helpers ─
  const q3Drop=(lbl)=>(raw)=>{
    if(q3St[lbl]==='correct') return;
    if(raw==='del') setQ3D(p=>({...p,[lbl]:(p[lbl]||[]).slice(0,-1)}));
    else if(raw.startsWith('digit:')) setQ3D(p=>({...p,[lbl]:[...(p[lbl]||[]),raw.split(':')[1]]}));
  };
  const q3Rm=(lbl)=>(i)=>{if(q3St[lbl]==='correct')return;setQ3D(p=>{const a=[...(p[lbl]||[])];a.splice(i,1);return{...p,[lbl]:a};});};
  const q3Val=(lbl)=>{const d=(q3D[lbl]||[]);return d.length?parseInt(d.join(''),10):null;};

  const checkQ3=(q)=>{
    increment(`q3_${q.lbl}`); const att=getAtt(`q3_${q.lbl}`)+1;
    const v=q3Val(q.lbl); let fb;
    if(v===q.ans){
      setQ3St(p=>({...p,[q.lbl]:'correct'}));
      fb={type:'correct',text:`🎉 Correct! The missing number is ${q.ans}.`};
      prog.markDone(`q3_${q.lbl}`,'✓');
      const allDone=Q3.every((_,i)=>prog.done[`q3_${Q3[i].lbl}`]||Q3[i].lbl===q.lbl);
      if(allDone) prog.markDone('s3','✓');
    } else {
      setQ3St(p=>({...p,[q.lbl]:'wrong'}));
      if(att>=3) fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
      else if(att===2) fb={type:'hint',text:'💡 Not right. Follow the reverse steps from Step 1.'};
      else fb={type:'wrong',text:'✗ Incorrect. Use the reverse operation from Step 1.'};
      setTimeout(()=>setQ3St(p=>{const s={...p};if(s[q.lbl]==='wrong')delete s[q.lbl];return s;}),1200);
    }
    setQ3FB(p=>({...p,[q.lbl]:fb}));
  };

  // ─ Q4 helpers ─
  const q4Drop=(lbl,part)=>(raw)=>{
    const k=`${lbl}-${part}`; if(q4St[k]==='correct') return;
    if(raw==='del') setQ4D(p=>({...p,[k]:(p[k]||[]).slice(0,-1)}));
    else if(raw.startsWith('digit:')) setQ4D(p=>({...p,[k]:[...(p[k]||[]),raw.split(':')[1]]}));
  };
  const q4Rm=(lbl,part)=>(i)=>{const k=`${lbl}-${part}`;if(q4St[k]==='correct')return;setQ4D(p=>{const a=[...(p[k]||[])];a.splice(i,1);return{...p,[k]:a};});};
  const q4Val=(lbl,part)=>{const k=`${lbl}-${part}`;const d=(q4D[k]||[]);return d.length?parseInt(d.join(''),10):null;};

  const checkQ4=(q)=>{
    increment(`q4_${q.lbl}`); const att=getAtt(`q4_${q.lbl}`)+1;
    const v1=q4Val(q.lbl,'1'),v2=q4Val(q.lbl,'2');
    const ok1=v1===q.ans1,ok2=v2===q.ans2;
    const ns={...q4St};
    if(ok1) ns[`${q.lbl}-1`]='correct';
    else{ns[`${q.lbl}-1`]='wrong';}
    if(ok2) ns[`${q.lbl}-2`]='correct';
    else{ns[`${q.lbl}-2`]='wrong';}
    setQ4St(ns);
    let fb;
    const correct=(ok1?1:0)+(ok2?1:0);
    if(correct===2)   fb={type:'correct',text:`🎉 Both parts correct! Part 1 = ${q.ans1}, Part 2 = ${q.ans2}`};
    else if(att>=3)   fb={type:'hint',   text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2)  fb={type:'hint',   text:`💡 ${correct}/2 correct. Brackets are calculated first!`};
    else              fb={type:'wrong',  text:`✗ ${correct}/2 correct. Calculate inside brackets first.`};
    setQ4FB(p=>({...p,[q.lbl]:fb}));
    if(correct===2){
      prog.markDone(`q4_${q.lbl}`,'✓');
      const allDone=Q4.every((_,i)=>prog.done[`q4_${Q4[i].lbl}`]||Q4[i].lbl===q.lbl);
      if(allDone) prog.markDone('s4','✓');
    }
  };

  const q1Groups=grp(Q1,2);
  const q2Groups=grp(Q2,2);

  const q2OptState=(lbl,optIdx)=>{
    const k=`${lbl}-${optIdx}`;
    if(q2St[k]==='correct') return 'correct';
    if(q2St[k]==='wrong')   return 'wrong';
    if(q2St[k]==='reveal')  return 'reveal';
    if(q2Sel[lbl]===optIdx) return 'selected';
    return 'default';
  };

  return (
    <div style={{fontFamily:'var(--font)'}}>
      <Header lessonChip="Unit 5 · Lesson 1" completed={prog.completedCount} total={4}/>
      <div className="page">
        <ObjectiveCard text="Use brackets correctly and understand how bracket position changes the answer"/>
        <ExplainPanel title="Key Concept: Brackets">
          <RuleBox>
            <strong>Brackets first!</strong> Always calculate the expression inside brackets before anything else.<br/>
            e.g. <strong>(4 × 5) + 3</strong> → 20 + 3 = <strong>23</strong> &nbsp;but&nbsp;
            <strong>4 × (5 + 3)</strong> → 4 × 8 = <strong>32</strong>
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={4}/>

        {/* Q1 */}
        <SectionCard badge={1} title="Write the answer for each of these" tagType="drag" tagLabel="Drag Digits"
          subtitle="Drag digit cards (0–9) to build your answer. ✕ DEL removes. Check after each pair. ★ Guided: a & b">
          {q1Groups.map((grpArr,gi)=>(
            <QGroup key={gi} title={`Questions ${grpArr.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette paletteId={`q1p${gi}`}/>
              {grpArr.map((q,qi)=>(
                <QItem key={q.lbl} last={qi===grpArr.length-1}>
                  {q.guided&&<GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <span style={{fontSize:20,fontWeight:800}}>{q.expr} =</span>
                    <DigitDropZone paletteId={`q1p${gi}`} digits={q1D[q.lbl]||[]} zoneState={q1St[q.lbl]||'default'} onDrop={q1Drop(q.lbl)} onRemove={q1Rm(q.lbl)}/>
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton label={`✓ Check ${grpArr.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={()=>checkQ1(grpArr,gi)}/>
              {q1FB[gi]&&<FeedbackBox type={q1FB[gi].type} message={q1FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* Q2 */}
        <SectionCard badge={2} title="Place the brackets to make the answer 18" tagType="mcq" tagLabel="MCQ"
          subtitle="Choose the bracket position that gives 18. Work it out mentally — brackets first! Check after each pair.">
          {q2Groups.map((grpArr,gi)=>(
            <QGroup key={gi} title={`Questions ${grpArr.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              {grpArr.map((q,qi)=>(
                <QItem key={q.lbl} last={qi===grpArr.length-1}>
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <span style={{fontSize:18,fontWeight:800}}>Which bracket position gives 18?</span>
                  </QItemLabel>
                  <MCQOptions
                    options={q2Opts[q.lbl].map(o=>({id:o.id,label:o.text,state:q2OptState(q.lbl,o.id)}))}
                    onSelect={idx=>q2Select(q.lbl,idx)}
                  />
                </QItem>
              ))}
              <CheckButton label={`✓ Check ${grpArr.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={()=>checkQ2(grpArr,gi)}/>
              {q2FB[gi]&&<FeedbackBox type={q2FB[gi].type} message={q2FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* Q3 */}
        <SectionCard badge={3} title="Write the missing numbers — step by step" tagType="step" tagLabel="2 Steps"
          subtitle="Step 1: choose the reverse operation. Step 2: drag digits to build the missing number. One check per question.">
          {Q3.map(q=>(
            <QGroup key={q.lbl} title={`Question ${q.lbl.toUpperCase()}`}>
              <QItem>
                {q.guided&&<GuidedHint>{q.hint}</GuidedHint>}
                <QItemLabel><LblCircle letter={q.lbl}/><span style={{fontSize:22,fontWeight:800}}>{q.display}</span></QItemLabel>
                <TwoStepQuestion
                  paletteId={`q3p${q.lbl}`}
                  step1Question={q.s1q}
                  step1Options={q.s1opts}
                  step1AnswerId={q.s1ans}
                  step2Question={q.s2q}
                  digits={q3D[q.lbl]||[]}
                  zoneState={q3St[q.lbl]||'default'}
                  onDigitDrop={q3Drop(q.lbl)}
                  onDigitRemove={q3Rm(q.lbl)}
                />
                <CheckButton label={`✓ Check ${q.lbl.toUpperCase()}`} onClick={()=>checkQ3(q)} disabled={q3St[q.lbl]==='correct'}/>
                {q3FB[q.lbl]&&<FeedbackBox type={q3FB[q.lbl].type} message={q3FB[q.lbl].text}/>}
              </QItem>
            </QGroup>
          ))}
        </SectionCard>

        {/* Q4 */}
        <SectionCard badge={4} title="Copy each calculation twice — use brackets to give different answers" tagType="drag" tagLabel="Drag Digits"
          subtitle="Each question has Part 1 and Part 2 with different bracket positions. Drag digits to answer both. Own number cards per question.">
          {Q4.map(q=>(
            <QGroup key={q.lbl} title={`Question ${q.lbl.toUpperCase()}`}>
              <QItem>
                <QItemLabel><LblCircle letter={q.lbl}/><span style={{fontSize:22,fontWeight:900}}>{q.raw}</span></QItemLabel>
                <DigitPalette paletteId={`q4p${q.lbl}`}/>
                <TwoPartAnswer
                  paletteId={`q4p${q.lbl}`}
                  part1Label={q.p1} part2Label={q.p2}
                  digits1={q4D[`${q.lbl}-1`]||[]} digits2={q4D[`${q.lbl}-2`]||[]}
                  state1={q4St[`${q.lbl}-1`]||'default'} state2={q4St[`${q.lbl}-2`]||'default'}
                  onDrop1={q4Drop(q.lbl,'1')} onDrop2={q4Drop(q.lbl,'2')}
                  onRemove1={q4Rm(q.lbl,'1')} onRemove2={q4Rm(q.lbl,'2')}
                />
                <CheckButton label={`✓ Check ${q.lbl.toUpperCase()}`} onClick={()=>checkQ4(q)} disabled={q4St[`${q.lbl}-1`]==='correct'&&q4St[`${q.lbl}-2`]==='correct'}/>
                {q4FB[q.lbl]&&<FeedbackBox type={q4FB[q.lbl].type} message={q4FB[q.lbl].text}/>}
              </QItem>
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone&&<Summary message="Excellent! You have mastered how brackets change calculations!"/>}
      </div>
    </div>
  );
}
