// ============================================================
//  lessons/unit6/L3_MeasuringAngles.jsx
//  Unit 6 · Lesson 3: Measuring Angles
//  S1: Estimate then measure 8 angles with virtual protractor
//  S2: Draw specified angles by dragging an arm
// ============================================================

import { useState, useRef, useCallback } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem } from '../../components/layout/QGroupItem.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── 8 angles to measure (estimate + measure) ─────────────────
const MEASURE_QS = [
  { lbl:'a', deg:55  },
  { lbl:'b', deg:130 },
  { lbl:'c', deg:75  },
  { lbl:'d', deg:20  },
  { lbl:'e', deg:90  },
  { lbl:'f', deg:160 },
  { lbl:'g', deg:45  },
  { lbl:'h', deg:110 },
];

// ── 5 angles to draw ─────────────────────────────────────────
const DRAW_QS = [
  { lbl:'a', deg:55  },
  { lbl:'b', deg:67  },
  { lbl:'c', deg:26  },
  { lbl:'d', deg:134 },
  { lbl:'e', deg:109 },
];

const TOLERANCE = 4; // degrees

// ── Inline angle diagram (static, no protractor) ─────────────
function AngleDiagram({ deg, size=110 }) {
  const cx=size*0.35, cy=size*0.72, r=size*0.55;
  const toRad = d => d*Math.PI/180;
  const x2=cx+r;
  const x3=cx+r*Math.cos(toRad(deg));
  const y3=cy-r*Math.sin(toRad(deg));
  const arcR=size*0.14;
  const ax=cx+arcR*Math.cos(toRad(deg/2));
  const ay=cy-arcR*Math.sin(toRad(deg/2));
  const large=deg>180?1:0;
  const isRight=Math.abs(deg-90)<1;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <line x1={cx} y1={cy} x2={x2} y2={cy} stroke="#C2410C" strokeWidth={2} strokeLinecap="round"/>
      <line x1={cx} y1={cy} x2={x3} y2={y3} stroke="#C2410C" strokeWidth={2} strokeLinecap="round"/>
      {isRight
        ? <rect x={cx} y={cy-14} width={14} height={14} fill="none" stroke="#C2410C" strokeWidth={1.5}/>
        : <path d={`M${cx+arcR},${cy} A${arcR},${arcR} 0 ${large} 0 ${ax},${ay}`} fill="none" stroke="#C2410C" strokeWidth={1.5}/>
      }
    </svg>
  );
}

// ── Inline protractor widget (per question) ──────────────────
const R_PROTO = 100;
const CX_P = 120, CY_P = 140, W_P = 240, H_P = 160;

function ticks() {
  const marks=[];
  for(let d=0;d<=180;d+=10){
    const inner=d%30===0?R_PROTO-14:R_PROTO-7;
    const r1=d*Math.PI/180;
    marks.push({
      x1:CX_P+inner*Math.cos(r1), y1:CY_P-inner*Math.sin(r1),
      x2:CX_P+R_PROTO*Math.cos(r1), y2:CY_P-R_PROTO*Math.sin(r1),
      label:d%30===0?d:null,
      lx:CX_P+(inner-10)*Math.cos(r1), ly:CY_P-(inner-10)*Math.sin(r1),
    });
  }
  return marks;
}
const TICKS = ticks();

function ProtractorWidget({ targetDeg, onConfirm, confirmed, feedback }) {
  const [armDeg, setArmDeg] = useState(90);
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const getAngle = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return armDeg;
    const rect = svg.getBoundingClientRect();
    const sx = W_P / rect.width;
    const sy = H_P / rect.height;
    const dx = (clientX - rect.left)*sx - CX_P;
    const dy = -((clientY - rect.top)*sy - CY_P);
    let deg = Math.atan2(dy, dx) * 180 / Math.PI;
    return Math.max(0, Math.min(180, Math.round(deg)));
  }, [armDeg]);

  const armPt = {
    x: CX_P + R_PROTO * Math.cos(armDeg * Math.PI/180),
    y: CY_P - R_PROTO * Math.sin(armDeg * Math.PI/180),
  };
  const midX = CX_P + (R_PROTO*0.45)*Math.cos(armDeg/2*Math.PI/180);
  const midY = CY_P - (R_PROTO*0.45)*Math.sin(armDeg/2*Math.PI/180);

  return (
    <div style={{ userSelect:'none', touchAction:'none' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W_P} ${H_P}`}
        style={{ width:'100%', maxWidth:280, display:'block', margin:'0 auto', touchAction:'none', cursor:confirmed?'default':'pointer' }}
        onPointerDown={e=>{ if(!confirmed){ dragging.current=true; e.currentTarget.setPointerCapture(e.pointerId); setArmDeg(getAngle(e.clientX,e.clientY)); }}}
        onPointerMove={e=>{ if(dragging.current && !confirmed) setArmDeg(getAngle(e.clientX,e.clientY)); }}
        onPointerUp={()=>{ dragging.current=false; }}
      >
        {/* Protractor body */}
        <path d={`M${CX_P-R_PROTO},${CY_P} A${R_PROTO},${R_PROTO} 0 0 1 ${CX_P+R_PROTO},${CY_P} Z`}
          fill="rgba(219,234,254,0.9)" stroke="#93C5FD" strokeWidth={1.5}/>
        <line x1={CX_P-R_PROTO} y1={CY_P} x2={CX_P+R_PROTO} y2={CY_P} stroke="#1E293B" strokeWidth={1.5}/>
        <circle cx={CX_P} cy={CY_P} r={3} fill="#1E293B"/>
        {TICKS.map((t,i)=>(
          <g key={i}>
            <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#1E293B" strokeWidth={t.label!==null?1.5:1}/>
            {t.label!==null && (
              <text x={t.lx} y={t.ly} textAnchor="middle" dominantBaseline="middle"
                fontSize={t.label%90===0?8:6.5} fontWeight={t.label%90===0?700:400} fill="#1E293B"
                transform={`rotate(${-(t.label-90)},${t.lx},${t.ly})`}>{t.label}</text>
            )}
          </g>
        ))}
        {/* Arm */}
        <line x1={CX_P} y1={CY_P} x2={armPt.x} y2={armPt.y}
          stroke={confirmed?(feedback==='correct'?'#16A34A':'#DC2626'):'#1E6FD9'} strokeWidth={3} strokeLinecap="round"/>
        <circle cx={armPt.x} cy={armPt.y} r={8}
          fill={confirmed?(feedback==='correct'?'#16A34A':'#DC2626'):'#1E6FD9'}/>
        {/* Readout */}
        <rect x={midX-18} y={midY-10} width={36} height={20} rx={5} fill="rgba(30,111,217,0.9)"/>
        <text x={midX} y={midY+5} textAnchor="middle" fill="white" fontSize={10} fontWeight={800}>{armDeg}°</text>
      </svg>
      {!confirmed && (
        <div style={{ textAlign:'center', marginTop:8 }}>
          <button onClick={()=>onConfirm(armDeg)} style={{
            background:'var(--blue)', color:'white', border:'none', borderRadius:9,
            padding:'8px 22px', fontFamily:'var(--font)', fontSize:13, fontWeight:700, cursor:'pointer',
          }}>Confirm {armDeg}°</button>
        </div>
      )}
      {confirmed && (
        <p style={{ textAlign:'center', marginTop:8, fontWeight:700, fontSize:13,
          color: feedback==='correct'?'var(--green)':'var(--red)' }}>
          {feedback==='correct'?`✓ Correct! ${targetDeg}°`:`Angle is ${targetDeg}° — you read ${armDeg}°`}
        </p>
      )}
    </div>
  );
}

// ── Draw-angle widget ─────────────────────────────────────────
function DrawAngleWidget({ targetDeg, onConfirm, confirmed, feedback }) {
  const [armDeg, setArmDeg] = useState(0);
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const SIZE=200, CX=100, CY=150, R=120;
  const getAngle = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return armDeg;
    const rect = svg.getBoundingClientRect();
    const sx = SIZE/rect.width, sy = SIZE/rect.height;
    const dx=(clientX-rect.left)*sx-CX, dy=-((clientY-rect.top)*sy-CY);
    let deg=Math.atan2(dy,dx)*180/Math.PI;
    return Math.max(0,Math.min(180,Math.round(deg)));
  },[armDeg]);

  const armPt={ x:CX+R*Math.cos(armDeg*Math.PI/180), y:CY-R*Math.sin(armDeg*Math.PI/180) };
  const targetPt={ x:CX+R*Math.cos(targetDeg*Math.PI/180), y:CY-R*Math.sin(targetDeg*Math.PI/180) };

  return (
    <div style={{ userSelect:'none', touchAction:'none' }}>
      <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ width:'100%', maxWidth:240, display:'block', margin:'0 auto', touchAction:'none',
          cursor:confirmed?'default':'crosshair', background:'#F8FAFC', borderRadius:12,
          border:'2px solid var(--border)' }}
        onPointerDown={e=>{if(!confirmed){dragging.current=true;e.currentTarget.setPointerCapture(e.pointerId);setArmDeg(getAngle(e.clientX,e.clientY));}}}
        onPointerMove={e=>{if(dragging.current&&!confirmed)setArmDeg(getAngle(e.clientX,e.clientY));}}
        onPointerUp={()=>{dragging.current=false;}}
      >
        {/* Ghost target */}
        <line x1={CX} y1={CY} x2={targetPt.x} y2={targetPt.y} stroke="#CBD5E1" strokeWidth={2} strokeDasharray="6 4"/>
        {/* Baseline */}
        <line x1={CX} y1={CY} x2={CX+R} y2={CY} stroke="#1E293B" strokeWidth={2} strokeLinecap="round"/>
        {/* Ghost protractor arc */}
        <path d={`M${CX+R},${CY} A${R},${R} 0 0 1 ${CX-R},${CY}`} fill="none" stroke="#E2E8F0" strokeWidth={1}/>
        {/* Arm */}
        <line x1={CX} y1={CY} x2={armPt.x} y2={armPt.y}
          stroke={confirmed?(feedback==='correct'?'#16A34A':'#DC2626'):'#1E6FD9'} strokeWidth={3} strokeLinecap="round"/>
        <circle cx={armPt.x} cy={armPt.y} r={8}
          fill={confirmed?(feedback==='correct'?'#16A34A':'#DC2626'):'#1E6FD9'}/>
        {/* Readout */}
        <rect x={CX+14} y={CY-42} width={36} height={20} rx={5} fill="rgba(30,111,217,0.9)"/>
        <text x={CX+32} y={CY-28} textAnchor="middle" fill="white" fontSize={10} fontWeight={800}>{armDeg}°</text>
      </svg>
      {!confirmed && (
        <div style={{ textAlign:'center', marginTop:8 }}>
          <button onClick={()=>onConfirm(armDeg)} style={{
            background:'var(--blue)', color:'white', border:'none', borderRadius:9,
            padding:'8px 22px', fontFamily:'var(--font)', fontSize:13, fontWeight:700, cursor:'pointer',
          }}>Confirm {armDeg}°</button>
        </div>
      )}
      {confirmed && (
        <p style={{ textAlign:'center', marginTop:8, fontWeight:700, fontSize:13,
          color: feedback==='correct'?'var(--green)':'var(--red)' }}>
          {feedback==='correct'?`✓ Correct! ${targetDeg}°`:`Target was ${targetDeg}° — you drew ${armDeg}°`}
        </p>
      )}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────
export default function L3_MeasuringAngles() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // S1: estimate + measurement state per question
  const s1Est  = state.s1Est  || {}, setS1Est  = setField('s1Est');
  const s1Meas = state.s1Meas || {}, setS1Meas = setField('s1Meas');
  const s1FB   = state.s1FB   || {}, setS1FB   = setField('s1FB');
  const [s1Step, setS1Step] = useState('estimate'); // 'estimate' | 'measure' | 'done'

  // S2: draw angle state per question
  const s2Meas = state.s2Meas || {}, setS2Meas = setField('s2Meas');
  const s2FB   = state.s2FB   || {}, setS2FB   = setField('s2FB');

  const s1Done = prog.isDone('s1');
  const s2Done = prog.isDone('s2');

  // Estimates: all 8 filled?
  const allEstimated = MEASURE_QS.every(q => s1Est[q.lbl] !== undefined && s1Est[q.lbl] !== '');

  function submitEstimates() {
    setS1Step('measure');
  }

  function confirmMeasure(lbl, deg) {
    const q = MEASURE_QS.find(q=>q.lbl===lbl);
    const ok = Math.abs(deg - q.deg) <= TOLERANCE;
    setS1Meas(p=>({...p,[lbl]:deg}));
    setS1FB(p=>({...p,[lbl]:ok?'correct':'wrong'}));
    // Check if all measured
    const allDone = MEASURE_QS.every(q2 =>
      q2.lbl===lbl ? true : s1FB[q2.lbl] !== undefined
    );
    if (allDone && !s1Done) {
      const correct = MEASURE_QS.filter(q2=>q2.lbl===lbl?ok:(s1FB[q2.lbl]==='correct')).length;
      increment('s1');
      prog.markDone('s1', { correct, total: MEASURE_QS.length, attempts: 1 });
      setS1Step('done');
    }
  }

  function confirmDraw(lbl, deg) {
    const q = DRAW_QS.find(q=>q.lbl===lbl);
    const ok = Math.abs(deg - q.deg) <= TOLERANCE;
    setS2Meas(p=>({...p,[lbl]:deg}));
    setS2FB(p=>({...p,[lbl]:ok?'correct':'wrong'}));
    const allDone = DRAW_QS.every(q2 =>
      q2.lbl===lbl ? true : s2FB[q2.lbl] !== undefined
    );
    if (allDone && !s2Done) {
      const correct = DRAW_QS.filter(q2=>q2.lbl===lbl?ok:(s2FB[q2.lbl]==='correct')).length;
      increment('s2');
      prog.markDone('s2', { correct, total: DRAW_QS.length, attempts: 1 });
    }
  }

  return (
    <div style={{ fontFamily:'var(--font)', paddingBottom:40 }}>
      <Header lessonChip="Unit 6 · Lesson 3" completed={prog.completedCount} total={2} />
      <div style={{ maxWidth:860, margin:'0 auto', padding:'0 16px' }}>
        <ObjectiveCard text="Estimate angles, then measure them with a virtual protractor. Draw angles accurately." />
        <ExplainPanel title="Using a Protractor">
          <RuleBox>
            1. Place the centre of the protractor on the vertex of the angle.<br/>
            2. Align the baseline (0°–180° line) with one ray.<br/>
            3. Read where the other ray crosses the scale.<br/>
            4. Drag the arm to align, then confirm your reading.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2} />

        {/* ── Section 1 ── */}
        <SectionCard badge={1} title="Estimate then measure" tagType="drag" tagLabel="Protractor">
          {s1Step === 'estimate' && (
            <QGroup title="First, estimate the size of each angle (without measuring)">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14, marginBottom:16 }}>
                {MEASURE_QS.map(q=>(
                  <div key={q.lbl} style={{ background:'white', border:'2px solid var(--border)', borderRadius:12, padding:12, textAlign:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                      <LblCircle letter={q.lbl}/>
                    </div>
                    <AngleDiagram deg={q.deg} size={100}/>
                    <div style={{ marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      <span style={{ fontWeight:700, fontSize:13 }}>~</span>
                      <input type="number" min={0} max={180} value={s1Est[q.lbl]??''}
                        onChange={e=>setS1Est(p=>({...p,[q.lbl]:e.target.value}))}
                        style={{ width:55, padding:'5px 8px', borderRadius:9, border:'2px solid var(--border)',
                          fontFamily:'var(--font)', fontSize:14, fontWeight:800, textAlign:'center' }}
                        placeholder="°"
                      />
                      <span style={{ fontWeight:700, fontSize:13 }}>°</span>
                    </div>
                  </div>
                ))}
              </div>
              <CheckButton onClick={submitEstimates} label="✓ Submit estimates — now measure" disabled={!allEstimated}/>
            </QGroup>
          )}

          {(s1Step === 'measure' || s1Step === 'done') && (
            <QGroup title="Now measure each angle by dragging the protractor arm">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:18, marginBottom:16 }}>
                {MEASURE_QS.map(q=>(
                  <div key={q.lbl} style={{ background:'white', border:'2px solid var(--border)', borderRadius:12, padding:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <LblCircle letter={q.lbl}/>
                      <span style={{ fontSize:12, color:'var(--muted)' }}>Your estimate: {s1Est[q.lbl]}°</span>
                    </div>
                    <AngleDiagram deg={q.deg} size={100}/>
                    <div style={{ marginTop:10 }}>
                      <ProtractorWidget
                        targetDeg={q.deg}
                        onConfirm={deg=>confirmMeasure(q.lbl,deg)}
                        confirmed={s1FB[q.lbl]!==undefined}
                        feedback={s1FB[q.lbl]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </QGroup>
          )}
        </SectionCard>

        {/* ── Section 2 ── */}
        <SectionCard badge={2} title="Draw angles accurately" tagType="drag" tagLabel="Drag arm">
          <QGroup title="Drag the arm to draw each angle. The dashed line shows the target — hit ±4°.">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:18, marginBottom:16 }}>
              {DRAW_QS.map(q=>(
                <div key={q.lbl} style={{ background:'white', border:'2px solid var(--border)', borderRadius:12, padding:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <LblCircle letter={q.lbl}/>
                    <span style={{ fontWeight:800, fontSize:15 }}>Draw {q.deg}°</span>
                  </div>
                  <DrawAngleWidget
                    targetDeg={q.deg}
                    onConfirm={deg=>confirmDraw(q.lbl,deg)}
                    confirmed={s2FB[q.lbl]!==undefined}
                    feedback={s2FB[q.lbl]}
                  />
                </div>
              ))}
            </div>
          </QGroup>
        </SectionCard>

        {prog.allDone && (
          <Summary score={prog.completedCount} total={2} message="You can measure and draw angles with a protractor!"/>
        )}
      </div>
    </div>
  );
}
