// ============================================================
//  lessons/unit1/L4_Rounding.jsx
//  Unit 1 · Lesson 4: Rounding Decimals
//  3 sections (textbook exercises 2, 3, 4):
//    s1 Round to nearest whole unit     — MCQ a/c/e, Drag b/d/f
//    s2 Round to nearest tenth          — MCQ a/c/e, Drag b/d/f
//    s3 Round to nearest whole number   — MCQ a/c/e, Drag b/d/f
// ============================================================
import { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import {
  ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
  FeedbackBox, LblCircle, NumChip, CheckButton, Summary, GuidedHint,
} from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

function sh(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ── s1: Round to nearest whole unit ──
const S1_MCQ = [
  { lbl:'a', n:27.6,  ans:'28', opts:['28','27','29','30'], guided:true, hint:'27.6 — look at the tenths digit. Is it 5 or more?' },
  { lbl:'c', n:83.49, ans:'83', opts:['83','84','82','85'] },
  { lbl:'e', n:11.08, ans:'11', opts:['11','12','10','9'] },
];
const S1_DRAG = [
  { lbl:'b', n:5.921, ans:'6',  guided:true, hint:'5.921 — look at the tenths digit. Is it 5 or more?' },
  { lbl:'d', n:20.5,  ans:'21' },
  { lbl:'f', n:14.56, ans:'15' },
];

// ── s2: Round to nearest tenth ──
const S2_MCQ = [
  { lbl:'a', n:7.07,   ans:'7.1',  opts:['7.1','7.0','7.2','6.1'], guided:true, hint:'7.07 — to round to one decimal place, look at the hundredths digit (2nd after the point).' },
  { lbl:'c', n:15.51,  ans:'15.5', opts:['15.5','15.6','15.4','16.5'] },
  { lbl:'e', n:42.339, ans:'42.3', opts:['42.3','42.4','42.2','43.3'] },
];
const S2_DRAG = [
  { lbl:'b', n:5.3641, ans:'5.4',  guided:true, hint:'5.3641 — look at the hundredths digit (2nd after the point). Is it 5 or more?' },
  { lbl:'d', n:9.828,  ans:'9.8' },
  { lbl:'f', n:15.54,  ans:'15.5' },
];

// ── s3: Round to nearest whole number ──
const S3_MCQ = [
  { lbl:'a', n:14.063, ans:'14', opts:['14','15','13','12'], guided:true, hint:'14.063 — look at the tenths digit (1st after the point). Is it 5 or more?' },
  { lbl:'c', n:23.009, ans:'23', opts:['23','24','22','21'] },
  { lbl:'e', n:27.905, ans:'28', opts:['28','27','29','26'] },
];
const S3_DRAG = [
  { lbl:'b', n:9.602,  ans:'10', guided:true, hint:'9.602 — look at the tenths digit. Is it 5 or more? Watch out — rounding up can change multiple digits!' },
  { lbl:'d', n:18.518, ans:'19' },
  { lbl:'f', n:54.485, ans:'54' },
];

const DRAG_INIT = { b:[], d:[], f:[] };

function fbMsg(ok, total, att) {
  if (ok === total) return { type:'correct', text:`🎉 ${ok}/${total} correct!` };
  if (att >= 3)    return { type:'hint',    text:'Keep trying! Ask your teacher if you need help.' };
  if (att === 2)   return { type:'hint',    text:`💡 ${ok}/${total} correct. If the next digit is 5 or more → round up; less than 5 → keep the same.` };
  return            { type:'wrong',   text:"✗ Check rounding: look at the digit right after the place you're rounding to." };
}

function allGroupsCorrect(mcqFB, dragFB) {
  return [0,1].every(i => mcqFB[i]?.type === 'correct') && [0,1].every(i => dragFB[i]?.type === 'correct');
}

export default function L4_Rounding() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── s1 state ──
  const s1Sel    = state.s1Sel    || {}, setS1Sel    = setField('s1Sel',    {});
  const s1St     = state.s1St     || {}, setS1St     = setField('s1St',     {});
  const s1FB     = state.s1FB     || {}, setS1FB     = setField('s1FB',     {});
  const s1Drag   = state.s1Drag   || DRAG_INIT, setS1Drag   = setField('s1Drag',   DRAG_INIT);
  const s1DragSt = state.s1DragSt || {}, setS1DragSt = setField('s1DragSt', {});
  const s1DragFB = state.s1DragFB || {}, setS1DragFB = setField('s1DragFB', {});

  // ── s2 state ──
  const s2Sel    = state.s2Sel    || {}, setS2Sel    = setField('s2Sel',    {});
  const s2St     = state.s2St     || {}, setS2St     = setField('s2St',     {});
  const s2FB     = state.s2FB     || {}, setS2FB     = setField('s2FB',     {});
  const s2Drag   = state.s2Drag   || DRAG_INIT, setS2Drag   = setField('s2Drag',   DRAG_INIT);
  const s2DragSt = state.s2DragSt || {}, setS2DragSt = setField('s2DragSt', {});
  const s2DragFB = state.s2DragFB || {}, setS2DragFB = setField('s2DragFB', {});

  // ── s3 state ──
  const s3Sel    = state.s3Sel    || {}, setS3Sel    = setField('s3Sel',    {});
  const s3St     = state.s3St     || {}, setS3St     = setField('s3St',     {});
  const s3FB     = state.s3FB     || {}, setS3FB     = setField('s3FB',     {});
  const s3Drag   = state.s3Drag   || DRAG_INIT, setS3Drag   = setField('s3Drag',   DRAG_INIT);
  const s3DragSt = state.s3DragSt || {}, setS3DragSt = setField('s3DragSt', {});
  const s3DragFB = state.s3DragFB || {}, setS3DragFB = setField('s3DragFB', {});

  // ── Shuffle MCQ options once on mount ──
  const [shuf] = useState(() => ({
    s1: Object.fromEntries(S1_MCQ.map(q => [q.lbl, sh(q.opts)])),
    s2: Object.fromEntries(S2_MCQ.map(q => [q.lbl, sh(q.opts)])),
    s3: Object.fromEntries(S3_MCQ.map(q => [q.lbl, sh(q.opts)])),
  }));

  // ═══ s1 check functions ═══
  // ok computed BEFORE setState to avoid React async-updater bug (CLAUDE.md)
  const checkS1MCQ = (ga, gi) => {
    increment(`s1m${gi}`); const att = getAtt(`s1m${gi}`) + 1;
    let ok = 0;
    ga.forEach(q => { if (s1Sel[q.lbl] === q.ans) ok++; });
    const ns = { ...s1St };
    ga.forEach(q => {
      const s = s1Sel[q.lbl];
      if (s === q.ans) ns[`${q.lbl}-${s}`] = 'correct';
      else if (s) ns[`${q.lbl}-${s}`] = 'wrong';
    });
    setS1St(ns);
    const f = fbMsg(ok, ga.length, att);
    const newFB = { ...s1FB, [gi]: f };
    setS1FB(newFB);
    if (ok === ga.length && allGroupsCorrect(newFB, s1DragFB) && !prog.done['s1'])
      prog.markDone('s1', { score: 100 });
  };
  const checkS1Drag = (ga, gi) => {
    increment(`s1d${gi}`); const att = getAtt(`s1d${gi}`) + 1;
    let ok = 0;
    ga.forEach(q => { if ((s1Drag[q.lbl]||[]).join('') === q.ans) ok++; });
    const ns = { ...s1DragSt };
    ga.forEach(q => {
      if ((s1Drag[q.lbl]||[]).join('') === q.ans) { ns[q.lbl] = 'correct'; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setS1DragSt(p => { const x={...p}; if (x[q.lbl]==='wrong') delete x[q.lbl]; return x; }), 1200);
      }
    });
    setS1DragSt(ns);
    const f = fbMsg(ok, ga.length, att);
    const newFB = { ...s1DragFB, [gi]: f };
    setS1DragFB(newFB);
    if (ok === ga.length && allGroupsCorrect(s1FB, newFB) && !prog.done['s1'])
      prog.markDone('s1', { score: 100 });
  };

  // ═══ s2 check functions ═══
  const checkS2MCQ = (ga, gi) => {
    increment(`s2m${gi}`); const att = getAtt(`s2m${gi}`) + 1;
    let ok = 0;
    ga.forEach(q => { if (s2Sel[q.lbl] === q.ans) ok++; });
    const ns = { ...s2St };
    ga.forEach(q => {
      const s = s2Sel[q.lbl];
      if (s === q.ans) ns[`${q.lbl}-${s}`] = 'correct';
      else if (s) ns[`${q.lbl}-${s}`] = 'wrong';
    });
    setS2St(ns);
    const f = fbMsg(ok, ga.length, att);
    const newFB = { ...s2FB, [gi]: f };
    setS2FB(newFB);
    if (ok === ga.length && allGroupsCorrect(newFB, s2DragFB) && !prog.done['s2'])
      prog.markDone('s2', { score: 100 });
  };
  const checkS2Drag = (ga, gi) => {
    increment(`s2d${gi}`); const att = getAtt(`s2d${gi}`) + 1;
    let ok = 0;
    ga.forEach(q => { if ((s2Drag[q.lbl]||[]).join('') === q.ans) ok++; });
    const ns = { ...s2DragSt };
    ga.forEach(q => {
      if ((s2Drag[q.lbl]||[]).join('') === q.ans) { ns[q.lbl] = 'correct'; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setS2DragSt(p => { const x={...p}; if (x[q.lbl]==='wrong') delete x[q.lbl]; return x; }), 1200);
      }
    });
    setS2DragSt(ns);
    const f = fbMsg(ok, ga.length, att);
    const newFB = { ...s2DragFB, [gi]: f };
    setS2DragFB(newFB);
    if (ok === ga.length && allGroupsCorrect(s2FB, newFB) && !prog.done['s2'])
      prog.markDone('s2', { score: 100 });
  };

  // ═══ s3 check functions ═══
  const checkS3MCQ = (ga, gi) => {
    increment(`s3m${gi}`); const att = getAtt(`s3m${gi}`) + 1;
    let ok = 0;
    ga.forEach(q => { if (s3Sel[q.lbl] === q.ans) ok++; });
    const ns = { ...s3St };
    ga.forEach(q => {
      const s = s3Sel[q.lbl];
      if (s === q.ans) ns[`${q.lbl}-${s}`] = 'correct';
      else if (s) ns[`${q.lbl}-${s}`] = 'wrong';
    });
    setS3St(ns);
    const f = fbMsg(ok, ga.length, att);
    const newFB = { ...s3FB, [gi]: f };
    setS3FB(newFB);
    if (ok === ga.length && allGroupsCorrect(newFB, s3DragFB) && !prog.done['s3'])
      prog.markDone('s3', { score: 100 });
  };
  const checkS3Drag = (ga, gi) => {
    increment(`s3d${gi}`); const att = getAtt(`s3d${gi}`) + 1;
    let ok = 0;
    ga.forEach(q => { if ((s3Drag[q.lbl]||[]).join('') === q.ans) ok++; });
    const ns = { ...s3DragSt };
    ga.forEach(q => {
      if ((s3Drag[q.lbl]||[]).join('') === q.ans) { ns[q.lbl] = 'correct'; }
      else {
        ns[q.lbl] = 'wrong';
        setTimeout(() => setS3DragSt(p => { const x={...p}; if (x[q.lbl]==='wrong') delete x[q.lbl]; return x; }), 1200);
      }
    });
    setS3DragSt(ns);
    const f = fbMsg(ok, ga.length, att);
    const newFB = { ...s3DragFB, [gi]: f };
    setS3DragFB(newFB);
    if (ok === ga.length && allGroupsCorrect(s3FB, newFB) && !prog.done['s3'])
      prog.markDone('s3', { score: 100 });
  };

  // ── Section renderer (called during render, not a React component) ──
  const renderSection = ({
    badge, sid, title, subtitle,
    mcqQs, dragQs, shufKey,
    sel, setSel, mcqSt, mcqFB,
    drag, setDrag, dragSt, setDragSt, dragFB,
    checkMCQ, checkDrag,
  }) => {
    const mcqG0  = [mcqQs[0], mcqQs[1]];   // a, c
    const mcqG1  = [mcqQs[2]];              // e
    const dragG0 = [dragQs[0], dragQs[1]];  // b, d
    const dragG1 = [dragQs[2]];             // f

    const makeDrop = (lbl) => (raw) => {
      if (dragSt[lbl] === 'correct') return;
      if (raw === 'del')
        setDrag(p => ({ ...p, [lbl]: (p[lbl]||[]).slice(0,-1) }));
      else if (raw.startsWith('digit:'))
        setDrag(p => ({ ...p, [lbl]: [...(p[lbl]||[]), raw.split(':')[1]] }));
    };
    const makeRemove = (lbl) => (idx) => {
      if (dragSt[lbl] === 'correct') return;
      setDrag(p => { const a=[...(p[lbl]||[])]; a.splice(idx,1); return {...p,[lbl]:a}; });
    };

    const renderMCQItem = (q, last) => {
      const opts = (shuf[shufKey][q.lbl]||q.opts).map(o => ({
        id: o, label: o,
        state: mcqSt[`${q.lbl}-${o}`] || (sel[q.lbl] === o ? 'selected' : 'default'),
      }));
      return (
        <QItem key={q.lbl} last={last}>
          {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
          <QItemLabel>
            <LblCircle letter={q.lbl}/>
            <NumChip value={q.n}/>
            <span style={{ fontSize:22, fontWeight:700 }}>→</span>
          </QItemLabel>
          <MCQOptions options={opts} onSelect={id => setSel(p => ({ ...p, [q.lbl]: id }))}/>
        </QItem>
      );
    };

    const renderDragItem = (q, last) => (
      <QItem key={q.lbl} last={last}>
        {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
        <QItemLabel>
          <LblCircle letter={q.lbl}/>
          <NumChip value={q.n}/>
          <span style={{ fontSize:22, fontWeight:700 }}>→</span>
          <DigitDropZone
            digits={drag[q.lbl]||[]}
            zoneState={dragSt[q.lbl]||'default'}
            onDrop={makeDrop(q.lbl)}
            onRemove={makeRemove(q.lbl)}
          />
        </QItemLabel>
      </QItem>
    );

    return (
      <SectionCard key={sid} badge={badge} title={title} subtitle={subtitle}
        tagType="drag" tagLabel="MCQ + Drag" score={prog.done[sid]}>

        {/* MCQ: a & c */}
        <QGroup title="Questions A & C">
          {mcqG0.map((q, qi) => renderMCQItem(q, qi === mcqG0.length - 1))}
          <CheckButton
            label="✓ Check A & C"
            onClick={() => checkMCQ(mcqG0, 0)}
            disabled={mcqFB[0]?.type === 'correct'}
          />
          {mcqFB[0] && <FeedbackBox type={mcqFB[0].type} message={mcqFB[0].text}/>}
        </QGroup>

        {/* Drag: b & d — one palette for two questions (2-per-palette rule) */}
        <QGroup title="Questions B & D">
          <DigitPalette paletteId={`${sid}p0`}/>
          {dragG0.map((q, qi) => renderDragItem(q, qi === dragG0.length - 1))}
          <CheckButton
            label="✓ Check B & D"
            onClick={() => checkDrag(dragG0, 0)}
            disabled={dragFB[0]?.type === 'correct'}
          />
          {dragFB[0] && <FeedbackBox type={dragFB[0].type} message={dragFB[0].text}/>}
        </QGroup>

        {/* MCQ: e */}
        <QGroup title="Question E">
          {mcqG1.map(q => renderMCQItem(q, true))}
          <CheckButton
            label="✓ Check E"
            onClick={() => checkMCQ(mcqG1, 1)}
            disabled={mcqFB[1]?.type === 'correct'}
          />
          {mcqFB[1] && <FeedbackBox type={mcqFB[1].type} message={mcqFB[1].text}/>}
        </QGroup>

        {/* Drag: f — own palette */}
        <QGroup title="Question F">
          <DigitPalette paletteId={`${sid}p1`}/>
          {dragG1.map(q => renderDragItem(q, true))}
          <CheckButton
            label="✓ Check F"
            onClick={() => checkDrag(dragG1, 1)}
            disabled={dragFB[1]?.type === 'correct'}
          />
          {dragFB[1] && <FeedbackBox type={dragFB[1].type} message={dragFB[1].text}/>}
        </QGroup>
      </SectionCard>
    );
  };

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 1 · Lesson 4" completed={prog.completedCount} total={3}/>
      <div className="page">
        <ObjectiveCard text="Round decimal numbers to the nearest whole number and to one decimal place"/>
        <ExplainPanel title="Key Concept: Rounding Decimals">
          <RuleBox>
            Look at the digit <strong>after</strong> the place you are rounding to:<br/>
            <strong>5 or more</strong> → round UP &nbsp;&nbsp; <strong>4 or less</strong> → round DOWN (keep the same)<br/>
            e.g. 27.6 → nearest whole: tenths digit is 6 ≥ 5, so round up → <strong>28</strong><br/>
            e.g. 15.51 → nearest tenth: hundredths digit is 1 &lt; 5, so keep → <strong>15.5</strong>
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={3}/>

        {renderSection({
          badge:1, sid:'s1', title:'Round each amount to the nearest whole unit',
          subtitle:'★ Guided: a & b',
          mcqQs:S1_MCQ, dragQs:S1_DRAG, shufKey:'s1',
          sel:s1Sel, setSel:setS1Sel, mcqSt:s1St, mcqFB:s1FB,
          drag:s1Drag, setDrag:setS1Drag, dragSt:s1DragSt, setDragSt:setS1DragSt, dragFB:s1DragFB,
          checkMCQ:checkS1MCQ, checkDrag:checkS1Drag,
        })}

        {renderSection({
          badge:2, sid:'s2', title:'Round each amount to the nearest tenth of a unit',
          subtitle:'★ Guided: a & b',
          mcqQs:S2_MCQ, dragQs:S2_DRAG, shufKey:'s2',
          sel:s2Sel, setSel:setS2Sel, mcqSt:s2St, mcqFB:s2FB,
          drag:s2Drag, setDrag:setS2Drag, dragSt:s2DragSt, setDragSt:setS2DragSt, dragFB:s2DragFB,
          checkMCQ:checkS2MCQ, checkDrag:checkS2Drag,
        })}

        {renderSection({
          badge:3, sid:'s3', title:'Round each of these to the nearest whole number',
          subtitle:'★ Guided: a & b',
          mcqQs:S3_MCQ, dragQs:S3_DRAG, shufKey:'s3',
          sel:s3Sel, setSel:setS3Sel, mcqSt:s3St, mcqFB:s3FB,
          drag:s3Drag, setDrag:setS3Drag, dragSt:s3DragSt, setDragSt:setS3DragSt, dragFB:s3DragFB,
          checkMCQ:checkS3MCQ, checkDrag:checkS3Drag,
        })}

        {prog.allDone && <Summary message="Excellent! You can round decimals accurately!"/>}
      </div>
    </div>
  );
}
