// ============================================================
//  lessons/unit6/L8_Nets.jsx
//  Unit 6 · Lesson 8: Nets of 3D Shapes
//  S1: Fold net → 3D shape → MCQ name it (4 nets)
//  S2: Given 3D shape, pick its net from 4 options (MCQ)
// ============================================================

import { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem } from '../../components/layout/QGroupItem.jsx';
import NetFoldViewer from '../../components/interactions/NetFoldViewer.jsx';
import Shape3DViewer from '../../components/interactions/Shape3DViewer.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── S1: Nets to fold ─────────────────────────────────────────
const FOLD_QS = [
  {
    lbl:'a', netId:'triangular-pyramid',
    answer:'triangular pyramid',
    opts:['triangular pyramid','square-based pyramid','triangular prism','cuboid'],
  },
  {
    lbl:'b', netId:'square-pyramid',
    answer:'square-based pyramid',
    opts:['square-based pyramid','triangular pyramid','pentagonal prism','hexagonal prism'],
  },
  {
    lbl:'c', netId:'triangular-prism',
    answer:'triangular prism',
    opts:['triangular prism','triangular pyramid','cuboid','pentagonal prism'],
  },
  {
    lbl:'d', netId:'pentagonal-prism',
    answer:'pentagonal prism',
    opts:['pentagonal prism','hexagonal prism','cuboid','pentagonal pyramid'],
  },
];

// ── S2: Shape → pick net ──────────────────────────────────────
// Mini static net SVGs for MCQ choices
function MiniNet({ type, selected, onClick }) {
  const border = selected ? '2px solid var(--blue)' : '2px solid var(--border)';
  const bg = selected ? 'var(--blue-light)' : 'white';
  return (
    <button onClick={onClick} style={{
      border, background: bg, borderRadius: 12, padding: 10,
      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      {type === 'cross' && (
        <svg viewBox="0 0 100 80" width={90} height={72}>
          <rect x={35} y={5}  width={30} height={25} fill="#60A5FA" stroke="#1E293B" strokeWidth={1.5}/>
          <rect x={5}  y={30} width={30} height={25} fill="#34D399" stroke="#1E293B" strokeWidth={1.5}/>
          <rect x={35} y={30} width={30} height={25} fill="#60A5FA" stroke="#1E293B" strokeWidth={1.5}/>
          <rect x={65} y={30} width={30} height={25} fill="#34D399" stroke="#1E293B" strokeWidth={1.5}/>
          <rect x={35} y={55} width={30} height={25} fill="#60A5FA" stroke="#1E293B" strokeWidth={1.5}/>
        </svg>
      )}
      {type === 'strip' && (
        <svg viewBox="0 0 110 50" width={100} height={45}>
          {[0,1,2,3,4,5].map(i=>(
            <rect key={i} x={5+i*16} y={5} width={15} height={35} fill="#A78BFA" stroke="#1E293B" strokeWidth={1.5}/>
          ))}
        </svg>
      )}
      {type === 'prism-net' && (
        <svg viewBox="0 0 120 80" width={110} height={72}>
          <rect x={10} y={25} width={30} height={30} fill="#FBBF24" stroke="#1E293B" strokeWidth={1.5}/>
          <rect x={40} y={25} width={30} height={30} fill="#FBBF24" stroke="#1E293B" strokeWidth={1.5}/>
          <rect x={70} y={25} width={30} height={30} fill="#FBBF24" stroke="#1E293B" strokeWidth={1.5}/>
          <polygon points="25,25 40,5 55,25" fill="#34D399" stroke="#1E293B" strokeWidth={1.5}/>
          <polygon points="25,55 40,75 55,55" fill="#34D399" stroke="#1E293B" strokeWidth={1.5}/>
        </svg>
      )}
      {type === 'pyramid-net' && (
        <svg viewBox="0 0 80 80" width={75} height={75}>
          <rect x={25} y={25} width={30} height={30} fill="#FBBF24" stroke="#1E293B" strokeWidth={1.5}/>
          <polygon points="25,25 55,25 40,5"  fill="#F87171" stroke="#1E293B" strokeWidth={1.5}/>
          <polygon points="55,25 55,55 75,40" fill="#F87171" stroke="#1E293B" strokeWidth={1.5}/>
          <polygon points="25,55 55,55 40,75" fill="#F87171" stroke="#1E293B" strokeWidth={1.5}/>
          <polygon points="25,25 25,55 5,40"  fill="#F87171" stroke="#1E293B" strokeWidth={1.5}/>
        </svg>
      )}
      <span style={{ fontSize: 11, fontWeight: 700, color: selected ? 'var(--blue)' : 'var(--muted)' }}>
        {type === 'cross' ? 'Cross / T-shape' : type === 'strip' ? 'Strip of 6' : type === 'prism-net' ? 'Two triangles + strip' : 'Square + 4 triangles'}
      </span>
    </button>
  );
}

const REVERSE_QS = [
  {
    lbl:'a', shape:'cuboid', answer:'cross',
    opts:['cross','strip','prism-net','pyramid-net'],
    hint:'A cuboid has 6 rectangular faces.',
  },
  {
    lbl:'b', shape:'triangular-prism', answer:'prism-net',
    opts:['prism-net','cross','strip','pyramid-net'],
    hint:'A triangular prism has 2 triangle ends and 3 rectangular sides.',
  },
  {
    lbl:'c', shape:'square-pyramid', answer:'pyramid-net',
    opts:['pyramid-net','cross','strip','prism-net'],
    hint:'A square pyramid has 1 square base and 4 triangular faces.',
  },
];

// ── Component ─────────────────────────────────────────────────
export default function L8_Nets() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  const [folded, setFolded] = useState({});
  const s1Sel = state.s1Sel || {}, setS1Sel = setField('s1Sel');
  const s1FB  = state.s1FB  || null, setS1FB  = setField('s1FB');
  const s2Sel = state.s2Sel || {}, setS2Sel = setField('s2Sel');
  const s2FB  = state.s2FB  || null, setS2FB  = setField('s2FB');

  const s1Done=prog.isDone('s1'), s2Done=prog.isDone('s2');

  function checkS1(){
    increment('s1'); const att=getAtt('s1')+1;
    let correct=0;
    FOLD_QS.forEach(q=>{ if(s1Sel[q.lbl]===q.answer) correct++; });
    const total=FOLD_QS.length;
    if(correct===total){setS1FB({type:'correct',msg:'✓ All nets matched to their 3D shape!'});prog.markDone('s1',{correct,total,attempts:att});}
    else if(att>=3){setS1FB({type:'hint',msg:FOLD_QS.map(q=>`${q.lbl}) ${q.answer}`).join(', ')});prog.markDone('s1',{correct,total,attempts:att});}
    else setS1FB({type:'wrong',msg:`${correct}/${total} correct. Fold the nets you haven't tried yet.`});
  }

  function checkS2(){
    increment('s2'); const att=getAtt('s2')+1;
    let correct=0;
    REVERSE_QS.forEach(q=>{ if(s2Sel[q.lbl]===q.answer) correct++; });
    const total=REVERSE_QS.length;
    if(correct===total){setS2FB({type:'correct',msg:'✓ You can match 3D shapes to their nets!'});prog.markDone('s2',{correct,total,attempts:att});}
    else if(att>=3){setS2FB({type:'hint',msg:REVERSE_QS.map(q=>`${q.lbl}) ${q.hint}`).join(' | ')});prog.markDone('s2',{correct,total,attempts:att});}
    else setS2FB({type:'wrong',msg:`${correct}/${total} correct.`});
  }

  return (
    <div style={{fontFamily:'var(--font)',paddingBottom:40}}>
      <Header lessonChip="Unit 6 · Lesson 8" completed={prog.completedCount} total={2}/>
      <div style={{maxWidth:900,margin:'0 auto',padding:'0 16px'}}>
        <ObjectiveCard text="Identify which 3D shape a net folds into. Match 3D shapes to their nets."/>
        <ExplainPanel title="What is a Net?">
          <RuleBox>
            A <strong>net</strong> is a flat shape that can be folded to make a 3D shape.<br/>
            Press <strong>▶ Fold</strong> to see the net animate into its 3D shape, then name it.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* S1 */}
        <SectionCard badge={1} title="Fold nets into 3D shapes" tagType="mcq" tagLabel="Fold + Tap">
          <QGroup title="Press Fold — then select the 3D shape it makes">
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,marginBottom:16}}>
              {FOLD_QS.map(q=>(
                <div key={q.lbl} style={{background:'white',border:'2px solid var(--border)',borderRadius:16,padding:16}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                    <LblCircle letter={q.lbl}/>
                  </div>
                  <NetFoldViewer netId={q.netId} onFold={()=>setFolded(p=>({...p,[q.lbl]:true}))}/>
                  {folded[q.lbl] && !s1Done && (
                    <div style={{marginTop:10}}>
                      <p style={{fontSize:13,fontWeight:700,marginBottom:6}}>What shape is this?</p>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {q.opts.map(o=>(
                          <button key={o} onClick={()=>setS1Sel(p=>({...p,[q.lbl]:o}))} style={{
                            padding:'6px 10px',borderRadius:9,fontSize:12,fontWeight:700,fontFamily:'var(--font)',cursor:'pointer',
                            border:`2px solid ${s1Sel[q.lbl]===o?'var(--blue)':'var(--border)'}`,
                            background:s1Sel[q.lbl]===o?'var(--blue-light)':'white',
                            color:s1Sel[q.lbl]===o?'var(--blue)':'var(--text)',
                          }}>{o}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {s1Done && s1Sel[q.lbl] && (
                    <p style={{marginTop:8,fontWeight:700,color:'var(--muted)',fontSize:12}}>You answered: {s1Sel[q.lbl]}</p>
                  )}
                </div>
              ))}
            </div>
            {!s1Done&&<CheckButton onClick={checkS1} disabled={FOLD_QS.some(q=>!s1Sel[q.lbl])}/>}
            {s1FB&&<FeedbackBox type={s1FB.type} message={s1FB.msg}/>}
          </QGroup>
        </SectionCard>

        {/* S2 */}
        <SectionCard badge={2} title="Which net makes this shape?" tagType="mcq" tagLabel="Tap">
          <QGroup title="Rotate the 3D shape, then pick its net">
            {REVERSE_QS.map(q=>(
              <QItem key={q.lbl}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <LblCircle letter={q.lbl}/>
                </div>
                <div style={{display:'flex',gap:20,flexWrap:'wrap',alignItems:'flex-start'}}>
                  <Shape3DViewer shape={q.shape} height={180}/>
                  <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                    {q.opts.map(o=>(
                      <MiniNet key={o} type={o} selected={s2Sel[q.lbl]===o} onClick={()=>!s2Done&&setS2Sel(p=>({...p,[q.lbl]:o}))}/>
                    ))}
                  </div>
                </div>
              </QItem>
            ))}
            {!s2Done&&<CheckButton onClick={checkS2}/>}
            {s2FB&&<FeedbackBox type={s2FB.type} message={s2FB.msg}/>}
          </QGroup>
        </SectionCard>

        {prog.allDone&&<Summary score={prog.completedCount} total={2} message="You can fold nets and match 3D shapes!"/>}
      </div>
    </div>
  );
}
