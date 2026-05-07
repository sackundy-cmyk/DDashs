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

// ── Start server (initialise DB first) ───────────────────────
async function start() {
  try {
    await getDb(); // ensures schema is created before accepting requests
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
