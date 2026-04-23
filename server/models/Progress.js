// ============================================================
//  server/models/Progress.js
// ============================================================

import db from '../db/connection.js';

export const ProgressModel = {
  /** Upsert a progress record */
  save({ studentId, unit, lesson, sectionId, score, attempts, completed }) {
    db.prepare(`
      INSERT INTO progress (student_id, unit, lesson, section_id, score, attempts, completed, updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(student_id, unit, lesson, section_id)
      DO UPDATE SET
        score     = excluded.score,
        attempts  = excluded.attempts,
        completed = excluded.completed,
        updated   = datetime('now')
    `).run(studentId, unit, lesson, sectionId, score || null, attempts || 0, completed ? 1 : 0);
  },

  /** Get all progress records for a student */
  forStudent(studentId) {
    return db.prepare(
      'SELECT * FROM progress WHERE student_id = ? ORDER BY unit, lesson'
    ).all(studentId);
  },

  /** Get progress for a specific lesson */
  forLesson(studentId, unit, lesson) {
    return db.prepare(
      'SELECT * FROM progress WHERE student_id = ? AND unit = ? AND lesson = ?'
    ).all(studentId, unit, lesson);
  },

  /** Calculate overall completion percentage for a student */
  summary(studentId) {
    const rows = this.forStudent(studentId);
    const total    = rows.length;
    const complete = rows.filter(r => r.completed).length;
    return { total, complete, pct: total > 0 ? Math.round((complete / total) * 100) : 0 };
  },
};
