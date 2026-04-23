// ============================================================
//  server/routes/students.js
// ============================================================

import { Router } from 'express';
import { StudentModel } from '../models/Student.js';
import { requireAuth, requireRole } from './auth.js';
import { getDb } from '../db/connection.js';

const router = Router();

// GET /api/students — all students with progress summary (teacher/admin)
// ?includeDeleted=1 (admin only) — include soft-deleted students
router.get('/', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const db = await getDb();
    const showDeleted = req.user.role === 'admin' && req.query.includeDeleted === '1';
    const deletedClause = showDeleted ? '' : 'AND u.deleted_at IS NULL';
    const students = await db.all(`
      SELECT u.id, u.name, u.email, u.created_at, u.deleted_at,
             u.parent_email, u.phone, COALESCE(u.weekly_report_enabled, 1) AS weekly_report_enabled,
             COUNT(DISTINCT ce.class_id) AS class_count,
             ROUND(AVG(CASE WHEN lp.completed = 1 THEN lp.score ELSE NULL END), 1) AS avg_score,
             SUM(CASE WHEN lp.completed = 1 THEN 1 ELSE 0 END) AS sections_completed,
             MAX(lp.last_attempt_at) AS last_active,
             (SELECT COUNT(*) FROM (
               SELECT lp2.unit, lp2.lesson_num
               FROM lesson_progress lp2
               WHERE lp2.student_id = u.id
               GROUP BY lp2.unit, lp2.lesson_num
               HAVING SUM(lp2.completed) = (
                 SELECT COUNT(DISTINCT lp3.section_id)
                 FROM lesson_progress lp3
                 WHERE lp3.unit = lp2.unit AND lp3.lesson_num = lp2.lesson_num
               )
             )) AS lessons_completed
      FROM users u
      LEFT JOIN class_enrollments ce ON ce.student_id = u.id
      LEFT JOIN lesson_progress lp ON lp.student_id = u.id
      WHERE u.role = 'student' ${deletedClause}
      GROUP BY u.id
      ORDER BY u.name
    `);
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:id — one student's profile + progress (teacher/admin/self)
router.get('/:id', requireAuth, async (req, res) => {
  const targetId = parseInt(req.params.id);
  const { id: callerId, role } = req.user;

  if (role === 'student' && callerId !== targetId)
    return res.status(403).json({ error: 'Access denied' });

  try {
    const db = await getDb();

    const student = await db.get(
      'SELECT id, name, email, created_at FROM users WHERE id = ? AND role = ? AND deleted_at IS NULL',
      [targetId, 'student']
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const classes = await db.all(`
      SELECT c.id, c.name, c.color, c.grade
      FROM classes c
      JOIN class_enrollments ce ON ce.class_id = c.id
      WHERE ce.student_id = ?
    `, [targetId]);

    const progress = await db.all(
      'SELECT * FROM lesson_progress WHERE student_id = ? ORDER BY unit, lesson_num',
      [targetId]
    );

    res.json({ student, classes, progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Legacy routes (backward compat) ──────────────────────────

router.post('/legacy', async (req, res) => {
  const { id, name, class: cls } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  try {
    const student = await StudentModel.upsert(id, name, cls || '');
    res.json({ student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
