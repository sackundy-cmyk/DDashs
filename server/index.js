// ============================================================
//  server/index.js — Express API server
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';
import { getDb } from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
import progressRouter from './routes/progress.js';
import lessonsRouter  from './routes/lessons.js';
import studentsRouter from './routes/students.js';
import authRouter     from './routes/auth.js';
import classesRouter  from './routes/classes.js';
import draftsRouter   from './routes/drafts.js';
import locksRouter    from './routes/locks.js';
import usersRouter    from './routes/users.js';
import reportsRouter  from './routes/reports.js';
import notesRouter    from './routes/notes.js';
import certificatesRouter from './routes/certificates.js';
import quizzesRouter      from './routes/quizzes.js';
import { startWeeklyCron } from './lib/weeklyJob.js';

// ── JWT secret guard ─────────────────────────────────────────
// In production we refuse to boot without a real secret so we never silently
// fall back to the dev default in routes/auth.js. In test/dev a default is OK.
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required in production. Refusing to start.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.warn('⚠  JWT_SECRET not set — using insecure dev default. Do not run in production.');
}

const app  = express();
const PORT = process.env.PORT || 4000;

// In production the frontend is served by this same Express process (same origin),
// so CORS is only needed in local dev. CORS_ORIGIN env var overrides for flexibility.
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
} else if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN.split(',') }));
}
app.use(express.json());

app.use('/api/auth',     authRouter);
app.use('/api/classes',  classesRouter);
app.use('/api/progress', progressRouter);
app.use('/api/lessons',  lessonsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/drafts',   draftsRouter);
app.use('/api/locks',    locksRouter);
app.use('/api/users',    usersRouter);
app.use('/api/reports',  reportsRouter);
app.use('/api/notes',        notesRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/quizzes',      quizzesRouter);

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

// API 404 — only for unmatched /api/* paths
app.use('/api', (req, res) =>
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
);

// Serve the built React app for all non-API routes (production)
app.use(express.static(join(__dirname, '../dist')));
app.get('*', (_req, res) =>
  res.sendFile(join(__dirname, '../dist/index.html'))
);

// ── Auto-seed if database is empty ───────────────────────────
async function autoSeedIfEmpty(db) {
  const { n } = await db.get('SELECT COUNT(*) as n FROM users');
  if (n > 0) return;
  console.log('📦 Empty database detected — running initial seed...');
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  const bcrypt  = require('bcryptjs');
  const hash    = pw => bcrypt.hashSync(pw, 10);

  const adminId   = (await db.run(`INSERT INTO users (name,email,password_hash,role,weekly_report_enabled) VALUES (?,?,?,?,1)`, ['Admin','admin1@ddash.com',hash('Admin@123'),'admin'])).lastID;
  const teacherId = (await db.run(`INSERT INTO users (name,email,password_hash,role,weekly_report_enabled) VALUES (?,?,?,?,1)`, ['Ms. Sarah Collins','teacher1@ddash.com',hash('Teacher@123'),'teacher'])).lastID;
  const demoId    = (await db.run(`INSERT INTO users (name,email,password_hash,role,weekly_report_enabled) VALUES (?,?,?,?,1)`, ['Demo Student','demo@ddash.com',hash('Demo@123'),'student'])).lastID;

  const classId = (await db.run(`INSERT INTO classes (name,grade,teacher_id,description,color) VALUES (?,?,?,?,?)`, ['Grade 5 Mathematics','Grade 5',teacherId,'Full Grade 5 maths curriculum','#1E6FD9'])).lastID;

  const lessons = [
    {unit:1,num:1,title:'Place Value in Decimals'},{unit:1,num:2,title:'Thousandths'},{unit:1,num:3,title:'Multiply & Divide by 10/100'},{unit:1,num:4,title:'Rounding Decimals'},
    {unit:2,num:1,title:'Sequences'},{unit:2,num:2,title:'Negative Numbers'},{unit:2,num:3,title:'Function Machines'},{unit:2,num:4,title:'Patterns & Formulae'},{unit:2,num:5,title:'Equations'},
    {unit:3,num:1,title:'Rules of Divisibility'},{unit:3,num:2,title:'Multiples & LCM'},{unit:3,num:3,title:'Factors & HCF'},{unit:3,num:4,title:'Prime & Square Numbers'},
    {unit:4,num:1,title:'Brackets & Order of Operations'},{unit:4,num:2,title:'More Brackets'},{unit:4,num:3,title:'Inverse Operations'},{unit:4,num:4,title:'Mental Addition & Subtraction'},{unit:4,num:5,title:'Large Numbers'},{unit:4,num:6,title:'Decimal Tenths — Part 1'},{unit:4,num:7,title:'Decimal Tenths — Part 2'},{unit:4,num:8,title:'Decimal Hundredths'},
    {unit:5,num:1,title:'Brackets'},
  ];
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    await db.run(`INSERT INTO class_lessons (class_id,unit,lesson_num,title,order_index) VALUES (?,?,?,?,?)`, [classId,l.unit,l.num,l.title,i]);
  }
  await db.run(`INSERT INTO class_enrollments (class_id,student_id) VALUES (?,?)`, [classId,demoId]);
  void adminId;
  console.log('✅ Auto-seed complete — admin1@ddash.com / Admin@123');
}

// ── Start server (initialise DB first) ───────────────────────
async function start() {
  try {
    const db = await getDb(); // ensures schema is created before accepting requests
    await autoSeedIfEmpty(db);
    if (process.env.NODE_ENV !== 'test') startWeeklyCron();
    app.listen(PORT, () =>
      console.log('D-DASH API running on http://localhost:' + PORT)
    );
  } catch (err) {
    console.error('Failed to initialise database:', err);
    process.exit(1);
  }
}

start();
