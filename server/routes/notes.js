// ============================================================
//  server/routes/notes.js — teacher/admin notes on students
// ============================================================

import { Router } from 'express';
import { getDb } from '../db/connection.js';
import { requireAuth, requireRole } from './auth.js';

const router = Router();

// GET /api/notes/student/:studentId
router.get('/student/:studentId', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  try {
    const db = await getDb();
    // Teachers can only view notes for students in their classes
    if (req.user.role === 'teacher') {
      const access = await db.get(
        `SELECT 1 FROM class_enrollments e JOIN classes c ON c.id = e.class_id
         WHERE e.student_id = ? AND c.teacher_id = ? LIMIT 1`,
        [studentId, req.user.id]
      );
      if (!access) return res.status(403).json({ error: 'Access denied' });
    }
    const notes = await db.all(
      `SELECT n.id, n.body, n.created_at, u.name AS author_name
       FROM student_notes n JOIN users u ON u.id = n.author_id
       WHERE n.student_id = ? ORDER BY n.created_at DESC`,
      [studentId]
    );
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes/student/:studentId
// body: { body }
router.post('/student/:studentId', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  const { body } = req.body || {};
  if (!body || !body.trim()) return res.status(400).json({ error: 'body is required' });

  try {
    const db = await getDb();
    if (req.user.role === 'teacher') {
      const access = await db.get(
        `SELECT 1 FROM class_enrollments e JOIN classes c ON c.id = e.class_id
         WHERE e.student_id = ? AND c.teacher_id = ? LIMIT 1`,
        [studentId, req.user.id]
      );
      if (!access) return res.status(403).json({ error: 'Access denied' });
    }
    const result = await db.run(
      'INSERT INTO student_notes (student_id, author_id, body) VALUES (?, ?, ?)',
      [studentId, req.user.id, body.trim()]
    );
    const note = await db.get(
      `SELECT n.id, n.body, n.created_at, u.name AS author_name
       FROM student_notes n JOIN users u ON u.id = n.author_id WHERE n.id = ?`,
      [result.lastID]
    );
    res.status(201).json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const noteId = parseInt(req.params.id, 10);
  try {
    const db = await getDb();
    const note = await db.get('SELECT author_id FROM student_notes WHERE id = ?', [noteId]);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    // Teachers can only delete their own notes; admins can delete any
    if (req.user.role === 'teacher' && note.author_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });
    await db.run('DELETE FROM student_notes WHERE id = ?', [noteId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
