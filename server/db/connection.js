// ============================================================
//  server/db/connection.js — SQLite database setup + schema
//  Uses sqlite (promise wrapper) + sqlite3 (N-API, no build needed)
// ============================================================

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../ddash.db');

let _db = null;

export async function getDb() {
  if (_db) return _db;

  _db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  await _db.run("PRAGMA journal_mode = WAL");
  await _db.run("PRAGMA foreign_keys = ON");

  // ── New role-based schema ─────────────────────────────────
  await _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL CHECK(role IN ('admin','teacher','student')),
      created_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS classes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      grade       TEXT,
      teacher_id  INTEGER REFERENCES users(id),
      description TEXT,
      color       TEXT DEFAULT '#1E6FD9',
      created_at  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS class_enrollments (
      class_id    INTEGER NOT NULL REFERENCES classes(id),
      student_id  INTEGER NOT NULL REFERENCES users(id),
      enrolled_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (class_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS class_lessons (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id    INTEGER NOT NULL REFERENCES classes(id),
      unit        INTEGER NOT NULL,
      lesson_num  INTEGER NOT NULL,
      title       TEXT NOT NULL,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id      INTEGER NOT NULL REFERENCES users(id),
      class_id        INTEGER NOT NULL REFERENCES classes(id),
      unit            INTEGER NOT NULL,
      lesson_num      INTEGER NOT NULL,
      section_id      TEXT NOT NULL,
      attempts        INTEGER DEFAULT 0,
      completed       INTEGER DEFAULT 0,
      score           REAL,
      last_attempt_at TEXT DEFAULT (datetime('now')),
      UNIQUE(student_id, class_id, unit, lesson_num, section_id)
    );

    CREATE INDEX IF NOT EXISTS idx_lp_student     ON lesson_progress(student_id);
    CREATE INDEX IF NOT EXISTS idx_lp_class       ON lesson_progress(class_id);
    CREATE INDEX IF NOT EXISTS idx_enroll_student ON class_enrollments(student_id);

    CREATE TABLE IF NOT EXISTS lesson_drafts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id  INTEGER NOT NULL REFERENCES users(id),
      class_id    INTEGER NOT NULL REFERENCES classes(id),
      unit        INTEGER NOT NULL,
      lesson_num  INTEGER NOT NULL,
      state_json  TEXT NOT NULL,
      updated_at  TEXT DEFAULT (datetime('now')),
      UNIQUE(student_id, class_id, unit, lesson_num)
    );

    CREATE INDEX IF NOT EXISTS idx_drafts_student ON lesson_drafts(student_id);

    CREATE TABLE IF NOT EXISTS lesson_locks (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES users(id),
      class_id   INTEGER NOT NULL REFERENCES classes(id),
      unit       INTEGER NOT NULL,
      lesson_num INTEGER NOT NULL,
      locked     INTEGER NOT NULL DEFAULT 1,
      locked_by  INTEGER REFERENCES users(id),
      locked_at  TEXT DEFAULT (datetime('now')),
      UNIQUE(student_id, class_id, unit, lesson_num)
    );

    CREATE INDEX IF NOT EXISTS idx_locks_class   ON lesson_locks(class_id);
    CREATE INDEX IF NOT EXISTS idx_locks_student ON lesson_locks(student_id);

    CREATE TABLE IF NOT EXISTS student_notes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES users(id),
      author_id  INTEGER NOT NULL REFERENCES users(id),
      body       TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_notes_student ON student_notes(student_id);

    CREATE TABLE IF NOT EXISTS report_log (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id       INTEGER NOT NULL REFERENCES users(id),
      sent_at          TEXT DEFAULT (datetime('now')),
      period_start     TEXT,
      period_end       TEXT,
      parent_email     TEXT,
      status           TEXT NOT NULL,
      error_message    TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_report_log_student ON report_log(student_id);
  `);

  // ── Additive column migrations (idempotent) ───────────────
  const addColumnIfMissing = async (table, column, decl) => {
    const cols = await _db.all(`PRAGMA table_info(${table})`);
    if (!cols.some(c => c.name === column)) {
      await _db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
  };
  await addColumnIfMissing('users',   'parent_email',            'TEXT');
  await addColumnIfMissing('users',   'phone',                   'TEXT');
  await addColumnIfMissing('users',   'weekly_report_enabled',   'INTEGER DEFAULT 1');
  await addColumnIfMissing('users',   'unsubscribe_token',       'TEXT');
  await addColumnIfMissing('users',   'deleted_at',              'TEXT NULL');
  await addColumnIfMissing('classes', 'weekly_report_enabled',   'INTEGER DEFAULT 1');
  await addColumnIfMissing('classes', 'archived_at',             'TEXT NULL');

  // ── Legacy tables (kept for backward compatibility) ───────
  await _db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id       TEXT PRIMARY KEY,
      name     TEXT NOT NULL,
      class    TEXT DEFAULT '',
      created  TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS progress (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      unit       INTEGER NOT NULL,
      lesson     INTEGER NOT NULL,
      section_id TEXT NOT NULL,
      score      TEXT,
      attempts   INTEGER DEFAULT 0,
      completed  INTEGER DEFAULT 0,
      updated    TEXT DEFAULT (datetime('now')),
      UNIQUE(student_id, unit, lesson, section_id)
    );

    CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(student_id);
  `);

  return _db;
}
