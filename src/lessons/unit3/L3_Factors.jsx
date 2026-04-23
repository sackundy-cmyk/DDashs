// ============================================================
//  lessons/unit3/L3_Factors.jsx
//  Unit 3 · Lesson 3: Factors & HCF
//  Q1: drag factor cards into ordered slots
//  Q2: MCQ common factor sets
//  Q3: MCQ HCF (4 choices)
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         GuidedHint, FeedbackBox, LblCircle, NumChip, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { getFactors, getCommonFactors, hcf } from '../../utils/mathUtils.js';
import { shuffle } from '../../utils/shuffleUtils.js';
import { wrongCFSets } from '../../utils/wrongAnswerGen.js';

const Q1 = [
  { lbl:'a', n:12, guided:true,  hint:'Try dividing 12 by 1,2,3… Which give no remainder?' },
  { lbl:'b', n:27, guided:true,  hint:'27÷1=27 ✓  27÷3=9 ✓  27÷9=3 ✓  27÷27=1 ✓' },
  { lbl:'c', n:45, guided:false },
  { lbl:'d', n:36, guided:false },
  { lbl:'e', n:30, guided:false },
  { lbl:'f', n:42, guided:false },
  { lbl:'g', n:14, guided:false },
  { lbl:'h', n:48, guided:false },
];

const Q2 = [
  { lbl:'a', nums:[12,42]       },
  { lbl:'b', nums:[27,45]       },
  { lbl:'c', nums:[14,42]       },
  { lbl:'d', nums:[36,48]       },
  { lbl:'e', nums:[30,45]       },
  { lbl:'f', nums:[27,36,45]    },
  { lbl:'g', nums:[36,42,48]    },
  { lbl:'h', nums:[12,14,30]    },
  { lbl:'i', nums:[12,36,48]    },
  { lbl:'j', nums:[27,30,42]    },
];

const Q3 = [
  { lbl:'a', nums:[12,42], guided:true,  hint:'Common factors of 12 and 42, then pick the largest.' },
  { lbl:'b', nums:[27,45], guided:true,  hint:'Common factors of 27 and 45: 1,3,9 — so HCF = 9.' },
  { lbl:'c', nums:[14,42], guided:false },
  { lbl:'d', nums:[36,48], guided:false },
  { lbl:'e', nums:[30,45], guided:false },
  { lbl:'f', nums:[36,42], guided:false },
];

function fmt(arr){ return arr.join(', '); }
function grp(arr,n){ const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out; }

export default function L3_Factors() {
  const q1SlotsInit = Object.fromEntries(Q1.map(q=>{ const f=getFactors(q.n); return [q.lbl, f.slice(1).map(()=>({value:null,state:'default'}))]; }));
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── Q1 state ──
  const q1Slots = state.q1Slots || q1SlotsInit, setQ1Slots = setField('q1Slots', q1SlotsInit);
  const q1FB    = state.q1FB    || {},          setQ1FB    = setField('q1FB');
  const q1Done  = state.q1Done  || {},          setQ1Done  = setField('q1Done');

  // ── Q2 MCQ state ──
  const [q2Opts] = useState(()=> Object.fromEntries(Q2.map(q=>{
    const cf=getCommonFactors(q.nums);
    const wrongs=wrongCFSets(cf, getFactors(q.nums[0]));
    const opts=shuffle([{vals:cf,c:true},...wrongs.map(w=>({vals:w,c:false}))]).slice(0,4);
    return [q.lbl, opts.map((o,i)=>({id:i,label:fmt(o.vals),isCorrect:o.c}))];
  })));
  const q2Sel   = state.q2Sel   || {}, setQ2Sel   = setField('q2Sel');
  const q2OptSt = state.q2OptSt || {}, setQ2OptSt = setField('q2OptSt');
  const q2FB    = state.q2FB    || {}, setQ2FB    = setField('q2FB');
  const q2Done  = state.q2Done  || {}, setQ2Done  = setField('q2Done');

  // ── Q3 MCQ state ──
  const [q3Opts] = useState(()=> Object.fromEntries(Q3.map(q=>{
    const h=hcf(q.nums);
    const cf=getCommonFactors(q.nums);
    const wrongs=shuffle([...cf.slice(0,-1).reverse(),...[h+1,h-1,h*2].filter(v=>v>0&&v!==h)]).slice(0,3);
    while(wrongs.length<3) wrongs.push(h+wrongs.length+1);
    return [q.lbl, shuffle([{val:h,c:true},...wrongs.map(v=>({val:v,c:false}))]).map((o,i)=>({id:i,label:String(o.val),isCorrect:o.c,val:o.val}))];
  })));
  const q3Sel   = state.q3Sel   || {}, setQ3Sel   = setField('q3Sel');
  const q3OptSt = state.q3OptSt || {}, setQ3OptSt = setField('q3OptSt');
  const q3FB    = state.q3FB    || {}, setQ3FB    = setField('q3FB');
  const q3Done  = state.q3Done  || {}, setQ3Done  = setField('q3Done');

  // ── Q1 check ──
  const checkQ1 = (q) => {
    const factors = getFactors(q.n);
    const expected = factors.slice(1);
    increment(`q1_${q.lbl}`); const att=getAtt(`q1_${q.lbl}`)+1;
    let ok=0;
    const newSlots = [...q1Slots[q.lbl]];
    newSlots.forEach((sl,i) => {
      if (sl.value===expected[i]) { newSlots[i]={value:expected[i],state:'correct'}; ok++; }
      else if (sl.value===null) {
        // leave empty
      } else {
        newSlots[i]={...sl,state:'wrong'};
      }
    });
    setQ1Slots(p=>({...p,[q.lbl]:newSlots}));
    let fb;
    if(ok===expected.length) fb={type:'correct',text:`🎉 All factors correct! ${q.n}: ${factors.join(', ')}`};
    else if(att>=3) fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2) fb={type:'hint',text:`💡 ${ok}/${expected.length} correct. Factors come in pairs — if 2 is a factor, so is ${q.n/2}.`};
    else fb={type:'wrong',text:`✗ ${ok}/${expected.length} correct. Does each number divide ${q.n} exactly?`};
    setQ1FB(p=>({...p,[q.lbl]:fb}));
    if(ok===expected.length){
      const nd={...q1Done,[q.lbl]:true};
      setQ1Done(nd);
      if(Object.keys(nd).length>=Q1.length) prog.markDone('s1','✓');
    }
  };

  // ── Q2 check ──
  const checkQ2 = (q) => {
    increment(`q2_${q.lbl}`); const att=getAtt(`q2_${q.lbl}`)+1;
    const opts=q2Opts[q.lbl];
    const sel=q2Sel[q.lbl];
    const ns={...q2OptSt};
    let ok=false;
    if(sel!==undefined){
      if(opts[sel].isCorrect){ns[`${q.lbl}-${sel}`]='correct';ok=true;}
      else{ns[`${q.lbl}-${sel}`]='wrong';}
    }
    setQ2OptSt(ns);
    const cf=getCommonFactors(q.nums);
    let fb;
    if(ok) fb={type:'correct',text:`🎉 Correct! Common factors: ${fmt(cf)}`};
    else if(att>=3) fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2) fb={type:'hint',text:'💡 List factors of each number — which appear in ALL lists?'};
    else fb={type:'wrong',text:'✗ A common factor must divide ALL numbers exactly.'};
    setQ2FB(p=>({...p,[q.lbl]:fb}));
    if(ok){
      const nd={...q2Done,[q.lbl]:true};
      setQ2Done(nd);
      if(Object.keys(nd).length>=Q2.length) prog.markDone('s2','✓');
    }
  };

  // ── Q3 check ──
  const checkQ3 = (q) => {
    increment(`q3_${q.lbl}`); const att=getAtt(`q3_${q.lbl}`)+1;
    const opts=q3Opts[q.lbl];
    const sel=q3Sel[q.lbl];
    const h=hcf(q.nums);
    const ns={...q3OptSt};
    let ok=false;
    if(sel!==undefined){
      if(opts[sel].isCorrect){ns[`${q.lbl}-${sel}`]='correct';ok=true;}
      else{ns[`${q.lbl}-${sel}`]='wrong';}
    }
    setQ3OptSt(ns);
    let fb;
    if(ok) fb={type:'correct',text:`🎉 Correct! HCF of ${q.nums.join(' and ')} = ${h}`};
    else if(att>=3) fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2) fb={type:'hint',text:`💡 Common factors of ${q.nums.join(' and ')}: ${fmt(getCommonFactors(q.nums))}. Which is biggest?`};
    else fb={type:'wrong',text:'✗ The HCF is the LARGEST number that divides all numbers exactly.'};
    setQ3FB(p=>({...p,[q.lbl]:fb}));
    if(ok){
      const nd={...q3Done,[q.lbl]:true};
      setQ3Done(nd);
      if(Object.keys(nd).length>=Q3.length) prog.markDone('s3','✓');
    }
  };

  return (
    <div style={{fontFamily:'var(--font)'}}>
      <Header lessonChip="Unit 3 · Lesson 3" completed={prog.completedCount} total={3}/>
      <div className="page">
        <ObjectiveCard text="Find factors of numbers, identify common factors, and find the Highest Common Factor (HCF)"/>
        <ExplainPanel title="Key Concepts">
          <RuleBox>
            <strong>Factor:</strong> A number that divides exactly into another with no remainder. (Factors of 12: 1,2,3,4,6,12)<br/>
            <strong>Common factor:</strong> A factor shared by two or more numbers. (Common factors of 12 and 18: 1,2,3,6)<br/>
            <strong>HCF:</strong> The <em>largest</em> common factor. (HCF of 12 and 18 = 6)
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={3}/>

        {/* Q1 */}
        <SectionCard badge={1} title="Write the factors in order — starting with 1" tagType="drag" tagLabel="Drag & Drop"
          subtitle="Each question has its own number bank. Drag cards into the boxes. Click a box to remove. ★ Guided: a & b">
          {Q1.map(q=>{
            const factors=getFactors(q.n);
            const distractors=shuffle([q.n+1,q.n-1,q.n+2,Math.round(q.n/2)+1,Math.round(q.n*1.5)].filter(v=>v>0&&v!==q.n&&!factors.includes(v))).slice(0,4);
            const bankNums=shuffle([...factors,...distractors]);
            return (
              <QGroup key={q.lbl} title={`Question ${q.lbl.toUpperCase()}`}>
                {q.guided&&<GuidedHint>{q.hint}</GuidedHint>}
                {/* Bank */}
                <div style={{ background:'var(--blue-light)', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
                  <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>🃏 Drag number cards into the boxes</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {bankNums.map(v=>(
                      <div key={v} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',JSON.stringify({value:v}))}
                        style={{ background:'#fff', border:'2.5px solid var(--blue)', borderRadius:10, padding:'8px 16px', fontSize:20, fontWeight:900, color:'var(--blue-dark)', cursor:'grab', userSelect:'none' }}>
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Slots row */}
                <QItemLabel>
                  <LblCircle letter={q.lbl}/>
                  <NumChip value={q.n}/>
                  <span style={{fontSize:22,fontWeight:900,color:'var(--blue)'}}>→</span>
                  {/* pre-filled 1 */}
                  <div style={{ width:54, height:50, borderRadius:10, border:'2.5px solid var(--blue)', background:'var(--blue)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900 }}>1</div>
                  {q1Slots[q.lbl].map((sl,i)=>{
                    const bg=sl.state==='correct'?'var(--green-bg)':sl.state==='wrong'?'var(--red-bg)':sl.state==='reveal'?'var(--green-bg)':sl.value?'var(--blue-light)':'#fff';
                    const bd=sl.state==='correct'?'2.5px solid var(--green)':sl.state==='wrong'?'2.5px solid var(--red)':sl.state==='reveal'?'2.5px dashed var(--green)':sl.value?'2.5px solid var(--blue)':'2.5px dashed var(--border)';
                    const col=sl.state==='correct'?'var(--green)':sl.state==='wrong'?'var(--red)':sl.state==='reveal'?'var(--green)':sl.value?'var(--blue-dark)':'var(--muted)';
                    const locked=['correct','reveal'].includes(sl.state);
                    return (
                      <div key={i}
                        onDragOver={e=>e.preventDefault()}
                        onDrop={e=>{e.preventDefault();try{const d=JSON.parse(e.dataTransfer.getData('text/plain'));setQ1Slots(p=>{const arr=[...p[q.lbl]];arr[i]={value:d.value,state:'filled'};return{...p,[q.lbl]:arr};});}catch{}}}
                        onClick={()=>!locked&&sl.value&&setQ1Slots(p=>{const arr=[...p[q.lbl]];arr[i]={value:null,state:'default'};return{...p,[q.lbl]:arr};})}
                        style={{ width:54, height:50, borderRadius:10, border:bd, background:bg, color:col, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, cursor:locked?'default':'pointer', transition:'all .2s' }}>
                        {sl.value||''}
                      </div>
                    );
                  })}
                </QItemLabel>
                <CheckButton label={`✓ Check ${q.lbl.toUpperCase()}`} onClick={()=>checkQ1(q)} disabled={q1Done[q.lbl]}/>
                {q1FB[q.lbl]&&<FeedbackBox type={q1FB[q.lbl].type} message={q1FB[q.lbl].text}/>}
              </QGroup>
            );
          })}
        </SectionCard>

        {/* Q2 */}
        <SectionCard badge={2} title="Find the common factors" tagType="mcq" tagLabel="MCQ"
          subtitle="Choose the correct set of common factors. One check button per question.">
          {Q2.map(q=>{
            const opts=q2Opts[q.lbl].map(o=>({...o,state:q2OptSt[`${q.lbl}-${o.id}`]||(q2Sel[q.lbl]===o.id?'selected':'default')}));
            return (
              <QGroup key={q.lbl} title={`Question ${q.lbl.toUpperCase()}`}>
                <QItem>
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <span style={{fontSize:17,fontWeight:700}}>Common factors of</span>
                    {q.nums.map((n,i)=><React.Fragment key={i}><NumChip value={n}/>{i<q.nums.length-1&&<span style={{fontWeight:700}}>{i===q.nums.length-2?' and ':','}</span>}</React.Fragment>)}
                  </QItemLabel>
                  <MCQOptions options={opts} onSelect={id=>setQ2Sel(p=>({...p,[q.lbl]:id}))}/>
                  <CheckButton label={`✓ Check ${q.lbl.toUpperCase()}`} onClick={()=>checkQ2(q)} disabled={q2Done[q.lbl]}/>
                  {q2FB[q.lbl]&&<FeedbackBox type={q2FB[q.lbl].type} message={q2FB[q.lbl].text}/>}
                </QItem>
              </QGroup>
            );
          })}
        </SectionCard>

        {/* Q3 */}
        <SectionCard badge={3} title="What is the Highest Common Factor (HCF)?" tagType="mcq" tagLabel="MCQ"
          subtitle="Choose the correct HCF from 4 options. ★ Guided: a & b">
          {Q3.map(q=>{
            const opts=q3Opts[q.lbl].map(o=>({...o,state:q3OptSt[`${q.lbl}-${o.id}`]||(q3Sel[q.lbl]===o.id?'selected':'default')}));
            return (
              <QGroup key={q.lbl} title={`Question ${q.lbl.toUpperCase()}`}>
                <QItem>
                  {q.guided&&<GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <span style={{fontSize:18,fontWeight:700}}>HCF of</span>
                    {q.nums.map((n,i)=><React.Fragment key={i}><NumChip value={n}/>{i<q.nums.length-1&&<span style={{fontWeight:700}}> and </span>}</React.Fragment>)}
                  </QItemLabel>
                  {/* 2x2 grid buttons */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxWidth:360, marginTop:8 }}>
                    {opts.map(o=>{
                      const s={default:{bg:'#fff',col:'var(--text)',bd:'2.5px solid var(--border)'},selected:{bg:'var(--blue)',col:'#fff',bd:'2.5px solid var(--blue)'},correct:{bg:'var(--green-bg)',col:'var(--green)',bd:'2.5px solid var(--green)'},wrong:{bg:'var(--red-bg)',col:'var(--red)',bd:'2.5px solid var(--red)'},reveal:{bg:'var(--green-bg)',col:'var(--green)',bd:'2.5px dashed var(--green)'}}[o.state||'default'];
                      const locked=['correct','wrong','reveal'].includes(o.state);
                      return (
                        <button key={o.id} onClick={()=>!locked&&setQ3Sel(p=>({...p,[q.lbl]:o.id}))}
                          style={{ background:s.bg, color:s.col, border:s.bd, borderRadius:12, padding:'12px', fontSize:22, fontWeight:900, cursor:locked?'default':'pointer', fontFamily:'var(--font)', textAlign:'center' }}>
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                  <CheckButton label={`✓ Check ${q.lbl.toUpperCase()}`} onClick={()=>checkQ3(q)} disabled={q3Done[q.lbl]}/>
                  {q3FB[q.lbl]&&<FeedbackBox type={q3FB[q.lbl].type} message={q3FB[q.lbl].text}/>}
                </QItem>
              </QGroup>
            );
          })}
        </SectionCard>

        {prog.allDone&&<Summary message="Excellent! You can find factors, common factors, and the HCF!"/>}
      </div>
    </div>
  );
}
