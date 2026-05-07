// ============================================================
//  lessons/unit6/L10_Transformations.jsx
//  Unit 6 · Lesson 10: Transformations
//  S1: Identify translation / rotation / reflection (3 pairs)
//  S2: Reflect a triangle on a grid by clicking vertices
// ============================================================

import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem } from '../../components/layout/QGroupItem.jsx';
import CoordGrid from '../../components/interactions/CoordGrid.jsx';
import { useState } from 'react';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── S1: Shape pair SVGs ───────────────────────────────────────
function ShapePairSVG({ type }) {
  if (type === 'translation') {
    // Same H-shape, moved right
    const h1 = 'M10,10 h15 v15 h10 v-15 h15 v40 h-15 v-15 h-10 v15 h-15 Z';
    const h2 = 'M60,25 h15 v15 h10 v-15 h15 v40 h-15 v-15 h-10 v15 h-15 Z';
    return (
      <svg viewBox="0 0 140 70" width={160} height={80}>
        <path d={h1} fill="#F97316" stroke="white" strokeWidth={1.5}/>
        <path d={h2} fill="#F97316" stroke="white" strokeWidth={1.5}/>
        <text x={70} y={40} fontSize={18} textAnchor="middle" fill="#94A3B8">→</text>
      </svg>
    );
  }
  if (type === 'reflection') {
    // A-like shape mirrored
    const a1 = 'M20,65 L40,10 L60,65 L50,65 L40,40 L30,65 Z';
    const a2 = 'M80,65 L100,10 L120,65 L110,65 L100,40 L90,65 Z';
    return (
      <svg viewBox="0 0 140 75" width={160} height={85}>
        <path d={a1} fill="#60A5FA" stroke="white" strokeWidth={1.5}/>
        <path d={a2} fill="#60A5FA" stroke="white" strokeWidth={1.5} transform="scale(-1,1) translate(-200,0)"/>
        <path d={a2} fill="#60A5FA" stroke="white" strokeWidth={1.5}/>
        <line x1={70} y1={5} x2={70} y2={70} stroke="#DC2626" strokeWidth={1.5} strokeDasharray="5 4"/>
      </svg>
    );
  }
  if (type === 'rotation') {
    // L-shape rotated 90°
    const l1 = 'M10,10 h15 v40 h30 v15 h-45 Z';
    const l2 = 'M80,10 h40 v15 h-25 v40 h-15 Z';
    return (
      <svg viewBox="0 0 140 75" width={160} height={85}>
        <path d={l1} fill="#34D399" stroke="white" strokeWidth={1.5}/>
        <path d={l2} fill="#34D399" stroke="white" strokeWidth={1.5}/>
        <text x={70} y={40} fontSize={16} textAnchor="middle" fill="#94A3B8">↻</text>
      </svg>
    );
  }
}

const TRANSFORM_QS = [
  { lbl:'a', type:'translation', answer:'translated', opts:['translated','rotated','reflected'] },
  { lbl:'b', type:'reflection',  answer:'reflected',  opts:['translated','rotated','reflected'] },
  { lbl:'c', type:'rotation',    answer:'rotated',    opts:['translated','rotated','reflected'] },
];

// ── S2: Reflect triangle ──────────────────────────────────────
// Original: A(2,7), B(1,1), C(5,3). Mirror: x=6.
// Reflected: A'(10,7), B'(11,1), C'(7,3)
const ORIG_TRI = [
  {x:2,y:7,label:'A',colour:'#7C3AED'},
  {x:1,y:1,label:'B',colour:'#7C3AED'},
  {x:5,y:3,label:'C',colour:'#7C3AED'},
];
const ORIG_LINES = [
  {from:{x:2,y:7},to:{x:1,y:1},colour:'#7C3AED'},
  {from:{x:1,y:1},to:{x:5,y:3},colour:'#7C3AED'},
  {from:{x:5,y:3},to:{x:2,y:7},colour:'#7C3AED'},
];
const REFL_CORRECT = [{x:10,y:7},{x:11,y:1},{x:7,y:3}];

// ── Component ─────────────────────────────────────────────────
export default function L10_Transformations() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  const s1Sel = state.s1Sel || {}, setS1Sel = setField('s1Sel');
  const s1FB  = state.s1FB  || null, setS1FB  = setField('s1FB');
  const [reflPoints, setReflPoints] = useState([]);
  const s2FB  = state.s2FB  || null, setS2FB  = setField('s2FB');

  const s1Done=prog.isDone('s1'),s2Done=prog.isDone('s2');

  function checkS1(){
    increment('s1'); const att=getAtt('s1')+1;
    let correct=0;
    TRANSFORM_QS.forEach(q=>{ if(s1Sel[q.lbl]===q.answer) correct++; });
    const total=TRANSFORM_QS.length;
    if(correct===total){setS1FB({type:'correct',msg:'✓ All transformation types identified!'});prog.markDone('s1',{correct,total,attempts:att});}
    else if(att>=3){
      setS1FB({type:'hint',msg:'Translation = moved (same orientation). Rotation = turned. Reflection = flipped (mirror image).'});
      prog.markDone('s1',{correct,total,attempts:att});
    } else {
      setS1FB({type:'wrong',msg:`${correct}/${total} correct.`});
    }
  }

  function checkS2(){
    increment('s2'); const att=getAtt('s2')+1;
    if(reflPoints.length<3){
      setS2FB({type:'wrong',msg:'Place all 3 reflected vertices first.'});
      return;
    }
    const matched=REFL_CORRECT.every(expected=>reflPoints.some(p=>p.x===expected.x&&p.y===expected.y));
    if(matched){
      setS2FB({type:'correct',msg:"✓ Triangle reflected correctly! A'(10,7), B'(11,1), C'(7,3)."});
      prog.markDone('s2',{correct:1,total:1,attempts:att});
    } else if(att>=3){
      setS2FB({type:'hint',msg:"Reflected vertices: A'=(10,7), B'=(11,1), C'=(7,3). For mirror at x=6: x' = 6 + (6 − x) = 12 − x."});
      prog.markDone('s2',{correct:0,total:1,attempts:att});
    } else {
      setS2FB({type:'wrong',msg:`Your points don't match the correct reflection. Hint: x' = 12 − x for mirror at x=6.`});
    }
  }

  return (
    <div style={{fontFamily:'var(--font)',paddingBottom:40}}>
      <Header lessonChip="Unit 6 · Lesson 10" completed={prog.completedCount} total={2}/>
      <div style={{maxWidth:860,margin:'0 auto',padding:'0 16px'}}>
        <ObjectiveCard text="Identify translations, rotations and reflections. Reflect a triangle on a coordinate grid."/>
        <ExplainPanel title="Transformations">
          <RuleBox>
            <strong>Translation</strong> — slide without turning or flipping<br/>
            <strong>Rotation</strong> — turn around a fixed point<br/>
            <strong>Reflection</strong> — flip to create a mirror image
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* S1 */}
        <SectionCard badge={1} title="Translated, rotated or reflected?" tagType="mcq" tagLabel="Tap">
          <QGroup title="Has each shape been translated, rotated or reflected?">
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,marginBottom:16}}>
              {TRANSFORM_QS.map(q=>(
                <div key={q.lbl} style={{background:'white',border:'2px solid var(--border)',borderRadius:12,padding:14,textAlign:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                    <LblCircle letter={q.lbl}/>
                  </div>
                  <ShapePairSVG type={q.type}/>
                  <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:10}}>
                    {q.opts.map(o=>(
                      <button key={o} onClick={()=>!s1Done&&setS1Sel(p=>({...p,[q.lbl]:o}))} style={{
                        padding:'6px 12px',borderRadius:9,fontSize:12,fontWeight:700,fontFamily:'var(--font)',
                        cursor:s1Done?'default':'pointer',
                        border:`2px solid ${s1Sel[q.lbl]===o?'var(--blue)':'var(--border)'}`,
                        background:s1Sel[q.lbl]===o?'var(--blue-light)':'white',
                        color:s1Sel[q.lbl]===o?'var(--blue)':'var(--text)',
                      }}>{o}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!s1Done&&<CheckButton onClick={checkS1}/>}
            {s1FB&&<FeedbackBox type={s1FB.type} message={s1FB.msg}/>}
          </QGroup>
        </SectionCard>

        {/* S2 */}
        <SectionCard badge={2} title="Reflect a triangle" tagType="tap" tagLabel="Click grid">
          <QGroup title="The purple triangle has vertices A(2,7), B(1,1), C(5,3). The dashed line is the mirror at x=6. Click to place the 3 reflected vertices A', B', C'.">
            <div style={{marginBottom:12}}>
              <p style={{fontSize:13,color:'var(--muted)',marginBottom:4}}>
                Formula: x' = 12 − x (mirror at x=6). y stays the same.
              </p>
              <CoordGrid
                size={12} cellPx={34}
                prePoints={ORIG_TRI}
                preLines={ORIG_LINES}
                mirror={{axis:'x',value:6}}
                interactive={!s2Done} maxPoints={3}
                onPointPlace={setReflPoints}
                colour="#F97316"
              />
              {reflPoints.length>0 && (
                <p style={{fontSize:13,fontWeight:700,marginTop:8,color:'var(--orange)'}}>
                  Placed: {reflPoints.map(p=>`(${p.x},${p.y})`).join(', ')}
                </p>
              )}
            </div>
            {!s2Done&&<CheckButton onClick={checkS2} label="✓ Check reflection"/>}
            {s2FB&&<FeedbackBox type={s2FB.type} message={s2FB.msg}/>}
          </QGroup>
        </SectionCard>

        {prog.allDone&&<Summary score={prog.completedCount} total={2} message="You can identify and perform transformations!"/>}
      </div>
    </div>
  );
}
