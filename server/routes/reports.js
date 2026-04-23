// ============================================================
//  server/routes/reports.js — analytics + PDF + send + unsub
// ============================================================

import { Router } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/connection.js';
import { requireAuth, requireRole } from './auth.js';
import { buildClassReport, buildWeeklyReport } from '../lib/reportData.js';
import { streamWeeklyReportPdf } from '../lib/pdfReport.js';
import { sendWeeklyReportForStudent } from '../lib/weeklyJob.js';

const router = Router();

async function assertClassAccess(db, classId, user) {
  if (user.role === 'admin') return true;
  if (user.role === 'teacher') {
    const row = await db.get('SELECT teacher_id FROM classes WHERE id = ?', [classId]);
    return row && row.teacher_id === user.id;
  }
  return false;
}

// GET /api/reports/class/:classId?unit=&studentId=
router.get('/class/:classId', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const classId = parseInt(req.params.classId, 10);
  try {
    const db = await getDb();
    if (!(await assertClassAccess(db, classId, req.user)))
      return res.status(403).json({ error: 'Access denied' });

    const data = await buildClassReport(db, classId, {
      unit: req.query.unit ? parseInt(req.query.unit, 10) : undefined,
      studentId: req.query.studentId ? parseInt(req.query.studentId, 10) : undefined,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function weekBounds(qFrom, qTo) {
  const to = qTo ? new Date(qTo) : new Date();
  const from = qFrom ? new Date(qFrom) : new Date(to.getTime() - 7 * 86400_000);
  return { from: from.toISOString(), to: to.toISOString() };
}

async function canAccessStudent(db, studentId, user) {
  if (user.role === 'admin') return true;
  if (user.role === 'teacher') {
    const row = await db.get(
      `SELECT 1 FROM class_enrollments e
       JOIN classes c ON c.id = e.class_id
       WHERE e.student_id = ? AND c.teacher_id = ? LIMIT 1`,
      [studentId, user.id]
    );
    return !!row;
  }
  return user.id === +studentId; // students can view their own report
}

// GET /api/reports/student/:id/weekly?from=&to=
router.get('/student/:id/weekly', requireAuth, async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  try {
    const db = await getDb();
    if (!(await canAccessStudent(db, studentId, req.user)))
      return res.status(403).json({ error: 'Access denied' });

    const { from, to } = weekBounds(req.query.from, req.query.to);
    const report = await buildWeeklyReport(db, studentId, from, to);
    res.json({ ...report, period: { from, to } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/student/:id/weekly.pdf
router.get('/student/:id/weekly.pdf', requireAuth, async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  try {
    const db = await getDb();
    if (!(await canAccessStudent(db, studentId, req.user)))
      return res.status(403).json({ error: 'Access denied' });

    const { from, to } = weekBounds(req.query.from, req.query.to);
    const report = await buildWeeklyReport(db, studentId, from, to);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${report.student.name.replace(/\W+/g,'-')}-weekly.pdf"`);
    streamWeeklyReportPdf(res, { ...report, period: `${from.slice(0,10)} → ${to.slice(0,10)}`, parentName: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports/student/:id/send-weekly — immediate send
router.post('/student/:id/send-weekly', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  try {
    const db = await getDb();
    if (!(await canAccessStudent(db, studentId, req.user)))
      return res.status(403).json({ error: 'Access denied' });

    const result = await sendWeeklyReportForStudent(studentId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/reports/unsubscribe?token=...
router.get('/unsubscribe', async (req, res) => {
  const token = (req.query.token || '').toString();
  if (!token) return res.status(400).send('Missing token');
  try {
    const db = await getDb();
    const user = await db.get('SELECT id, name FROM users WHERE unsubscribe_token = ?', [token]);
    if (!user) return res.status(404).send('Invalid or expired token');
    await db.run('UPDATE users SET weekly_report_enabled = 0 WHERE id = ?', [user.id]);
    res.setHeader('Content-Type', 'text/html');
    res.send(`<html><body style="font-family:sans-serif;padding:40px;text-align:center;">
      <h2>Unsubscribed</h2>
      <p>You will no longer receive weekly D-DASH reports for ${user.name}.</p>
    </body></html>`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /api/reports/cron/run-now — admin manual trigger
router.post('/cron/run-now', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { runOnce } = await import('../lib/weeklyJob.js');
    const results = await runOnce();
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
