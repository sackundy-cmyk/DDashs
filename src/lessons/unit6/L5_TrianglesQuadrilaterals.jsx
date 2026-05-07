// ============================================================
//  lessons/unit6/L5_TrianglesQuadrilaterals.jsx
//  Unit 6 · Lesson 5: Triangles & Quadrilaterals
//  S1: Name 6 triangle types (multi-select where needed)
//  S2: Name 6 quadrilateral types (MCQ)
//  S3: True/False for quadrilateral statements
//  S4: Identify quadrilateral from diagonal dot-grid pattern
// ============================================================

import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem } from '../../components/layout/QGroupItem.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── Triangle SVGs ────────────────────────────────────────────
const TRIANGLE_QS = [
  { lbl:'a', correct:['isosceles'],   fill:'#F97316', pts:'35,5 5,75 65,75' },
  { lbl:'b', correct:['equilateral'], fill:'#EAB308', pts:'40,5 5,75 75,75' },
  { lbl:'c', correct:['scalene','right-angled'], fill:'#22C55E', pts:'5,5 5,75 75,75' },
  { lbl:'d', correct:['isosceles'],   fill:'#EC4899', pts:'40,5 5,75 75,75' },
  { lbl:'e', correct:['isosceles'],   fill:'#93C5FD', pts:'40,5 5,75 75,75' },
  { lbl:'f', correct:['scalene'],     fill:'#D97706', pts:'60,5 5,75 75,60' },
];
const TRIANGLE_TYPES = ['equilateral','isosceles','right-angled','scalene'];

// ── Quadrilateral SVGs ───────────────────────────────────────
const QUAD_QS = [
  { lbl:'a', name:'kite',         pts:'70,40 40,5 10,40 40,85',  fill:'#EC4899' },
  { lbl:'b', name:'rhombus',      pts:'40,5 75,40 40,75 5,40',   fill:'#F97316' },
  { lbl:'c', name:'parallelogram',pts:'15,75 5,5 70,5 80,75',    fill:'#93C5FD' },
  { lbl:'d', name:'rectangle',    pts:'5,60 5,15 75,15 75,60',   fill:'#EAB308' },
  { lbl:'e', name:'parallelogram',pts:'20,75 5,5 65,5 80,75',    fill:'#22C55E' },
  { lbl:'f', name:'rectangle',    pts:'5,80 5,5 35,5 35,80',     fill:'#D97706' },
];
const QUAD_NAMES = ['kite','rhombus','parallelogram','rectangle','square','trapezium'];

// ── True/False statements ────────────────────────────────────
const TF_STATEMENTS = [
  { lbl:'a', text:'A trapezium always has a pair of parallel sides.',          answer:true },
  { lbl:'b', text:'A rectangle always has 4 equal sides and 4 right angles.', answer:false },
  { lbl:'c', text:'A kite sometimes has a right angle.',                       answer:true },
  { lbl:'d', text:'A parallelogram always has opposite sides of equal length.',answer:true },
  { lbl:'e', text:'A rhombus always has pairs of opposite angles the same size.', answer:true },
];

// ── Diagonal patterns (dot grids) ───────────────────────────
function DotGridDiagonal({ lines=[], dotSpacing=18, cols=7, rows=5 }) {
  const w=dotSpacing*(cols-1)+20, h=dotSpacing*(rows-1)+20;
  const dot=(c,r)=>({cx:10+c*dotSpacing,cy:10+r*dotSpacing});
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{background:'#FFF7ED',borderRadius:8}}>
      {Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>(
        <circle key={`${r}-${c}`} cx={10+c*dotSpacing} cy={10+r*dotSpacing} r={2} fill="#C2410C"/>
      )))}
      {lines.map(([c1,r1,c2,r2],i)=>{
        const a=dot(c1,r1), b=dot(c2,r2);
        return <line key={i} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} stroke="#1E293B" strokeWidth={2}/>;
      })}
    </svg>
  );
}

const DIAGONAL_QS = [
  { lbl:'a', answer:'parallelogram',
    lines:[[1,1,5,3],[5,3,1,3],[1,1,5,1],[1,3,5,1]] },
  { lbl:'b', answer:'square or rectangle',
    lines:[[1,1,5,1],[5,1,5,4],[5,4,1,4],[1,4,1,1],[1,1,5,4],[5,1,1,4]] },
  { lbl:'c', answer:'rhombus or kite',
    lines:[[3,1,5,3],[5,3,3,5],[3,5,1,3],[1,3,3,1],[3,1,3,5],[1,3,5,3]] },
];
const DIAGONAL_OPTS = ['parallelogram','square or rectangle','rhombus or kite','trapezium'];

// ── Component ─────────────────────────────────────────────────
export default function L5_TrianglesQuadrilaterals() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(4, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  const s1Sel = state.s1Sel || {}, setS1Sel = setField('s1Sel');
  const s1FB  = state.s1FB  || null, setS1FB  = setField('s1FB');
  const s2Sel = state.s2Sel || {}, setS2Sel = setField('s2Sel');
  const s2FB  = state.s2FB  || null, setS2FB  = setField('s2FB');
  const s3Sel = state.s3Sel || {}, setS3Sel = setField('s3Sel');
  const s3FB  = state.s3FB  || null, setS3FB  = setField('s3FB');
  const s4Sel = state.s4Sel || {}, setS4Sel = setField('s4Sel');
  const s4FB  = state.s4FB  || null, setS4FB  = setField('s4FB');

  const s1Done=prog.isDone('s1'),s2Done=prog.isDone('s2'),s3Done=prog.isDone('s3'),s4Done=prog.isDone('s4');

  const toggleMulti=(key,val,setter)=>{
    setter(prev=>{
      const cur=prev[key]||[];
      return {...prev,[key]:cur.includes(val)?cur.filter(x=>x!==val):[...cur,val]};
    });
  };

  function checkS1(){
    increment('s1'); const att=getAtt('s1')+1;
    let correct=0;
    TRIANGLE_QS.forEach(q=>{
      const sel=(s1Sel[q.lbl]||[]).sort().join(',');
      const exp=q.correct.sort().join(',');
      if(sel===exp)correct++;
    });
    const total=TRIANGLE_QS.length;
    if(correct===total){setS1FB({type:'correct',msg:'✓ All triangles named correctly!'});prog.markDone('s1',{correct,total,attempts:att});}
    else if(att>=3){setS1FB({type:'hint',msg:'c) is scalene AND right-angled. Some triangles have 2 names!'});prog.markDone('s1',{correct,total,attempts:att});}
    else setS1FB({type:'wrong',msg:`${correct}/${total} correct.`});
  }
  function checkS2(){
    increment('s2'); const att=getAtt('s2')+1;
    let correct=0;
    QUAD_QS.forEach(q=>{if(s2Sel[q.lbl]===q.name)correct++;});
    const total=QUAD_QS.length;
    if(correct===total){setS2FB({type:'correct',msg:'✓ All quadrilaterals named!'});prog.markDone('s2',{correct,total,attempts:att});}
    else if(att>=3){setS2FB({type:'hint',msg:'Check: kite has 2 pairs of adjacent equal sides. Rhombus has 4 equal sides.'});prog.markDone('s2',{correct,total,attempts:att});}
    else setS2FB({type:'wrong',msg:`${correct}/${total} correct.`});
  }
  function checkS3(){
    increment('s3'); const att=getAtt('s3')+1;
    let correct=0;
    TF_STATEMENTS.forEach(q=>{
      if((s3Sel[q.lbl]==='true')===q.answer)correct++;
    });
    const total=TF_STATEMENTS.length;
    if(correct===total){setS3FB({type:'correct',msg:'✓ All True/False answered correctly!'});prog.markDone('s3',{correct,total,attempts:att});}
    else if(att>=3){setS3FB({type:'hint',msg:'b) False — a rectangle has 4 right angles but 2 pairs of equal sides, not 4 equal sides.'});prog.markDone('s3',{correct,total,attempts:att});}
    else setS3FB({type:'wrong',msg:`${correct}/${total} correct. Try again!`});
  }
  function checkS4(){
    increment('s4'); const att=getAtt('s4')+1;
    let correct=0;
    DIAGONAL_QS.forEach(q=>{if(s4Sel[q.lbl]===q.answer)correct++;});
    const total=DIAGONAL_QS.length;
    if(correct===total){setS4FB({type:'correct',msg:'✓ You can identify shapes from their diagonals!'});prog.markDone('s4',{correct,total,attempts:att});}
    else if(att>=3){setS4FB({type:'hint',msg:'Perpendicular bisecting diagonals → square/rectangle. Equal perpendicular diagonals → rhombus/kite.'});prog.markDone('s4',{correct,total,attempts:att});}
    else setS4FB({type:'wrong',msg:`${correct}/${total} correct.`});
  }

  return (
    <div style={{fontFamily:'var(--font)',paddingBottom:40}}>
      <Header lessonChip="Unit 6 · Lesson 5" completed={prog.completedCount} total={4}/>
      <div style={{maxWidth:860,margin:'0 auto',padding:'0 16px'}}>
        <ObjectiveCard text="Name and classify triangles and quadrilaterals. Identify properties and shapes from diagonal patterns."/>
        <ExplainPanel title="Triangle Types">
          <RuleBox>
            <strong>Equilateral</strong> — 3 equal sides, 3 equal angles (60°), 3 lines of symmetry<br/>
            <strong>Isosceles</strong> — 2 equal sides, 2 equal angles, 1 line of symmetry<br/>
            <strong>Right-angled</strong> — 1 right angle (some are also isosceles or scalene)<br/>
            <strong>Scalene</strong> — no equal sides, no equal angles, no symmetry
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={4}/>

        {/* S1 */}
        <SectionCard badge={1} title="Name each triangle" tagType="mcq" tagLabel="Multi-tap">
          <QGroup title="Some triangles may have more than one name — tap all that apply">
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:16}}>
              {TRIANGLE_QS.map(q=>{
                const sel=s1Sel[q.lbl]||[];
                return (
                  <div key={q.lbl} style={{background:'white',border:'2px solid var(--border)',borderRadius:12,padding:12,textAlign:'center'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}><LblCircle letter={q.lbl}/></div>
                    <svg viewBox="0 0 80 80" width={80} height={80}>
                      <polygon points={q.pts} fill={q.fill} stroke="white" strokeWidth={2}/>
                    </svg>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4,justifyContent:'center',marginTop:8}}>
                      {TRIANGLE_TYPES.map(t=>(
                        <button key={t} onClick={()=>!s1Done&&toggleMulti(q.lbl,t,setS1Sel)} style={{
                          padding:'3px 7px',borderRadius:7,fontSize:10,fontWeight:700,fontFamily:'var(--font)',
                          cursor:s1Done?'default':'pointer',
                          border:`2px solid ${sel.includes(t)?'var(--blue)':'var(--border)'}`,
                          background:sel.includes(t)?'var(--blue-light)':'white',
                          color:sel.includes(t)?'var(--blue)':'var(--text)',
                        }}>{t}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {!s1Done&&<CheckButton onClick={checkS1}/>}
            {s1FB&&<FeedbackBox type={s1FB.type} message={s1FB.msg}/>}
          </QGroup>
        </SectionCard>

        {/* S2 */}
        <SectionCard badge={2} title="Name each quadrilateral" tagType="mcq" tagLabel="Tap">
          <QGroup title="Choose the correct name for each shape">
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:16}}>
              {QUAD_QS.map(q=>(
                <div key={q.lbl} style={{background:'white',border:'2px solid var(--border)',borderRadius:12,padding:12,textAlign:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}><LblCircle letter={q.lbl}/></div>
                  <svg viewBox="0 0 80 90" width={80} height={90}>
                    <polygon points={q.pts} fill={q.fill} stroke="white" strokeWidth={2}/>
                  </svg>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4,justifyContent:'center',marginTop:8}}>
                    {QUAD_NAMES.map(n=>(
                      <button key={n} onClick={()=>!s2Done&&setS2Sel(p=>({...p,[q.lbl]:n}))} style={{
                        padding:'3px 7px',borderRadius:7,fontSize:10,fontWeight:700,fontFamily:'var(--font)',
                        cursor:s2Done?'default':'pointer',
                        border:`2px solid ${s2Sel[q.lbl]===n?'var(--blue)':'var(--border)'}`,
                        background:s2Sel[q.lbl]===n?'var(--blue-light)':'white',
                        color:s2Sel[q.lbl]===n?'var(--blue)':'var(--text)',
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!s2Done&&<CheckButton onClick={checkS2}/>}
            {s2FB&&<FeedbackBox type={s2FB.type} message={s2FB.msg}/>}
          </QGroup>
        </SectionCard>

        {/* S3 */}
        <SectionCard badge={3} title="True or False?" tagType="mcq" tagLabel="Tap">
          <QGroup title="For each statement, choose True or False">
            {TF_STATEMENTS.map(q=>(
              <QItem key={q.lbl}>
                <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <LblCircle letter={q.lbl}/>
                  <p style={{flex:1,fontWeight:600,fontSize:14,margin:0}}>{q.text}</p>
                  <div style={{display:'flex',gap:8}}>
                    {['true','false'].map(v=>(
                      <button key={v} onClick={()=>!s3Done&&setS3Sel(p=>({...p,[q.lbl]:v}))} style={{
                        padding:'8px 18px',borderRadius:10,fontSize:14,fontWeight:800,
                        fontFamily:'var(--font)',cursor:s3Done?'default':'pointer',
                        border:`2px solid ${s3Sel[q.lbl]===v?(v==='true'?'var(--green)':'var(--red)'):'var(--border)'}`,
                        background:s3Sel[q.lbl]===v?(v==='true'?'var(--green-bg)':'var(--red-bg)'):'white',
                        color:s3Sel[q.lbl]===v?(v==='true'?'var(--green)':'var(--red)'):'var(--text)',
                      }}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>
                    ))}
                  </div>
                </div>
              </QItem>
            ))}
            {!s3Done&&<CheckButton onClick={checkS3}/>}
            {s3FB&&<FeedbackBox type={s3FB.type} message={s3FB.msg}/>}
          </QGroup>
        </SectionCard>

        {/* S4 */}
        <SectionCard badge={4} title="Name from diagonal patterns" tagType="mcq" tagLabel="Tap">
          <QGroup title="The diagonals of a quadrilateral are shown. Name the quadrilateral.">
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:16}}>
              {DIAGONAL_QS.map(q=>(
                <div key={q.lbl} style={{background:'white',border:'2px solid var(--border)',borderRadius:12,padding:14}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}><LblCircle letter={q.lbl}/></div>
                  <DotGridDiagonal lines={q.lines}/>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10}}>
                    {DIAGONAL_OPTS.map(n=>(
                      <button key={n} onClick={()=>!s4Done&&setS4Sel(p=>({...p,[q.lbl]:n}))} style={{
                        padding:'4px 10px',borderRadius:8,fontSize:11,fontWeight:700,fontFamily:'var(--font)',
                        cursor:s4Done?'default':'pointer',
                        border:`2px solid ${s4Sel[q.lbl]===n?'var(--blue)':'var(--border)'}`,
                        background:s4Sel[q.lbl]===n?'var(--blue-light)':'white',
                        color:s4Sel[q.lbl]===n?'var(--blue)':'var(--text)',
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!s4Done&&<CheckButton onClick={checkS4}/>}
            {s4FB&&<FeedbackBox type={s4FB.type} message={s4FB.msg}/>}
          </QGroup>
        </SectionCard>

        {prog.allDone&&<Summary score={prog.completedCount} total={4} message="You can classify triangles and quadrilaterals with confidence!"/>}
      </div>
    </div>
  );
}
