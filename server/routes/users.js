// ============================================================
//  server/routes/users.js — admin-only user management
// ============================================================

import { Router } from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

import { getDb } from '../db/connection.js';
import { requireAuth, requireRole } from './auth.js';

const router = Router();

const VALID_ROLES = ['student', 'teacher', 'admin'];

// GET /api/users?role=student|teacher|admin&includeDeleted=1 — list users (admin only)
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const db = await getDb();
    const { role, includeDeleted } = req.query;
    const showDeleted = includeDeleted === '1';
    const deletedClause = showDeleted ? '' : 'AND deleted_at IS NULL';
    const rows = role
      ? await db.all(
          `SELECT id, name, email, role, created_at, deleted_at FROM users WHERE role = ? ${deletedClause} ORDER BY name`,
          [role]
        )
      : await db.all(
          `SELECT id, name, email, role, created_at, deleted_at FROM users WHERE 1=1 ${deletedClause} ORDER BY role, name`
        );
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users — create teacher or student
// body: { name, email, password, role, classId?, classIds? }
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, email, password, role, classId, classIds, parent_email, phone } = req.body || {};

  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'name, email, password, role are required' });
  if (!VALID_ROLES.includes(role))
    return res.status(400).json({ error: `role must be one of ${VALID_ROLES.join(', ')}` });

  try {
    const db = await getDb();
    const normEmail = email.toLowerCase().trim();

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [normEmail]);
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hash = bcrypt.hashSync(password, 10);
    const result = await db.run(
      `INSERT INTO users (name, email, password_hash, role, parent_email, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), normEmail, hash, role, parent_email || null, phone || null]
    );
    const newId = result.lastID;

    // Student enrollment
    if (role === 'student' && classId) {
      await db.run(
        'INSERT OR IGNORE INTO class_enrollments (class_id, student_id) VALUES (?, ?)',
        [parseInt(classId, 10), newId]
      );
    }
    // Teacher class assignment (multi)
    if (role === 'teacher' && Array.isArray(classIds)) {
      for (const cid of classIds) {
        await db.run('UPDATE classes SET teacher_id = ? WHERE id = ?', [newId, parseInt(cid, 10)]);
      }
    }

    const user = await db.get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [newId]
    );
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/bulk-import — create multiple students (admin only)
// body: { classId?, rows: [{name, email, password?, parent_email?, phone?}] }
router.post('/bulk-import', requireAuth, requireRole('admin'), async (req, res) => {
  const { classId, rows } = req.body || {};
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: 'rows array is required' });

  try {
    const db = await getDb();
    let created = 0, skipped = 0;
    const errors = [];

    for (const row of rows) {
      const name  = (row.name  || '').trim();
      const email = (row.email || '').toLowerCase().trim();
      if (!name || !email) { errors.push({ email, reason: 'name or email missing' }); continue; }

      const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
      if (existing) { skipped++; continue; }

      const password = (row.password || '').trim() || 'Ddash@123';
      const hash = bcrypt.hashSync(password, 10);
      try {
        const result = await db.run(
          `INSERT INTO users (name, email, password_hash, role, parent_email, phone)
           VALUES (?, ?, ?, 'student', ?, ?)`,
          [name, email, hash, row.parent_email || null, row.phone || null]
        );
        if (classId) {
          await db.run(
            'INSERT OR IGNORE INTO class_enrollments (class_id, student_id) VALUES (?, ?)',
            [parseInt(classId, 10), result.lastID]
          );
        }
        created++;
      } catch (e) {
        errors.push({ email, reason: e.message });
      }
    }

    res.json({ created, skipped, errors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/reset-password — body: { password }
router.post('/:id/reset-password', requireAuth, requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { password } = req.body || {};
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'password (min 6 chars) required' });

  try {
    const db = await getDb();
    const hash = bcrypt.hashSync(password, 10);
    const result = await db.run(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hash, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id — update name/email/parent_email/phone, and for students, (re)enrol to a class
// body: { name?, email?, classId?, parent_email?, phone?, weekly_report_enabled? }
router.put('/:id', requireAuth, requireRole('admin', 'teacher'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, email, classId, parent_email, phone, weekly_report_enabled } = req.body || {};

  try {
    const db = await getDb();
    const existing = await db.get('SELECT id, role FROM users WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'User not found' });

    // Teachers can only edit students enrolled in their classes
    if (req.user.role === 'teacher') {
      const owns = await db.get(
        `SELECT 1 FROM class_enrollments e JOIN classes c ON c.id = e.class_id
         WHERE e.student_id = ? AND c.teacher_id = ? LIMIT 1`,
        [id, req.user.id]
      );
      if (!owns || existing.role !== 'student')
        return res.status(403).json({ error: 'Access denied' });
    }

    if (name) await db.run('UPDATE users SET name = ? WHERE id = ?', [name.trim(), id]);
    if (email) {
      const normEmail = email.toLowerCase().trim();
      const clash = await db.get(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [normEmail, id]
      );
      if (clash) return res.status(409).json({ error: 'Email already in use' });
      await db.run('UPDATE users SET email = ? WHERE id = ?', [normEmail, id]);
    }
    if (parent_email !== undefined) {
      await db.run('UPDATE users SET parent_email = ? WHERE id = ?', [parent_email || null, id]);
    }
    if (phone !== undefined) {
      await db.run('UPDATE users SET phone = ? WHERE id = ?', [phone || null, id]);
    }
    if (weekly_report_enabled !== undefined) {
      await db.run('UPDATE users SET weekly_report_enabled = ? WHERE id = ?', [weekly_report_enabled ? 1 : 0, id]);
    }
    if (existing.role === 'student' && classId) {
      await db.run(
        'INSERT OR IGNORE INTO class_enrollments (class_id, student_id) VALUES (?, ?)',
        [parseInt(classId, 10), id]
      );
    }

    const user = await db.get(
      'SELECT id, name, email, role, created_at, parent_email, phone, weekly_report_enabled FROM users WHERE id = ?',
      [id]
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id — soft-delete (admin only)
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id === req.user.id) return res.status(403).json({ error: 'Cannot delete your own account' });

  try {
    const db = await getDb();
    const target = await db.get('SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
    if (!target) return res.status(404).json({ error: 'User not found' });

    // If deleting a teacher who still owns active (non-archived) classes, block and return the class ids
    if (target.role === 'teacher') {
      const blocking = await db.all(
        `SELECT id FROM classes WHERE teacher_id = ? AND archived_at IS NULL`,
        [id]
      );
      if (blocking.length > 0)
        return res.status(409).json({
          error: 'Teacher still owns active classes. Archive or reassign them first.',
          blockingClassIds: blocking.map(r => r.id),
        });
    }

    await db.run(`UPDATE users SET deleted_at = datetime('now') WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/restore — undo soft-delete (admin only)
router.post('/:id/restore', requireAuth, requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const db = await getDb();
    const result = await db.run(`UPDATE users SET deleted_at = NULL WHERE id = ?`, [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/send-test-email — verify SMTP
router.post('/send-test-email', requireAuth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { sendMail } = await import('../lib/email.js');
    const info = await sendMail({
      to: req.body?.to || req.user.email,
      subject: 'D-DASH — test email',
      html: `<p>This is a test from D-DASH. If you see this, SMTP is configured.</p>`,
    });
    res.json({ ok: true, fake: info.fake });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
