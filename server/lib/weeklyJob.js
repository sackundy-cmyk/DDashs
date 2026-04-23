// ============================================================
//  server/lib/weeklyJob.js — Sunday 18:00 parent-email cron
// ============================================================

import cron from 'node-cron';
import crypto from 'crypto';
import { getDb } from '../db/connection.js';
import { buildWeeklyReport } from './reportData.js';
import { sendMail, weeklyReportHtml } from './email.js';
import { streamWeeklyReportPdf } from './pdfReport.js';

function weekBounds(now = new Date()) {
  const end = new Date(now);
  const start = new Date(now);
  start.setDate(start.getDate() - 7);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function ensureUnsubscribeToken(db, userId) {
  const u = await db.get('SELECT unsubscribe_token FROM users WHERE id = ?', [userId]);
  if (u?.unsubscribe_token) return u.unsubscribe_token;
  const token = crypto.randomBytes(18).toString('hex');
  await db.run('UPDATE users SET unsubscribe_token = ? WHERE id = ?', [token, userId]);
  return token;
}

async function renderPdfBuffer(data) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const fake = {
      write: (c) => chunks.push(Buffer.from(c)),
      end:   () => resolve(Buffer.concat(chunks)),
      on:    () => {},
      once:  () => {},
      emit:  () => {},
    };
    try { streamWeeklyReportPdf(fake, data); }
    catch (e) { reject(e); }
  });
}

export async function sendWeeklyReportForStudent(studentId, { period } = {}) {
  const db = await getDb();
  const student = await db.get('SELECT * FROM users WHERE id = ? AND role = ?', [studentId, 'student']);
  if (!student) throw new Error('Student not found');
  if (!student.parent_email) throw new Error('No parent_email set for student');
  if (student.weekly_report_enabled === 0) throw new Error('Parent unsubscribed');

  const { start, end } = period || weekBounds();
  const report = await buildWeeklyReport(db, studentId, start, end);
  const token = await ensureUnsubscribeToken(db, studentId);
  const appBase = process.env.APP_URL || 'http://localhost:3000';

  const html = weeklyReportHtml({
    student: report.student,
    parentName: student.parent_email.split('@')[0],
    summary: report.summary,
    lessons: report.lessons,
    strongest: report.strongest,
    weakest: report.weakest,
    teacherNote: report.teacherNote,
    unsubscribeUrl: `${appBase}/api/reports/unsubscribe?token=${token}`,
    appUrl: `${appBase}/student/dashboard`,
  });

  let pdfBuf = null;
  try { pdfBuf = await renderPdfBuffer({ ...report, parentName: student.parent_email.split('@')[0], period: `${start.slice(0,10)} → ${end.slice(0,10)}` }); }
  catch { /* PDF optional; fall back to HTML-only */ }

  try {
    const info = await sendMail({
      to: student.parent_email,
      subject: `D-DASH weekly update — ${report.student.name}`,
      html,
      attachments: pdfBuf ? [{ filename: 'ddash-weekly.pdf', content: pdfBuf }] : undefined,
    });
    await db.run(
      `INSERT INTO report_log (student_id, period_start, period_end, parent_email, status, error_message)
       VALUES (?,?,?,?,?,?)`,
      [studentId, start, end, student.parent_email, info.fake ? 'fake' : 'sent', null]
    );
    return { ok: true, fake: info.fake };
  } catch (err) {
    await db.run(
      `INSERT INTO report_log (student_id, period_start, period_end, parent_email, status, error_message)
       VALUES (?,?,?,?,?,?)`,
      [studentId, start, end, student.parent_email, 'error', err.message]
    );
    throw err;
  }
}

export async function runOnce() {
  const db = await getDb();
  const students = await db.all(`
    SELECT DISTINCT u.id FROM users u
    JOIN class_enrollments e ON e.student_id = u.id
    JOIN classes c            ON c.id = e.class_id
    WHERE u.role = 'student'
      AND u.deleted_at IS NULL
      AND c.archived_at IS NULL
      AND u.parent_email IS NOT NULL
      AND u.parent_email <> ''
      AND COALESCE(u.weekly_report_enabled, 1) = 1
      AND COALESCE(c.weekly_report_enabled, 1) = 1
  `);
  const period = weekBounds();
  const results = [];
  for (const s of students) {
    try {
      const r = await sendWeeklyReportForStudent(s.id, { period });
      results.push({ studentId: s.id, ok: true, fake: r.fake });
    } catch (err) {
      results.push({ studentId: s.id, ok: false, error: err.message });
    }
  }
  return results;
}

let _scheduled = false;
export function startWeeklyCron() {
  if (_scheduled) return;
  cron.schedule('0 18 * * 0', () => {
    runOnce().catch(err => console.error('[weeklyJob] failed:', err));
  });
  _scheduled = true;
  console.log('[weeklyJob] scheduled for Sundays 18:00');
}
