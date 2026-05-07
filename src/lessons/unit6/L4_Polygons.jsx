// ============================================================
//  lessons/unit6/L4_Polygons.jsx
//  Unit 6 · Lesson 4: Polygons
//  S1: Polygon names & side counts (8 shapes, digit entry)
//  S2: Shape properties table (6 shapes × 4 properties)
//  S3: Congruent shapes — tap triangles congruent to X and Y
// ============================================================

import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem } from '../../components/layout/QGroupItem.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── S1: Polygons ─────────────────────────────────────────────
function RegularPolygon({ sides, color='#60A5FA', size=110 }) {
  const cx=size/2, cy=size/2, r=size*0.42;
  const points=Array.from({length:sides},(_,i)=>{
    const a=(i*2*Math.PI/sides)-Math.PI/2;
    return `${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`;
  }).join(' ');
  return <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
    <polygon points={points} fill={color} stroke="white" strokeWidth={2}/>
  </svg>;
}

const POLYGON_QS = [
  { lbl:'a', name:'octagon',      sides:8,  color:'#EC4899' },
  { lbl:'b', name:'hexagon',      sides:6,  color:'#22C55E' },
  { lbl:'c', name:'triangle',     sides:3,  color:'#F97316' },
  { lbl:'d', name:'decagon',      sides:10, color:'#EAB308' },
  { lbl:'e', name:'quadrilateral',sides:4,  color:'#06B6D4' },
  { lbl:'f', name:'pentagon',     sides:5,  color:'#A855F7' },
  { lbl:'g', name:'nonagon',      sides:9,  color:'#3B82F6' },
  { lbl:'h', name:'heptagon',     sides:7,  color:'#14B8A6' },
];

// ── S2: Properties table ─────────────────────────────────────
const TABLE_SHAPES = [
  { name:'Rectangle',                   equalSides:'2 pairs', equalAngles:4, rightAngles:4, symmetry:2 },
  { name:'Rhombus',                      equalSides:4,         equalAngles:'2 pairs', rightAngles:0, symmetry:2 },
  { name:'Regular hexagon',             equalSides:6,         equalAngles:6, rightAngles:0, symmetry:6 },
  { name:'Equilateral triangle',        equalSides:3,         equalAngles:3, rightAngles:0, symmetry:3 },
  { name:'Square',                       equalSides:4,         equalAngles:4, rightAngles:4, symmetry:4 },
  { name:'Right-angled isosceles triangle', equalSides:2,     equalAngles:2, rightAngles:1, symmetry:1 },
];
const TABLE_COLS = ['Equal sides','Equal angles','Right angles','Symmetry lines'];
const TABLE_KEYS = ['equalSides','equalAngles','rightAngles','symmetry'];

// ── S3: Congruent shapes ─────────────────────────────────────
// X = tall narrow triangle, Y = wide flat blue triangle
// A,D,E = congruent to X (same shape/size, diff rotation/colour)
// B,G,I = congruent to Y
const CONGRUENT = [
  { id:'A', congruentTo:'X', color:'#F97316' },
  { id:'B', congruentTo:'Y', color:'#EAB308' },
  { id:'C', congruentTo:null, color:'#EC4899' },
  { id:'D', congruentTo:'X', color:'#22C55E' },
  { id:'E', congruentTo:'X', color:'#A855F7' },
  { id:'F', congruentTo:null, color:'#14B8A6' },
  { id:'G', congruentTo:'Y', color:'#F97316' },
  { id:'H', congruentTo:null, color:'#3B82F6' },
  { id:'I', congruentTo:'Y', color:'#EC4899' },
];

function TriangleSVG({ color='#60A5FA', type='X', size=80 }) {
  if (type==='X') return <svg viewBox="0 0 60 70" width={size} height={size*70/60}><polygon points="30,5 48,65 12,65" fill={color} stroke="white" strokeWidth={2}/></svg>;
  return <svg viewBox="0 0 80 50" width={size*80/60} height={size*50/60}><polygon points="5,45 75,45 50,10" fill={color} stroke="white" strokeWidth={2}/></svg>;
}
function SmallTriangle({ congruentTo, color, size=70 }) {
  if (congruentTo==='X') return <TriangleSVG color={color} type='X' size={size}/>;
  if (congruentTo==='Y') return <TriangleSVG color={color} type='Y' size={size}/>;
  // Different shape
  return <svg viewBox="0 0 60 55" width={size} height={size}><polygon points="30,5 55,50 5,50" fill={color} stroke="white" strokeWidth={2}/></svg>;
}

// ── Component ─────────────────────────────────────────────────
export default function L4_Polygons() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  const s1Ans = state.s1Ans || {}, setS1Ans = setField('s1Ans');
  const s1FB  = state.s1FB  || null, setS1FB  = setField('s1FB');
  const s2Ans = state.s2Ans || {}, setS2Ans = setField('s2Ans');
  const s2FB  = state.s2FB  || null, setS2FB  = setField('s2FB');
  const s3SelX = state.s3SelX || [], setS3SelX = setField('s3SelX');
  const s3SelY = state.s3SelY || [], setS3SelY = setField('s3SelY');
  const s3FB   = state.s3FB   || null, setS3FB   = setField('s3FB');

  const s1Done = prog.isDone('s1');
  const s2Done = prog.isDone('s2');
  const s3Done = prog.isDone('s3');

  function checkS1() {
    increment('s1');
    const att = getAtt('s1')+1;
    let correct = 0;
    POLYGON_QS.forEach(q => { if (parseInt(s1Ans[q.lbl])===q.sides) correct++; });
    const total = POLYGON_QS.length;
    if (correct===total) {
      setS1FB({type:'correct',msg:'✓ All correct!'});
      prog.markDone('s1',{correct,total,attempts:att});
    } else if (att>=3) {
      setS1FB({type:'hint',msg:POLYGON_QS.map(q=>`${q.name}=${q.sides}`).join(', ')});
      prog.markDone('s1',{correct,total,attempts:att});
    } else {
      setS1FB({type:'wrong',msg:`${correct}/${total} correct.`});
    }
  }

  function checkS2() {
    increment('s2');
    const att = getAtt('s2')+1;
    let correct = 0, total = 0;
    TABLE_SHAPES.forEach(row => {
      TABLE_KEYS.forEach(k => {
        total++;
        const expected = String(row[k]);
        const given = String(s2Ans[`${row.name}_${k}`]||'');
        if (given.toLowerCase()===expected.toLowerCase()) correct++;
      });
    });
    if (correct===total) {
      setS2FB({type:'correct',msg:'✓ All properties correct!'});
      prog.markDone('s2',{correct,total,attempts:att});
    } else if (att>=3) {
      setS2FB({type:'hint',msg:'Check: Rectangle has 4 equal angles (all 90°). Rhombus has 4 equal sides. Hexagon has 6 equal sides and 6 symmetry lines.'});
      prog.markDone('s2',{correct,total,attempts:att});
    } else {
      setS2FB({type:'wrong',msg:`${correct}/${total} cells correct.`});
    }
  }

  function checkS3() {
    increment('s3');
    const att = getAtt('s3')+1;
    const correctX = CONGRUENT.filter(c=>c.congruentTo==='X').map(c=>c.id).sort();
    const correctY = CONGRUENT.filter(c=>c.congruentTo==='Y').map(c=>c.id).sort();
    const selX = [...s3SelX].sort();
    const selY = [...s3SelY].sort();
    const xOk = JSON.stringify(selX)===JSON.stringify(correctX);
    const yOk = JSON.stringify(selY)===JSON.stringify(correctY);
    if (xOk&&yOk) {
      setS3FB({type:'correct',msg:'✓ Correct! Congruent shapes are identical in size — colour and rotation can differ.'});
      prog.markDone('s3',{correct:2,total:2,attempts:att});
    } else if (att>=3) {
      setS3FB({type:'hint',msg:`X congruent: ${correctX.join(', ')}. Y congruent: ${correctY.join(', ')}.`});
      prog.markDone('s3',{correct:0,total:2,attempts:att});
    } else {
      setS3FB({type:'wrong',msg:`${xOk?'X ✓':'X ✗'} | ${yOk?'Y ✓':'Y ✗'} — try again.`});
    }
  }

  const toggle=(list,setList,id)=>{
    setList(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  };

  return (
    <div style={{fontFamily:'var(--font)',paddingBottom:40}}>
      <Header lessonChip="Unit 6 · Lesson 4" completed={prog.completedCount} total={3}/>
      <div style={{maxWidth:860,margin:'0 auto',padding:'0 16px'}}>
        <ObjectiveCard text="Name polygons by their number of sides. Identify properties of 2D shapes. Recognise congruent shapes."/>
        <ExplainPanel title="Polygons">
          <RuleBox>
            A <strong>polygon</strong> is a closed 2D shape with straight sides.<br/>
            Triangles (3), Quadrilaterals (4), Pentagons (5), Hexagons (6), Heptagons (7), Octagons (8), Nonagons (9), Decagons (10).
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={3}/>

        {/* S1 */}
        <SectionCard badge={1} title="How many sides?" tagType="drag" tagLabel="Type">
          <QGroup title="Type the number of sides for each polygon">
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:16}}>
              {POLYGON_QS.map(q=>(
                <div key={q.lbl} style={{background:'white',border:'2px solid var(--border)',borderRadius:12,padding:12,textAlign:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                    <LblCircle letter={q.lbl}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'center',marginBottom:8}}>
                    <RegularPolygon sides={q.sides} color={q.color}/>
                  </div>
                  <p style={{fontWeight:700,fontSize:12,marginBottom:6}}>{q.name}</p>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                    <input type="number" min={3} max={12} value={s1Ans[q.lbl]??''}
                      onChange={e=>!s1Done&&setS1Ans(p=>({...p,[q.lbl]:e.target.value}))}
                      disabled={s1Done}
                      style={{width:70,padding:'5px 8px',borderRadius:9,border:'2px solid var(--border)',
                        fontFamily:'var(--font)',fontSize:20,fontWeight:800,textAlign:'center'}}
                      placeholder="#"/>
                    <span style={{fontWeight:700}}>sides</span>
                  </div>
                </div>
              ))}
            </div>
            <CheckButton disabled={s1Done} onClick={checkS1}/>
            {s1FB&&<FeedbackBox type={s1FB.type} message={s1FB.msg}/>}
          </QGroup>
        </SectionCard>

        {/* S2 */}
        <SectionCard badge={2} title="Shape properties table" tagType="drag" tagLabel="Type">
          <QGroup title="Complete the table — enter the number for each property">
            <div style={{overflowX:'auto',marginBottom:16}}>
              <table style={{borderCollapse:'collapse',minWidth:560,width:'100%',fontSize:13,fontFamily:'var(--font)'}}>
                <thead>
                  <tr style={{background:'var(--blue-light)'}}>
                    <th style={{padding:'10px 12px',border:'2px solid var(--border)',textAlign:'left',fontWeight:800}}>Shape</th>
                    {TABLE_COLS.map(c=>(
                      <th key={c} style={{padding:'10px 12px',border:'2px solid var(--border)',textAlign:'center',fontWeight:800}}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TABLE_SHAPES.map((row,ri)=>(
                    <tr key={ri} style={{background:ri%2===0?'white':'#F8FAFC'}}>
                      <td style={{padding:'8px 12px',border:'2px solid var(--border)',fontWeight:700}}>{row.name}</td>
                      {TABLE_KEYS.map(k=>(
                        <td key={k} style={{padding:'6px 8px',border:'2px solid var(--border)',textAlign:'center'}}>
                          <input type="text" value={s2Ans[`${row.name}_${k}`]??''}
                            onChange={e=>!s2Done&&setS2Ans(p=>({...p,[`${row.name}_${k}`]:e.target.value}))}
                            disabled={s2Done}
                            style={{width:60,padding:'4px 6px',borderRadius:7,border:'2px solid var(--border)',
                              fontFamily:'var(--font)',fontSize:13,fontWeight:700,textAlign:'center'}}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CheckButton disabled={s2Done} onClick={checkS2}/>
            {s2FB&&<FeedbackBox type={s2FB.type} message={s2FB.msg}/>}
          </QGroup>
        </SectionCard>

        {/* S3 */}
        <SectionCard badge={3} title="Congruent shapes" tagType="tap" tagLabel="Tap">
          <QGroup title="Congruent shapes are identical in size — colour and position can differ.">
            <div style={{display:'flex',gap:20,flexWrap:'wrap',marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--blue-light)',borderRadius:12,padding:'8px 16px'}}>
                <span style={{fontWeight:800,fontSize:15}}>X</span>
                <TriangleSVG color="#FBBF24" type='X' size={52}/>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--purple-bg)',borderRadius:12,padding:'8px 16px'}}>
                <span style={{fontWeight:800,fontSize:15}}>Y</span>
                <TriangleSVG color="#93C5FD" type='Y' size={60}/>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <p style={{fontWeight:700,marginBottom:8}}>Congruent to X — tap all:</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:12}}>
                {CONGRUENT.map(c=>{
                  const sel=s3SelX.includes(c.id);
                  return <button key={c.id} onClick={()=>!s3Done&&toggle(s3SelX,setS3SelX,c.id)} style={{
                    display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 12px',
                    borderRadius:12,border:`2px solid ${sel?'var(--blue)':'var(--border)'}`,
                    background:sel?'var(--blue-light)':'white',cursor:s3Done?'default':'pointer',
                  }}>
                    <SmallTriangle congruentTo={c.congruentTo} color={c.color}/>
                    <span style={{fontWeight:800,fontSize:12,color:sel?'var(--blue)':'var(--text)'}}>{c.id}</span>
                  </button>;
                })}
              </div>
              <p style={{fontWeight:700,marginBottom:8}}>Congruent to Y — tap all:</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                {CONGRUENT.map(c=>{
                  const sel=s3SelY.includes(c.id);
                  return <button key={c.id} onClick={()=>!s3Done&&toggle(s3SelY,setS3SelY,c.id)} style={{
                    display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 12px',
                    borderRadius:12,border:`2px solid ${sel?'var(--purple)':'var(--border)'}`,
                    background:sel?'var(--purple-bg)':'white',cursor:s3Done?'default':'pointer',
                  }}>
                    <SmallTriangle congruentTo={c.congruentTo} color={c.color}/>
                    <span style={{fontWeight:800,fontSize:12,color:sel?'var(--purple)':'var(--text)'}}>{c.id}</span>
                  </button>;
                })}
              </div>
            </div>
            <CheckButton disabled={s3Done} onClick={checkS3}/>
            {s3FB&&<FeedbackBox type={s3FB.type} message={s3FB.msg}/>}
          </QGroup>
        </SectionCard>

        {prog.allDone&&<Summary score={prog.completedCount} total={3} message="You know your polygons and can spot congruent shapes!"/>}
      </div>
    </div>
  );
}
