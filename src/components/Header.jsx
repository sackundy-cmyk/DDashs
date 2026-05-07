// ============================================================
//  Header.jsx — sticky lesson top bar with brand identity
// ============================================================

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Header.module.css';
import { DDashIcon } from './DDashLogo.jsx';
import curriculum from '../data/curriculum.json';

const FLAT_LESSONS = curriculum.units.flatMap(u =>
  u.lessons.map(l => ({ unitId: u.id, lessonId: l.id, title: l.title }))
);

function findIndex(unitId, lessonId) {
  return FLAT_LESSONS.findIndex(l => l.unitId === unitId && l.lessonId === lessonId);
}

export default function Header({ lessonChip, completed = 0, total = 1 }) {
  const pct = Math.round((completed / total) * 100);
  const navigate  = useNavigate();
  const params    = useParams();
  const unitId    = parseInt(params.unitId,   10);
  const lessonId  = parseInt(params.lessonId, 10);
  const idx       = !isNaN(unitId) && !isNaN(lessonId) ? findIndex(unitId, lessonId) : -1;
  const prev      = idx > 0 ? FLAT_LESSONS[idx - 1] : null;
  const next      = idx >= 0 && idx < FLAT_LESSONS.length - 1 ? FLAT_LESSONS[idx + 1] : null;

  const goToLesson   = (l) => navigate(`/student/lesson/${l.unitId}/${l.lessonId}`);
  const backToClasses = () => navigate('/student/classes');

  return (
    <header className={styles.header}>
      {/* Brand */}
      <div className={styles.logo}>
        <div className={styles.logoBadge}>
          <DDashIcon size={22} />
        </div>
        <span className={styles.logoText}>
          D<span className={styles.logoDash}>-DASH</span>
        </span>
      </div>

      {/* Back to class */}
      {idx >= 0 && (
        <button
          className={`${styles.navBtn} ${styles.navBtnBack}`}
          onClick={backToClasses}
          title="Back to My Classes"
        >
          ← Classes
        </button>
      )}

      {/* Lesson chip */}
      <div className={styles.chip}>{lessonChip}</div>

      {/* Progress bar */}
      <div className={styles.progress}>
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.label}>{completed} / {total} sections complete</div>
      </div>

      {/* Prev / Next */}
      {idx >= 0 && (
        <>
          <button
            className={styles.navBtn}
            onClick={() => goToLesson(prev)}
            disabled={!prev}
            title={prev ? prev.title : 'No previous lesson'}
          >
            ← Prev
          </button>
          <button
            className={styles.navBtn}
            onClick={() => goToLesson(next)}
            disabled={!next}
            title={next ? next.title : 'No next lesson'}
          >
            Next →
          </button>
        </>
      )}
    </header>
  );
}
