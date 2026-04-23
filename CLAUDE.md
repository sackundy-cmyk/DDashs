# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**D-DASH** — interactive maths platform for ages 8–12. React 18 + Vite frontend, Express + SQLite (sqlite3 N-API, no native build) backend, JWT auth, three roles: student / teacher / admin. 14 lessons live across units 1, 2, 3, 5.

## Commands

```bash
npm run dev          # frontend on :3000 (proxies /api → :4000)
npm run server       # API on :4000
npm run start        # both concurrently
npm run build        # vite build → dist/  (currently 106 modules, must stay green)
npm run test         # vitest run
npm run test:watch
npm run lint         # eslint src --ext .js,.jsx
node server/db/seed.js   # reseed sqlite (creates ddash.db, demo users + classes + progress)
```

Demo accounts: `demo@ddash.com / Demo@123` (student), `teacher1@ddash.com / Teacher@123`, `admin1@ddash.com / Admin@123`.

Vite path aliases: `@`, `@components`, `@hooks`, `@utils`, `@data`, `@lessons`, `@pages`, `@contexts`.

## Architecture

### Routing & shell

`src/App.jsx` is the single router. All non-public routes are wrapped in `<ProtectedRoute roles={[...]}>` which checks `useAuth()` and redirects to the role's home dashboard on mismatch. Lessons are lazy-loaded via a `LESSON_MAP` keyed by `"${unitId}-${lessonId}"`. Student lesson routes are wrapped in `<DashboardLayout>` so the sidebar + breadcrumbs persist during lessons; the lesson page also renders its own sticky `<Header>` (back/prev/next + progress).

`DashboardLayout.jsx` provides sidebar nav (driven by `NAV_MAP[role]`), top bar, and `<Breadcrumbs />`. `Breadcrumbs.jsx` special-cases `/student/lesson/:unitId/:lessonId` against `curriculum.json`.

### Auth

`AuthContext.jsx` stores `{ user, token }` in React state + localStorage (`ddash_token`, `ddash_user`). All authed fetches send `Authorization: Bearer <token>`. Backend middleware: `requireAuth`, `requireRole(...roles)` from `server/routes/auth.js`. JWT secret is `process.env.JWT_SECRET` (dev fallback present). Login rejects users where `deleted_at IS NOT NULL`.

### Lesson state model — three layers

A lesson page typically uses three hooks:

1. **`useLessonDraft()`** (`src/hooks/useLessonDraft.js`) — persists in-progress UI state. Reads context (unit, lesson, classId) from URL: path `/student/lesson/:unit/:lesson` + query `?classId=`. Hydration: localStorage immediately, then backend `GET /api/drafts/:classId/:unit/:lesson`; if remote `updated_at` is newer it overrides. Writes: localStorage sync on every change, debounced `PUT` (1500ms) to backend. Returns `{ state, setState, setField, clearDraft, hydrated }`.

   `setField(key, initial)` is the workhorse — returns a setter that mimics `useState`'s API for one slot of `state`. **Pass `initial` whenever the field has a structured default that functional updaters depend on** (otherwise updaters receive `{}` and crash on e.g. `arr.includes`). Pattern in every converted lesson:
   ```js
   const q1Init = Object.fromEntries(QS.map(q=>[q.lbl,[]]));
   const { state, setField, clearDraft } = useLessonDraft();
   const prog = useProgress(N, { onAllDone: clearDraft });
   const q1 = state.q1 || q1Init, setQ1 = setField('q1', q1Init);
   // transient UI (hover, lazy shuffles) stays as plain useState
   ```
   Sets do not JSON-serialize — store as arrays (see `L4_PrimeSquare.jsx` `q3Tapped`).

2. **`useProgress(totalSections, { onAllDone })`** (`src/hooks/useProgress.js`) — section completion + summary trigger. `markDone(sectionId, { correct, total, attempts })` posts to `/api/progress` (fire-and-forget; pulls token, classId, unit, lesson from localStorage + URL). `onAllDone` fires once when every section completes — wire it to `clearDraft` so the resume snapshot is wiped on completion.

3. **`useAttempts(questionId)`** — per-question 3-attempt counter driving the feedback ladder.

### Backend

`server/index.js` mounts all routers. `getDb()` in `server/db/connection.js` opens SQLite (`ddash.db` at repo root), enables WAL + foreign keys, runs `CREATE TABLE IF NOT EXISTS` for all tables, then applies additive column migrations via `addColumnIfMissing()`. **Schema changes go in `connection.js` only — additive, never destructive.**

**Tables:** `users`, `classes`, `class_enrollments`, `class_lessons`, `lesson_progress`, `lesson_drafts`, `lesson_locks`, `student_notes`, `report_log`, plus legacy `students`/`progress`.

**Soft-delete pattern:** `users.deleted_at` (NULL = active) and `classes.archived_at` (NULL = active). All list queries filter these by default; pass `?includeDeleted=1` or `?includeArchived=1` (admin only) to opt in.

**Reports pipeline:** `server/lib/reportData.js` builds the weekly data shape → `server/lib/email.js` (nodemailer, fake-mode when SMTP unconfigured) + `server/lib/pdfReport.js` (pdfkit) → `server/lib/weeklyJob.js` runs via `node-cron` every Sunday 18:00, skipping deleted users and archived classes. Manual trigger: `POST /api/reports/cron/run-now` (admin).

### Modals & toasts

All dialogs use `src/components/Modal.jsx` as the base. `Toast.jsx` / `useToast()` provides the toast stack (mounted in `App.jsx` via `ToastProvider`). Shared modals in `src/components/modals/`: `ConfirmDialog`, `AddClassModal`, `EditClassModal`, `AddStudentModal`, `BulkImportStudentsModal`, `AddTeacherModal`, `EditTeacherModal`, `LessonDetailModal`, `StudentProfileModal`. `StudentNotesTimeline` is a standalone component (not a modal) mounted inside `StudentProfileModal`.

### Charts

Hand-rolled SVG components — no charting dependency. `src/components/charts/SvgBarChart.jsx` and `SvgLineChart.jsx`. Used on Reports pages.

## Lesson authoring rules (load-bearing — break a lesson if violated)

- **3-attempt feedback ladder, no exceptions:** attempt 1 = correct/wrong only, attempt 2 = hint, attempt 3+ = reveal + lock. Never reveal unselected correct answers before attempt 3. Special case: prime grid Q1 in U3L4 — check button never locks until all primes are found; wrong picks go red; unfound primes are NOT revealed.
- **Each question (or question pair) gets its own check button + feedback** — no global submit.
- **English only.** No bilingual content.
- **Colours from `src/design-tokens/tokens.css` only** — never hardcode hex. Font: Nunito (400/600/700/800/900).
- **Question letter badges:** 40px circle, bold. Numbers in question text: ≥24px bold pill.
- **Mobile-first, 320px minimum.** `src/utils/touchDragPolyfill.js` handles tablet drag.
- **Drag-and-drop preferred for number input;** MCQ for complex option sets.
- **Venn diagrams:** SVG circles + absolutely-positioned transparent overlay drop zones.

## Adding a lesson

1. Create `src/lessons/unitX/LN_TopicName.jsx`. Use `useLessonDraft` + `useProgress` per the pattern above. Lift any state that represents user progress into `state` slots; keep transient UI as `useState`.
2. Register in `LESSON_MAP` in `src/App.jsx`.
3. Add data file `src/data/unitX/lessonN.json` and entry in `src/data/curriculum.json` (curriculum drives prev/next nav in `Header.jsx` and breadcrumb labels).
4. Run `npm run build` — must stay green.

## Platform status

All platform layers are shipped:

- **Lesson resume** — `useLessonDraft` + `lesson_drafts` table + `/api/drafts`
- **Nav** — Header back/prev/next from `curriculum.json`, `Breadcrumbs.jsx`, sidebar persists in lessons
- **Locks** — per-student per-lesson (`lesson_locks` table, `/api/locks`), pre-checked in `POST /api/progress`, surfaced in `StudentProfileModal`
- **Reports** — SVG charts, PDF (pdfkit), SMTP email, node-cron weekly job, `report_log` table, Settings pages
- **Lesson correctness audit** — all 14 Grade 5 lessons verified; three bugs fixed (U1L4, U2L3, U3L1). Audit log in `C:\Users\Mustafa\.claude\plans\jaunty-meandering-avalanche.md`.
- **Admin/Teacher CRUD** — soft-delete + restore for users, archive + restore for classes, bulk student import, teacher unenroll, student notes timeline

**Explicitly out of scope (do not implement):** parent portal login, streaks/XP/badges/gamification, adaptive difficulty, spaced repetition, any changes to Grade 4 Numbers / Grade 6 Algebra / Grade 5 Problem Solving / Grade 4 Fractions placeholder lessons.

## API surface

```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

GET    /api/classes                         ?includeArchived=1 (admin)
POST   /api/classes                         (admin) { name, grade, description, color, teacherId, lessonRefs? }
GET    /api/classes/:id
PUT    /api/classes/:id                     (admin)
DELETE /api/classes/:id                     (admin) — archive
POST   /api/classes/:id/restore             (admin)
POST   /api/classes/:id/lessons/bulk        (admin) { lessonRefs }
DELETE /api/classes/:id/students/:studentId (teacher/admin) — unenroll
GET    /api/classes/:id/students            (teacher/admin)
GET    /api/classes/:id/progress            (teacher/admin)

GET    /api/users?role=&includeDeleted=1    (admin)
POST   /api/users                           (admin) { name, email, password, role, classId?, classIds? }
POST   /api/users/bulk-import               (admin) { classId?, rows: [{name,email,password?,…}] }
PUT    /api/users/:id                       (admin/teacher)
DELETE /api/users/:id                       (admin) — soft-delete
POST   /api/users/:id/restore               (admin)
POST   /api/users/:id/reset-password        (admin) { password }

GET    /api/students                        ?includeDeleted=1 (admin) — includes lessons_completed aggregate
GET    /api/students/:id

POST   /api/progress                        { classId, unit, lessonKey, sectionId, score, attempts, completed }
GET    /api/progress/:studentId

GET    /api/drafts/:classId/:unit/:lesson
PUT    /api/drafts/:classId/:unit/:lesson   { state }
DELETE /api/drafts/:classId/:unit/:lesson

GET    /api/locks/class/:classId
PUT    /api/locks/student/:studentId/lesson/:classId/:unit/:lessonNum  { locked }
POST   /api/locks/class/:classId/bulk       { locks: [{studentId,unit,lessonNum,locked}] }

GET    /api/notes/student/:studentId
POST   /api/notes/student/:studentId        { body }
DELETE /api/notes/:id

GET    /api/reports/class/:classId          ?unit=&studentId=
GET    /api/reports/student/:id/weekly      ?from=&to=
GET    /api/reports/student/:id/weekly.pdf
POST   /api/reports/student/:id/send-weekly
GET    /api/reports/unsubscribe             ?token=
POST   /api/reports/cron/run-now            (admin)

GET    /api/lessons, /api/lessons/:unit/:lesson
GET    /api/health
```

## Conventions

- Components: `PascalCase.jsx`. Hooks: `useCamelCase.js`. Data: `kebab-case.json`. CSS classes: kebab-case. IDs/state keys: camelCase.
- ESM throughout (`"type": "module"`).
- Backend uses `sqlite` (promise wrapper) + `sqlite3` (N-API) — **not** `better-sqlite3` despite it being in deps. Use `getDb()` and `db.run`/`db.get`/`db.all` (async).
- Test files in `src/__tests__/` (vitest + jsdom).
