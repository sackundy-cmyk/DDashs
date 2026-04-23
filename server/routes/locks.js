// ============================================================
//  server/routes/locks.js — per-student lesson lock/unlock
// ============================================================

import { Router } from 'express';
import { getDb } from '../db/connection.js';
import { requireAuth, requireRole } from './auth.js';

const router = Router();

async function assertClassAccess(db, classId, user) {
  if (user.role === 'admin') return true;
  if (user.role === 'teacher') {
    const row = await db.get('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
    return row && row.teacher_id === user.id;
  }
  return false;
}

// GET /api/locks/class/:classId — every lock row for a class
router.get('/class/:classId', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const classId = parseInt(req.params.classId, 10);
  try {
    const db = await getDb();
    if (!(await assertClassAccess(db, classId, req.user)))
      return res.status(403).json({ error: 'Access denied' });

    const locks = await db.all(
      `SELECT student_id, class_id, unit, lesson_num, locked, locked_by, locked_at
       FROM lesson_locks
       WHERE class_id = ? AND locked = 1`,
      [classId]
    );
    res.json({ locks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/locks/student/:studentId/lesson/:classId/:unit/:lesson
// body: { locked: true|false }
router.put(
  '/student/:studentId/lesson/:classId/:unit/:lesson',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res) => {
    const studentId = parseInt(req.params.studentId, 10);
    const classId   = parseInt(req.params.classId, 10);
    const unit      = parseInt(req.params.unit, 10);
    const lessonNum = parseInt(req.params.lesson, 10);
    const locked    = req.body?.locked ? 1 : 0;

    try {
      const db = await getDb();
      if (!(await assertClassAccess(db, classId, req.user)))
        return res.status(403).json({ error: 'Access denied' });

      await db.run(
        `INSERT INTO lesson_locks (student_id, class_id, unit, lesson_num, locked, locked_by, locked_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(student_id, class_id, unit, lesson_num)
         DO UPDATE SET locked = excluded.locked,
                       locked_by = excluded.locked_by,
                       locked_at = datetime('now')`,
        [studentId, classId, unit, lessonNum, locked, req.user.id]
      );
      res.json({ success: true, locked: !!locked });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/locks/class/:classId/lesson/:unit/:lesson/bulk
// body: { locked: bool, studentIds?: number[] | "all" }
router.post(
  '/class/:classId/lesson/:unit/:lesson/bulk',
  requireAuth,
  requireRole('teacher', 'admin'),
  async (req, res) => {
    const classId   = parseInt(req.params.classId, 10);
    const unit      = parseInt(req.params.unit, 10);
    const lessonNum = parseInt(req.params.lesson, 10);
    const locked    = req.body?.locked ? 1 : 0;
    const target    = req.body?.studentIds ?? 'all';

    try {
      const db = await getDb();
      if (!(await assertClassAccess(db, classId, req.user)))
        return res.status(403).json({ error: 'Access denied' });

      let studentIds;
      if (target === 'all' || !Array.isArray(target)) {
        const rows = await db.all(
          'SELECT student_id FROM class_enrollments WHERE class_id = ?',
          [classId]
        );
        studentIds = rows.map(r => r.student_id);
      } else {
        studentIds = target.map(x => parseInt(x, 10)).filter(Number.isInteger);
      }

      for (const sid of studentIds) {
        await db.run(
          `INSERT INTO lesson_locks (student_id, class_id, unit, lesson_num, locked, locked_by, locked_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
           ON CONFLICT(student_id, class_id, unit, lesson_num)
           DO UPDATE SET locked = excluded.locked,
                         locked_by = excluded.locked_by,
                         locked_at = datetime('now')`,
          [sid, classId, unit, lessonNum, locked, req.user.id]
        );
      }

      res.json({ success: true, locked: !!locked, count: studentIds.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
