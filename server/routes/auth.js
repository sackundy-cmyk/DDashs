// ============================================================
//  server/routes/auth.js — Authentication endpoints
// ============================================================

import { Router }  from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

import { getDb } from '../db/connection.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ddash_dev_secret_change_in_prod';
const JWT_EXPIRY  = '24h';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email.toLowerCase().trim()]);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const payload = { id: user.id, role: user.role, name: user.name, email: user.email };
    const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me  (requires Authorization: Bearer <token>)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout  (stateless JWT — client just discards token)
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

// ── Auth middleware (exported for use in other routes) ────────
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Authentication required' });

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}

export default router;
