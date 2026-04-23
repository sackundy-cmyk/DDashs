// ============================================================
//  Header.jsx — sticky top bar with logo, lesson chip, progress
// ============================================================

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Header.module.css';
import curriculum from '../data/curriculum.json';

const FLAT_LESSONS = curriculum.units.flatMap(u =>
  u.lessons.map(l => ({ unitId: u.id, lessonId: l.id, title: l.title }))
);

function findIndex(unitId, lessonId) {
  return FLAT_LESSONS.findIndex(l => l.unitId === unitId && l.lessonId === lessonId);
}

export default function Header({ lessonChip, completed = 0, total = 1 }) {
  const pct = Math.round((completed / total) * 100);
  const navigate = useNavigate();
  const params = useParams();
  const unitId = parseInt(params.unitId, 10);
  const lessonId = parseInt(params.lessonId, 10);
  const idx = !isNaN(unitId) && !isNaN(lessonId) ? findIndex(unitId, lessonId) : -1;
  const prev = idx > 0 ? FLAT_LESSONS[idx - 1] : null;
  const next = idx >= 0 && idx < FLAT_LESSONS.length - 1 ? FLAT_LESSONS[idx + 1] : null;

  const goToLesson = (l) => navigate(`/student/lesson/${l.unitId}/${l.lessonId}`);
  const backToClasses = () => navigate('/student/classes');

  const navBtn = (label, onClick, disabled, title) => (
    <button onClick={onClick} disabled={disabled} title={title}
      style={{
        background: disabled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)',
        color: '#fff', border: 'none', borderRadius: 999,
        padding: '6px 12px', fontSize: 13, fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1, fontFamily: 'var(--font)',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
      {label}
    </button>
  );

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        D<span className={styles.dash}>-DASH</span>
      </div>
      {idx >= 0 && navBtn('← Back to class', backToClasses, false, 'Back to My Classes')}
      <div className={styles.chip}>{lessonChip}</div>
      <div className={styles.progress}>
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.label}>{completed} / {total} sections complete</div>
      </div>
      {idx >= 0 && (
        <>
          {navBtn('← Prev', () => goToLesson(prev), !prev, prev ? `${prev.title}` : 'No previous lesson')}
          {navBtn('Next →', () => goToLesson(next), !next, next ? `${next.title}` : 'No next lesson')}
        </>
      )}
    </header>
  );
}
