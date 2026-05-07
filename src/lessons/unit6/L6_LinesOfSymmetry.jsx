// ============================================================
//  lessons/unit6/L6_LinesOfSymmetry.jsx
//  Unit 6 · Lesson 6: Lines of Symmetry
//  S1: Count symmetry lines for 8 shapes (tap-chip MCQ)
//  S2: Draw symmetry lines by clicking on an SVG shape
// ============================================================

import { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem } from '../../components/layout/QGroupItem.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── Shape SVGs ────────────────────────────────────────────────
function Isosceles({sz=80,fill='#F97316'}){ return <svg viewBox="0 0 80 80" width={sz} height={sz}><polygon points="40,5 70,75 10,75" fill={fill} stroke="white" strokeWidth={2}/></svg>; }
function ScaleneT({sz=80,fill='#EC4899'}){ return <svg viewBox="0 0 80 80" width={sz} height={sz}><polygon points="65,5 70,75 5,75" fill={fill} stroke="white" strokeWidth={2}/></svg>; }
function EquilateralT({sz=80,fill='#EC4899'}){ return <svg viewBox="0 0 80 80" width={sz} height={sz}><polygon points="40,5 5,75 75,75" fill={fill} stroke="white" strokeWidth={2}/></svg>; }
function ArrowLeft({sz=80,fill='#F97316'}){
  return <svg viewBox="0 0 80 80" width={sz} height={sz}>
    <polygon points="10,40 50,5 50,25 75,25 75,55 50,55 50,75" fill={fill} stroke="white" strokeWidth={2}/>
  </svg>;
}
function RegHex({sz=80,fill='#22C55E'}){
  const pts=Array.from({length:6},(_,i)=>{const a=i*Math.PI/3-Math.PI/6;return `${40+35*Math.cos(a)},${40+35*Math.sin(a)}`;}).join(' ');
  return <svg viewBox="0 0 80 80" width={sz} height={sz}><polygon points={pts} fill={fill} stroke="white" strokeWidth={2}/></svg>;
}
function FourStar({sz=80,fill='#A855F7'}){
  const pts='40,5 48,32 75,40 48,48 40,75 32,48 5,40 32,32';
  return <svg viewBox="0 0 80 80" width={sz} height={sz}><polygon points={pts} fill={fill} stroke="white" strokeWidth={2}/></svg>;
}
function Square({sz=80,fill='#22C55E'}){ return <svg viewBox="0 0 80 80" width={sz} height={sz}><rect x={10} y={10} width={60} height={60} fill={fill} stroke="white" strokeWidth={2}/></svg>; }
function RegHex2({sz=80,fill='#93C5FD'}){
  const pts=Array.from({length:6},(_,i)=>{const a=i*Math.PI/3-Math.PI/6;return `${40+35*Math.cos(a)},${40+35*Math.sin(a)}`;}).join(' ');
  return <svg viewBox="0 0 80 80" width={sz} height={sz}><polygon points={pts} fill={fill} stroke="white" strokeWidth={2}/></svg>;
}

const SYMMETRY_QS = [
  { lbl:'a', answer:1, Comp:Isosceles,   label:'Isosceles triangle' },
  { lbl:'b', answer:0, Comp:ScaleneT,    label:'Scalene triangle' },
  { lbl:'c', answer:3, Comp:EquilateralT,label:'Equilateral triangle' },
  { lbl:'d', answer:1, Comp:ArrowLeft,   label:'Arrow/chevron' },
  { lbl:'e', answer:6, Comp:RegHex,      label:'Regular hexagon' },
  { lbl:'f', answer:4, Comp:FourStar,    label:'4-pointed star' },
  { lbl:'g', answer:4, Comp:Square,      label:'Square' },
  { lbl:'h', answer:6, Comp:RegHex2,     label:'Regular hexagon' },
];
const SYM_OPTIONS = [0,1,2,3,4,6];

// ── S2: Interactive draw-line on square ───────────────────────
// For simplicity, S2 uses the square (4 symmetry lines).
// Student taps a direction chip to "draw" a symmetry line.
const SQUARE_LINES = [
  { id:'vertical',   label:'Vertical',   valid:true },
  { id:'horizontal', label:'Horizontal', valid:true },
  { id:'diag1',      label:'Diagonal \\', valid:true },
  { id:'diag2',      label:'Diagonal /', valid:true },
  { id:'corner',     label:'Corner diagonal', valid:false },
];

function SquareWithLines({ selected }) {
  const lineMap = {
    vertical:   { x1:40,y1:5,x2:40,y2:95 },
    horizontal: { x1:5,y1:50,x2:95,y2:50 },
    diag1:      { x1:5,y1:5,x2:95,y2:95 },
    diag2:      { x1:95,y1:5,x2:5,y2:95 },
    corner:     { x1:5,y1:20,x2:50,y2:95 },
  };
  return (
    <svg viewBox="0 0 100 100" width={120} height={120}>
      <rect x={5} y={5} width={90} height={90} fill="#DCFCE7" stroke="#16A34A" strokeWidth={3}/>
      {selected.map(id=>{
        const l=lineMap[id];
        if(!l)return null;
        return <line key={id} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#1E6FD9" strokeWidth={2.5} strokeDasharray="8 4"/>;
      })}
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────
export default function L6_LinesOfSymmetry() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: () => clearDraft?.() });
  const { getAtt, increment } = useAttempts();

  const s1Sel = state.s1Sel || {}, setS1Sel = setField('s1Sel');
  const s1FB  = state.s1FB  || null, setS1FB  = setField('s1FB');
  const s2Sel = state.s2Sel || [], setS2Sel = setField('s2Sel');
  const s2FB  = state.s2FB  || null, setS2FB  = setField('s2FB');

  const s1Done=prog.isDone('s1'), s2Done=prog.isDone('s2');

  function checkS1(){
    increment('s1'); const att=getAtt('s1')+1;
    let correct=0;
    SYMMETRY_QS.forEach(q=>{ if(parseInt(s1Sel[q.lbl])===q.answer) correct++; });
    const total=SYMMETRY_QS.length;
    if(correct===total){setS1FB({type:'correct',msg:'✓ All correct!'});prog.markDone('s1',{correct,total,attempts:att});}
    else if(att>=3){
      const hints=SYMMETRY_QS.map(q=>`${q.lbl})${q.answer}`).join(' ');
      setS1FB({type:'hint',msg:`Answers: ${hints}`});
      prog.markDone('s1',{correct,total,attempts:att});
    } else {
      setS1FB({type:'wrong',msg:`${correct}/${total} correct.`});
    }
  }

  function checkS2(){
    increment('s2'); const att=getAtt('s2')+1;
    const validSelected=s2Sel.filter(id=>SQUARE_LINES.find(l=>l.id===id)?.valid);
    const validCount=SQUARE_LINES.filter(l=>l.valid).length;
    if(validSelected.length===validCount && s2Sel.length===validSelected.length){
      setS2FB({type:'correct',msg:'✓ Correct! A square has 4 lines of symmetry: vertical, horizontal, and both diagonals.'});
      prog.markDone('s2',{correct:1,total:1,attempts:att});
    } else if(att>=3){
      setS2FB({type:'hint',msg:'A square has 4 symmetry lines: vertical, horizontal, and the two diagonals.'});
      prog.markDone('s2',{correct:0,total:1,attempts:att});
    } else {
      setS2FB({type:'wrong',msg:`${validSelected.length} valid lines selected. Try again!`});
    }
  }

  const toggleLine=(id)=>{
    if(s2Done)return;
    setS2Sel(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  };

  return (
    <div style={{fontFamily:'var(--font)',paddingBottom:40}}>
      <Header lessonChip="Unit 6 · Lesson 6" completed={prog.completedCount} total={2}/>
      <div style={{maxWidth:820,margin:'0 auto',padding:'0 16px'}}>
        <ObjectiveCard text="Count and draw lines of symmetry in 2D shapes."/>
        <ExplainPanel title="Lines of Symmetry">
          <RuleBox>
            A <strong>line of symmetry</strong> divides a shape into two identical mirror-image halves.<br/>
            Equilateral triangle → 3 &nbsp;|&nbsp; Square → 4 &nbsp;|&nbsp; Regular hexagon → 6 &nbsp;|&nbsp; Scalene triangle → 0
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* S1 */}
        <SectionCard badge={1} title="How many lines of symmetry?" tagType="tap" tagLabel="Tap">
          <QGroup title="Tap the correct number of symmetry lines for each shape">
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14,marginBottom:16}}>
              {SYMMETRY_QS.map(q=>{
                const Comp=q.Comp;
                return (
                  <div key={q.lbl} style={{background:'white',border:'2px solid var(--border)',borderRadius:12,padding:12,textAlign:'center'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}><LblCircle letter={q.lbl}/></div>
                    <Comp sz={120}/>
                    <p style={{fontSize:15,color:'var(--muted)',marginBottom:8}}>{q.label}</p>
                    <div style={{display:'flex',gap:5,justifyContent:'center',flexWrap:'wrap'}}>
                      {SYM_OPTIONS.map(n=>(
                        <button key={n} onClick={()=>!s1Done&&setS1Sel(p=>({...p,[q.lbl]:n}))} style={{
                          width:40,height:40,borderRadius:8,fontSize:18,fontWeight:800,
                          fontFamily:'var(--font)',cursor:s1Done?'default':'pointer',
                          border:`2px solid ${s1Sel[q.lbl]===n?'var(--blue)':'var(--border)'}`,
                          background:s1Sel[q.lbl]===n?'var(--blue)':'white',
                          color:s1Sel[q.lbl]===n?'white':'var(--text)',
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <CheckButton disabled={s1Done} onClick={checkS1}/>
            {s1FB&&<FeedbackBox type={s1FB.type} message={s1FB.msg}/>}
          </QGroup>
        </SectionCard>

        {/* S2 */}
        <SectionCard badge={2} title="Draw symmetry lines on a square" tagType="tap" tagLabel="Tap">
          <QGroup title="A square has 4 lines of symmetry. Tap all of them below.">
            <QItem>
              <div style={{display:'flex',gap:24,alignItems:'center',flexWrap:'wrap'}}>
                <SquareWithLines selected={s2Sel}/>
                <div>
                  <p style={{fontSize:13,color:'var(--muted)',marginBottom:10}}>Tap each symmetry line:</p>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {SQUARE_LINES.map(l=>{
                      const sel=s2Sel.includes(l.id);
                      return (
                        <button key={l.id} onClick={()=>toggleLine(l.id)} style={{
                          padding:'8px 18px',borderRadius:10,fontSize:13,fontWeight:700,
                          fontFamily:'var(--font)',cursor:s2Done?'default':'pointer',textAlign:'left',
                          border:`2px solid ${sel?'var(--blue)':'var(--border)'}`,
                          background:sel?'var(--blue-light)':'white',
                          color:sel?'var(--blue)':'var(--text)',
                        }}>
                          {sel?'✓ ':''}{l.label}
                          {s2Done&&!l.valid&&sel&&<span style={{color:'var(--red)',marginLeft:6}}>✗ not a symmetry line</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </QItem>
            <CheckButton disabled={s2Done} onClick={checkS2}/>
            {s2FB&&<FeedbackBox type={s2FB.type} message={s2FB.msg}/>}
          </QGroup>
        </SectionCard>

        {prog.allDone&&<Summary score={prog.completedCount} total={2} message="You can find and draw lines of symmetry!"/>}
      </div>
    </div>
  );
}
