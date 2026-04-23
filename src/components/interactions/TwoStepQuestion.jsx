// ============================================================
//  interactions/TwoStepQuestion.jsx
//  Step 1: MCQ (auto-unlocks Step 2 on correct)
//  Step 2: digit drag answer
// ============================================================

import React, { useState } from 'react';
import { MCQOptions } from './MCQOptions.jsx';
import { DigitPalette, DigitDropZone } from './DigitComponents.jsx';

/**
 * @param {string}   step1Question  - question text for step 1
 * @param {Array}    step1Options   - [{ id, label }]
 * @param {string}   step1AnswerId  - correct option id
 * @param {string}   step2Question  - hint text for step 2
 * @param {number[]} digits         - current digits in answer zone
 * @param {string}   zoneState      - 'default'|'correct'|'wrong'|'reveal'
 * @param {function} onDigitDrop    - called with raw dataTransfer string
 * @param {function} onDigitRemove  - called with digit index
 */
export function TwoStepQuestion({
  step1Question, step1Options, step1AnswerId,
  step2Question, digits, zoneState,
  onDigitDrop, onDigitRemove,
}) {
  const [s1States, setS1States] = useState({});
  const [step1Done, setStep1Done] = useState(false);

  const handleS1Click = (id) => {
    if (step1Done) return;
    if (id === step1AnswerId) {
      setS1States(prev => ({ ...prev, [id]: 'correct' }));
      setStep1Done(true);
    } else {
      setS1States(prev => ({ ...prev, [id]: 'wrong' }));
      // Reset wrong after 800ms
      setTimeout(() => setS1States(prev => {
        const s = { ...prev }; delete s[id]; return s;
      }), 800);
    }
  };

  const optionsWithState = step1Options.map(o => ({
    ...o,
    state: s1States[o.id] || (step1Done && o.id !== step1AnswerId ? 'default' : s1States[o.id]),
  }));

  return (
    <div>
      {/* Step 1 */}
      <div style={{
        borderRadius: 10, padding: '14px 16px', marginBottom: 10,
        background: '#F0F7FF', border: '1.5px solid var(--border)',
      }}>
        <div style={{
          fontSize: 12, fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '.6px', marginBottom: 8, color: 'var(--blue)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', background: 'var(--blue)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 900,
          }}>1</div>
          {step1Question}
        </div>
        <MCQOptions
          options={optionsWithState}
          onSelect={handleS1Click}
        />
      </div>

      {/* Step 2 — locked until step 1 done */}
      <div style={{
        borderRadius: 10, padding: '14px 16px', marginBottom: 10,
        background: '#F0FDF4', border: '1.5px solid var(--green-border)',
        opacity: step1Done ? 1 : 0.35,
        pointerEvents: step1Done ? undefined : 'none',
        transition: 'opacity .4s',
      }}>
        <div style={{
          fontSize: 12, fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '.6px', marginBottom: 8, color: 'var(--green)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', background: 'var(--green)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 900,
          }}>2</div>
          {step2Question} — Drag digits to build your answer:
        </div>

        {/* Mini digit palette */}
        <DigitPalette />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 900 }}>? =</span>
          <DigitDropZone
            digits={digits}
            zoneState={zoneState}
            onDrop={onDigitDrop}
            onRemove={onDigitRemove}
          />
        </div>
      </div>
    </div>
  );
}
