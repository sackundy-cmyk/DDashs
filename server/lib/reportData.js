// ============================================================
//  server/lib/reportData.js — aggregate progress → report rows
// ============================================================

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
let _curriculum = null;
function curriculum() {
  if (_curriculum) return _curriculum;
  const raw = readFileSync(join(__dirname, '../../src/data/curriculum.json'), 'utf8');
  _curriculum = JSON.parse(raw);
  return _curriculum;
}

function lessonTitle(unit, lessonNum) {
  const u = curriculum().units.find(x => x.id === unit);
  const l = u?.lessons.find(x => x.id === lessonNum);
  return l ? `${u.title} · ${l.title}` : `Unit ${unit} L${lessonNum}`;
}
function unitTitle(unit) {
  return curriculum().units.find(x => x.id === unit)?.title || `Unit ${unit}`;
}

/**
 * Build the weekly report payload for a single student between [from, to].
 * Returns { student, summary, lessons[], strongest, weakest, teacherNote }.
 */
export async function buildWeeklyReport(db, studentId, from, to) {
  const student = await db.get('SELECT id, name, email, parent_email FROM users WHERE id = ?', [studentId]);
  if (!student) throw new Error('Student not found');

  const thisWeek = await db.all(
    `SELECT unit, lesson_num, section_id, score, attempts, completed, last_attempt_at
     FROM lesson_progress
     WHERE student_id = ? AND last_attempt_at >= ? AND last_attempt_at < ?`,
    [studentId, from, to]
  );

  const prevFrom = new Date(new Date(from).getTime() - (new Date(to).getTime() - new Date(from).getTime())).toISOString();
  const prevWeek = await db.all(
    `SELECT score FROM lesson_progress
     WHERE student_id = ? AND last_attempt_at >= ? AND last_attempt_at < ?`,
    [studentId, prevFrom, from]
  );

  // Group this-week by lesson
  const byLesson = new Map();
  for (const r of thisWeek) {
    const key = `${r.unit}-${r.lesson_num}`;
    if (!byLesson.has(key)) byLesson.set(key, { unit: r.unit, lesson_num: r.lesson_num, scores: [], completedCount: 0, total: 0, lastDate: r.last_attempt_at });
    const g = byLesson.get(key);
    g.total += 1;
    if (r.completed) g.completedCount += 1;
    if (typeof r.score === 'number') g.scores.push(r.score);
    if (r.last_attempt_at > g.lastDate) g.lastDate = r.last_attempt_at;
  }

  const lessons = [...byLesson.values()].map(g => {
    const accuracy = g.scores.length ? g.scores.reduce((a, b) => a + b, 0) / g.scores.length : null;
    const status = g.total > 0 && g.completedCount >= g.total ? 'Completed'
      : g.completedCount > 0 ? 'In progress' : 'Started';
    return {
      unit: g.unit,
      lesson_num: g.lesson_num,
      title: lessonTitle(g.unit, g.lesson_num),
      accuracy,
      status,
      date: g.lastDate ? new Date(g.lastDate).toLocaleDateString() : '',
    };
  }).sort((a, b) => a.unit - b.unit || a.lesson_num - b.lesson_num);

  // Summary
  const thisAvg = avg(thisWeek.map(r => r.score).filter(s => typeof s === 'number'));
  const prevAvg = avg(prevWeek.map(r => r.score).filter(s => typeof s === 'number'));
  const summary = {
    lessonsCompleted: lessons.filter(l => l.status === 'Completed').length,
    sectionsCompleted: thisWeek.filter(r => r.completed).length,
    accuracy: thisAvg,
    accuracyDelta: (thisAvg != null && prevAvg != null) ? (thisAvg - prevAvg) : null,
  };

  // Strongest / weakest unit (within the week)
  const byUnit = {};
  for (const r of thisWeek) {
    if (typeof r.score !== 'number') continue;
    (byUnit[r.unit] = byUnit[r.unit] || []).push(r.score);
  }
  const unitAvgs = Object.entries(byUnit).map(([u, arr]) => ({ unit: +u, avg: avg(arr) }));
  unitAvgs.sort((a, b) => b.avg - a.avg);
  const strongest = unitAvgs.length ? `${unitTitle(unitAvgs[0].unit)} (${Math.round(unitAvgs[0].avg)}%)` : null;
  const weakest = unitAvgs.length > 1 ? `${unitTitle(unitAvgs[unitAvgs.length - 1].unit)} (${Math.round(unitAvgs[unitAvgs.length - 1].avg)}%)` : null;

  // Most recent teacher note
  const note = await db.get(
    `SELECT body, created_at FROM student_notes WHERE student_id = ?
     ORDER BY created_at DESC LIMIT 1`,
    [studentId]
  );
  const teacherNote = note && (new Date(note.created_at).getTime() > Date.now() - 7 * 86400_000) ? note.body : null;

  return { student, summary, lessons, strongest, weakest, teacherNote };
}

function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null; }

/**
 * Aggregate report for a whole class — optionally filtered by unit or student.
 * Returns { classInfo, perStudent[], perUnit[], trend[] }.
 */
export async function buildClassReport(db, classId, { unit, studentId } = {}) {
  const classInfo = await db.get('SELECT * FROM classes WHERE id = ?', [classId]);
  const params = [classId];
  let where = 'lp.class_id = ?';
  if (unit != null)      { where += ' AND lp.unit = ?';        params.push(+unit); }
  if (studentId != null) { where += ' AND lp.student_id = ?';  params.push(+studentId); }

  const rows = await db.all(
    `SELECT lp.student_id, u.name AS student_name,
            lp.unit, lp.lesson_num, lp.score, lp.completed, lp.last_attempt_at
     FROM lesson_progress lp
     JOIN users u ON u.id = lp.student_id
     WHERE ${where}`,
    params
  );

  // Per student
  const byStudent = new Map();
  for (const r of rows) {
    if (!byStudent.has(r.student_id)) byStudent.set(r.student_id, { id: r.student_id, name: r.student_name, scores: [], completed: 0, total: 0 });
    const s = byStudent.get(r.student_id);
    s.total += 1;
    if (r.completed) s.completed += 1;
    if (typeof r.score === 'number') s.scores.push(r.score);
  }
  const perStudent = [...byStudent.values()].map(s => ({
    id: s.id, name: s.name,
    sections: s.total, completed: s.completed,
    accuracy: avg(s.scores),
  })).sort((a, b) => (b.accuracy ?? -1) - (a.accuracy ?? -1));

  // Per unit
  const byUnit = {};
  for (const r of rows) {
    if (typeof r.score !== 'number') continue;
    (byUnit[r.unit] = byUnit[r.unit] || []).push(r.score);
  }
  const perUnit = Object.entries(byUnit).map(([u, arr]) => ({
    unit: +u, title: unitTitle(+u), accuracy: avg(arr), n: arr.length,
  })).sort((a, b) => a.unit - b.unit);

  // 8-week trend (class-wide accuracy)
  const trend = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const end = new Date(now); end.setDate(end.getDate() - i * 7);
    const start = new Date(end); start.setDate(start.getDate() - 7);
    const wk = await db.all(
      `SELECT score FROM lesson_progress
       WHERE class_id = ? AND last_attempt_at >= ? AND last_attempt_at < ? AND score IS NOT NULL`,
      [classId, start.toISOString(), end.toISOString()]
    );
    trend.push({
      label: `${start.getMonth() + 1}/${start.getDate()}`,
      accuracy: avg(wk.map(r => r.score)),
    });
  }

  return { classInfo, perStudent, perUnit, trend };
}
