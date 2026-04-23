// ============================================================
//  server/models/User.js
// ============================================================

import { getDb } from '../db/connection.js';

export const UserModel = {
  async findById(id) {
    const db = await getDb();
    return db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]) || null;
  },

  async findByEmail(email) {
    const db = await getDb();
    return db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]) || null;
  },

  async allByRole(role) {
    const db = await getDb();
    return db.all('SELECT id, name, email, role, created_at FROM users WHERE role = ? ORDER BY name', [role]);
  },

  async all() {
    const db = await getDb();
    return db.all('SELECT id, name, email, role, created_at FROM users ORDER BY role, name');
  },

  /** Students enrolled in a specific class */
  async studentsInClass(classId) {
    const db = await getDb();
    return db.all(`
      SELECT u.id, u.name, u.email, u.created_at
      FROM users u
      JOIN class_enrollments ce ON ce.student_id = u.id
      WHERE ce.class_id = ? AND u.role = 'student'
      ORDER BY u.name
    `, [classId]);
  },
};
