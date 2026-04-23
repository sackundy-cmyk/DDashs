// ============================================================
//  server/routes/lessons.js
// ============================================================

import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

const curriculum = JSON.parse(
  readFileSync(join(__dirname, '../../src/data/curriculum.json'), 'utf8')
);

// GET /api/lessons
router.get('/', (_, res) => res.json(curriculum));

// GET /api/lessons/:unit/:lesson
router.get('/:unit/:lesson', (req, res) => {
  const unit   = parseInt(req.params.unit);
  const lesson = parseInt(req.params.lesson);
  const unitData = curriculum.units.find(u => u.id === unit);
  if (!unitData) return res.status(404).json({ error: 'Unit not found' });
  const lessonData = unitData.lessons.find(l => l.id === lesson);
  if (!lessonData) return res.status(404).json({ error: 'Lesson not found' });
  res.json({ unit: unitData.id, unitTitle: unitData.title, lesson: lessonData });
});

export default router;
