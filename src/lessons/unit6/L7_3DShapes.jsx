// ============================================================
//  lessons/unit6/L7_3DShapes.jsx
//  Unit 6 · Lesson 7: 3D Shapes — Prisms & Pyramids
//  S1: Rotate & name 6 interactive 3D shapes (MCQ)
//  S2: Count faces, edges, vertices of 4 shapes (digit entry)
// ============================================================

import { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem } from '../../components/layout/QGroupItem.jsx';
import Shape3DViewer from '../../components/interactions/Shape3DViewer.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── S1: Name 6 shapes ────────────────────────────────────────
const NAME_QS = [
  { lbl:'a', shape:'square-pyramid',     answer:'square-based pyramid',  opts:['square-based pyramid','triangular prism','triangular pyramid','pentagonal prism'] },
  { lbl:'b', shape:'triangular-pyramid', answer:'triangular pyramid',    opts:['triangular pyramid','triangular prism','square-based pyramid','hexagonal prism'] },
  { lbl:'c', shape:'hexagonal-prism',    answer:'hexagonal prism',       opts:['hexagonal prism','pentagonal prism','hexagonal pyramid','triangular prism'] },
  { lbl:'d', shape:'cuboid',             answer:'cuboid',                opts:['cube','cuboid','triangular prism','rectangular pyramid'] },
  { lbl:'e', shape:'square-pyramid',     answer:'square-based pyramid',  opts:['pentagonal pyramid','square-based pyramid','triangular pyramid','cuboid'] },
  { lbl:'f', shape:'triangular-prism',   answer:'triangular prism',      opts:['triangular prism','triangular pyramid','square prism','hexagonal prism'] },
];

// ── S2: Count F/E/V for 4 shapes ─────────────────────────────
const FEV_QS = [
  { lbl:'a', shape:'square-pyramid',     faces:5, edges:8,  vertices:5,  desc:'5 faces, 8 edges, 5 vertices' },
  { lbl:'b', shape:'triangular-pyramid', faces:4, edges:6,  vertices:4,  desc:'4 faces, 6 edges, 4 vertices' },
  { lbl:'c', shape:'triangular-prism',   faces:5, edges:9,  vertices:6,  desc:'5 faces, 9 edges, 6 vertices' },
  { lbl:'d', shape:'cuboid',             faces:6, edges:12, vertices:8,  desc:'6 faces, 12 edges, 8 vertices' },
];

const MODE_LABELS = {
  'view':             'View shape',
  'count-faces':      'Highlight faces',
  'count-edges':      'Highlight edges',
  'count-vertices':   'Highlight vertices',
};

function FEVInput({ value, onChange, locked }) {
  return (
    <input type="number" min={0} max={30} value={value??''}
      onChange={e=>!locked&&onChange(e.target.value)}
      disabled={locked}
      style={{ width:55, padding:'6px 8px', borderRadius:9, border:'2px solid var(--border)',
        fontFamily:'var(--font)', fontSize:15, fontWeight:800, textAlign:'center' }}
    />
  );
}

// ── Component ─────────────────────────────────────────────────
export default function L7_3DShapes() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  const s1Sel = state.s1Sel || {}, setS1Sel = setField('s1Sel');
  const s1FB  = state.s1FB  || null, setS1FB  = setField('s1FB');
  const s2Ans = state.s2Ans || {}, setS2Ans = setField('s2Ans');
  const s2FB  = state.s2FB  || null, setS2FB  = setField('s2FB');

  const [modes, setModes] = useState({});

  const s1Done=prog.isDone('s1'), s2Done=prog.isDone('s2');

  function checkS1(){
    increment('s1'); const att=getAtt('s1')+1;
    let correct=0;
    NAME_QS.forEach(q=>{ if(s1Sel[q.lbl]===q.answer) correct++; });
    const total=NAME_QS.length;
    if(correct===total){setS1FB({type:'correct',msg:'✓ All 3D shapes named correctly!'});prog.markDone('s1',{correct,total,attempts:att});}
    else if(att>=3){setS1FB({type:'hint',msg:NAME_QS.map(q=>`${q.lbl}) ${q.answer}`).join(', ')});prog.markDone('s1',{correct,total,attempts:att});}
    else setS1FB({type:'wrong',msg:`${correct}/${total} correct. Rotate the shapes to see all faces.`});
  }

  function checkS2(){
    increment('s2'); const att=getAtt('s2')+1;
    let correct=0, total=0;
    FEV_QS.forEach(q=>{
      if(parseInt(s2Ans[`${q.lbl}_f`])===q.faces) correct++; total++;
      if(parseInt(s2Ans[`${q.lbl}_e`])===q.edges) correct++; total++;
      if(parseInt(s2Ans[`${q.lbl}_v`])===q.vertices) correct++; total++;
    });
    if(correct===total){setS2FB({type:'correct',msg:"✓ All faces, edges and vertices correct! Remember Euler's formula: F + V − E = 2."});prog.markDone('s2',{correct,total,attempts:att});}
    else if(att>=3){
      const h=FEV_QS.map(q=>`${q.lbl}) ${q.desc}`).join(' | ');
      setS2FB({type:'hint',msg:`Answers: ${h}`});
      prog.markDone('s2',{correct,total,attempts:att});
    } else {
      setS2FB({type:'wrong',msg:`${correct}/${total} correct. Use the Highlight buttons to count each feature.`});
    }
  }

  const setMode=(lbl,m)=>setModes(p=>({...p,[lbl]:m}));

  return (
    <div style={{fontFamily:'var(--font)',paddingBottom:40}}>
      <Header lessonChip="Unit 6 · Lesson 7" completed={prog.completedCount} total={2}/>
      <div style={{maxWidth:900,margin:'0 auto',padding:'0 16px'}}>
        <ObjectiveCard text="Name 3D prisms and pyramids. Count faces, edges and vertices by rotating interactive 3D models."/>
        <ExplainPanel title="Prisms & Pyramids">
          <RuleBox>
            <strong>Prism</strong> — two identical parallel polygon ends, rectangular side faces. Named after the end shape.<br/>
            <strong>Pyramid</strong> — polygon base, triangular faces meeting at a point. Named after the base.<br/>
            Drag the shape to rotate it. Use the highlight buttons to count faces, edges or vertices.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* S1 */}
        <SectionCard badge={1} title="Rotate and name each 3D shape" tagType="mcq" tagLabel="Drag + Tap">
          <p style={{fontSize:13,color:'var(--muted)',marginBottom:12}}>Drag the shape to rotate it. Then select its name below.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20,marginBottom:16}}>
            {NAME_QS.map(q=>(
              <div key={q.lbl} style={{background:'white',border:'2px solid var(--border)',borderRadius:16,padding:16}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <LblCircle letter={q.lbl}/>
                  <span style={{fontSize:12,color:'var(--muted)'}}>Drag to rotate</span>
                </div>
                <Shape3DViewer shape={q.shape} mode="view" height={220}/>
                <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:12}}>
                  {q.opts.map(o=>(
                    <button key={o} onClick={()=>!s1Done&&setS1Sel(p=>({...p,[q.lbl]:o}))} style={{
                      padding:'6px 10px',borderRadius:9,fontSize:12,fontWeight:700,fontFamily:'var(--font)',
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
        </SectionCard>

        {/* S2 */}
        <SectionCard badge={2} title="Count faces, edges and vertices" tagType="drag" tagLabel="Rotate + Type">
          <p style={{fontSize:13,color:'var(--muted)',marginBottom:12}}>
            Rotate each shape, use the highlight buttons to count, then enter the numbers.
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,marginBottom:16}}>
            {FEV_QS.map(q=>(
              <div key={q.lbl} style={{background:'white',border:'2px solid var(--border)',borderRadius:16,padding:16}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <LblCircle letter={q.lbl}/>
                </div>
                {/* Mode toggle */}
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                  {Object.entries(MODE_LABELS).map(([m,label])=>(
                    <button key={m} onClick={()=>setMode(q.lbl,m)} style={{
                      padding:'4px 10px',borderRadius:8,fontSize:11,fontWeight:700,fontFamily:'var(--font)',
                      cursor:'pointer',
                      border:`2px solid ${(modes[q.lbl]||'view')===m?'var(--amber)':'var(--border)'}`,
                      background:(modes[q.lbl]||'view')===m?'var(--amber-bg)':'white',
                      color:(modes[q.lbl]||'view')===m?'var(--amber)':'var(--text)',
                    }}>{label}</button>
                  ))}
                </div>
                <Shape3DViewer shape={q.shape} mode={modes[q.lbl]||'view'} height={220}/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:12}}>
                  {[['Faces','_f'],['Edges','_e'],['Vertices','_v']].map(([label,key])=>(
                    <div key={key} style={{textAlign:'center'}}>
                      <p style={{fontSize:11,fontWeight:700,color:'var(--muted)',marginBottom:4}}>{label}</p>
                      <FEVInput value={s2Ans[`${q.lbl}${key}`]??''} onChange={v=>setS2Ans(p=>({...p,[`${q.lbl}${key}`]:v}))} locked={s2Done}/>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {!s2Done&&<CheckButton onClick={checkS2}/>}
          {s2FB&&<FeedbackBox type={s2FB.type} message={s2FB.msg}/>}
        </SectionCard>

        {prog.allDone&&<Summary score={prog.completedCount} total={2} message="You can name and analyse 3D shapes in three dimensions!"/>}
      </div>
    </div>
  );
}
