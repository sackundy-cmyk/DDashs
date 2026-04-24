// ============================================================
//  server/db/seed.js — Seed demo data
//  Run: node server/db/seed.js
// ============================================================

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt  = require('bcryptjs');

import { getDb } from './connection.js';

const hash = (pw) => bcrypt.hashSync(pw, 10);

async function seed() {
  const db = await getDb();
  console.log('🌱 Seeding D-DASH database…');

  // ── Wipe existing data (order matters for FK constraints) ─────
  await db.exec(`
    DELETE FROM lesson_progress;
    DELETE FROM lesson_drafts;
    DELETE FROM lesson_locks;
    DELETE FROM class_enrollments;
    DELETE FROM class_lessons;
    DELETE FROM classes;
    DELETE FROM student_notes;
    DELETE FROM report_log;
    DELETE FROM users;
  `);

  // ── Helpers ───────────────────────────────────────────────────
  async function insertUser(name, email, pw, role, extras = {}) {
    const r = await db.run(
      `INSERT INTO users (name, email, password_hash, role, parent_email, phone, weekly_report_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hash(pw), role,
       extras.parentEmail || null,
       extras.phone || null,
       extras.weeklyReportEnabled ?? 1]
    );
    return r.lastID;
  }

  async function insertNote(studentId, authorId, body, daysAgo = 0) {
    await db.run(
      `INSERT INTO student_notes (student_id, author_id, body, created_at)
       VALUES (?, ?, ?, datetime('now', ? || ' days'))`,
      [studentId, authorId, body, String(daysAgo)]
    );
  }

  async function insertClass(name, grade, teacherId, description, color) {
    const r = await db.run(
      'INSERT INTO classes (name, grade, teacher_id, description, color) VALUES (?, ?, ?, ?, ?)',
      [name, grade, teacherId, description, color]
    );
    return r.lastID;
  }

  async function insertEnrollment(classId, studentId) {
    await db.run(
      'INSERT OR IGNORE INTO class_enrollments (class_id, student_id) VALUES (?, ?)',
      [classId, studentId]
    );
  }

  async function insertClassLesson(classId, unit, lessonNum, title, orderIndex) {
    await db.run(
      'INSERT INTO class_lessons (class_id, unit, lesson_num, title, order_index) VALUES (?, ?, ?, ?, ?)',
      [classId, unit, lessonNum, title, orderIndex]
    );
  }

  async function insertProgress(studentId, classId, unit, lessonNum, sectionId, attempts, completed, score, daysOffset) {
    await db.run(`
      INSERT OR REPLACE INTO lesson_progress
        (student_id, class_id, unit, lesson_num, section_id, attempts, completed, score, last_attempt_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ? || ' days'))
    `, [studentId, classId, unit, lessonNum, sectionId, attempts, completed, score, String(daysOffset)]);
  }

  // ── 1. Users ─────────────────────────────────────────────────

  // Admins
  const admin1Id = await insertUser('Dr. Amy Watson',   'admin1@ddash.com', 'Admin@123',   'admin');
  const admin2Id = await insertUser('Mr. David Clarke', 'admin2@ddash.com', 'Admin@123',   'admin');

  // Teachers
  const teacher1Id = await insertUser('Ms. Sarah Collins',  'teacher1@ddash.com', 'Teacher@123', 'teacher');
  const teacher2Id = await insertUser('Mr. James Thornton', 'teacher2@ddash.com', 'Teacher@123', 'teacher');

  // Demo student (enrolled in all classes)
  const demoId = await insertUser('Jordan Bailey', 'demo@ddash.com', 'Demo@123', 'student', {
    parentEmail: 'parent-demo@example.com',
    phone: '+1 (555) 010-0001',
  });

  // 30 students — parent_email populated for first ~20 to give the Settings page real data
  const STUDENT_NAMES = [
    'Aisha Rahman',     'Benjamin Foster',  'Chloe Martinez',  'Daniel Kim',
    'Emma Thompson',    'Farid Hassan',     'Grace Liu',       'Hassan Ali',
    'Isabella Carter',  'James Wilson',     'Kira Patel',      'Liam O\'Brien',
    'Maya Johnson',     'Noah Baker',       'Olivia Chen',     'Patrick Nguyen',
    'Quinn Edwards',    'Rachel Torres',    'Sam Mitchell',    'Tiana Scott',
    'Uma Kapoor',       'Victor Osei',      'Wendy Park',      'Xavier Davis',
    'Yasmine El-Amin',  'Zara Ahmed',       'Alex Turner',     'Bella Santos',
    'Carlos Rivera',    'Diana Moore',
  ];

  function parentEmailFor(studentName) {
    const last = studentName.split(' ').slice(-1)[0].toLowerCase().replace(/[^a-z]/g, '');
    return `parent.${last}@example.com`;
  }

  const studentIds = [];
  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const num   = String(i + 1).padStart(2, '0');
    const email = `student${num}@ddash.com`;
    const extras = i < 20
      ? { parentEmail: parentEmailFor(STUDENT_NAMES[i]), phone: `+1 (555) 010-${String(100 + i).padStart(4, '0')}` }
      : {};
    const id    = await insertUser(STUDENT_NAMES[i], email, 'Student@123', 'student', extras);
    studentIds.push(id);
  }

  console.log(`  ✓ ${studentIds.length + 5} users created (2 admins, 2 teachers, demo, 30 students)`);

  // ── 2. Classes ────────────────────────────────────────────────

  const class1Id = await insertClass(
    'Grade 5 Mathematics', 'Grade 5', teacher1Id,
    'Full Grade 5 maths curriculum — Decimals, Algebra, Multiples & Primes, Calculations',
    '#1E6FD9'
  );

  const class2Id = await insertClass(
    'Grade 4 Numbers', 'Grade 4', teacher1Id,
    'Number bonds, addition and subtraction strategies for Grade 4',
    '#16A34A'
  );

  const class3Id = await insertClass(
    'Grade 6 Algebra', 'Grade 6', teacher2Id,
    'Introduction to linear equations, inequalities and graphs for Grade 6',
    '#7C3AED'
  );

  const class4Id = await insertClass(
    'Grade 5 Problem Solving', 'Grade 5', teacher2Id,
    'Word problems, multi-step reasoning and logic puzzles for Grade 5',
    '#D97706'
  );

  const class5Id = await insertClass(
    'Grade 4 Fractions', 'Grade 4', teacher1Id,
    'Introduction to fractions, equivalent fractions and simple addition for Grade 4',
    '#DC2626'
  );

  console.log('  ✓ 5 classes created');

  // ── 3. Class Lessons ─────────────────────────────────────────

  // Class 1: Grade 5 Mathematics — all 22 real lessons
  const grade5Lessons = [
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
  for (let i = 0; i < grade5Lessons.length; i++) {
    const l = grade5Lessons[i];
    await insertClassLesson(class1Id, l.unit, l.num, l.title, i);
  }

  // Class 2: Grade 4 Numbers — placeholder
  const class2Lessons = [
    { unit: 4, num: 1, title: 'Number Bonds to 100' },
    { unit: 4, num: 2, title: 'Addition Strategies' },
    { unit: 4, num: 3, title: 'Subtraction Strategies' },
  ];
  for (let i = 0; i < class2Lessons.length; i++) {
    const l = class2Lessons[i];
    await insertClassLesson(class2Id, l.unit, l.num, l.title, i);
  }

  // Class 3: Grade 6 Algebra — placeholder
  const class3Lessons = [
    { unit: 6, num: 1, title: 'Writing & Solving Linear Equations' },
    { unit: 6, num: 2, title: 'Inequalities on a Number Line' },
    { unit: 6, num: 3, title: 'Plotting Straight-Line Graphs' },
    { unit: 6, num: 4, title: 'Systems of Equations' },
  ];
  for (let i = 0; i < class3Lessons.length; i++) {
    const l = class3Lessons[i];
    await insertClassLesson(class3Id, l.unit, l.num, l.title, i);
  }

  // Class 4: Grade 5 Problem Solving — placeholder
  const class4Lessons = [
    { unit: 7, num: 1, title: 'One-Step Word Problems' },
    { unit: 7, num: 2, title: 'Multi-Step Word Problems' },
    { unit: 7, num: 3, title: 'Logic Puzzles' },
  ];
  for (let i = 0; i < class4Lessons.length; i++) {
    const l = class4Lessons[i];
    await insertClassLesson(class4Id, l.unit, l.num, l.title, i);
  }

  // Class 5: Grade 4 Fractions — placeholder
  const class5Lessons = [
    { unit: 8, num: 1, title: 'Introduction to Fractions' },
    { unit: 8, num: 2, title: 'Equivalent Fractions' },
    { unit: 8, num: 3, title: 'Adding Fractions with Like Denominators' },
  ];
  for (let i = 0; i < class5Lessons.length; i++) {
    const l = class5Lessons[i];
    await insertClassLesson(class5Id, l.unit, l.num, l.title, i);
  }

  console.log('  ✓ Class lessons created (14 real + 13 placeholder)');

  // ── 4. Enrollments ────────────────────────────────────────────

  // Demo student → all 5 classes
  for (const cid of [class1Id, class2Id, class3Id, class4Id, class5Id]) {
    await insertEnrollment(cid, demoId);
  }

  // Distribute 30 students across classes (6–10 per class, some overlap)
  const enrollMap = {
    [class1Id]: studentIds.slice(0, 9),   // students 1–9
    [class2Id]: studentIds.slice(5, 13),  // students 6–13
    [class3Id]: studentIds.slice(12, 21), // students 13–21
    [class4Id]: studentIds.slice(17, 25), // students 18–25
    [class5Id]: studentIds.slice(22, 30), // students 23–30
  };

  for (const [classId, ids] of Object.entries(enrollMap)) {
    for (const sid of ids) {
      await insertEnrollment(Number(classId), sid);
    }
  }

  const totalEnrollments = 5 + Object.values(enrollMap).reduce((s, a) => s + a.length, 0);
  console.log(`  ✓ ${totalEnrollments} enrollments created`);

  // ── 5. Progress Data ─────────────────────────────────────────

  // Section IDs match what React lesson components emit (s1, s2, ...).
  // Counts reflect the post-rebuild structure of each lesson.
  const LESSON_SECTIONS = {
    '1-1': ['s1','s2','s3','s4','s5','s6'],   // Place Value: 6 sections
    '1-2': ['s1','s2','s3'],                   // Thousandths: 3 sections
    '1-3': ['s1','s2','s3','s4'],              // Multiply/Divide: 4 sections
    '1-4': ['s1','s2'],                        // Rounding: 2 sections
    '2-1': ['s1','s2'],                        // Sequences: 2 sections
    '2-2': ['s1','s2'],                        // Negative Numbers: 2 sections
    '2-3': ['s1','s2'],                        // Function Machines: 2 sections
    '2-4': ['s1'],                             // Patterns & Formulae: 1 section
    '2-5': ['s1','s2','s3'],                   // Equations: 3 sections
    '3-1': ['s1','s2'],                        // Divisibility: 2 sections
    '3-2': ['s1','s2','s3','s4','s5'],         // Multiples & LCM: 5 sections
    '3-3': ['s1','s2','s3'],                   // Factors & HCF: 3 sections
    '3-4': ['s1','s2','s3'],                   // Prime & Square: 3 sections
    '5-1': ['s1','s2','s3','s4'],              // Brackets: 4 sections
  };

  async function makeProgress(studentId, classId, unit, lessonNum, completionRate, scoreRange) {
    const key = `${unit}-${lessonNum}`;
    const sections = LESSON_SECTIONS[key] || ['s1', 's2', 's3'];
    const numComplete = Math.floor(sections.length * completionRate);
    const daysAgo = -(Math.floor(Math.random() * 20) + 1);

    for (let i = 0; i < numComplete; i++) {
      const secId = sections[i];
      const score = scoreRange[0] + Math.random() * (scoreRange[1] - scoreRange[0]);
      const attempts = Math.floor(Math.random() * 3) + 1;
      await insertProgress(studentId, classId, unit, lessonNum, secId, attempts, 1, Math.round(score), daysAgo);
    }

    // Partially started next section
    if (numComplete < sections.length && completionRate > 0) {
      const secId = sections[numComplete];
      await insertProgress(
        studentId, classId, unit, lessonNum, secId,
        Math.floor(Math.random() * 2) + 1, 0,
        scoreRange[0] + Math.random() * 20, daysAgo
      );
    }
  }

  // Grade 5 Math — 9 real students + demo
  const class1Students = [demoId, ...studentIds.slice(0, 9)];

  for (let idx = 0; idx < class1Students.length; idx++) {
    const sid = class1Students[idx];
    let profile;
    if (idx === 0)       profile = { rate: 0.6, score: [65, 90] };  // demo: moderate
    else if (idx <= 2)   profile = { rate: 0.9, score: [80, 100] }; // top achievers
    else if (idx <= 5)   profile = { rate: 0.6, score: [55, 80] };  // average
    else                 profile = { rate: 0.25, score: [25, 55] }; // needs help

    for (const l of grade5Lessons) {
      if (Math.random() < 0.7) { // 70% chance student has started this lesson
        const lessonRate = Math.random() < profile.rate ? profile.rate : profile.rate * 0.5;
        await makeProgress(sid, class1Id, l.unit, l.num, lessonRate, profile.score);
      }
    }
  }

  // Grade 4 Numbers — add minimal progress for a few students
  for (let i = 5; i < 10; i++) {
    const sid = studentIds[i];
    for (const l of [{ unit: 4, num: 1 }, { unit: 4, num: 2 }]) {
      if (Math.random() < 0.5) {
        await makeProgress(sid, class2Id, l.unit, l.num, 0.4 + (i - 5) * 0.1, [50, 80]);
      }
    }
  }

  // Demo student — add some progress across all classes
  for (const cid of [class2Id, class3Id, class4Id, class5Id]) {
    await insertProgress(demoId, cid, cid + 3, 1, 's1', 2, 0, 45, -3);
  }

  console.log('  ✓ Progress data seeded');

  // ── 6. Teacher notes (show up in weekly parent email within 7 days) ─
  await insertNote(demoId, teacher1Id,
    'Jordan has shown excellent focus this week — really strong on decimals. Encourage a bit more practice on rounding.',
    -2);
  await insertNote(studentIds[0], teacher1Id,
    'Aisha is consistently leading the class on algebra. Consider the extension problems on function machines.',
    -3);
  await insertNote(studentIds[6], teacher1Id,
    'Grace needs a little extra support with negative numbers — we\'ll revisit in Monday\'s session.',
    -1);

  console.log('  ✓ Teacher notes seeded');

  // ── Summary ───────────────────────────────────────────────────
  const [usersRow, classesRow, lessonsRow, enrolledRow, progressRow, notesRow, parentsRow] = await Promise.all([
    db.get('SELECT COUNT(*) as n FROM users'),
    db.get('SELECT COUNT(*) as n FROM classes'),
    db.get('SELECT COUNT(*) as n FROM class_lessons'),
    db.get('SELECT COUNT(*) as n FROM class_enrollments'),
    db.get('SELECT COUNT(*) as n FROM lesson_progress'),
    db.get('SELECT COUNT(*) as n FROM student_notes'),
    db.get("SELECT COUNT(*) as n FROM users WHERE role='student' AND parent_email IS NOT NULL"),
  ]);

  console.log('\n✅ Seed complete!');
  console.log(`   Users: ${usersRow.n}  Classes: ${classesRow.n}  Lessons: ${lessonsRow.n}`);
  console.log(`   Enrollments: ${enrolledRow.n}  Progress records: ${progressRow.n}`);
  console.log(`   Students with parent_email: ${parentsRow.n}  Teacher notes: ${notesRow.n}`);
  console.log('\nDemo credentials:');
  console.log('  Admin:   admin1@ddash.com   / Admin@123');
  console.log('  Teacher: teacher1@ddash.com / Teacher@123');
  console.log('  Student: demo@ddash.com     / Demo@123');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
