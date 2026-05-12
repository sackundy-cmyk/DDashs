// ============================================================
//  lessons/unit7/L5_AddSubDecimals.jsx
//  Unit 7 · Lesson 5: Adding and Subtracting Decimals
//  s1: Q1 Additions a–d  (approx + exact, digit drag-drop)
//  s2: Q1 Subtractions e–h (approx + exact, digit drag-drop)
//  s3: Q2 Word problems a–f (approx + exact, digit drag-drop)
// ============================================================

import React from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem } from '../../components/layout/QGroupItem.jsx';
import { DigitPalette, DigitDropZone } from '../../components/interactions/DigitComponents.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';

// ── Question data ──────────────────────────────────────────────
const Q1_ADD = [
  { lbl:'a', top:'5.658',   op:'+', bot:'2.752',   approx:'9',   exact:'8.41'   },
  { lbl:'b', top:'13.27',   op:'+', bot:'51.82',   approx:'65',  exact:'65.09'  },
  { lbl:'c', top:'5.903',   op:'+', bot:'2.319',   approx:'8',   exact:'8.222'  },
  { lbl:'d', top:'412.79',  op:'+', bot:'178.16',  approx:'591', exact:'590.95' },
];

const Q1_SUB = [
  { lbl:'e', top:'61.58',   op:'−', bot:'39.52',   approx:'22',  exact:'22.06'  },
  { lbl:'f', top:'496.91',  op:'−', bot:'208.96',  approx:'288', exact:'287.95' },
  { lbl:'g', top:'9.417',   op:'−', bot:'7.298',   approx:'2',   exact:'2.119'  },
  { lbl:'h', top:'30.42',   op:'−', bot:'19.78',   approx:'10',  exact:'10.64'  },
];

const Q2 = [
  { lbl:'a', text:'Add 29.08 to 38.44.',                                       approx:'67',  exact:'67.52'  },
  { lbl:'b', text:'What is the sum of 235.88 and 129.26?',                     approx:'365', exact:'365.14' },
  { lbl:'c', text:'Total 1.717 and 4.355.',                                    approx:'6',   exact:'6.072'  },
  { lbl:'d', text:'What is 8.794 subtract 5.097?',                             approx:'4',   exact:'3.697'  },
  { lbl:'e', text:'What is the difference between 700.63 and 291.44?',         approx:'410', exact:'409.19' },
  { lbl:'f', text:'What is 26.35 less than 56.183?',                           approx:'30',  exact:'29.833' },
];

// ── Column-style calculation display ──────────────────────────
function CalcStack({ top, op, bot }) {
  const width = Math.max(top.length, bot.length + 2) * 18 + 24;
  return (
    <div style={{
      display: 'inline-block', textAlign: 'right',
      background: '#EFF6FF', border: '2px solid #BFDBFE',
      borderRadius: 10, padding: '12px 20px',
      minWidth: width,
    }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#1E3A8A', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
        {top}
      </div>
      <div style={{
        fontSize: 26, fontWeight: 900, color: '#1E3A8A', fontFamily: 'monospace', letterSpacing: '0.08em',
        borderTop: '3px solid #1E3A8A', paddingTop: 6, marginTop: 4,
      }}>
        {op}&nbsp;{bot}
      </div>
    </div>
  );
}

// ── Answer row: approx + exact side by side ───────────────────
function AnswerRow({ palId, approxDigits, exactDigits, approxState, exactState, onDropApprox, onDropExact, onRemoveApprox, onRemoveExact }) {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 14 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>
          ≈ Approximate
        </div>
        <DigitDropZone
          paletteId={palId}
          digits={approxDigits}
          zoneState={approxState}
          onDrop={onDropApprox}
          onRemove={onRemoveApprox}
        />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5 }}>
          = Exact answer
        </div>
        <DigitDropZone
          paletteId={palId}
          digits={exactDigits}
          zoneState={exactState}
          onDrop={onDropExact}
          onRemove={onRemoveExact}
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function L5_AddSubDecimals() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(3, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── s1 state (Q1 additions) ──
  const s1D  = state.s1D  || {}, setS1D  = setField('s1D');
  const s1St = state.s1St || {}, setS1St = setField('s1St');
  const s1FB = state.s1FB || {}, setS1FB = setField('s1FB');

  // ── s2 state (Q1 subtractions) ──
  const s2D  = state.s2D  || {}, setS2D  = setField('s2D');
  const s2St = state.s2St || {}, setS2St = setField('s2St');
  const s2FB = state.s2FB || {}, setS2FB = setField('s2FB');

  // ── s3 state (Q2 word problems) ──
  const s3D  = state.s3D  || {}, setS3D  = setField('s3D');
  const s3St = state.s3St || {}, setS3St = setField('s3St');
  const s3FB = state.s3FB || {}, setS3FB = setField('s3FB');

  // ── Generic drop / remove factory ─────────────────────────────
  function makeDropper(dState, setD, stState, setSt) {
    return (key) => (raw) => {
      if (stState[key] === 'correct') return;
      if (raw === 'del') {
        if (stState[key] === 'wrong') setSt(p => ({ ...p, [key]: 'default' }));
        setD(p => ({ ...p, [key]: (p[key] || []).slice(0, -1) }));
      } else if (raw.startsWith('digit:')) {
        const d = raw.split(':')[1];
        if (stState[key] === 'wrong') setSt(p => ({ ...p, [key]: 'default' }));
        setD(p => ({ ...p, [key]: [...(p[key] || []), d] }));
      }
    };
  }

  function makeRemover(dState, setD, stState, setSt) {
    return (key) => (idx) => {
      if (stState[key] === 'correct') return;
      if (stState[key] === 'wrong') setSt(p => ({ ...p, [key]: 'default' }));
      setD(p => {
        const a = [...(p[key] || [])];
        a.splice(idx, 1);
        return { ...p, [key]: a };
      });
    };
  }

  // ── Generic check factory ──────────────────────────────────────
  function makeChecker(questions, dState, stState, setSt, fbState, setFB, sectionId) {
    return (q) => {
      const attKey = `${sectionId}_${q.lbl}`;
      increment(attKey);
      const att = getAtt(attKey) + 1;

      const approxKey = `${q.lbl}_approx`;
      const exactKey  = `${q.lbl}_exact`;

      // compute correctness BEFORE setState (avoid async-updater bug)
      const approxVal = (dState[approxKey] || []).join('');
      const exactVal  = (dState[exactKey]  || []).join('');
      const approxOk  = approxVal === q.approx;
      const exactOk   = exactVal  === q.exact;
      const ok = (approxOk ? 1 : 0) + (exactOk ? 1 : 0);

      const ns = { ...stState };
      ns[approxKey] = approxOk ? 'correct' : approxVal ? 'wrong' : stState[approxKey] || 'default';
      ns[exactKey]  = exactOk  ? 'correct' : exactVal  ? 'wrong' : stState[exactKey]  || 'default';
      setSt(ns);

      let hint2 = '';
      if (approxOk) hint2 = 'Approximate ≈ is right — check the exact calculation digit by digit.';
      else if (exactOk) hint2 = 'Exact = is right — re-check your rounding for the approximate.';
      else hint2 = 'Round each number to the nearest whole number for the approximate answer.';

      let fb;
      if (ok === 2) {
        fb = { type: 'correct', text: '🎉 Both answers correct!' };
      } else if (att >= 3) {
        fb = { type: 'hint', text: 'Keep trying! Ask your teacher if you need help.' };
      } else if (att === 2) {
        fb = { type: 'hint', text: `💡 ${ok}/2 correct. ${hint2}` };
      } else {
        fb = { type: 'wrong', text: `✗ ${ok}/2 correct. Find the approximate first by rounding each number to the nearest whole number.` };
      }

      const merged = { ...fbState, [q.lbl]: fb };
      setFB(merged);

      if (ok === 2) {
        const allDone = questions.every(qq => merged[qq.lbl]?.type === 'correct');
        if (allDone) prog.markDone(sectionId, { correct: questions.length * 2, total: questions.length * 2, attempts: att });
      }
    };
  }

  // ── Instantiate handlers for each section ─────────────────────
  const s1Drop   = makeDropper(s1D, setS1D, s1St, setS1St);
  const s1Remove = makeRemover(s1D, setS1D, s1St, setS1St);
  const checkS1  = makeChecker(Q1_ADD, s1D, s1St, setS1St, s1FB, setS1FB, 's1');

  const s2Drop   = makeDropper(s2D, setS2D, s2St, setS2St);
  const s2Remove = makeRemover(s2D, setS2D, s2St, setS2St);
  const checkS2  = makeChecker(Q1_SUB, s2D, s2St, setS2St, s2FB, setS2FB, 's2');

  const s3Drop   = makeDropper(s3D, setS3D, s3St, setS3St);
  const s3Remove = makeRemover(s3D, setS3D, s3St, setS3St);
  const checkS3  = makeChecker(Q2,    s3D, s3St, setS3St, s3FB, setS3FB, 's3');

  // ── Render a Q1-style question (column arithmetic + two drop zones) ──
  function renderCalcQuestion(q, drop, remove, dState, stState, fbState, check, sectionId) {
    const approxKey = `${q.lbl}_approx`;
    const exactKey  = `${q.lbl}_exact`;
    const palId     = `${sectionId}_${q.lbl}`;
    const isDone    = !!prog.done[sectionId];
    return (
      <QGroup key={q.lbl} title={`Question ${q.lbl.toUpperCase()}`}>
        <DigitPalette paletteId={palId} decimal={true} minus={false}/>
        <QItem last={true}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
            <LblCircle letter={q.lbl}/>
            <div>
              <CalcStack top={q.top} op={q.op} bot={q.bot}/>
              <AnswerRow
                palId={palId}
                approxDigits={dState[approxKey] || []}
                exactDigits={dState[exactKey]   || []}
                approxState={stState[approxKey] || 'default'}
                exactState={stState[exactKey]   || 'default'}
                onDropApprox={drop(approxKey)}
                onDropExact={drop(exactKey)}
                onRemoveApprox={remove(approxKey)}
                onRemoveExact={remove(exactKey)}
              />
            </div>
          </div>
        </QItem>
        <CheckButton
          label={`✓ Check ${q.lbl.toUpperCase()}`}
          onClick={() => check(q)}
          disabled={isDone}
        />
        {fbState[q.lbl] && <FeedbackBox type={fbState[q.lbl].type} message={fbState[q.lbl].text}/>}
      </QGroup>
    );
  }

  // ── Render a Q2-style question (text + two drop zones) ────────
  function renderWordQuestion(q, drop, remove, dState, stState, fbState, check, sectionId) {
    const approxKey = `${q.lbl}_approx`;
    const exactKey  = `${q.lbl}_exact`;
    const palId     = `${sectionId}_${q.lbl}`;
    const isDone    = !!prog.done[sectionId];
    return (
      <QGroup key={q.lbl} title={`Question ${q.lbl.toUpperCase()}`}>
        <DigitPalette paletteId={palId} decimal={true} minus={false}/>
        <QItem last={true}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
            <LblCircle letter={q.lbl}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1E3A8A', marginBottom: 4, lineHeight: 1.4 }}>
                {q.text}
              </div>
              <AnswerRow
                palId={palId}
                approxDigits={dState[approxKey] || []}
                exactDigits={dState[exactKey]   || []}
                approxState={stState[approxKey] || 'default'}
                exactState={stState[exactKey]   || 'default'}
                onDropApprox={drop(approxKey)}
                onDropExact={drop(exactKey)}
                onRemoveApprox={remove(approxKey)}
                onRemoveExact={remove(exactKey)}
              />
            </div>
          </div>
        </QItem>
        <CheckButton
          label={`✓ Check ${q.lbl.toUpperCase()}`}
          onClick={() => check(q)}
          disabled={isDone}
        />
        {fbState[q.lbl] && <FeedbackBox type={fbState[q.lbl].type} message={fbState[q.lbl].text}/>}
      </QGroup>
    );
  }

  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: 'var(--font)' }}>
      <Header lessonChip="Unit 1 · Lesson 5 · Adding and Subtracting Decimals" completed={prog.completedCount} total={3}/>
      <div className="page">
        <ObjectiveCard text="Write approximate answers by rounding to the nearest whole number, then calculate the exact answer for decimal addition and subtraction"/>
        <ExplainPanel title="Key Concepts: Approximate and Exact Answers">
          <RuleBox>
            <strong>Approximate answer (≈):</strong> Round each number to the nearest whole number, then add or subtract. This gives a quick estimate.<br/>
            <strong>Exact answer (=):</strong> Line up the decimal points, then add or subtract column by column.<br/>
            Example: 5.658 + 2.752 → approximate: 6 + 3 = <strong>9</strong> · exact: <strong>8.41</strong>
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={3}/>

        {/* ── s1: Q1 Additions ── */}
        <SectionCard badge={1}
          title="Write approximate answers as whole numbers, then calculate the exact answer."
          tagType="drag" tagLabel="Drag Digits"
          subtitle="For each addition: drag digits to fill the ≈ Approximate box (rounded whole numbers) and the = Exact box."
          score={prog.done['s1']}>
          {Q1_ADD.map(q => renderCalcQuestion(q, s1Drop, s1Remove, s1D, s1St, s1FB, checkS1, 's1'))}
        </SectionCard>

        {/* ── s2: Q1 Subtractions ── */}
        <SectionCard badge={2}
          title="Write approximate answers as whole numbers, then calculate the exact answer."
          tagType="drag" tagLabel="Drag Digits"
          subtitle="For each subtraction: drag digits to fill the ≈ Approximate box and the = Exact box."
          score={prog.done['s2']}>
          {Q1_SUB.map(q => renderCalcQuestion(q, s2Drop, s2Remove, s2D, s2St, s2FB, checkS2, 's2'))}
        </SectionCard>

        {/* ── s3: Q2 Word problems ── */}
        <SectionCard badge={3}
          title="Read and answer these. Write an approximate answer and an exact answer."
          tagType="drag" tagLabel="Drag Digits"
          subtitle="For each problem: drag digits to fill the ≈ Approximate box and the = Exact box."
          score={prog.done['s3']}>
          {Q2.map(q => renderWordQuestion(q, s3Drop, s3Remove, s3D, s3St, s3FB, checkS3, 's3'))}
        </SectionCard>

        {prog.allDone && (
          <Summary message="Excellent! You can estimate with approximate answers and calculate exact decimal additions and subtractions!"/>
        )}
      </div>
    </div>
  );
}
