// ============================================================
//  server/routes/progress.js
// ============================================================

import { Router } from 'express';
import { getDb } from '../db/connection.js';
import { requireAuth } from './auth.js';

const router = Router();

// POST /api/progress — save or update a lesson_progress record
router.post('/', requireAuth, async (req, res) => {
  const { classId, unit, lessonNum, lessonKey, sectionId, score, attempts, completed } = req.body;
  const studentId = req.user.id;

  // Accept either lessonNum or lessonKey (lessonKey is the URL slug, lessonNum is the integer)
  const lessonNumVal = lessonNum ?? (lessonKey ? parseInt(lessonKey, 10) || null : null);

  if (!classId || !unit || !sectionId)
    return res.status(400).json({ error: 'classId, unit, sectionId are required' });

  try {
    const db = await getDb();

    // Lock pre-check: reject if the student's lesson is locked
    if (lessonNumVal != null) {
      const lock = await db.get(
        `SELECT locked FROM lesson_locks
         WHERE student_id = ? AND class_id = ? AND unit = ? AND lesson_num = ?`,
        [studentId, classId, unit, lessonNumVal]
      );
      if (lock && lock.locked === 1)
        return res.status(403).json({ error: 'Lesson is locked by your teacher' });
    }

    await db.run(`
      INSERT INTO lesson_progress (student_id, class_id, unit, lesson_num, section_id, score, attempts, completed, last_attempt_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(student_id, class_id, unit, lesson_num, section_id)
      DO UPDATE SET
        score           = excluded.score,
        attempts        = MAX(lesson_progress.attempts, excluded.attempts),
        completed       = excluded.completed,
        last_attempt_at = datetime('now')
    `, [studentId, classId, unit, lessonNumVal, sectionId,
        score ?? null, attempts ?? 1, completed ? 1 : 0]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/progress/:studentId — all progress (legacy + new)
router.get('/:studentId', requireAuth, async (req, res) => {
  const targetId = parseInt(req.params.studentId);
  const { id: callerId, role } = req.user;

  if (role === 'student' && callerId !== targetId)
    return res.status(403).json({ error: 'Access denied' });

  try {
    const db = await getDb();
    const rows = await db.all(`
      SELECT lp.*, cl.title AS lesson_title
      FROM lesson_progress lp
      LEFT JOIN class_lessons cl
        ON cl.class_id = lp.class_id AND cl.unit = lp.unit AND cl.lesson_num = lp.lesson_num
      WHERE lp.student_id = ?
      ORDER BY lp.unit, lp.lesson_num
    `, [targetId]);
    res.json({ progress: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/progress/summary/:studentId — completion summary per lesson
router.get('/summary/:studentId', requireAuth, async (req, res) => {
  const targetId = parseInt(req.params.studentId);
  const { id: callerId, role } = req.user;

  if (role === 'student' && callerId !== targetId)
    return res.status(403).json({ error: 'Access denied' });

  try {
    const db = await getDb();
    const summary = await db.all(`
      SELECT class_id, unit, lesson_num,
             COUNT(*) AS total_sections,
             SUM(completed) AS completed_sections,
             ROUND(AVG(CASE WHEN completed = 1 THEN score END), 1) AS avg_score,
             MAX(last_attempt_at) AS last_attempt_at
      FROM lesson_progress
      WHERE student_id = ?
      GROUP BY class_id, unit, lesson_num
      ORDER BY unit, lesson_num
    `, [targetId]);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
