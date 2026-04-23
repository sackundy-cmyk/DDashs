// ============================================================
//  server/routes/classes.js — Classes API
// ============================================================

import { Router } from 'express';
import { getDb } from '../db/connection.js';
import { requireAuth, requireRole } from './auth.js';

const router = Router();

// GET /api/classes — list classes visible to the current user
// Admin: all non-archived classes  |  Teacher: their classes  |  Student: enrolled classes
// ?includeArchived=1 (admin only) — include archived classes
router.get('/', requireAuth, async (req, res) => {
  const { id, role } = req.user;
  const showArchived = role === 'admin' && req.query.includeArchived === '1';
  const archiveClause = showArchived ? '' : 'AND c.archived_at IS NULL';

  try {
    const db = await getDb();
    let classes;

    if (role === 'admin') {
      classes = await db.all(`
        SELECT c.*, u.name AS teacher_name,
               COUNT(DISTINCT ce.student_id) AS student_count,
               COUNT(DISTINCT cl.id) AS lesson_count
        FROM classes c
        LEFT JOIN users u ON u.id = c.teacher_id
        LEFT JOIN class_enrollments ce ON ce.class_id = c.id
        LEFT JOIN class_lessons cl ON cl.class_id = c.id
        WHERE 1=1 ${archiveClause}
        GROUP BY c.id
        ORDER BY c.name
      `);
    } else if (role === 'teacher') {
      classes = await db.all(`
        SELECT c.*, u.name AS teacher_name,
               COUNT(DISTINCT ce.student_id) AS student_count,
               COUNT(DISTINCT cl.id) AS lesson_count
        FROM classes c
        LEFT JOIN users u ON u.id = c.teacher_id
        LEFT JOIN class_enrollments ce ON ce.class_id = c.id
        LEFT JOIN class_lessons cl ON cl.class_id = c.id
        WHERE c.teacher_id = ? AND c.archived_at IS NULL
        GROUP BY c.id
        ORDER BY c.name
      `, [id]);
    } else {
      classes = await db.all(`
        SELECT c.*, u.name AS teacher_name,
               COUNT(DISTINCT cl.id) AS lesson_count
        FROM classes c
        JOIN class_enrollments ce ON ce.class_id = c.id AND ce.student_id = ?
        LEFT JOIN users u ON u.id = c.teacher_id
        LEFT JOIN class_lessons cl ON cl.class_id = c.id
        WHERE c.archived_at IS NULL
        GROUP BY c.id
        ORDER BY c.name
      `, [id]);
    }

    res.json({ classes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/classes — create class (admin only)
// body: { name, grade?, description?, color?, teacherId?, lessonRefs?: [{unit,lessonNum,title}] }
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, grade, description, color, teacherId, lessonRefs } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO classes (name, grade, description, color, teacher_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), grade || null, description || null, color || '#1E6FD9', teacherId || null]
    );
    const classId = result.lastID;

    if (Array.isArray(lessonRefs) && lessonRefs.length > 0) {
      for (let i = 0; i < lessonRefs.length; i++) {
        const { unit, lessonNum, title } = lessonRefs[i];
        await db.run(
          `INSERT INTO class_lessons (class_id, unit, lesson_num, title, order_index) VALUES (?, ?, ?, ?, ?)`,
          [classId, unit, lessonNum, title, i]
        );
      }
    }

    const cls = await db.get(
      `SELECT c.*, u.name AS teacher_name FROM classes c LEFT JOIN users u ON u.id = c.teacher_id WHERE c.id = ?`,
      [classId]
    );
    res.status(201).json({ class: cls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classes/:id — class detail with lessons + progress
router.get('/:id', requireAuth, async (req, res) => {
  const classId = parseInt(req.params.id);
  const { id: userId, role } = req.user;

  try {
    const db = await getDb();

    const cls = await db.get(`
      SELECT c.*, u.name AS teacher_name
      FROM classes c
      LEFT JOIN users u ON u.id = c.teacher_id
      WHERE c.id = ?
    `, [classId]);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    if (cls.archived_at && role !== 'admin') return res.status(404).json({ error: 'Class not found' });

    if (role === 'teacher' && cls.teacher_id !== userId)
      return res.status(403).json({ error: 'Access denied' });
    if (role === 'student') {
      const enrolled = await db.get(
        'SELECT 1 FROM class_enrollments WHERE class_id = ? AND student_id = ?',
        [classId, userId]
      );
      if (!enrolled) return res.status(403).json({ error: 'Not enrolled in this class' });
    }

    const lessons = await db.all(
      'SELECT * FROM class_lessons WHERE class_id = ? ORDER BY order_index',
      [classId]
    );

    let lessonsWithProgress = lessons;
    if (role === 'student') {
      lessonsWithProgress = await Promise.all(lessons.map(async lesson => {
        const sections = await db.all(`
          SELECT section_id, attempts, completed, score
          FROM lesson_progress
          WHERE student_id = ? AND class_id = ? AND unit = ? AND lesson_num = ?
        `, [userId, classId, lesson.unit, lesson.lesson_num]);
        const completedSections = sections.filter(s => s.completed).length;
        const totalSections     = sections.length;
        const avgScore = completedSections > 0
          ? Math.round(sections.filter(s => s.completed).reduce((a, s) => a + (s.score || 0), 0) / completedSections)
          : null;
        const lockRow = await db.get(
          `SELECT locked FROM lesson_locks
           WHERE student_id = ? AND class_id = ? AND unit = ? AND lesson_num = ?`,
          [userId, classId, lesson.unit, lesson.lesson_num]
        );
        const locked = !!(lockRow && lockRow.locked === 1);
        return { ...lesson, sections, completedSections, totalSections, avgScore, locked };
      }));
    }

    res.json({ class: cls, lessons: lessonsWithProgress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/classes/:id — edit class (admin only)
// body: { name?, grade?, description?, color?, teacherId? }
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const classId = parseInt(req.params.id, 10);
  const { name, grade, description, color, teacherId } = req.body || {};

  try {
    const db = await getDb();
    const existing = await db.get('SELECT id FROM classes WHERE id = ?', [classId]);
    if (!existing) return res.status(404).json({ error: 'Class not found' });

    if (name !== undefined) await db.run('UPDATE classes SET name = ? WHERE id = ?', [name.trim(), classId]);
    if (grade !== undefined) await db.run('UPDATE classes SET grade = ? WHERE id = ?', [grade || null, classId]);
    if (description !== undefined) await db.run('UPDATE classes SET description = ? WHERE id = ?', [description || null, classId]);
    if (color !== undefined) await db.run('UPDATE classes SET color = ? WHERE id = ?', [color, classId]);
    if (teacherId !== undefined) await db.run('UPDATE classes SET teacher_id = ? WHERE id = ?', [teacherId || null, classId]);

    const cls = await db.get(
      `SELECT c.*, u.name AS teacher_name FROM classes c LEFT JOIN users u ON u.id = c.teacher_id WHERE c.id = ?`,
      [classId]
    );
    res.json({ class: cls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/classes/:id — archive (admin only)
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const classId = parseInt(req.params.id, 10);
  try {
    const db = await getDb();
    const result = await db.run(
      `UPDATE classes SET archived_at = datetime('now') WHERE id = ? AND archived_at IS NULL`,
      [classId]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Class not found or already archived' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/classes/:id/restore — unarchive (admin only)
router.post('/:id/restore', requireAuth, requireRole('admin'), async (req, res) => {
  const classId = parseInt(req.params.id, 10);
  try {
    const db = await getDb();
    const result = await db.run(`UPDATE classes SET archived_at = NULL WHERE id = ?`, [classId]);
    if (result.changes === 0) return res.status(404).json({ error: 'Class not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/classes/:id/lessons/bulk — replace class_lessons (admin only)
// body: { lessonRefs: [{unit, lessonNum, title}] }
router.post('/:id/lessons/bulk', requireAuth, requireRole('admin'), async (req, res) => {
  const classId = parseInt(req.params.id, 10);
  const { lessonRefs } = req.body || {};
  if (!Array.isArray(lessonRefs)) return res.status(400).json({ error: 'lessonRefs array required' });

  try {
    const db = await getDb();
    await db.run('DELETE FROM class_lessons WHERE class_id = ?', [classId]);
    for (let i = 0; i < lessonRefs.length; i++) {
      const { unit, lessonNum, title } = lessonRefs[i];
      await db.run(
        `INSERT INTO class_lessons (class_id, unit, lesson_num, title, order_index) VALUES (?, ?, ?, ?, ?)`,
        [classId, unit, lessonNum, title, i]
      );
    }
    const lessons = await db.all('SELECT * FROM class_lessons WHERE class_id = ? ORDER BY order_index', [classId]);
    res.json({ lessons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/classes/:id/students/:studentId — unenroll (teacher/admin)
router.delete('/:id/students/:studentId', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const classId    = parseInt(req.params.id, 10);
  const studentId  = parseInt(req.params.studentId, 10);

  try {
    const db = await getDb();
    if (req.user.role === 'teacher') {
      const cls = await db.get('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
      if (!cls || cls.teacher_id !== req.user.id)
        return res.status(403).json({ error: 'Access denied' });
    }
    await db.run(
      'DELETE FROM class_enrollments WHERE class_id = ? AND student_id = ?',
      [classId, studentId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classes/:id/students — students in a class (teacher/admin)
router.get('/:id/students', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const classId = parseInt(req.params.id);
  try {
    const db = await getDb();
    const students = await db.all(`
      SELECT u.id, u.name, u.email,
             COUNT(DISTINCT lp.unit * 100 + lp.lesson_num) AS lessons_touched,
             ROUND(AVG(CASE WHEN lp.completed = 1 THEN lp.score ELSE NULL END), 1) AS avg_score,
             SUM(CASE WHEN lp.completed = 1 THEN 1 ELSE 0 END) AS sections_done,
             MAX(lp.last_attempt_at) AS last_active
      FROM users u
      JOIN class_enrollments ce ON ce.student_id = u.id AND ce.class_id = ?
      LEFT JOIN lesson_progress lp ON lp.student_id = u.id AND lp.class_id = ?
      WHERE u.role = 'student' AND u.deleted_at IS NULL
      GROUP BY u.id
      ORDER BY u.name
    `, [classId, classId]);
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classes/:id/progress — all progress in a class (teacher/admin)
router.get('/:id/progress', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const classId = parseInt(req.params.id);
  try {
    const db = await getDb();
    const rows = await db.all(`
      SELECT lp.*, u.name AS student_name
      FROM lesson_progress lp
      JOIN users u ON u.id = lp.student_id
      WHERE lp.class_id = ?
      ORDER BY u.name, lp.unit, lp.lesson_num
    `, [classId]);
    res.json({ progress: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
