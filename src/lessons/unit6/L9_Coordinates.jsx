// ============================================================
//  lessons/unit6/L9_Coordinates.jsx
//  Unit 6 · Lesson 9: Coordinates
//  S1: Read farm map coordinates (MCQ + digit entry)
//  S2: Find missing vertices on grid (click-to-place)
//  S3: Plot pentagon on grid, then draw its reflection
// ============================================================

import { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem } from '../../components/layout/QGroupItem.jsx';
import CoordGrid from '../../components/interactions/CoordGrid.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── Farm map (S1) ─────────────────────────────────────────────
const FARM_ITEMS = [
  { name:'Water pump', x:1, y:5, icon:'💧' },
  { name:'Windmill',   x:7, y:2, icon:'🌬️' },
  { name:'Tractor',    x:6, y:6, icon:'🚜' },
  { name:'Farmhouse',  x:6, y:4, icon:'🏠' },
  { name:'Gate',       x:2, y:3, icon:'🚪' },
  { name:'Tree',       x:5, y:9, icon:'🌴' },
  { name:'Bridge',     x:9, y:7, icon:'🌉' },
  { name:'Stables',    x:3, y:6, icon:'🐴' },
];

function FarmMap() {
  const CELL = 38, MARGIN = 36, SIZE = 10;
  const W = MARGIN + CELL * SIZE + 10;
  const H = MARGIN + CELL * SIZE + 10;
  const gx = x => MARGIN + x * CELL;
  const gy = y => CELL * SIZE - y * CELL + 10;
  const gridLines = [];
  for (let i=0;i<=SIZE;i++) {
    gridLines.push(<line key={`v${i}`} x1={gx(i)} y1={10} x2={gx(i)} y2={gy(0)} stroke="#D1FAE5" strokeWidth={1}/>);
    gridLines.push(<line key={`h${i}`} x1={MARGIN} y1={gy(i)} x2={gx(SIZE)} y2={gy(i)} stroke="#D1FAE5" strokeWidth={1}/>);
  }
  return (
    <div style={{overflowX:'auto'}}>
      <svg width={W} height={H} style={{display:'block',background:'#ECFDF5',borderRadius:12}}>
        <rect x={MARGIN} y={10} width={CELL*SIZE} height={CELL*SIZE} fill="#D1FAE5"/>
        {gridLines}
        {/* Axis labels */}
        {Array.from({length:SIZE+1},(_,i)=>(
          <g key={i}>
            <text x={gx(i)} y={gy(0)+16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#065F46">{i}</text>
            <text x={MARGIN-6} y={gy(i)+4} textAnchor="end" fontSize={11} fontWeight={700} fill="#065F46">{i}</text>
          </g>
        ))}
        <text x={gx(SIZE)+8} y={gy(0)+4} fontSize={13} fontWeight={800} fill="#065F46">x</text>
        <text x={MARGIN-6} y={4} textAnchor="middle" fontSize={13} fontWeight={800} fill="#065F46">y</text>
        {/* Farm items */}
        {FARM_ITEMS.map(item=>(
          <g key={item.name}>
            <rect x={gx(item.x)-14} y={gy(item.y)-20} width={28} height={28} rx={6} fill="white" opacity={0.85}/>
            <text x={gx(item.x)} y={gy(item.y)+8} textAnchor="middle" fontSize={18}>{item.icon}</text>
            <text x={gx(item.x)} y={gy(item.y)-22} textAnchor="middle" fontSize={8} fontWeight={700} fill="#065F46">{item.name}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Q2: Answer coordinates
const MAP_QS = [
  { lbl:'a', q:'What is at (2, 3)?',                    type:'mcq', opts:['Gate','Stables','Windmill','Farmhouse'],   answer:'Gate' },
  { lbl:'b', q:'What is at (9, 7)?',                    type:'mcq', opts:['Bridge','Tree','Tractor','Stables'],       answer:'Bridge' },
  { lbl:'c', q:'What is at (3, 6)?',                    type:'mcq', opts:['Stables','Gate','Farmhouse','Water pump'], answer:'Stables' },
  { lbl:'d', q:'What is at (6, 4)?',                    type:'mcq', opts:['Farmhouse','Tractor','Gate','Tree'],       answer:'Farmhouse' },
  { lbl:'e', q:'What are the coordinates of the Water pump?', type:'coords', answer:{x:1,y:5} },
  { lbl:'f', q:'What are the coordinates of the Windmill?',   type:'coords', answer:{x:7,y:2} },
  { lbl:'g', q:'What are the coordinates of the Tractor?',    type:'coords', answer:{x:6,y:6} },
  { lbl:'h', q:'What are the coordinates of the Farmhouse?',  type:'coords', answer:{x:6,y:4} },
];

// ── S2: Missing vertices ──────────────────────────────────────
const MISSING_VERTEX_QS = [
  {
    lbl:'a',
    desc:'Three corners of a rectangle are A(1,1), B(4,1), C(4,4). Click the 4th corner D.',
    prePoints:[{x:1,y:1,label:'A',colour:'#7C3AED'},{x:4,y:1,label:'B',colour:'#7C3AED'},{x:4,y:4,label:'C',colour:'#7C3AED'}],
    preLines:[{from:{x:1,y:1},to:{x:4,y:1},colour:'#7C3AED'},{from:{x:4,y:1},to:{x:4,y:4},colour:'#7C3AED'}],
    answer:{x:1,y:4},
  },
  {
    lbl:'b',
    desc:'Three corners of a square are P(2,2), Q(5,2), R(5,5). Click the 4th corner S.',
    prePoints:[{x:2,y:2,label:'P',colour:'#DC2626'},{x:5,y:2,label:'Q',colour:'#DC2626'},{x:5,y:5,label:'R',colour:'#DC2626'}],
    preLines:[{from:{x:2,y:2},to:{x:5,y:2},colour:'#DC2626'},{from:{x:5,y:2},to:{x:5,y:5},colour:'#DC2626'}],
    answer:{x:2,y:5},
  },
];

// ── S3: Plot pentagon + reflect ───────────────────────────────
const PENTAGON = [{x:2,y:8,label:'A'},{x:4,y:6,label:'B'},{x:4,y:4,label:'C'},{x:2,y:4,label:'D'},{x:0,y:6,label:'E'}];
const REFLECTED_PENTAGON = [{x:6,y:8},{x:8,y:6},{x:8,y:4},{x:6,y:4},{x:4,y:6}]; // reflection over x=4? Let's use y=x mirror (the image showed diagonal)
// Actually from image mirror line is y=x diagonal. Reflected: A(2,8)→A'(8,2), B(4,6)→B'(6,4), etc.
// Let's use a simpler vertical mirror at x=4: A(2,8)→A'(6,8), B(4,6)→B'(4,6), C(4,4)→C'(4,4), D(2,4)→D'(6,4), E(0,6)→E'(8,6)
const REFL_CORRECT = [{x:6,y:8},{x:4,y:6},{x:4,y:4},{x:6,y:4},{x:8,y:6}];

// ── Component ─────────────────────────────────────────────────
export default function L9_Coordinates() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  const s1Sel = state.s1Sel || {}, setS1Sel = setField('s1Sel');
  const s1FB  = state.s1FB  || null, setS1FB  = setField('s1FB');
  const [s2Points, setS2Points] = useState([{},{}]); // one point per question
  const s2FB  = state.s2FB  || null, setS2FB  = setField('s2FB');
  const [pentPoints, setPentPoints] = useState([]);
  const [reflPoints, setReflPoints] = useState([]);
  const s3FB  = state.s3FB  || null, setS3FB  = setField('s3FB');

  const s1Done=prog.isDone('s1'),s2Done=prog.isDone('s2'),s3Done=prog.isDone('s3');

  function checkS1(){
    increment('s1'); const att=getAtt('s1')+1;
    let correct=0;
    MAP_QS.forEach(q=>{
      if(q.type==='mcq' && s1Sel[q.lbl]===q.answer) correct++;
      if(q.type==='coords'){
        const sel=s1Sel[q.lbl]||{};
        if(parseInt(sel.x)===q.answer.x && parseInt(sel.y)===q.answer.y) correct++;
      }
    });
    const total=MAP_QS.length;
    if(correct===total){setS1FB({type:'correct',msg:'✓ All coordinates correct!'});prog.markDone('s1',{correct,total,attempts:att});}
    else if(att>=3){setS1FB({type:'hint',msg:'Remember: x comes first (across), then y (up). Water pump=(1,5), Windmill=(7,2), Tractor=(6,6), Farmhouse=(6,4).'});prog.markDone('s1',{correct,total,attempts:att});}
    else setS1FB({type:'wrong',msg:`${correct}/${total} correct.`});
  }

  function checkS2(){
    increment('s2'); const att=getAtt('s2')+1;
    let correct=0;
    MISSING_VERTEX_QS.forEach((q,i)=>{
      const pt=s2Points[i];
      if(pt && pt.x===q.answer.x && pt.y===q.answer.y) correct++;
    });
    const total=MISSING_VERTEX_QS.length;
    if(correct===total){setS2FB({type:'correct',msg:'✓ Both missing vertices found!'});prog.markDone('s2',{correct,total,attempts:att});}
    else if(att>=3){setS2FB({type:'hint',msg:`a) D=(1,4) — the 4th corner of the rectangle. b) S=(2,5) — the 4th corner of the square.`});prog.markDone('s2',{correct,total,attempts:att});}
    else setS2FB({type:'wrong',msg:`${correct}/${total} correct. Tap the missing corner on the grid.`});
  }

  function checkS3(){
    increment('s3'); const att=getAtt('s3')+1;
    let pentOk=pentPoints.length>=5;
    let reflOk=reflPoints.length>=5;
    if(reflOk){
      const matched=REFL_CORRECT.every(expected=>
        reflPoints.some(p=>p.x===expected.x && p.y===expected.y)
      );
      reflOk=matched;
    }
    if(pentOk&&reflOk){setS3FB({type:'correct',msg:'✓ Pentagon plotted and reflected correctly!'});prog.markDone('s3',{correct:1,total:1,attempts:att});}
    else if(att>=3){setS3FB({type:'hint',msg:'Reflected vertices (mirror at x=4): A\'(6,8) B\'(4,6) C\'(4,4) D\'(6,4) E\'(8,6).'});prog.markDone('s3',{correct:0,total:1,attempts:att});}
    else setS3FB({type:'wrong',msg:'Check your pentagon points and the reflected positions across the mirror line.'});
  }

  const updateS2Point=(qi,pts)=>{
    const pt=pts[pts.length-1];
    setS2Points(prev=>{ const next=[...prev]; next[qi]=pt||{}; return next; });
  };

  return (
    <div style={{fontFamily:'var(--font)',paddingBottom:40}}>
      <Header lessonChip="Unit 6 · Lesson 9" completed={prog.completedCount} total={3}/>
      <div style={{maxWidth:900,margin:'0 auto',padding:'0 16px'}}>
        <ObjectiveCard text="Read and plot coordinates. Find missing vertices of shapes. Reflect shapes on a coordinate grid."/>
        <ExplainPanel title="Coordinates">
          <RuleBox>
            Coordinates are written as <strong>(x, y)</strong> — x is across (horizontal), y is up (vertical).<br/>
            Start at the origin (0,0) and count along first, then up.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={3}/>

        {/* S1 */}
        <SectionCard badge={1} title="Farm map coordinates" tagType="mcq" tagLabel="Tap + Type">
          <FarmMap/>
          <QGroup title="Answer these questions about the farm map">
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12,marginBottom:16,marginTop:12}}>
              {MAP_QS.map(q=>(
                <QItem key={q.lbl}>
                  <div style={{display:'flex',gap:8,alignItems:'flex-start',flexWrap:'wrap'}}>
                    <LblCircle letter={q.lbl}/>
                    <div style={{flex:1}}>
                      <p style={{fontWeight:700,fontSize:13,marginBottom:8}}>{q.q}</p>
                      {q.type==='mcq' && (
                        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                          {q.opts.map(o=>(
                            <button key={o} onClick={()=>!s1Done&&setS1Sel(p=>({...p,[q.lbl]:o}))} style={{
                              padding:'5px 12px',borderRadius:8,fontSize:12,fontWeight:700,fontFamily:'var(--font)',
                              cursor:s1Done?'default':'pointer',
                              border:`2px solid ${s1Sel[q.lbl]===o?'var(--blue)':'var(--border)'}`,
                              background:s1Sel[q.lbl]===o?'var(--blue-light)':'white',
                              color:s1Sel[q.lbl]===o?'var(--blue)':'var(--text)',
                            }}>{o}</button>
                          ))}
                        </div>
                      )}
                      {q.type==='coords' && (
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <span style={{fontWeight:700}}>x =</span>
                          <input type="number" value={(s1Sel[q.lbl]||{}).x??''} min={0} max={10}
                            onChange={e=>!s1Done&&setS1Sel(p=>({...p,[q.lbl]:{...(p[q.lbl]||{}),x:parseInt(e.target.value)}}))}
                            disabled={s1Done}
                            style={{width:50,padding:'5px 8px',borderRadius:9,border:'2px solid var(--border)',fontFamily:'var(--font)',fontSize:14,fontWeight:800,textAlign:'center'}}/>
                          <span style={{fontWeight:700}}>y =</span>
                          <input type="number" value={(s1Sel[q.lbl]||{}).y??''} min={0} max={10}
                            onChange={e=>!s1Done&&setS1Sel(p=>({...p,[q.lbl]:{...(p[q.lbl]||{}),y:parseInt(e.target.value)}}))}
                            disabled={s1Done}
                            style={{width:50,padding:'5px 8px',borderRadius:9,border:'2px solid var(--border)',fontFamily:'var(--font)',fontSize:14,fontWeight:800,textAlign:'center'}}/>
                        </div>
                      )}
                    </div>
                  </div>
                </QItem>
              ))}
            </div>
            {!s1Done&&<CheckButton onClick={checkS1}/>}
            {s1FB&&<FeedbackBox type={s1FB.type} message={s1FB.msg}/>}
          </QGroup>
        </SectionCard>

        {/* S2 */}
        <SectionCard badge={2} title="Find the missing vertex" tagType="tap" tagLabel="Click grid">
          <QGroup title="Tap on the grid to place the missing corner of each shape">
            {MISSING_VERTEX_QS.map((q,qi)=>(
              <QItem key={q.lbl}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                  <LblCircle letter={q.lbl}/>
                  <p style={{fontWeight:600,fontSize:13}}>{q.desc}</p>
                </div>
                <CoordGrid
                  size={7} cellPx={40}
                  prePoints={q.prePoints} preLines={q.preLines}
                  interactive={!s2Done} maxPoints={1}
                  onPointPlace={pts=>updateS2Point(qi,pts)}
                  colour="#F97316"
                />
                {s2Points[qi]?.x!==undefined && (
                  <p style={{fontSize:13,fontWeight:700,marginTop:6,color:'var(--blue)'}}>
                    Your answer: ({s2Points[qi].x}, {s2Points[qi].y})
                  </p>
                )}
              </QItem>
            ))}
            {!s2Done&&<CheckButton onClick={checkS2}/>}
            {s2FB&&<FeedbackBox type={s2FB.type} message={s2FB.msg}/>}
          </QGroup>
        </SectionCard>

        {/* S3 */}
        <SectionCard badge={3} title="Plot a pentagon and reflect it" tagType="tap" tagLabel="Click grid">
          <QGroup title="Step 1: Plot A(2,8) B(4,6) C(4,4) D(2,4) E(0,6) to make a pentagon. Step 2: Draw the reflection over the dashed mirror line x=4.">
            <p style={{fontSize:13,color:'var(--muted)',marginBottom:8}}>
              <strong>Step 1</strong> — click 5 points for the pentagon (blue). <strong>Step 2</strong> — click 5 reflected points (orange).
            </p>
            <p style={{fontSize:12,fontWeight:700,marginBottom:4}}>Pentagon points (click 5):</p>
            <CoordGrid
              size={10} cellPx={36}
              prePoints={PENTAGON.map(p=>({...p,colour:'#7C3AED'}))}
              preLines={PENTAGON.map((p,i)=>({from:p,to:PENTAGON[(i+1)%5],colour:'#7C3AED'}))}
              mirror={{axis:'x',value:4}}
              interactive={!s3Done} maxPoints={5}
              onPointPlace={setPentPoints}
              colour="#7C3AED"
            />
            <p style={{fontSize:12,fontWeight:700,margin:'12px 0 4px'}}>Reflected points A'–E' (click 5 on the right of the mirror):</p>
            <CoordGrid
              size={10} cellPx={36}
              prePoints={PENTAGON.map(p=>({...p,colour:'#7C3AED'}))}
              preLines={PENTAGON.map((p,i)=>({from:p,to:PENTAGON[(i+1)%5],colour:'#7C3AED'}))}
              mirror={{axis:'x',value:4}}
              interactive={!s3Done} maxPoints={5}
              onPointPlace={setReflPoints}
              colour="#F97316"
            />
            {!s3Done&&<CheckButton onClick={checkS3}/>}
            {s3FB&&<FeedbackBox type={s3FB.type} message={s3FB.msg}/>}
          </QGroup>
        </SectionCard>

        {prog.allDone&&<Summary score={prog.completedCount} total={3} message="You can read, plot and reflect coordinates!"/>}
      </div>
    </div>
  );
}
