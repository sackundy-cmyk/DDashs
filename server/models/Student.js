// ============================================================
//  server/models/Student.js
// ============================================================

import { getDb } from '../db/connection.js';

export const StudentModel = {
  /** Create or return a student by id */
  async upsert(id, name, className = '') {
    const db = await getDb();
    await db.run(`
      INSERT INTO students (id, name, class)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, class=excluded.class
    `, [id, name, className]);
    return this.findById(id);
  },

  async findById(id) {
    const db = await getDb();
    return db.get('SELECT * FROM students WHERE id = ?', [id]) || null;
  },

  async all() {
    const db = await getDb();
    return db.all('SELECT * FROM students ORDER BY name');
  },
};
