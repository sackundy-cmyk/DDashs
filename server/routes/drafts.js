// ============================================================
//  server/routes/drafts.js
//  Per-student in-progress lesson state (resume after refresh)
// ============================================================

import { Router } from 'express';
import { getDb } from '../db/connection.js';
import { requireAuth } from './auth.js';

const router = Router();

// GET /api/drafts/:classId/:unit/:lesson
router.get('/:classId/:unit/:lesson', requireAuth, async (req, res) => {
  const studentId = req.user.id;
  const classId   = parseInt(req.params.classId, 10);
  const unit      = parseInt(req.params.unit, 10);
  const lessonNum = parseInt(req.params.lesson, 10);

  if (!classId || !unit || !lessonNum)
    return res.status(400).json({ error: 'classId, unit, lesson required' });

  try {
    const db = await getDb();
    const row = await db.get(
      `SELECT state_json, updated_at FROM lesson_drafts
        WHERE student_id = ? AND class_id = ? AND unit = ? AND lesson_num = ?`,
      [studentId, classId, unit, lessonNum]
    );
    if (!row) return res.json({ draft: null });
    let state = null;
    try { state = JSON.parse(row.state_json); } catch { state = null; }
    res.json({ draft: { state, updatedAt: row.updated_at } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/drafts/:classId/:unit/:lesson  { state }
router.put('/:classId/:unit/:lesson', requireAuth, async (req, res) => {
  const studentId = req.user.id;
  const classId   = parseInt(req.params.classId, 10);
  const unit      = parseInt(req.params.unit, 10);
  const lessonNum = parseInt(req.params.lesson, 10);
  const { state } = req.body || {};

  if (!classId || !unit || !lessonNum)
    return res.status(400).json({ error: 'classId, unit, lesson required' });
  if (state === undefined)
    return res.status(400).json({ error: 'state is required' });

  try {
    const db = await getDb();
    const json = JSON.stringify(state);
    await db.run(`
      INSERT INTO lesson_drafts (student_id, class_id, unit, lesson_num, state_json, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(student_id, class_id, unit, lesson_num)
      DO UPDATE SET state_json = excluded.state_json, updated_at = datetime('now')
    `, [studentId, classId, unit, lessonNum, json]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/drafts/:classId/:unit/:lesson
router.delete('/:classId/:unit/:lesson', requireAuth, async (req, res) => {
  const studentId = req.user.id;
  const classId   = parseInt(req.params.classId, 10);
  const unit      = parseInt(req.params.unit, 10);
  const lessonNum = parseInt(req.params.lesson, 10);

  try {
    const db = await getDb();
    await db.run(
      `DELETE FROM lesson_drafts
        WHERE student_id = ? AND class_id = ? AND unit = ? AND lesson_num = ?`,
      [studentId, classId, unit, lessonNum]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
