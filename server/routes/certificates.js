// ============================================================
//  server/routes/certificates.js — issue / list / download PDFs
// ============================================================

import { Router } from 'express';
import { getDb } from '../db/connection.js';
import { requireAuth, requireRole } from './auth.js';
import { streamCertificatePdf } from '../lib/pdfCertificate.js';

const router = Router();

const UNIT_TITLES = {
  1: 'Decimals',
  2: 'Algebra & Patterns',
  3: 'Multiples, Factors & Primes',
  4: 'Addition & Subtraction',
  5: 'Mental & Written Calculations',
};

// GET /api/certificates/student/:studentId
// Visible to: the student themselves, or any teacher/admin
router.get('/student/:studentId', requireAuth, async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (req.user.role === 'student' && req.user.id !== studentId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const db = await getDb();
    const rows = await db.all(
      `SELECT c.*, cls.name AS class_name, cls.color AS class_color
         FROM certificates c
         JOIN classes cls ON cls.id = c.class_id
        WHERE c.student_id = ?
        ORDER BY c.issued_at DESC`,
      [studentId]
    );
    res.json({ certificates: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/certificates    teacher/admin — issue or re-issue
//   { studentId, classId, type, unit?, lessonNum?, score? }
router.post('/', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const { studentId, classId, type, unit, lessonNum, score } = req.body;
  if (!studentId || !classId || !type) {
    return res.status(400).json({ error: 'studentId, classId and type are required' });
  }
  if (!['lesson', 'unit', 'course'].includes(type)) {
    return res.status(400).json({ error: 'type must be lesson|unit|course' });
  }
  if (type === 'lesson' && (unit == null || lessonNum == null)) {
    return res.status(400).json({ error: 'lesson certificates require unit and lessonNum' });
  }
  if (type === 'unit' && unit == null) {
    return res.status(400).json({ error: 'unit certificates require unit' });
  }

  try {
    const db = await getDb();
    // Upsert: re-issue updates issued_at + score on existing row
    await db.run(
      `INSERT INTO certificates (student_id, class_id, type, unit, lesson_num, score, issued_by_user_id, issued_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(student_id, class_id, type, unit, lesson_num)
       DO UPDATE SET score = excluded.score,
                     issued_by_user_id = excluded.issued_by_user_id,
                     issued_at = datetime('now')`,
      [studentId, classId, type, unit ?? null, lessonNum ?? null, score ?? null, req.user.id]
    );
    const row = await db.get(
      `SELECT * FROM certificates
        WHERE student_id = ? AND class_id = ? AND type = ?
          AND IFNULL(unit, -1) = IFNULL(?, -1)
          AND IFNULL(lesson_num, -1) = IFNULL(?, -1)`,
      [studentId, classId, type, unit ?? null, lessonNum ?? null]
    );
    res.status(201).json({ certificate: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/certificates/:id    teacher/admin — revoke
router.delete('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM certificates WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/certificates/:id/pdf    student-self or teacher/admin
router.get('/:id/pdf', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const cert = await db.get(
      `SELECT c.*, cls.name AS class_name, u.name AS student_name, t.name AS teacher_name, lessons.title AS lesson_title
         FROM certificates c
         JOIN classes cls   ON cls.id = c.class_id
         JOIN users u       ON u.id = c.student_id
         LEFT JOIN users t  ON t.id = cls.teacher_id
         LEFT JOIN class_lessons lessons
           ON lessons.class_id = c.class_id
          AND lessons.unit = c.unit
          AND lessons.lesson_num = c.lesson_num
        WHERE c.id = ?`,
      [req.params.id]
    );
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    if (req.user.role === 'student' && req.user.id !== cert.student_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const filename = `certificate-${cert.type}-${cert.id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    streamCertificatePdf(res, {
      studentName: cert.student_name,
      className:   cert.class_name,
      teacherName: cert.teacher_name,
      type:        cert.type,
      unitTitle:   cert.unit ? `Unit ${cert.unit} · ${UNIT_TITLES[cert.unit] || ''}`.trim() : null,
      lessonTitle: cert.lesson_title,
      score:       cert.score,
      issuedAt:    cert.issued_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
