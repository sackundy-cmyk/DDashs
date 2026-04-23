// ============================================================
//  lessons/unit4/L2_MoreBrackets.jsx
//  Unit 4 · Lesson 2: More Brackets
//  S1 (Q5): compare two expressions with <, >, = (pairs)
//  S2 (Q6): MCQ — bracket placement for largest answer (pairs)
// ============================================================

import React, { useState } from 'react';
import Header from '../../components/Header.jsx';
import SectionCard from '../../components/SectionCard.jsx';
import { ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
         GuidedHint, FeedbackBox, LblCircle, CheckButton, Summary } from '../../components/SharedComponents.jsx';
import { QGroup, QItem, QItemLabel } from '../../components/layout/QGroupItem.jsx';
import { MCQOptions } from '../../components/interactions/MCQOptions.jsx';
import { useProgress } from '../../hooks/useProgress.js';
import { useAttempts } from '../../hooks/useAttempts.js';
import { useLessonDraft } from '../../hooks/useLessonDraft.js';
import { evalExpr } from '../../utils/mathUtils.js';
import { shuffle } from '../../utils/shuffleUtils.js';

function grp(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// ── Section 1: compare expressions ──
const Q5 = [
  { lbl:'a', left:'(4 × 5) + (12 ÷ 4)', right:'(8 + 6) + (3 × 3)',  guided:true,
    hint:'Work out both sides: 4×5 = 20, 12÷4 = 3. And: 8+6 = 14, 3×3 = 9. Then compare.' },
  { lbl:'b', left:'24 − (8 × 2) + 4',    right:'(4 × 5) − (3 × 4)', guided:true,
    hint:'Work out both sides: 8×2 = 16, 24−16+4 = 12. And: 4×5 = 20, 3×4 = 12, 20−12 = 8.' },
  { lbl:'c', left:'(4 × 6) − (14 ÷ 7) + 8', right:'6 × (18 ÷ 3) − 4', guided:false },
  { lbl:'d', left:'(8 + 14) − (6 × 3)',   right:'(6 + 9) ÷ (28 − 23)', guided:false },
].map(q => {
  const lv = Math.round(evalExpr(q.left)  * 1000) / 1000;
  const rv = Math.round(evalExpr(q.right) * 1000) / 1000;
  return { ...q, ans: lv < rv ? '<' : lv > rv ? '>' : '=' };
});

// ── Section 2: MCQ largest bracket placement ──
const Q6 = [
  { lbl:'a', raw:'8 + 4 − 2 × 3',
    opts:['(8 + 4) − (2 × 3)', '8 + (4 − 2) × 3', '(8 + 4 − 2) × 3', '8 + 4 − (2 × 3)'] },
  { lbl:'b', raw:'9 × 3 − 1 + 5',
    opts:['(9 × 3) − (1 + 5)', '9 × (3 − 1) + 5', '9 × (3 − 1 + 5)', '(9 × 3 − 1) + 5'] },
  { lbl:'c', raw:'6 + 8 × 4 ÷ 2',
    opts:['(6 + 8) × 4 ÷ 2', '6 + (8 × 4) ÷ 2', '6 + 8 × (4 ÷ 2)', '(6 + 8 × 4) ÷ 2'] },
  { lbl:'d', raw:'10 ÷ 2 + 3 × 7',
    opts:['(10 ÷ 2) + (3 × 7)', '10 ÷ (2 + 3) × 7', '(10 ÷ 2 + 3) × 7', '10 ÷ (2 + 3 × 7)'] },
  { lbl:'e', raw:'6 − 2 × 8 + 20',
    opts:['(6 − 2) × 8 + 20', '6 − (2 × 8) + 20', '6 − 2 × (8 + 20)', '(6 − 2 × 8) + 20'] },
  { lbl:'f', raw:'8 + 10 ÷ 2 × 3',
    opts:['(8 + 10) ÷ 2 × 3', '8 + (10 ÷ 2) × 3', '8 + 10 ÷ (2 × 3)', '(8 + 10 ÷ 2) × 3'] },
].map(q => {
  const vals = q.opts.map(o => Math.round(evalExpr(o) * 100) / 100);
  const max  = Math.max(...vals);
  return { ...q, ans: vals.indexOf(max), vals };
});

// ── CompareSelector ──
function CompareSelector({ selected, status, onSelect }) {
  return (
    <div style={{ display:'flex', gap:6 }}>
      {['<', '>', '='].map(sym => {
        const isSel = selected === sym;
        const locked = status === 'correct';
        let bg = '#fff', border = '2px solid var(--border)', color = 'var(--muted)';
        if (isSel) {
          if (status === 'correct') { bg = 'var(--green)'; border = '2px solid var(--green)'; color = '#fff'; }
          else if (status === 'wrong') { bg = 'var(--red-bg)'; border = '2px solid var(--red)'; color = 'var(--red)'; }
          else { bg = 'var(--blue)'; border = '2px solid var(--blue)'; color = '#fff'; }
        }
        return (
          <button key={sym}
            onClick={() => !locked && onSelect(sym)}
            style={{
              padding:'6px 16px', borderRadius:8, border, background:bg, color,
              fontSize:22, fontWeight:900, cursor:locked?'default':'pointer',
              fontFamily:'var(--font)', lineHeight:1.1, transition:'all .15s',
            }}
          >{sym}</button>
        );
      })}
    </div>
  );
}

export default function L2_MoreBrackets() {
  const { state, setField, clearDraft } = useLessonDraft();
  const prog = useProgress(2, { onAllDone: clearDraft });
  const { getAtt, increment } = useAttempts();

  // ── Section 1 state ──
  const q5Sel       = state.q5Sel       || {}, setQ5Sel       = setField('q5Sel');
  const q5St        = state.q5St        || {}, setQ5St        = setField('q5St');
  const q5FB        = state.q5FB        || {}, setQ5FB        = setField('q5FB');
  const q5GroupDone = state.q5GroupDone || {}, setQ5GroupDone = setField('q5GroupDone');

  // ── Section 2 state ──
  const [q6Opts] = useState(() =>
    Object.fromEntries(Q6.map(q => [q.lbl, shuffle(q.opts.map((text, id) => ({ id, text })))]))
  );
  const q6Sel       = state.q6Sel       || {}, setQ6Sel       = setField('q6Sel');
  const q6St        = state.q6St        || {}, setQ6St        = setField('q6St');
  const q6FB        = state.q6FB        || {}, setQ6FB        = setField('q6FB');
  const q6GroupDone = state.q6GroupDone || {}, setQ6GroupDone = setField('q6GroupDone');

  const q5Groups = grp(Q5, 2);
  const q6Groups = grp(Q6, 2);

  // ── Section 1 helpers ──
  const handleQ5Select = (lbl, sym) => {
    setQ5Sel(p => ({ ...p, [lbl]: sym }));
    setQ5St(p => { const ns = {...p}; if (ns[lbl] === 'wrong') delete ns[lbl]; return ns; });
  };

  const checkQ5 = (grpArr, gi) => {
    increment(`q5g${gi}`); const att = getAtt(`q5g${gi}`) + 1;
    let ok = 0; const ns = { ...q5St };
    grpArr.forEach(q => {
      const sel = q5Sel[q.lbl];
      if (sel === q.ans) { ns[q.lbl] = 'correct'; ok++; }
      else { ns[q.lbl] = 'wrong'; }
    });
    setQ5St(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      const nd = { ...q5GroupDone, [gi]:true };
      setQ5GroupDone(nd);
      if (q5Groups.every((_, i) => nd[i])) prog.markDone('s1', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Work out each side separately — brackets first!` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Calculate both sides and then compare.` };
    }
    setQ5FB(p => ({ ...p, [gi]: fb }));
  };

  // ── Section 2 helpers ──
  const q6OptState = (lbl, optId) => {
    const k = `${lbl}-${optId}`;
    if (q6St[k] === 'correct') return 'correct';
    if (q6St[k] === 'wrong')   return 'wrong';
    if (q6Sel[lbl] === optId)  return 'selected';
    return 'default';
  };

  const checkQ6 = (grpArr, gi) => {
    increment(`q6g${gi}`); const att = getAtt(`q6g${gi}`) + 1;
    let ok = 0; const ns = { ...q6St };
    grpArr.forEach(q => {
      const sel = q6Sel[q.lbl];
      if (sel === q.ans) { ns[`${q.lbl}-${sel}`] = 'correct'; ok++; }
      else if (sel !== undefined) { ns[`${q.lbl}-${sel}`] = 'wrong'; }
    });
    setQ6St(ns);
    const total = grpArr.length; let fb;
    if (ok === total) {
      fb = { type:'correct', text:`🎉 ${ok}/${total} correct!` };
      const nd = { ...q6GroupDone, [gi]:true };
      setQ6GroupDone(nd);
      if (q6Groups.every((_, i) => nd[i])) prog.markDone('s2', '✓');
    } else if (att >= 3) {
      fb = { type:'hint', text:'Keep trying! Ask your teacher if you need help.' };
    } else if (att === 2) {
      fb = { type:'hint', text:`💡 ${ok}/${total} correct. Try working out the value of each option.` };
    } else {
      fb = { type:'wrong', text:`✗ ${ok}/${total} correct. Calculate each option and look for the largest result.` };
    }
    setQ6FB(p => ({ ...p, [gi]: fb }));
  };

  return (
    <div style={{ fontFamily:'var(--font)' }}>
      <Header lessonChip="Unit 4 · Lesson 2" completed={prog.completedCount} total={2}/>
      <div className="page">
        <ObjectiveCard text="Compare expressions using &lt;, &gt;, = and use brackets to find the largest possible answer"/>
        <ExplainPanel title="Key Concept: Comparing Expressions & Maximising with Brackets">
          <RuleBox>
            <strong>Always apply BODMAS:</strong> brackets → × ÷ → + −<br/>
            To <strong>compare</strong> two expressions, evaluate each side fully first.<br/>
            To <strong>maximise</strong> a result, try placing brackets so that a large number is multiplied.
          </RuleBox>
        </ExplainPanel>
        <ScoreTrack completed={prog.completedCount} total={2}/>

        {/* ── Section 1 ── */}
        <SectionCard badge={5} title="Use <, > or = to make each statement true" tagType="mcq" tagLabel="Compare"
          subtitle="Calculate both sides, then click the correct symbol. Check after each pair. ★ Guided: a & b">
          {q5Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {q.guided && <GuidedHint>{q.hint}</GuidedHint>}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                      <span style={{ fontSize:17, fontWeight:800, color:'var(--text)' }}>{q.left}</span>
                      <CompareSelector
                        selected={q5Sel[q.lbl]}
                        status={q5St[q.lbl]}
                        onSelect={sym => handleQ5Select(q.lbl, sym)}
                      />
                      <span style={{ fontSize:17, fontWeight:800, color:'var(--text)' }}>{q.right}</span>
                    </div>
                  </QItemLabel>
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkQ5(grpArr, gi)}
              />
              {q5FB[gi] && <FeedbackBox type={q5FB[gi].type} message={q5FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {/* ── Section 2 ── */}
        <SectionCard badge={6} title="Rewrite using brackets to give the largest possible answer" tagType="mcq" tagLabel="MCQ"
          subtitle="Four bracket placements are shown — choose the one that gives the highest value. Check after each pair. ★ Guided: a & b">
          {q6Groups.map((grpArr, gi) => (
            <QGroup key={gi} title={`Questions ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}>
              {grpArr.map((q, qi) => (
                <QItem key={q.lbl} last={qi === grpArr.length - 1}>
                  {gi === 0 && q.lbl === 'a' && (
                    <GuidedHint>Try calculating (8 + 4 − 2) × 3 = 10 × 3. Compare this with the other options.</GuidedHint>
                  )}
                  {gi === 0 && q.lbl === 'b' && (
                    <GuidedHint>Try calculating 9 × (3 − 1 + 5) = 9 × 7. How big is that?</GuidedHint>
                  )}
                  <QItemLabel>
                    <LblCircle letter={q.lbl}/>
                    <span style={{ fontSize:21, fontWeight:900, color:'var(--text)' }}>{q.raw}</span>
                  </QItemLabel>
                  <MCQOptions
                    options={q6Opts[q.lbl].map(o => ({ id:o.id, label:o.text, state:q6OptState(q.lbl, o.id) }))}
                    onSelect={idx => {
                      if (q6St[`${q.lbl}-${idx}`] !== 'correct') setQ6Sel(p => ({ ...p, [q.lbl]:idx }));
                    }}
                  />
                </QItem>
              ))}
              <CheckButton
                label={`✓ Check ${grpArr.map(q => q.lbl.toUpperCase()).join(' & ')}`}
                onClick={() => checkQ6(grpArr, gi)}
              />
              {q6FB[gi] && <FeedbackBox type={q6FB[gi].type} message={q6FB[gi].text}/>}
            </QGroup>
          ))}
        </SectionCard>

        {prog.allDone && <Summary message="Well done! You can evaluate, compare and maximise bracket expressions!"/>}
      </div>
    </div>
  );
}
