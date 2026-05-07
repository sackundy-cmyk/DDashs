// ============================================================
//  server/routes/quizzes.js — quizzes / questions / attempts
// ============================================================

import { Router } from 'express';
import { getDb } from '../db/connection.js';
import { requireAuth, requireRole } from './auth.js';

const router = Router();

const VALID_TYPES = new Set(['mcq', 'digit', 'fraction', 'true-false']);

function parseConfig(row) {
  try { row.config = JSON.parse(row.config); } catch { row.config = {}; }
  return row;
}

// Strip the answer config so students can't see it client-side
function studentSafeQuestion(q) {
  const cfg = q.config || {};
  let safe;
  switch (q.type) {
    case 'mcq':
      safe = { options: cfg.options || [] };
      break;
    case 'digit':
      safe = { decimal: !!cfg.decimal };
      break;
    case 'fraction':
    case 'true-false':
    default:
      safe = {};
  }
  return { ...q, config: safe };
}

// ── List quizzes ─────────────────────────────────────────────
// Teacher/admin: all (own classes for teacher); Student: published in enrolled classes only
router.get('/', requireAuth, async (req, res) => {
  const { classId } = req.query;
  try {
    const db = await getDb();
    let rows;
    if (req.user.role === 'student') {
      rows = await db.all(
        `SELECT q.*, cls.name AS class_name, cls.color AS class_color,
                (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) AS question_count
           FROM quizzes q
           JOIN classes cls ON cls.id = q.class_id
           JOIN class_enrollments e ON e.class_id = q.class_id AND e.student_id = ?
          WHERE q.deleted_at IS NULL
            AND q.published = 1
            ${classId ? 'AND q.class_id = ?' : ''}
          ORDER BY q.created_at DESC`,
        classId ? [req.user.id, classId] : [req.user.id]
      );
      // Annotate with this student's latest attempt
      for (const q of rows) {
        const att = await db.get(
          `SELECT pct, score, max_score, submitted_at FROM quiz_attempts
            WHERE quiz_id = ? AND student_id = ? AND submitted_at IS NOT NULL
            ORDER BY submitted_at DESC LIMIT 1`,
          [q.id, req.user.id]
        );
        q.latest_attempt = att || null;
      }
    } else {
      const params = [];
      let where = 'q.deleted_at IS NULL';
      if (classId) { where += ' AND q.class_id = ?'; params.push(classId); }
      if (req.user.role === 'teacher') {
        where += ' AND cls.teacher_id = ?'; params.push(req.user.id);
      }
      rows = await db.all(
        `SELECT q.*, cls.name AS class_name, cls.color AS class_color,
                (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) AS question_count,
                (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id AND submitted_at IS NOT NULL) AS attempt_count
           FROM quizzes q
           JOIN classes cls ON cls.id = q.class_id
          WHERE ${where}
          ORDER BY q.created_at DESC`,
        params
      );
    }
    res.json({ quizzes: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get one quiz with questions ──────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const quiz = await db.get(
      `SELECT q.*, cls.name AS class_name, cls.color AS class_color
         FROM quizzes q JOIN classes cls ON cls.id = q.class_id
        WHERE q.id = ? AND q.deleted_at IS NULL`,
      [req.params.id]
    );
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Auth checks
    if (req.user.role === 'student') {
      if (!quiz.published) return res.status(403).json({ error: 'Forbidden' });
      const enrolled = await db.get(
        'SELECT 1 FROM class_enrollments WHERE class_id = ? AND student_id = ?',
        [quiz.class_id, req.user.id]
      );
      if (!enrolled) return res.status(403).json({ error: 'Not enrolled in this class' });
    }

    const questions = (await db.all(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index, id',
      [req.params.id]
    )).map(parseConfig);

    const safeQuestions = req.user.role === 'student'
      ? questions.map(studentSafeQuestion)
      : questions;

    res.json({ quiz, questions: safeQuestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Create quiz (with questions) ─────────────────────────────
router.post('/', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const { classId, title, description, timeLimit, passMark, published, questions } = req.body;
  if (!classId || !title) return res.status(400).json({ error: 'classId and title required' });
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'At least one question required' });
  }
  try {
    const db = await getDb();
    const r = await db.run(
      `INSERT INTO quizzes (class_id, title, description, time_limit_seconds, pass_mark, published, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [classId, title, description || null, timeLimit || null,
       passMark ?? 60, published ? 1 : 0, req.user.id]
    );
    const quizId = r.lastID;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!VALID_TYPES.has(q.type)) {
        return res.status(400).json({ error: `Invalid question type: ${q.type}` });
      }
      await db.run(
        `INSERT INTO quiz_questions (quiz_id, type, prompt, config, points, order_index)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [quizId, q.type, q.prompt || '', JSON.stringify(q.config || {}), q.points || 1, i]
      );
    }
    res.status(201).json({ id: quizId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update quiz ──────────────────────────────────────────────
router.put('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const { title, description, timeLimit, passMark, published, questions } = req.body;
  try {
    const db = await getDb();
    const quiz = await db.get(
      `SELECT q.*, cls.teacher_id FROM quizzes q JOIN classes cls ON cls.id = q.class_id WHERE q.id = ?`,
      [req.params.id]
    );
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    if (req.user.role === 'teacher' && quiz.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await db.run(
      `UPDATE quizzes
          SET title = COALESCE(?, title),
              description = COALESCE(?, description),
              time_limit_seconds = ?,
              pass_mark = COALESCE(?, pass_mark),
              published = COALESCE(?, published),
              updated_at = datetime('now')
        WHERE id = ?`,
      [title ?? null, description ?? null, timeLimit ?? null, passMark ?? null,
       published == null ? null : (published ? 1 : 0), req.params.id]
    );
    if (Array.isArray(questions)) {
      // Replace question set
      await db.run('DELETE FROM quiz_questions WHERE quiz_id = ?', [req.params.id]);
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!VALID_TYPES.has(q.type)) continue;
        await db.run(
          `INSERT INTO quiz_questions (quiz_id, type, prompt, config, points, order_index)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [req.params.id, q.type, q.prompt || '', JSON.stringify(q.config || {}), q.points || 1, i]
        );
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Toggle publish ───────────────────────────────────────────
router.post('/:id/publish', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const db = await getDb();
    const quiz = await db.get('SELECT published FROM quizzes WHERE id = ?', [req.params.id]);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const next = quiz.published ? 0 : 1;
    await db.run('UPDATE quizzes SET published = ?, updated_at = datetime(\'now\') WHERE id = ?', [next, req.params.id]);
    res.json({ published: !!next });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Soft delete ──────────────────────────────────────────────
router.delete('/:id', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const db = await getDb();
    await db.run('UPDATE quizzes SET deleted_at = datetime(\'now\') WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start an attempt ─────────────────────────────────────────
router.post('/:id/attempts', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const db = await getDb();
    const quiz = await db.get(
      'SELECT * FROM quizzes WHERE id = ? AND deleted_at IS NULL AND published = 1',
      [req.params.id]
    );
    if (!quiz) return res.status(404).json({ error: 'Quiz not available' });
    const enrolled = await db.get(
      'SELECT 1 FROM class_enrollments WHERE class_id = ? AND student_id = ?',
      [quiz.class_id, req.user.id]
    );
    if (!enrolled) return res.status(403).json({ error: 'Not enrolled' });

    const r = await db.run(
      `INSERT INTO quiz_attempts (quiz_id, student_id, started_at) VALUES (?, ?, datetime('now'))`,
      [req.params.id, req.user.id]
    );
    res.status(201).json({ attemptId: r.lastID, startedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Submit an attempt + auto-grade ───────────────────────────
function gradeQuestion(question, response) {
  const cfg = question.config || {};
  switch (question.type) {
    case 'mcq': {
      return Number(response) === Number(cfg.correctIndex);
    }
    case 'digit': {
      const got = String(response ?? '').trim();
      const expected = String(cfg.answer ?? '').trim();
      if (cfg.tolerance != null) {
        const a = parseFloat(got), b = parseFloat(expected);
        return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= cfg.tolerance;
      }
      return got !== '' && got === expected;
    }
    case 'fraction': {
      const r = response || {};
      return Number(r.numerator) === Number(cfg.numerator)
          && Number(r.denominator) === Number(cfg.denominator);
    }
    case 'true-false': {
      return Boolean(response) === Boolean(cfg.correct);
    }
    default:
      return false;
  }
}

router.put('/:id/attempts/:attemptId/submit', requireAuth, requireRole('student'), async (req, res) => {
  const { responses } = req.body; // [{ question_id, response }]
  if (!Array.isArray(responses)) return res.status(400).json({ error: 'responses[] required' });
  try {
    const db = await getDb();
    const attempt = await db.get(
      'SELECT * FROM quiz_attempts WHERE id = ? AND quiz_id = ? AND student_id = ?',
      [req.params.attemptId, req.params.id, req.user.id]
    );
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.submitted_at) return res.status(409).json({ error: 'Already submitted' });

    const questions = (await db.all(
      'SELECT * FROM quiz_questions WHERE quiz_id = ?',
      [req.params.id]
    )).map(parseConfig);

    const qById = new Map(questions.map(q => [q.id, q]));
    let score = 0, maxScore = 0;
    const graded = responses.map(r => {
      const q = qById.get(Number(r.question_id));
      if (!q) return { question_id: r.question_id, response: r.response, correct: false, points: 0 };
      maxScore += q.points || 1;
      const correct = gradeQuestion(q, r.response);
      if (correct) score += q.points || 1;
      return { question_id: q.id, response: r.response, correct, points: correct ? q.points || 1 : 0 };
    });
    // Account for unanswered questions in max
    for (const q of questions) {
      if (!responses.some(r => Number(r.question_id) === q.id)) maxScore += q.points || 1;
    }

    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    await db.run(
      `UPDATE quiz_attempts
          SET submitted_at = datetime('now'),
              responses    = ?,
              score        = ?,
              max_score    = ?,
              pct          = ?
        WHERE id = ?`,
      [JSON.stringify(graded), score, maxScore, pct, req.params.attemptId]
    );

    res.json({ attemptId: Number(req.params.attemptId), score, maxScore, pct, graded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Teacher: all attempts for a quiz ─────────────────────────
router.get('/:id/attempts', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      `SELECT a.*, u.name AS student_name, u.email AS student_email
         FROM quiz_attempts a
         JOIN users u ON u.id = a.student_id
        WHERE a.quiz_id = ? AND a.submitted_at IS NOT NULL
        ORDER BY a.submitted_at DESC`,
      [req.params.id]
    );
    res.json({ attempts: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Student: my attempts for a quiz ──────────────────────────
router.get('/:id/attempts/me', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all(
      `SELECT * FROM quiz_attempts WHERE quiz_id = ? AND student_id = ? ORDER BY started_at DESC`,
      [req.params.id, req.user.id]
    );
    res.json({ attempts: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
