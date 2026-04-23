// ============================================================
//  components/index.js — barrel exports
// ============================================================

// Shared atoms
export {
  ObjectiveCard, ExplainPanel, RuleBox, ScoreTrack,
  GuidedHint, FeedbackBox, LblCircle, NumChip, CheckButton, Summary,
} from './SharedComponents.jsx';

// Layout
export { default as Header }        from './Header.jsx';
export { default as SectionCard }   from './SectionCard.jsx';
export { default as ErrorBoundary } from './ErrorBoundary.jsx';
export { default as PageWrapper }   from './layout/PageWrapper.jsx';
export { QGroup, QItem, QItemLabel }from './layout/QGroupItem.jsx';

// Interactions
export { MCQOptions }                   from './interactions/MCQOptions.jsx';
export { DigitPalette, DigitDropZone }  from './interactions/DigitComponents.jsx';
export { DropSlot, FactorSlotRow }      from './interactions/DropSlot.jsx';
export { DraggableCard }                from './interactions/DraggableCard.jsx';
export { default as NumberGrid100 }     from './interactions/NumberGrid100.jsx';
export { Venn2Diagram }                 from './interactions/VennDiagrams.jsx';
export { NumberCardBank }               from './interactions/NumberCardBank.jsx';
export { TwoStepQuestion }              from './interactions/TwoStepQuestion.jsx';
export { TwoPartAnswer }                from './interactions/TwoPartAnswer.jsx';
