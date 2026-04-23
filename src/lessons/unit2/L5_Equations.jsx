// ============================================================
//  lessons/unit2/L5_Equations.jsx
//  Unit 2 · Lesson 5: Equations
//  s1: Word problems (MCQ, 8 items)
//  s2: One-step equations with symbols/letters (TwoStep, 8 items)
//  s3: Two-step equations (TwoStep, 6 items)
// ============================================================
import React from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack, FeedbackBox, LblCircle, CheckButton, Summary, GuidedHint } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { TwoStepQuestion } from '../../components/interactions/TwoStepQuestion.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { shuffle } from '../../utils/shuffleUtils.js';

// s1: Word problems → equation MCQ (8 items, pairs)
const WORD_QS = [
  { lbl:'a', problem:'What number when added to 9 gives 12?',          ans:3,  opts:[3,21,4,108], guided:true,  hint:'n + 9 = 12, so n = 12 − 9 = 3.' },
  { lbl:'b', problem:'What number when multiplied by 6 gives 42?',      ans:7,  opts:[7,36,48,8],  guided:true,  hint:'6n = 42, so n = 42 ÷ 6 = 7.' },
  { lbl:'c', problem:'I subtract 5 from a number and get 18. The number is?', ans:23, opts:[23,13,90,3.6], guided:false },
  { lbl:'d', problem:'I divide a number by 4 and get 11. The number is?',     ans:44, opts:[44,7,15,2.75], guided:false },
  { lbl:'e', problem:'I add 14 to a number and get 30. The number is?',       ans:16, opts:[16,44,2.1,420], guided:false },
  { lbl:'f', problem:'I multiply a number by 8 and get 56. The number is?',   ans:7,  opts:[7,48,64,448],  guided:false },
  { lbl:'g', problem:'I take 9 away from a number and get 17. The number is?',ans:26, opts:[26,8,153,1.9], guided:false },
  { lbl:'h', problem:'I share a number equally between 5 and each gets 12. The number is?', ans:60, opts:[60,17,7,2.4], guided:false },
];

// s2: One-step equations with symbols/letters (TwoStep, 8 items)
const ONE_QS = [
  { lbl:'a', eq:'16 + ☆ = 23', sym:'☆', ans:7, guided:true,
    s1q:'To find ☆, undo "+ 16" by doing what to 23?',
    s1opts:[{id:'0',label:'23 − 16 = 7'},{id:'1',label:'23 + 16 = 39'},{id:'2',label:'23 × 16 = 368'},{id:'3',label:'23 ÷ 16 = 1.4'}], s1ans:'0', s2q:'So ☆ = 23 − 16 =' },
  { lbl:'b', eq:'□ − 8 = 7', sym:'□', ans:15, guided:true,
    s1q:'To find □, undo "− 8" by doing what to 7?',
    s1opts:[{id:'0',label:'7 + 8 = 15'},{id:'1',label:'7 − 8 = −1'},{id:'2',label:'7 × 8 = 56'},{id:'3',label:'7 ÷ 8 = 0.9'}], s1ans:'0', s2q:'So □ = 7 + 8 =' },
  { lbl:'c', eq:'a + 19 = 31', sym:'a', ans:12, guided:false,
    s1q:'To find a, undo "+ 19" by doing what to 31?',
    s1opts:[{id:'0',label:'31 − 19 = 12'},{id:'1',label:'31 + 19 = 50'},{id:'2',label:'31 × 19 = 589'},{id:'3',label:'31 ÷ 19 = 1.6'}], s1ans:'0', s2q:'So a = 31 − 19 =' },
  { lbl:'d', eq:'b − 13 = 9', sym:'b', ans:22, guided:false,
    s1q:'To find b, undo "− 13" by doing what to 9?',
    s1opts:[{id:'0',label:'9 + 13 = 22'},{id:'1',label:'9 − 13 = −4'},{id:'2',label:'9 × 13 = 117'},{id:'3',label:'9 ÷ 13 = 0.7'}], s1ans:'0', s2q:'So b = 9 + 13 =' },
  { lbl:'e', eq:'7c = 56', sym:'c', ans:8, guided:false,
    s1q:'To find c, undo "× 7" by doing what to 56?',
    s1opts:[{id:'0',label:'56 ÷ 7 = 8'},{id:'1',label:'56 × 7 = 392'},{id:'2',label:'56 − 7 = 49'},{id:'3',label:'56 + 7 = 63'}], s1ans:'0', s2q:'So c = 56 ÷ 7 =' },
  { lbl:'f', eq:'d ÷ 6 = 4', sym:'d', ans:24, guided:false,
    s1q:'To find d, undo "÷ 6" by doing what to 4?',
    s1opts:[{id:'0',label:'4 × 6 = 24'},{id:'1',label:'4 ÷ 6 = 0.7'},{id:'2',label:'4 − 6 = −2'},{id:'3',label:'4 + 6 = 10'}], s1ans:'0', s2q:'So d = 4 × 6 =' },
  { lbl:'g', eq:'△ × 9 = 81', sym:'△', ans:9, guided:false,
    s1q:'To find △, undo "× 9" by doing what to 81?',
    s1opts:[{id:'0',label:'81 ÷ 9 = 9'},{id:'1',label:'81 × 9 = 729'},{id:'2',label:'81 − 9 = 72'},{id:'3',label:'81 + 9 = 90'}], s1ans:'0', s2q:'So △ = 81 ÷ 9 =' },
  { lbl:'h', eq:'42 − ◇ = 17', sym:'◇', ans:25, guided:false,
    s1q:'To find ◇, rearrange: ◇ = 42 − 17. What is that?',
    s1opts:[{id:'0',label:'42 − 17 = 25'},{id:'1',label:'42 + 17 = 59'},{id:'2',label:'42 × 17 = 714'},{id:'3',label:'42 ÷ 17 = 2.5'}], s1ans:'0', s2q:'So ◇ = 42 − 17 =' },
];

// s3: Two-step equations (TwoStep, 6 items in pairs)
const TWO_QS = [
  { lbl:'a', eq:'5e + 8 = 28', sym:'e', ans:4, guided:true,
    s1q:'First undo "+ 8": 28 − 8 = ?',
    s1opts:[{id:'0',label:'28 − 8 = 20'},{id:'1',label:'28 + 8 = 36'},{id:'2',label:'28 × 8 = 224'},{id:'3',label:'28 ÷ 8 = 3.5'}], s1ans:'0', s2q:'Now find e: 20 ÷ 5 =' },
  { lbl:'b', eq:'4h − 12 = 12', sym:'h', ans:6, guided:true,
    s1q:'First undo "− 12": 12 + 12 = ?',
    s1opts:[{id:'0',label:'12 + 12 = 24'},{id:'1',label:'12 − 12 = 0'},{id:'2',label:'12 × 12 = 144'},{id:'3',label:'12 ÷ 12 = 1'}], s1ans:'0', s2q:'Now find h: 24 ÷ 4 =' },
  { lbl:'c', eq:'3k + 5 = 26', sym:'k', ans:7, guided:false,
    s1q:'First undo "+ 5": 26 − 5 = ?',
    s1opts:[{id:'0',label:'26 − 5 = 21'},{id:'1',label:'26 + 5 = 31'},{id:'2',label:'26 × 5 = 130'},{id:'3',label:'26 ÷ 5 = 5.2'}], s1ans:'0', s2q:'Now find k: 21 ÷ 3 =' },
  { lbl:'d', eq:'2m − 7 = 13', sym:'m', ans:10, guided:false,
    s1q:'First undo "− 7": 13 + 7 = ?',
    s1opts:[{id:'0',label:'13 + 7 = 20'},{id:'1',label:'13 − 7 = 6'},{id:'2',label:'13 × 7 = 91'},{id:'3',label:'13 ÷ 7 = 1.9'}], s1ans:'0', s2q:'Now find m: 20 ÷ 2 =' },
  { lbl:'e', eq:'6p + 4 = 40', sym:'p', ans:6, guided:false,
    s1q:'First undo "+ 4": 40 − 4 = ?',
    s1opts:[{id:'0',label:'40 − 4 = 36'},{id:'1',label:'40 + 4 = 44'},{id:'2',label:'40 × 4 = 160'},{id:'3',label:'40 ÷ 4 = 10'}], s1ans:'0', s2q:'Now find p: 36 ÷ 6 =' },
  { lbl:'f', eq:'5t − 9 = 16', sym:'t', ans:5, guided:false,
    s1q:'First undo "− 9": 16 + 9 = ?',
    s1opts:[{id:'0',label:'16 + 9 = 25'},{id:'1',label:'16 − 9 = 7'},{id:'2',label:'16 × 9 = 144'},{id:'3',label:'16 ÷ 9 = 1.8'}], s1ans:'0', s2q:'Now find t: 25 ÷ 5 =' },
];

function grp(arr,n){const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out;}

export default function L5_Equations() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // s1: word MCQ
  const wSel = state.wSel || {}, setWSel = setField('wSel');
  const wSt  = state.wSt  || {}, setWSt  = setField('wSt');
  const wFB  = state.wFB  || {}, setWFB  = setField('wFB');

  // s2 + s3 share digit/zone state per question label
  const digits = state.digits || {}, setDigits = setField('digits');
  const zSt    = state.zSt    || {}, setZSt    = setField('zSt');
  const fb2    = state.fb2    || {}, setFb2    = setField('fb2');
  const done2  = state.done2  || {}, setDone2  = setField('done2');
  const fb3    = state.fb3    || {}, setFb3    = setField('fb3');
  const done3  = state.done3  || {}, setDone3  = setField('done3');

  const drop=(lbl)=>(raw)=>{
    if(zSt[lbl]==='correct')return;
    if(raw==='del')setDigits(p=>({...p,[lbl]:(p[lbl]||[]).slice(0,-1)}));
    else if(raw.startsWith('digit:'))setDigits(p=>({...p,[lbl]:[...(p[lbl]||[]),raw.split(':')[1]]}));
  };
  const rm=(lbl)=>(i)=>{if(zSt[lbl]==='correct')return;setDigits(p=>{const a=[...(p[lbl]||[])];a.splice(i,1);return{...p,[lbl]:a};});};
  const val=(lbl)=>{const d=digits[lbl]||[];return d.length?parseInt(d.join(''),10):null;};

  const checkWord=(ga,gi)=>{
    increment(`w${gi}`);const att=getAtt(`w${gi}`)+1;
    let ok=0;const ns={...wSt};
    ga.forEach(q=>{
      const s=wSel[q.lbl];
      if(s===q.ans){ns[`${q.lbl}-${s}`]='correct';ok++;}
      else{if(s!==undefined)ns[`${q.lbl}-${s}`]='wrong';}
    });
    setWSt(ns);
    const total=ga.length;
    let fb;
    if(ok===total)fb={type:'correct',text:`🎉 ${ok}/${total} correct!`};
    else if(att>=3)fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2)fb={type:'hint',text:`💡 ${ok}/${total} correct. Write each problem as an equation, then solve.`};
    else fb={type:'wrong',text:'✗ Translate the words to an equation: e.g. n + 9 = 12.'};
    setWFB(p=>({...p,[gi]:fb}));
    if(ok===total){
      const allG=grp(WORD_QS,2);
      const correctGroups=Object.values({...wFB,[gi]:fb}).filter(f=>f.type==='correct').length;
      if(correctGroups>=allG.length){
        prog.markDone('s1',{correct:WORD_QS.length,total:WORD_QS.length,attempts:att});
      }
    }
  };

  const checkSolve=(q,sid,fbState,setFbState,doneState,setDoneState,allQs)=>{
    increment(`${sid}_${q.lbl}`);const att=getAtt(`${sid}_${q.lbl}`)+1;
    const v=val(q.lbl);
    let fb;
    if(v===q.ans){
      setZSt(p=>({...p,[q.lbl]:'correct'}));
      fb={type:'correct',text:`🎉 Correct! ${q.sym} = ${q.ans}`};
      const nd={...doneState,[q.lbl]:true};setDoneState(nd);
      if(Object.keys(nd).length>=allQs.length){
        prog.markDone(sid,{correct:allQs.length,total:allQs.length,attempts:att});
      }
    } else {
      setZSt(p=>({...p,[q.lbl]:'wrong'}));
      if(att>=3) fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
      else if(att===2) fb={type:'hint',text:'💡 Not right. Follow the reverse steps from Step 1.'};
      else fb={type:'wrong',text:'✗ Incorrect. Use the reverse operation from Step 1.'};
      setTimeout(()=>setZSt(p=>{const s={...p};if(s[q.lbl]==='wrong')delete s[q.lbl];return s;}),1200);
    }
    setFbState(p=>({...p,[q.lbl]:fb}));
  };

  const renderEqGroup=(qs,sid,fbState,setFbState,doneState,setDoneState)=>qs.map(q=>(
    <QGroup key={q.lbl} title={`Equation ${q.lbl.toUpperCase()}`}>
      <QItem>
        {q.guided&&<GuidedHint>Work backwards: undo each operation in reverse order.</GuidedHint>}
        <QItemLabel><LblCircle letter={q.lbl}/><span style={{fontSize:22,fontWeight:900,background:'#F0F7FF',border:'2px solid var(--border)',borderRadius:12,padding:'8px 16px',display:'inline-block'}}>{q.eq}</span></QItemLabel>
        <TwoStepQuestion
          step1Question={q.s1q} step1Options={q.s1opts} step1AnswerId={q.s1ans}
          step2Question={q.s2q}
          digits={digits[q.lbl]||[]} zoneState={zSt[q.lbl]||'default'}
          onDigitDrop={drop(q.lbl)} onDigitRemove={rm(q.lbl)}
        />
        <CheckButton label={`✓ Check ${q.lbl.toUpperCase()}`} onClick={()=>checkSolve(q,sid,fbState,setFbState,doneState,setDoneState,qs)} disabled={zSt[q.lbl]==='correct'}/>
        {fbState[q.lbl]&&<FeedbackBox type={fbState[q.lbl].type} message={fbState[q.lbl].text}/>}
      </QItem>
    </QGroup>
  ));

  return (
    <div style={{fontFamily:'var(--font)'}}>
      <Header lessonChip="Unit 2 · Lesson 5" completed={prog.completedCount} total={3}/>
      <div className="page">
        <ObjectiveCard text="Write and solve equations using inverse operations"/>
        <ExplainPanel title="Key Concept: Solving Equations">
          <RuleBox>
            To solve an equation, <strong>work backwards</strong> using the inverse operation:<br/>
            + ↔ − &nbsp;&nbsp; × ↔ ÷<br/>
            e.g. n + 7 = 15 → n = 15 − 7 = <strong>8</strong><br/>
            e.g. 2n + 3 = 19 → first 19 − 3 = 16, then 16 ÷ 2 = <strong>8</strong>
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={3}/>

        <SectionCard badge={1} title="Solve these word problems" tagType="mcq" tagLabel="MCQ" subtitle="★ Guided: a & b" score={prog.done['s1']}>
          {grp(WORD_QS,2).map((ga,gi)=>(
            <QGroup key={gi} title={`Questions ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q,qi)=>{
                const opts=shuffle(q.opts).map(v=>({id:v,label:String(v),state:wSt[`${q.lbl}-${v}`]||(wSel[q.lbl]===v?'selected':'default')}));
                return (
                  <QItem key={q.lbl} last={qi===ga.length-1}>
                    {q.guided&&<GuidedHint>{q.hint}</GuidedHint>}
                    <QItemLabel><LblCircle letter={q.lbl}/><span style={{fontSize:16,fontWeight:700}}>{q.problem}</span></QItemLabel>
                    <MCQOptions options={opts} onSelect={v=>setWSel(p=>({...p,[q.lbl]:v}))}/>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={()=>checkWord(ga,gi)}/>
              {wFB[gi]&&<FeedbackBox type={wFB[gi].type} message={wFB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        <SectionCard badge={2} title="Solve one-step equations with symbols and letters" tagType="step" tagLabel="2 Steps" subtitle="Step 1: choose the inverse operation. Step 2: drag digits to build the answer. ★ Guided: a & b" score={prog.done['s2']}>
          {renderEqGroup(ONE_QS,'s2',fb2,setFb2,done2,setDone2)}
        </SectionCard>

        <SectionCard badge={3} title="Solve two-step equations" tagType="step" tagLabel="2 Steps" subtitle="Undo + or − first, then × or ÷. ★ Guided: a & b" score={prog.done['s3']}>
          {renderEqGroup(TWO_QS,'s3',fb3,setFb3,done3,setDone3)}
        </SectionCard>

        {prog.allDone&&<Summary message="Brilliant! You can solve word problems and equations using inverse operations!"/>}
      </div>
    </div>
  );
}
