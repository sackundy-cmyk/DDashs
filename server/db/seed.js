// ============================================================
//  server/db/seed.js — minimal seed for real-world use
//  Run: node server/db/seed.js
//
//  Seeds only:
//    - 1 admin    (admin1@ddash.com)
//    - 1 teacher  (teacher1@ddash.com)
//    - 1 demo student (demo@ddash.com)
//    - 1 class    (Grade 5 Mathematics, 22 lessons)
//    - demo student enrolled in the class
//
//  Add real teachers / students / classes via the admin UI.
// ============================================================

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt  = require('bcryptjs');

import { getDb } from './connection.js';

const hash = (pw) => bcrypt.hashSync(pw, 10);

async function seed() {
  const db = await getDb();
  console.log('🌱 Seeding D-DASH database (clean baseline)…');

  // ── Wipe existing data (order matters for FK constraints) ─────
  await db.exec(`
    DELETE FROM quiz_attempts;
    DELETE FROM quiz_questions;
    DELETE FROM quizzes;
    DELETE FROM certificates;
    DELETE FROM lesson_progress;
    DELETE FROM lesson_drafts;
    DELETE FROM lesson_locks;
    DELETE FROM class_enrollments;
    DELETE FROM class_lessons;
    DELETE FROM student_notes;
    DELETE FROM report_log;
    DELETE FROM classes;
    DELETE FROM users;
  `);

  async function insertUser(name, email, pw, role) {
    const r = await db.run(
      `INSERT INTO users (name, email, password_hash, role, weekly_report_enabled)
       VALUES (?, ?, ?, ?, 1)`,
      [name, email, hash(pw), role]
    );
    return r.lastID;
  }

  async function insertClass(name, grade, teacherId, description, color) {
    const r = await db.run(
      'INSERT INTO classes (name, grade, teacher_id, description, color) VALUES (?, ?, ?, ?, ?)',
      [name, grade, teacherId, description, color]
    );
    return r.lastID;
  }

  // ── 1. Users ─────────────────────────────────────────────────

  const adminId   = await insertUser('Admin',                'admin1@ddash.com',   'Admin@123',   'admin');
  const teacherId = await insertUser('Ms. Sarah Collins',    'teacher1@ddash.com', 'Teacher@123', 'teacher');
  const demoId    = await insertUser('Demo Student',         'demo@ddash.com',     'Demo@123',    'student');

  console.log('  ✓ 3 users created (1 admin, 1 teacher, 1 demo student)');

  // ── 2. Class: Grade 5 Mathematics ─────────────────────────────

  const classId = await insertClass(
    'Grade 5 Mathematics', 'Grade 5', teacherId,
    'Full Grade 5 maths curriculum — Decimals, Algebra, Multiples & Primes, Addition & Subtraction, Calculations',
    '#1E6FD9'
  );

  const lessons = [
    // Unit 1 — Decimals
    { unit: 1, num: 1, title: 'Place Value in Decimals' },
    { unit: 1, num: 2, title: 'Thousandths' },
    { unit: 1, num: 3, title: 'Multiply & Divide by 10/100' },
    { unit: 1, num: 4, title: 'Rounding Decimals' },
    // Unit 2 — Algebra & Patterns
    { unit: 2, num: 1, title: 'Sequences' },
    { unit: 2, num: 2, title: 'Negative Numbers' },
    { unit: 2, num: 3, title: 'Function Machines' },
    { unit: 2, num: 4, title: 'Patterns & Formulae' },
    { unit: 2, num: 5, title: 'Equations' },
    // Unit 3 — Multiples, Factors & Primes
    { unit: 3, num: 1, title: 'Rules of Divisibility' },
    { unit: 3, num: 2, title: 'Multiples & LCM' },
    { unit: 3, num: 3, title: 'Factors & HCF' },
    { unit: 3, num: 4, title: 'Prime & Square Numbers' },
    // Unit 4 — Addition & Subtraction
    { unit: 4, num: 1, title: 'Brackets & Order of Operations' },
    { unit: 4, num: 2, title: 'More Brackets' },
    { unit: 4, num: 3, title: 'Inverse Operations' },
    { unit: 4, num: 4, title: 'Mental Addition & Subtraction' },
    { unit: 4, num: 5, title: 'Large Numbers' },
    { unit: 4, num: 6, title: 'Decimal Tenths — Part 1' },
    { unit: 4, num: 7, title: 'Decimal Tenths — Part 2' },
    { unit: 4, num: 8, title: 'Decimal Hundredths' },
    // Unit 5 — Calculations
    { unit: 5, num: 1, title: 'Brackets' },
  ];

  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    await db.run(
      'INSERT INTO class_lessons (class_id, unit, lesson_num, title, order_index) VALUES (?, ?, ?, ?, ?)',
      [classId, l.unit, l.num, l.title, i]
    );
  }

  console.log(`  ✓ 1 class created (Grade 5 Mathematics, ${lessons.length} lessons)`);

  // ── 3. Demo enrollment in Grade 5 ───────────────────────────

  await db.run(
    'INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)',
    [classId, demoId]
  );

  console.log('  ✓ demo student enrolled in Grade 5');

  // ── 4. Class: Grade 6 Mathematics — Book A ───────────────────

  const g6Id = await insertClass(
    'Grade 6 Mathematics — Book A', 'Grade 6', teacherId,
    'Grade 6 Mathematics Book A — Integers and Number Lines',
    '#0F766E'
  );

  await db.run(
    'INSERT INTO class_lessons (class_id, unit, lesson_num, title, order_index) VALUES (?, ?, ?, ?, ?)',
    [g6Id, 7, 1, 'Integers on a Number Line', 0]
  );
  await db.run(
    'INSERT INTO class_lessons (class_id, unit, lesson_num, title, order_index) VALUES (?, ?, ?, ?, ?)',
    [g6Id, 7, 2, 'Rounding Large Numbers', 1]
  );

  console.log('  ✓ 1 class created (Grade 6 Mathematics — Book A, 2 lessons)');

  // ── 5. Demo enrollment in Grade 6 ───────────────────────────

  await db.run(
    'INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)',
    [g6Id, demoId]
  );

  console.log('  ✓ demo student enrolled in Grade 6');

  // ── Summary ──────────────────────────────────────────────────
  console.log('\n✅ Seed complete.');
  console.log('\nLogin credentials:');
  console.log('  Admin:   admin1@ddash.com   / Admin@123');
  console.log('  Teacher: teacher1@ddash.com / Teacher@123');
  console.log('  Student: demo@ddash.com     / Demo@123');
  console.log('\nAdd more teachers / students / classes via the admin UI.');

  // Suppress unused-var lint
  void adminId;
  void g6Id;
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
