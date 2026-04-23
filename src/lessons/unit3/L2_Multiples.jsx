// ============================================================
//  lessons/unit3/L2_Multiples.jsx
//  Unit 3 · Lesson 2: Multiples & LCM
//  Q1: MCQ common multiples (pairs)
//  Q2: MCQ common multiples (triples)
//  Q4: drag digit cards for LCM
//  Q5: drag numbers as answers (persistent bank)
//  Q6: four 2-circle Venn diagrams
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         GuidedHint, FeedbackBox, LblCircle, NumChip, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { lcm, getCommonMultiples, getCommonMultiples3 } from '../../utils/mathUtils.js';
import { shuffle } from '../../utils/shuffleUtils.js';
import { wrongMultipleSets } from '../../utils/wrongAnswerGen.js';

// ── Q1 data (pairs) ──
const Q1 = [
  { lbl:'a', pair:[3,4],  guided:true,  hint:'List multiples of 3 and 4 — find numbers in both lists.' },
  { lbl:'b', pair:[6,10], guided:true,  hint:'LCM(6,10)=30. Every multiple of 30 up to 100.' },
  { lbl:'c', pair:[3,9],  guided:false },
  { lbl:'d', pair:[2,5],  guided:false },
  { lbl:'e', pair:[7,8],  guided:false },
  { lbl:'f', pair:[3,7],  guided:false },
  { lbl:'g', pair:[4,6],  guided:false },
  { lbl:'h', pair:[6,9],  guided:false },
];

// ── Q2 data (triples) ──
const Q2 = [
  { lbl:'a', triple:[2,4,8],   guided:true,  hint:'LCM(2,4,8)=8. Every multiple of 8 up to 100.' },
  { lbl:'b', triple:[4,6,9],   guided:true,  hint:'LCM(4,6,9)=36. Multiples of 36 up to 100.' },
  { lbl:'c', triple:[6,15,18], guided:false },
  { lbl:'d', triple:[3,5,10],  guided:false },
  { lbl:'e', triple:[8,12,18], guided:false },
  { lbl:'f', triple:[4,10,12], guided:false },
  { lbl:'g', triple:[6,10,15], guided:false },
  { lbl:'h', triple:[3,6,21],  guided:false },
];

// ── Q4 data (LCM) ──
const Q4 = [
  { lbl:'a', nums:[5,8],    guided:true,  hint:'List multiples of 8: 8,16,24,32,40 — which is also a multiple of 5?' },
  { lbl:'b', nums:[9,4],    guided:true,  hint:'LCM(9,4): 9×4=36, GCD=1, so LCM=36.' },
  { lbl:'c', nums:[10,25],  guided:false },
  { lbl:'d', nums:[6,10],   guided:false },
  { lbl:'e', nums:[2,3,7],  guided:false },
  { lbl:'f', nums:[7,9,21], guided:false },
  { lbl:'g', nums:[6,12,14],guided:false },
  { lbl:'h', nums:[9,4,5],  guided:false },
];
Q4.forEach(q => { q.ans = q.nums.reduce((a,b)=>lcm(a,b)); });

// ── Q5 data ──
const Q5_NUMS = [6880, 4728, 1530, 864, 1008, 3150];
const Q5_QS = [
  { lbl:'a', q:'multiples of 8',       check:n=>n%8===0 },
  { lbl:'b', q:'multiples of 7',       check:n=>n%7===0 },
  { lbl:'c', q:'multiples of 5',       check:n=>n%5===0 },
  { lbl:'d', q:'multiples of 6',       check:n=>n%6===0 },
  { lbl:'e', q:'multiples of 9',       check:n=>n%9===0 },
  { lbl:'f', q:'multiples of 4 and 7', check:n=>n%4===0&&n%7===0 },
  { lbl:'g', q:'multiples of 3 and 8', check:n=>n%3===0&&n%8===0 },
  { lbl:'h', q:'multiples of 2, 5 and 9', check:n=>n%2===0&&n%5===0&&n%9===0 },
];

// ── Q6 data ──
const Q6_VENNS = [
  { id:'va', lbl:'a', left:6,  right:8 },
  { id:'vb', lbl:'b', left:4,  right:6 },
  { id:'vc', lbl:'c', left:5,  right:7 },
  { id:'vd', lbl:'d', left:3,  right:5 },
];

function genVennNums(l,r) {
  const bothLcm = lcm(l,r);
  const nums = [];
  // both
  for (let v=bothLcm; v<=bothLcm*4 && nums.length<3; v+=bothLcm) nums.push(v);
  // left only
  let lo=[]; for(let v=l;v<=l*20;v+=l){if(v%r!==0&&!nums.includes(v))lo.push(v);}
  nums.push(...lo.slice(0,3));
  // right only
  let ro=[]; for(let v=r;v<=r*20;v+=r){if(v%l!==0&&!nums.includes(v))ro.push(v);}
  nums.push(...ro.slice(0,3));
  // neither
  let ne=[]; for(let v=2;v<=50;v++){if(v%l!==0&&v%r!==0&&!nums.includes(v))ne.push(v);}
  nums.push(...ne.slice(0,1));
  return shuffle(nums).slice(0,10);
}

Q6_VENNS.forEach(v => { v.nums = genVennNums(v.left, v.right); });

function fmt(arr){ return arr.length ? arr.join(', ') : 'None up to 100'; }
function grp(arr,n){ const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out; }

export default function L2_Multiples() {
  const q5PlacedInit = Object.fromEntries(Q5_QS.map(q=>[q.lbl,[]]));
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(5, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // Q1/Q2 MCQ state: lbl → optionIdx selected
  const q1Sel   = state.q1Sel   || {}, setQ1Sel   = setField('q1Sel');
  const q1OptSt = state.q1OptSt || {}, setQ1OptSt = setField('q1OptSt');
  const q1FB    = state.q1FB    || {}, setQ1FB    = setField('q1FB');
  const q2Sel   = state.q2Sel   || {}, setQ2Sel   = setField('q2Sel');
  const q2OptSt = state.q2OptSt || {}, setQ2OptSt = setField('q2OptSt');
  const q2FB    = state.q2FB    || {}, setQ2FB    = setField('q2FB');

  // Q4 digit state
  const q4D  = state.q4D  || {}, setQ4D  = setField('q4D');
  const q4St = state.q4St || {}, setQ4St = setField('q4St');
  const q4FB = state.q4FB || {}, setQ4FB = setField('q4FB');

  // Q5 placed
  const q5Placed = state.q5Placed || q5PlacedInit, setQ5Placed = setField('q5Placed', q5PlacedInit);
  const q5St     = state.q5St     || {},           setQ5St     = setField('q5St');
  const q5FB     = state.q5FB     || {},           setQ5FB     = setField('q5FB');

  // Q6 Venn
  const v6Placed = state.v6Placed || {}, setV6Placed = setField('v6Placed');
  const v6St     = state.v6St     || {}, setV6St     = setField('v6St');
  const v6FB     = state.v6FB     || {}, setV6FB     = setField('v6FB');
  const [v6Over, setV6Over] = useState(null);

  // ── Q1 helpers ──
  const buildMCQOpts = (correct, a) => {
    const wrongs = wrongMultipleSets(correct, a, 100);
    const opts = shuffle([{vals:correct,c:true},...wrongs.map(w=>({vals:w,c:false}))]).slice(0,4);
    return opts.map((o,i)=>({id:i,label:fmt(o.vals),isCorrect:o.c}));
  };

  const [q1Opts] = useState(()=> Object.fromEntries(Q1.map(q=>{ const cm=getCommonMultiples(q.pair[0],q.pair[1],100); return [q.lbl, buildMCQOpts(cm,q.pair[0])]; })));
  const [q2Opts] = useState(()=> Object.fromEntries(Q2.map(q=>{ const cm=getCommonMultiples3(q.triple[0],q.triple[1],q.triple[2],100); return [q.lbl, buildMCQOpts(cm,q.triple[0])]; })));

  const checkMCQGroup = (grpArr, gi, selState, setSelState, optState, setOptState, fbState, setFBState, sid, totalG) => {
    increment(`${sid}g${gi}`); const att=getAtt(`${sid}g${gi}`)+1;
    let ok=0; const ns={...optState};
    grpArr.forEach(q=>{
      const sel=selState[q.lbl];
      const opts=sid==='q1'?q1Opts[q.lbl]:q2Opts[q.lbl];
      if(sel!==undefined){
        const chosen=opts[sel];
        if(chosen.isCorrect){ns[`${q.lbl}-${sel}`]='correct';ok++;}
        else{ns[`${q.lbl}-${sel}`]='wrong';}
      }
    });
    setOptState(ns);
    const total=grpArr.length;
    let fb;
    if(ok===total) fb={type:'correct',text:`🎉 ${ok}/${total} correct!`};
    else if(att>=3) fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2) fb={type:'hint',text:`💡 ${ok}/${total} correct. Tip: find the LCM, then list multiples.`};
    else fb={type:'wrong',text:'✗ Look for numbers that appear in ALL lists of multiples.'};
    setFBState(p=>({...p,[gi]:fb}));
    if(ok===total){
      const nfb={...fbState,[gi]:fb};
      if(Object.keys(nfb).length>=totalG) prog.markDone(sid,'✓');
    }
  };

  // ── Q4 helpers ──
  const q4Drop=(lbl)=>(raw)=>{if(q4St[lbl]==='correct')return;if(raw==='del')setQ4D(p=>({...p,[lbl]:(p[lbl]||[]).slice(0,-1)}));else if(raw.startsWith('digit:'))setQ4D(p=>({...p,[lbl]:[...(p[lbl]||[]),raw.split(':')[1]]}));};
  const q4Rm=(lbl)=>(i)=>{if(q4St[lbl]==='correct')return;setQ4D(p=>{const a=[...(p[lbl]||[])];a.splice(i,1);return{...p,[lbl]:a};});};
  const q4Val=(lbl)=>{const d=q4D[lbl]||[];return d.length?parseInt(d.join(''),10):null;};

  const checkQ4Group=(grpArr,gi)=>{
    increment(`q4g${gi}`);const att=getAtt(`q4g${gi}`)+1;
    let ok=0;const ns={...q4St};
    grpArr.forEach(q=>{
      const v=q4Val(q.lbl);
      if(v===q.ans){ns[q.lbl]='correct';ok++;}
      else{ns[q.lbl]='wrong';}
    });
    setQ4St(ns);
    const total=grpArr.length;
    let fb;
    if(ok===total) fb={type:'correct',text:`🎉 ${ok}/${total} correct!`};
    else if(att>=3) fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2) fb={type:'hint',text:`💡 ${ok}/${total} correct. List multiples of the larger number until you find a common one.`};
    else fb={type:'wrong',text:'✗ The LCM is the SMALLEST common multiple.'};
    setQ4FB(p=>({...p,[gi]:fb}));
    if(ok===total){
      const allG=grp(Q4,2);
      if(Object.keys({...q4FB,[gi]:fb}).length>=allG.length) prog.markDone('q4','✓');
    }
  };

  // ── Q5 helpers ──
  const q5Drop=(lbl)=>(e)=>{
    e.preventDefault();
    try{
      const d=JSON.parse(e.dataTransfer.getData('text/plain'));
      const num=d.value||d.num;
      setQ5Placed(p=>{
        if((p[lbl]||[]).includes(num)) return p;
        return {...p,[lbl]:[...(p[lbl]||[]),num]};
      });
    }catch{}
  };
  const q5Remove=(lbl,num)=>setQ5Placed(p=>({...p,[lbl]:(p[lbl]||[]).filter(n=>n!==num)}));

  const checkQ5Group=(grpArr,gi)=>{
    increment(`q5g${gi}`);const att=getAtt(`q5g${gi}`)+1;
    let ok=0;const ns={...q5St};
    grpArr.forEach(q=>{
      const exp=Q5_NUMS.filter(n=>q.check(n));
      const placed=[...(q5Placed[q.lbl]||[])].sort((a,b)=>a-b);
      const expS=[...exp].sort((a,b)=>a-b);
      const correct=placed.length===expS.length&&placed.every((v,i)=>v===expS[i]);
      if(correct){ok++;(q5Placed[q.lbl]||[]).forEach(n=>{ns[`${q.lbl}-${n}`]='ok';});}
      else{
        (q5Placed[q.lbl]||[]).forEach(n=>{ns[`${q.lbl}-${n}`]='bad';});
      }
    });
    setQ5St(ns);
    const total=grpArr.length;
    let fb;
    if(ok===total) fb={type:'correct',text:`🎉 ${ok}/${total} correct!`};
    else if(att>=3) fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2) fb={type:'hint',text:`💡 ${ok}/${total} correct. Try dividing each number — no remainder = it's a multiple!`};
    else fb={type:'wrong',text:'✗ Some wrong. Check by dividing each number by the divisor.'};
    setQ5FB(p=>({...p,[gi]:fb}));
    if(ok===total){
      const allG=grp(Q5_QS,2);
      if(Object.keys({...q5FB,[gi]:fb}).length>=allG.length) prog.markDone('s5','✓');
    }
  };

  // ── Q6 Venn helpers ──
  const v6Place=(vid,num,zone)=>{
    setV6Placed(p=>({...p,[`${vid}_${num}`]:zone}));
    setV6St(p=>{const s={...p};delete s[`${vid}_${num}`];return s;});
  };
  const v6Return=(vid,num)=>{
    setV6Placed(p=>({...p,[`${vid}_${num}`]:null}));
    setV6St(p=>{const s={...p};delete s[`${vid}_${num}`];return s;});
  };

  const checkV6=(venn)=>{
    const k=`v6_${venn.id}`;
    increment(k);const att=getAtt(k)+1;
    let ok=0,total=venn.nums.length;
    const ns={...v6St};
    venn.nums.forEach(n=>{
      const inL=n%venn.left===0,inR=n%venn.right===0;
      const exp=inL&&inR?'both':inL?'left':inR?'right':null;
      const placed=v6Placed[`${venn.id}_${n}`];
      if(exp&&placed===exp){ns[`${venn.id}_${n}`]='ok';ok++;}
      else if(exp){
        ns[`${venn.id}_${n}`]='bad';
      } else if(placed) ns[`${venn.id}_${n}`]='bad';
    });
    setV6St(ns);
    let fb;
    if(ok===total) fb={type:'correct',text:`🎉 Perfect! All ${total} numbers in the right section!`};
    else if(att>=3) fb={type:'hint',text:'Keep trying! Ask your teacher if you need help.'};
    else if(att===2) fb={type:'hint',text:`💡 ${ok}/${total} correct. Numbers divisible by BOTH go in the middle!`};
    else fb={type:'wrong',text:'✗ Check: is the number in the left, right, or both circles?'};
    setV6FB(p=>({...p,[venn.id]:fb}));
    if(ok===total){
      if(Object.keys({...v6FB,[venn.id]:fb}).length>=Q6_VENNS.length) prog.markDone('s6','✓');
    }
  };

  const q1Groups=grp(Q1,2), q2Groups=grp(Q2,2), q4Groups=grp(Q4,2), q5Groups=grp(Q5_QS,2);

  return (
    <div style={{fontFamily:'var(--font)'}}>
      <Header lessonChip="Unit 3 · Lesson 2" completed={prog.completedCount} total={5}/>
      <div className="page">
        <ObjectiveCard text="Find common multiples, lowest common multiples (LCM), and sort numbers using Venn diagrams"/>
        <ExplainPanel title="Key Concepts">
          <RuleBox>
            <strong>Multiple:</strong> A number you get by multiplying another number by 1, 2, 3, 4… (e.g. multiples of 4: 4, 8, 12, 16…)<br/>
            <strong>Common multiple:</strong> A number that is a multiple of two or more numbers (e.g. 12 is a common multiple of 3 and 4)<br/>
            <strong>LCM:</strong> The <em>smallest</em> common multiple (e.g. LCM of 3 and 4 is 12)
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={5}/>

        {/* Q1 */}
        <SectionCard badge={1} title="Find all common multiples up to 100 (pairs)" tagType="mcq" tagLabel="MCQ"
          subtitle="Choose the correct set of common multiples. ★ Guided: a & b">
          {q1Groups.map((ga,gi)=>(
            <QGroup key={gi} title={`Questions ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q,qi)=>{
                const opts=q1Opts[q.lbl].map(o=>({...o,state:q1OptSt[`${q.lbl}-${o.id}`]||(q1Sel[q.lbl]===o.id?'selected':'default')}));
                return (
                  <QItem key={q.lbl} last={qi===ga.length-1}>
                    {q.guided&&<GuidedHint>{q.hint}</GuidedHint>}
                    <QItemLabel><LblCircle letter={q.lbl}/><span style={{fontSize:17,fontWeight:700}}>Common multiples of</span><NumChip value={q.pair[0]}/><span style={{fontWeight:700}}>and</span><NumChip value={q.pair[1]}/></QItemLabel>
                    <MCQOptions options={opts} onSelect={id=>setQ1Sel(p=>({...p,[q.lbl]:id}))}/>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={()=>checkMCQGroup(ga,gi,q1Sel,setQ1Sel,q1OptSt,setQ1OptSt,q1FB,setQ1FB,'q1',q1Groups.length)}/>
              {q1FB[gi]&&<FeedbackBox type={q1FB[gi].type} message={q1FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* Q2 */}
        <SectionCard badge={2} title="Find all common multiples up to 100 (sets of 3)" tagType="mcq" tagLabel="MCQ"
          subtitle="Choose the correct set. ★ Guided: a & b">
          {q2Groups.map((ga,gi)=>(
            <QGroup key={gi} title={`Questions ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              {ga.map((q,qi)=>{
                const opts=q2Opts[q.lbl].map(o=>({...o,state:q2OptSt[`${q.lbl}-${o.id}`]||(q2Sel[q.lbl]===o.id?'selected':'default')}));
                return (
                  <QItem key={q.lbl} last={qi===ga.length-1}>
                    {q.guided&&<GuidedHint>{q.hint}</GuidedHint>}
                    <QItemLabel><LblCircle letter={q.lbl}/><span style={{fontSize:17,fontWeight:700}}>Common multiples of</span><NumChip value={q.triple[0]}/><span style={{fontWeight:700}}>,</span><NumChip value={q.triple[1]}/><span style={{fontWeight:700}}>and</span><NumChip value={q.triple[2]}/></QItemLabel>
                    <MCQOptions options={opts} onSelect={id=>setQ2Sel(p=>({...p,[q.lbl]:id}))}/>
                  </QItem>
                );
              })}
              <CheckButton label={`✓ Check ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={()=>checkMCQGroup(ga,gi,q2Sel,setQ2Sel,q2OptSt,setQ2OptSt,q2FB,setQ2FB,'q2',q2Groups.length)}/>
              {q2FB[gi]&&<FeedbackBox type={q2FB[gi].type} message={q2FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* Q4 */}
        <SectionCard badge={4} title="What is the lowest common multiple (LCM)?" tagType="drag" tagLabel="Drag Digits"
          subtitle="Drag digit cards to build the LCM. ★ Guided: a & b">
          {q4Groups.map((ga,gi)=>(
            <QGroup key={gi} title={`Questions ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              <DigitPalette paletteId={`q4p${gi}`}/>
              {ga.map((q,qi)=>(
                <QItem key={q.lbl} last={qi===ga.length-1}>
                  {q.guided&&<GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <span style={{fontSize:17,fontWeight:700}}>LCM of</span>
                    {q.nums.map((n,i)=><React.Fragment key={i}><NumChip value={n}/>{i<q.nums.length-1&&<span style={{fontWeight:700}}>{i===q.nums.length-2?' and ':','}</span>}</React.Fragment>)}
                    <span style={{fontSize:20,fontWeight:900}}>=</span>
                    <DigitDropZone digits={q4D[q.lbl]||[]} zoneState={q4St[q.lbl]||'default'} onDrop={q4Drop(q.lbl)} onRemove={q4Rm(q.lbl)}/>
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton label={`✓ Check ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={()=>checkQ4Group(ga,gi)}/>
              {q4FB[gi]&&<FeedbackBox type={q4FB[gi].type} message={q4FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* Q5 */}
        <SectionCard badge={5} title="Which of these numbers are multiples of…?" tagType="drag" tagLabel="Drag & Drop"
          subtitle="Drag numbers from the bank into each answer box. Numbers may be used more than once!">
          {q5Groups.map((ga,gi)=>(
            <QGroup key={gi} title={`Questions ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              {/* Persistent number bank */}
              <div style={{ background:'var(--blue-light)', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>🃏 Drag any of these numbers as your answer:</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {Q5_NUMS.map(n=>(
                    <div key={n} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',JSON.stringify({value:n}))}
                      style={{ background:'#fff', border:'2.5px solid var(--blue)', borderRadius:10, padding:'7px 14px', fontSize:16, fontWeight:900, color:'var(--blue-dark)', cursor:'grab', userSelect:'none' }}>
                      {n}
                    </div>
                  ))}
                </div>
              </div>
              {ga.map((q,qi)=>(
                <QItem key={q.lbl} last={qi===ga.length-1}>
                  <QItemLabel><LblCircle letter={q.lbl}/><span style={{fontSize:17,fontWeight:800}}>Which are {q.q}?</span></QItemLabel>
                  <div onDragOver={e=>e.preventDefault()} onDrop={q5Drop(q.lbl)}
                    style={{ minWidth:200, minHeight:44, border:'2.5px dashed var(--border)', borderRadius:10, background:'#fff', padding:'6px 10px', display:'flex', flexWrap:'wrap', gap:6 }}>
                    {(q5Placed[q.lbl]||[]).length===0 && <span style={{fontSize:13,color:'var(--muted)',fontWeight:700}}>Drop numbers here…</span>}
                    {(q5Placed[q.lbl]||[]).map(n=>{
                      const st=q5St[`${q.lbl}-${n}`];
                      return (
                        <span key={n} onClick={()=>st!=='ok'&&st!=='rev'&&q5Remove(q.lbl,n)}
                          style={{ background:st==='ok'?'var(--green-bg)':st==='bad'?'var(--red-bg)':st==='rev'?'var(--green-bg)':'var(--blue-light)',
                            border:`2px solid ${st==='ok'?'var(--green)':st==='bad'?'var(--red)':st==='rev'?'var(--green)':'var(--blue)'}`,
                            color:st==='ok'?'var(--green)':st==='bad'?'var(--red)':st==='rev'?'var(--green)':'var(--blue-dark)',
                            borderRadius:8, padding:'4px 10px', fontSize:15, fontWeight:900, cursor:st==='ok'||st==='rev'?'default':'pointer' }}>
                          {n}
                        </span>
                      );
                    })}
                  </div>
                </QItem>
              ))}
              <CheckButton label={`✓ Check ${ga.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={()=>checkQ5Group(ga,gi)}/>
              {q5FB[gi]&&<FeedbackBox type={q5FB[gi].type} message={q5FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* Q6 Venn diagrams */}
        <SectionCard badge={6} title="Sort numbers into the correct Venn diagram section" tagType="venn" tagLabel="Venn Drag"
          subtitle="Each diagram has its own number bank. Drag into left, right, or middle (both) section.">
          {Q6_VENNS.map(venn=>(
            <div key={venn.id} style={{ background:'#F8FAFF', borderRadius:14, padding:18, marginBottom:16, border:'1px solid var(--border)' }}>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--blue-dark)', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ background:'var(--blue)', color:'#fff', minWidth:38, height:38, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900 }}>{venn.lbl.toUpperCase()}</span>
                Multiples of <NumChip value={venn.left}/> and <NumChip value={venn.right}/>
              </div>
              {/* Bank */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, background:'var(--blue-light)', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 12px', marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', width:'100%', marginBottom:4 }}>🃏 Drag each number into the correct section</div>
                {venn.nums.map(n=>v6Placed[`${venn.id}_${n}`]?null:(
                  <div key={n} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',JSON.stringify({vid:venn.id,num:n}))}
                    style={{ background:'#fff', border:'2.5px solid var(--blue)', borderRadius:999, padding:'6px 14px', fontSize:15, fontWeight:900, color:'var(--blue-dark)', cursor:'grab', userSelect:'none' }}>
                    {n}
                  </div>
                ))}
              </div>
              {/* 2-circle SVG */}
              <div style={{ position:'relative', maxWidth:560 }}>
                <svg viewBox="0 0 560 308" style={{ width:'100%' }}>
                  <rect x="5" y="5" width="550" height="298" rx="12" fill="#F8FAFF" stroke="var(--border)" strokeWidth="1.5"/>
                  <circle cx="200" cy="154" r="130" fill="rgba(251,146,60,0.2)" stroke="#FB923C" strokeWidth="2.5"/>
                  <circle cx="360" cy="154" r="130" fill="rgba(250,204,21,.22)" stroke="#EAB308" strokeWidth="2.5"/>
                  <text x="65" y="273" fontFamily="Nunito,sans-serif" fontSize="13" fontWeight="800" fill="#C2410C">Multiples of {venn.left}</text>
                  <text x="375" y="273" fontFamily="Nunito,sans-serif" fontSize="13" fontWeight="800" fill="#A16207">Multiples of {venn.right}</text>
                </svg>
                {['left','both','right'].map(zone=>{
                  const pos=zone==='left'?{left:'5%',top:'15%',width:'30%',height:'70%'}:zone==='both'?{left:'37%',top:'15%',width:'26%',height:'70%'}:{left:'65%',top:'15%',width:'30%',height:'70%'};
                  const zNums=venn.nums.filter(n=>v6Placed[`${venn.id}_${n}`]===zone);
                  return (
                    <div key={zone}
                      onDragOver={e=>{e.preventDefault();setV6Over(`${venn.id}_${zone}`);}}
                      onDragLeave={()=>setV6Over(null)}
                      onDrop={e=>{e.preventDefault();setV6Over(null);try{const d=JSON.parse(e.dataTransfer.getData('text/plain'));if(d.vid===venn.id)v6Place(venn.id,d.num,zone);}catch{}}}
                      style={{ position:'absolute',...pos, display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:3, padding:4, outline:v6Over===`${venn.id}_${zone}`?'3px dashed var(--green)':'none', borderRadius:8 }}
                    >
                      {zNums.map(n=>{
                        const st=v6St[`${venn.id}_${n}`];
                        return (
                          <span key={n} onClick={()=>st!=='ok'&&st!=='rev'&&v6Return(venn.id,n)}
                            style={{ background:st==='ok'?'var(--green-bg)':st==='bad'?'var(--red-bg)':st==='rev'?'var(--green-bg)':'#fff', border:`2px solid ${st==='ok'?'var(--green)':st==='bad'?'var(--red)':st==='rev'?'var(--green)':'#64748B'}`, color:st==='ok'?'var(--green)':st==='bad'?'var(--red)':st==='rev'?'var(--green)':'#1E293B', borderRadius:999, padding:'2px 8px', fontSize:13, fontWeight:900, cursor:st==='ok'||st==='rev'?'default':'pointer', display:'inline-block' }}>
                            {n}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <CheckButton label={`✓ Check Diagram ${venn.lbl.toUpperCase()}`} onClick={()=>checkV6(venn)}/>
              {v6FB[venn.id]&&<FeedbackBox type={v6FB[venn.id].type} message={v6FB[venn.id].text}/>}
            </div>
          ))}
        </SectionCard>

        {prog.allDone&&<Summary message="Excellent! You have mastered multiples and LCM!"/>}
      </div>
    </div>
  );
}
