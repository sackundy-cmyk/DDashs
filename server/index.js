// ============================================================
//  server/index.js — Express API server
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import { getDb } from './db/connection.js';
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
import { startWeeklyCron } from './lib/weeklyJob.js';

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
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
app.use('/api/notes',    notesRouter);

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

app.use((req, res) =>
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
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
