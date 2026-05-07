// ============================================================
//  lessons/unit3/L1_Divisibility.jsx
//  Unit 3 · Lesson 1: Rules of Divisibility
//  Ex 1: drag divisors (2-10) into slots
//  Ex 3: drag bubbles into 3-circle Venn (÷5, ÷6, ÷9)
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         GuidedHint, FeedbackBox, LblCircle, NumChip, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { shuffle } from '../../utils/shuffleUtils.js';

// ── Exercise 1 data ──
const EX1 = [
  { lbl:'a', n:81,   div:[3,9],              guided:true,  hint:'Digit sum = 8+1 = 9. Divisible by 3 and 9.' },
  { lbl:'b', n:96,   div:[2,3,4,6,8],        guided:true,  hint:'Even → ÷2. Sum=15 → ÷3. Last two digits 96 ÷ 4 → ÷4. ÷2 & ÷3 → ÷6. 96÷8=12 → ÷8.' },
  { lbl:'c', n:170,  div:[2,5,10],           guided:false },
  { lbl:'d', n:156,  div:[2,3,4,6],          guided:false },
  { lbl:'e', n:252,  div:[2,3,4,6,7,9],      guided:false },
  { lbl:'f', n:1680, div:[2,3,4,5,6,7,8,10], guided:false },
  { lbl:'g', n:945,  div:[3,5,7,9],          guided:false },
  { lbl:'h', n:4050, div:[2,3,5,6,9,10],     guided:false },
];

// ── Exercise 3 data (Venn: ÷5, ÷6, ÷9) ──
const VENN_NUMS = [3845,1004,6237,3618,7158,2700,8523,5634,7440,3915];

function getVennZone(n) {
  const by5 = n%5===0, by6 = n%6===0, by9 = n%9===0;
  if (by5&&by6&&by9) return 'all';
  if (by5&&by6) return '5_6';
  if (by5&&by9) return '5_9';
  if (by6&&by9) return '6_9';
  if (by5) return '5';
  if (by6) return '6';
  if (by9) return '9';
  return 'none';
}

const VENN_CORRECT = Object.fromEntries(VENN_NUMS.map(n => [n, getVennZone(n)]));

function grp(arr,n){ const out=[];for(let i=0;i<arr.length;i+=n)out.push(arr.slice(i,i+n));return out; }

// ── Slot row component ──
function DivSlots({ q, slots, onDrop, onRemove }) {
  const [overs, setOvers] = useState({});
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginTop:8 }}>
      <span style={{ fontSize:20, color:'var(--blue)', fontWeight:900 }}>→</span>
      {/* pre-filled 1 */}
      <div style={{ width:52, height:50, borderRadius:10, border:'2.5px solid var(--blue)', background:'var(--blue)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900 }}>1</div>
      {slots.map((sl,i) => {
        const s = overs[i] ? 'over' : sl.state;
        const bg = s==='correct'?'var(--green-bg)':s==='wrong'?'var(--red-bg)':s==='reveal'?'var(--green-bg)':s==='filled'?'var(--blue-light)':s==='over'?'var(--green-bg)':'#fff';
        const bd = s==='correct'?'2.5px solid var(--green)':s==='wrong'?'2.5px solid var(--red)':s==='reveal'?'2.5px dashed var(--green)':s==='filled'?'2.5px solid var(--blue)':s==='over'?'2.5px solid var(--green)':'2.5px dashed var(--border)';
        const col = s==='correct'?'var(--green)':s==='wrong'?'var(--red)':s==='reveal'?'var(--green)':s==='filled'?'var(--blue-dark)':'var(--muted)';
        const locked = ['correct','reveal'].includes(sl.state);
        return (
          <div key={i}
            onDragOver={e=>{e.preventDefault();setOvers(p=>({...p,[i]:true}));}}
            onDragLeave={()=>setOvers(p=>({...p,[i]:false}))}
            onDrop={e=>{e.preventDefault();setOvers(p=>({...p,[i]:false}));
              try{ const d=JSON.parse(e.dataTransfer.getData('text/plain')); onDrop(i,d.value); }catch{}}}
            onClick={()=>!locked && sl.value && onRemove(i)}
            style={{ width:52, height:50, borderRadius:10, border:bd, background:bg, color:col, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:900, cursor:locked?'default':'pointer', transition:'all .2s' }}
          >
            {sl.value || ''}
          </div>
        );
      })}
    </div>
  );
}

// ── 3-circle Venn component (simplified) ──
const ZONE_LABELS = { '5':'÷5 only','6':'÷6 only','9':'÷9 only','5_6':'÷5&6','5_9':'÷5&9','6_9':'÷6&9','all':'÷5,6&9','none':'None' };
const ZONE_POSITIONS = {
  '5':   { left:'5%',  top:'52%', width:'22%', height:'22%' },
  '6':   { left:'38%', top:'5%',  width:'23%', height:'22%' },
  '9':   { left:'71%', top:'52%', width:'22%', height:'22%' },
  '5_6': { left:'23%', top:'22%', width:'20%', height:'20%' },
  '5_9': { left:'40%', top:'62%', width:'20%', height:'20%' },
  '6_9': { left:'56%', top:'22%', width:'20%', height:'20%' },
  'all': { left:'38%', top:'42%', width:'24%', height:'22%' },
};

export default function L1_Divisibility() {
  const ex1SlotsInit = Object.fromEntries(EX1.map(q => [q.lbl, q.div.map(() => ({ value:null, state:'default' }))]));

  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── Ex1 state ──
  const ex1Slots = state.ex1Slots || ex1SlotsInit, setEx1Slots = setField('ex1Slots', ex1SlotsInit);
  const ex1FB    = state.ex1FB    || {},           setEx1FB    = setField('ex1FB');

  // ── Ex3 Venn state ──
  const vennPlaced     = state.vennPlaced     || {}, setVennPlaced     = setField('vennPlaced');
  const vennItemStates = state.vennItemStates || {}, setVennItemStates = setField('vennItemStates');
  const vennFB         = state.vennFB         ?? null, setVennFB       = setField('vennFB');
  const vennAtt        = state.vennAtt        ?? 0, setVennAtt        = setField('vennAtt');
  const [vennOver, setVennOver] = useState(null);

  const checkEx1Group = (grpArr, gi) => {
    increment(`ex1g${gi}`); const att = getAtt(`ex1g${gi}`) + 1;
    let totalSlots=0, correct=0;
    const newSlots = { ...ex1Slots };
    grpArr.forEach(q => {
      const expected = [...q.div];
      newSlots[q.lbl] = newSlots[q.lbl].map((sl, si) => {
        totalSlots++;
        if (sl.value === null) {
          return sl;
        }
        const idx = expected.indexOf(sl.value);
        if (idx > -1) { expected.splice(idx,1); correct++; return { ...sl, state:'correct' }; }
        return { ...sl, state:'wrong' };
      });
    });
    setEx1Slots(newSlots);
    let fb;
    if (correct===totalSlots)  fb={type:'correct',text:'🎉 All divisors correct!'};
    else if (att>=3)           fb={type:'hint',   text:'Keep trying! Ask your teacher if you need help.'};
    else if (att===2)          fb={type:'hint',   text:`💡 ${correct}/${totalSlots} slots correct. Check: digit sum for ÷3, last digit for ÷2, ÷5, ÷10.`};
    else                       fb={type:'wrong',  text:'✗ Some slots wrong. Use the rules in the Key Concept box.'};
    setEx1FB(p=>({...p,[gi]:fb}));
    if (correct===totalSlots) {
      const allG = grp(EX1,2);
      if (Object.keys({...ex1FB,[gi]:fb}).length >= allG.length) prog.markDone('s1','✓');
    }
  };

  // Venn
  const placeInVenn = (num, zone) => {
    setVennPlaced(p=>({...p,[num]:zone}));
    setVennItemStates(p=>{ const s={...p}; delete s[num]; return s; });
  };
  const returnFromVenn = (num) => { setVennPlaced(p=>({...p,[num]:null})); setVennItemStates(p=>{ const s={...p};delete s[num];return s; }); };

  const checkVenn = () => {
    const newAtt = vennAtt+1; setVennAtt(newAtt);
    let correct=0; const newStates={};
    VENN_NUMS.forEach(n=>{
      const exp=VENN_CORRECT[n];
      if (exp==='none') return; // outside — skip
      if (vennPlaced[n]===exp) { correct++; newStates[n]='ok'; }
      else {
        newStates[n]='bad';
      }
    });
    setVennItemStates(newStates);
    const total = VENN_NUMS.filter(n=>VENN_CORRECT[n]!=='none').length;
    if (correct===total)         setVennFB({type:'correct',text:`🎉 Perfect Venn diagram! All ${total} numbers placed correctly.`});
    else if (newAtt>=3)          setVennFB({type:'hint',   text:'Keep trying! Ask your teacher if you need help.'});
    else if (newAtt===2)         setVennFB({type:'hint',   text:`💡 ${correct}/${total} correct. Check overlapping sections — a number divisible by two categories goes in their overlap!`});
    else                         setVennFB({type:'wrong',  text:'✗ Some wrong. Is the number in one circle, two, or all three?'});
    if (correct===total) prog.markDone('s2','✓');
  };

  const ex1Groups = grp(EX1,2);

  return (
    <div style={{fontFamily:'var(--font)'}}>
      <Header lessonChip="Unit 3 · Lesson 1" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Use rules of divisibility to find which numbers (2–10) divide exactly into a given number"/>
        <ExplainPanel title="Key Concept: Rules of Divisibility">
          <RuleBox>
            <strong>÷2</strong> — Last digit is even (0,2,4,6,8)&nbsp;&nbsp;
            <strong>÷3</strong> — Digit sum divisible by 3<br/>
            <strong>÷4</strong> — Last two digits divisible by 4&nbsp;&nbsp;
            <strong>÷5</strong> — Last digit is 0 or 5<br/>
            <strong>÷6</strong> — Divisible by both 2 AND 3&nbsp;&nbsp;
            <strong>÷9</strong> — Digit sum divisible by 9<br/>
            <strong>÷10</strong> — Last digit is 0
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* Exercise 1 */}
        <SectionCard badge={1} title="Find all the divisors — drag numbers into the boxes" tagType="drag" tagLabel="Drag & Drop"
          subtitle="Drag numbers 2–10 from the palette into the correct boxes. ★ Guided: a & b">
          {ex1Groups.map((grpArr,gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q=>q.lbl.toUpperCase()).join(' & ')}`}>
              {/* Chip palette 2-10 */}
              <div style={{ background:'var(--blue-light)', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>🃏 Drag numbers into the boxes</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {[2,3,4,5,6,7,8,9,10].map(v=>(
                    <div key={v} draggable onDragStart={e=>{e.dataTransfer.setData('text/plain',JSON.stringify({value:v}));}}
                      style={{ background:'#fff', color:'var(--blue-dark)', border:'2.5px solid var(--blue)', borderRadius:10, padding:'7px 14px', fontSize:18, fontWeight:900, cursor:'grab', userSelect:'none' }}>
                      {v}
                    </div>
                  ))}
                </div>
              </div>
              {grpArr.map((q,qi)=>(
                <QItem key={q.lbl} last={qi===grpArr.length-1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <NumChip value={q.n}/>
                    <span style={{fontSize:20,fontWeight:700}}>is divisible by</span>
                  </QItemLabel>
                  <DivSlots
                    q={q}
                    slots={ex1Slots[q.lbl]}
                    onDrop={(i,val)=>{
                      setEx1Slots(p=>{
                        const arr=[...p[q.lbl]]; arr[i]={value:val,state:'filled'}; return{...p,[q.lbl]:arr};
                      });
                    }}
                    onRemove={(i)=>{
                      setEx1Slots(p=>{
                        const arr=[...p[q.lbl]]; arr[i]={value:null,state:'default'}; return{...p,[q.lbl]:arr};
                      });
                    }}
                  />
                </QItem>
              ))}
              <CheckButton label={`✓ Check ${grpArr.map(q=>q.lbl.toUpperCase()).join(' & ')}`} onClick={()=>checkEx1Group(grpArr,gi)}/>
              {ex1FB[gi] && <FeedbackBox type={ex1FB[gi].type} message={ex1FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* Exercise 3 — Venn */}
        <SectionCard badge={3} title="Sort numbers into the Venn diagram" tagType="venn" tagLabel="Venn Drag"
          subtitle="Drag each number bubble into the correct section. Numbers can belong to more than one circle — or none.">
          {/* Bubble bank */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, background:'var(--blue-light)', border:'1.5px solid var(--border)', borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', width:'100%', marginBottom:4 }}>🃏 Drag each number into the correct section</div>
            {VENN_NUMS.map(n => vennPlaced[n] ? null : (
              <div key={n} draggable
                onDragStart={e=>e.dataTransfer.setData('text/plain',JSON.stringify({num:n}))}
                style={{ background:'#fff', border:'2.5px solid var(--blue)', borderRadius:999, padding:'6px 14px', fontSize:15, fontWeight:900, color:'var(--blue-dark)', cursor:'grab', userSelect:'none' }}>
                {n}
              </div>
            ))}
          </div>

          {/* Venn SVG */}
          <div style={{ position:'relative', maxWidth:640 }}>
            <svg viewBox="0 0 640 480" style={{ width:'100%' }}>
              <rect x="10" y="10" width="620" height="460" rx="14" fill="#F8FAFF" stroke="var(--border)" strokeWidth="2"/>
              <circle cx="230" cy="270" r="155" fill="rgba(251,146,60,0.18)" stroke="#FB923C" strokeWidth="2.5"/>
              <circle cx="320" cy="175" r="155" fill="rgba(74,222,128,0.18)" stroke="#22C55E" strokeWidth="2.5"/>
              <circle cx="410" cy="270" r="155" fill="rgba(250,204,21,0.22)" stroke="#EAB308" strokeWidth="2.5"/>
              <text x="90" y="445" fontFamily="Nunito,sans-serif" fontSize="14" fontWeight="800" fill="#C2410C">Divisible by 5</text>
              <text x="255" y="38" fontFamily="Nunito,sans-serif" fontSize="14" fontWeight="800" fill="#15803D">Divisible by 6</text>
              <text x="445" y="445" fontFamily="Nunito,sans-serif" fontSize="14" fontWeight="800" fill="#A16207">Divisible by 9</text>
            </svg>

            {/* Drop zones */}
            {Object.entries(ZONE_POSITIONS).map(([zid, pos]) => {
              const zNums = VENN_NUMS.filter(n=>vennPlaced[n]===zid);
              return (
                <div key={zid}
                  onDragOver={e=>{e.preventDefault();setVennOver(zid);}}
                  onDragLeave={()=>setVennOver(null)}
                  onDrop={e=>{e.preventDefault();setVennOver(null);try{const d=JSON.parse(e.dataTransfer.getData('text/plain'));placeInVenn(d.num,zid);}catch{}}}
                  style={{
                    position:'absolute', ...pos,
                    display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:3, padding:4,
                    outline: vennOver===zid ? '3px dashed var(--green)' : 'none', borderRadius:8,
                  }}
                >
                  {zNums.map(n=>{
                    const st=vennItemStates[n];
                    return (
                      <span key={n} onClick={()=>st!=='ok'&&st!=='rev'&&returnFromVenn(n)}
                        style={{
                          background: st==='ok'?'var(--green-bg)':st==='bad'?'var(--red-bg)':st==='rev'?'var(--green-bg)':'#fff',
                          border: st==='ok'?'2px solid var(--green)':st==='bad'?'2px solid var(--red)':st==='rev'?'2px dashed var(--green)':'2px solid #64748B',
                          color: st==='ok'?'var(--green)':st==='bad'?'var(--red)':st==='rev'?'var(--green)':'#1E293B',
                          borderRadius:999, padding:'2px 8px', fontSize:13, fontWeight:900,
                          cursor: st==='ok'||st==='rev'?'default':'pointer', display:'inline-block',
                        }}>
                        {n}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Outside zone */}
          <div style={{ marginTop:12, fontSize:12, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>
            🔲 Not divisible by 5, 6 or 9 — place here:
          </div>
          <div
            onDragOver={e=>{e.preventDefault();setVennOver('none');}}
            onDragLeave={()=>setVennOver(null)}
            onDrop={e=>{e.preventDefault();setVennOver(null);try{const d=JSON.parse(e.dataTransfer.getData('text/plain'));placeInVenn(d.num,'none');}catch{}}}
            style={{ border:`2.5px dashed ${vennOver==='none'?'var(--green)':'#CBD5E1'}`, borderRadius:12, padding:14, display:'flex', flexWrap:'wrap', gap:8, minHeight:52, background:vennOver==='none'?'#F0FDF4':'transparent', marginBottom:14 }}
          >
            {VENN_NUMS.filter(n=>vennPlaced[n]==='none').map(n=>(
              <span key={n} onClick={()=>returnFromVenn(n)}
                style={{ background:'#fff', border:'2px solid #64748B', borderRadius:999, padding:'3px 9px', fontSize:14, fontWeight:900, cursor:'pointer' }}>{n}</span>
            ))}
          </div>

          <CheckButton label="✓ Check Venn Diagram" onClick={checkVenn}/>
          {vennFB && <FeedbackBox type={vennFB.type} message={vennFB.text}/>}
        </SectionCard>

        {prog.allDone && <Summary message="Excellent! You can apply all the divisibility rules like a pro!"/>}
      </div>
    </div>
  );
}
