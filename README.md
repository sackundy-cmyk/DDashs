# D-DASH — Interactive Maths Learning Platform

Interactive mathematics platform for primary school students (ages 8–12).

## Quick Start

```bash
npm install
cp .env.example .env
npm run start        # frontend :3000 + API :4000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Frontend dev server (port 3000) |
| `npm run server` | Express API (port 4000) |
| `npm run start` | Both concurrently |
| `npm run build` | Production build |
| `npm run test` | Vitest unit tests |
| `npm run lint` | ESLint |

## Lesson Inventory (14 lessons)

| Unit | # | Topic |
|---|---|---|
| 1 | 1–4 | Decimals: place value, ordering, ×÷10/100, rounding |
| 2 | 1–5 | Algebra: sequences, properties, function machines, formulae, equations |
| 3 | 1–4 | Numbers: divisibility, multiples/LCM, factors/HCF, prime/square |
| 5 | 1 | Calculations: brackets |

## Adding a lesson

1. Create `src/lessons/unitX/LN_TopicName.jsx`
2. Register in `LESSON_MAP` in `src/App.jsx`
3. Add metadata to `src/data/unitX/lessonN.json`
4. Add entry in `src/data/curriculum.json`

## Key rules (see CLAUDE.md for full details)

- English only
- 3-attempt feedback: correct/wrong → hint → reveal
- Never reveal answers before attempt 3
- All colours from `tokens.css`, font: Nunito
- Mobile-first: touch drag polyfill handles tablets

## API

```
GET  /api/health
GET  /api/lessons
GET  /api/lessons/:unit/:lesson
POST /api/progress
GET  /api/progress/:studentId
POST /api/students
GET  /api/students/:id
```

## Tech

React 18 + Vite + React Router v6 | Express + SQLite | Vitest
# DDash
# DDash
