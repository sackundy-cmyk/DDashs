# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**D-DASH** — interactive maths platform for ages 8–12. React 18 + Vite frontend, Express + SQLite (sqlite3 N-API, no native build) backend, JWT auth, three roles: student / teacher / admin. **23 lessons live** across Units 1–5 (Unit 1 now has 5 lessons), all in one course: **Grade 5 Mathematics**.

## Commands

```bash
npm run dev          # frontend on :3000 (proxies /api → :4000)
npm run server       # API on :4000
npm run start        # both concurrently
npm run build        # vite build → dist/  (must stay green)
npm run test         # vitest run
npm run test:watch
npm run lint         # eslint src --ext .js,.jsx
node server/db/seed.js   # reseed sqlite — wipes ddash.db, leaves only Grade 5 Math + 1 admin/teacher/demo student
```

Demo accounts (only ones seeded):
- `admin1@ddash.com / Admin@123`
- `teacher1@ddash.com / Teacher@123`
- `demo@ddash.com / Demo@123`

Add real teachers, students, and classes via the admin UI — `seed.js` only seeds the bare minimum to log in.

Vite path aliases: `@`, `@components`, `@hooks`, `@utils`, `@data`, `@lessons`, `@pages`, `@contexts`.

## Architecture

### Routing & shell

`src/App.jsx` is the single router. All non-public routes are wrapped in `<ProtectedRoute roles={[...]}>`. Lessons are lazy-loaded via a `LESSON_MAP` keyed by `"${unitId}-${lessonId}"`. Lesson routes are wrapped in `<DashboardLayout>` so the sidebar persists.

`DashboardLayout.jsx` — enhanced shell:
- **Sidebar**: dark slate (`#0F172A`) with pill active states, icon containers, dot indicator, gradient zap logo. Collapses to a slide-in drawer at ≤900px (hamburger button in top bar).
- **Top bar**: page title (`var(--font-h1)`), bell, avatar+name+chevron lockup. Hamburger button visible at ≤900px.
- **Drawer**: backdrop `rgba(15,23,42,0.45)`; closes on backdrop click and on route change.

### Auth

`AuthContext.jsx` stores `{ user, token }` in React state + localStorage (`ddash_token`, `ddash_user`). All authed fetches send `Authorization: Bearer <token>`. Backend middleware: `requireAuth`, `requireRole(...roles)` from `server/routes/auth.js`. **`JWT_SECRET` is required in production** (`server/index.js` refuses to boot without it when `NODE_ENV=production`); a clear dev fallback is used otherwise.

### Sidebar nav per role

```
STUDENT_NAV  : Dashboard · My Classes · Quizzes · Certificates
TEACHER_NAV  : Dashboard · Classes · Students · Quizzes · Reports · Settings
ADMIN_NAV    : Dashboard · Teachers · Students · Classes · Reports · Settings
```

### Student book → unit → lesson navigation

Three routed pages — books → units → lessons, each as a card grid:

| Route | What's shown |
|---|---|
| `/student/classes` | Books grid (one card per enrolled class, progress ring) |
| `/student/classes/:classId` | Units grid (one card per unit, progress ring + lesson count) |
| `/student/classes/:classId/unit/:unit` | Lessons grid (one card per lesson, status badge, Continue/Start) |

The lesson player itself stays at `/student/lesson/:unitId/:lessonId?classId=`. **`classId` is required in the query string** — without it, `useProgress` has no class to attribute progress to and skips the backend POST.

### Lesson state model — three layers

A lesson page typically uses three hooks:

1. **`useLessonDraft()`** (`src/hooks/useLessonDraft.js`) — persists in-progress UI state. Reads context from URL: path `/student/lesson/:unit/:lesson` + query `?classId=`. Hydration: localStorage immediately, then backend `GET /api/drafts/:classId/:unit/:lesson`. Writes: localStorage sync on every change, debounced `PUT` (1500ms). Returns `{ state, setState, setField, clearDraft, hydrated }`.

   `setField(key, initial)` returns a `useState`-style setter for one slot of `state`. **Pass `initial` whenever the field has a structured default** (otherwise updaters receive `{}` and crash).
   ```js
   const q1Init = Object.fromEntries(QS.map(q=>[q.lbl,[]]));
   const { state, setField, clearDraft } = useLessonDraft();
   const prog = useProgress(N, { onAllDone: clearDraft });
   const q1 = state.q1 || q1Init, setQ1 = setField('q1', q1Init);
   ```

2. **`useProgress(totalSections, { onAllDone })`** — section completion tracker. `markDone(sectionId, payload)` posts to `/api/progress` and fills the lesson progress bar. `onAllDone` fires once when every section completes — wire to `clearDraft`.

   `markDone` payload shapes:
   - `{ correct, total, attempts }` → score computed via `scoreFromAttempts(attempts)`: 1st→100%, 2nd→90%, 3rd→75%, 4th→55%, 5th+→40%
   - `{ score }` → explicit percentage override (0–100)
   - string / number / null → legacy; avoid in new lessons

3. **`useAttempts(questionId)`** — per-question attempt counter. `increment(key)` then `getAtt(key) + 1` gives the current attempt number.

### Critical: React async-updater bug in check functions

**Never increment an `ok` counter inside a `setState` functional updater.** React batches updaters and they do not run synchronously inline — reading `ok` after `setState(prev => { …ok++… })` will always see 0, so `markDone` is never called and the progress bar never fills.

**Wrong pattern:**
```js
let ok = 0;
setSt(prev => { ga.forEach(q => { if (correct) ok++; }); return ns; }); // ok stays 0 outside
if (ok === total) markDone(...); // never fires
```

**Correct pattern (compute before setState):**
```js
let ok = 0;
ga.forEach(q => { if (sel[q.lbl] === q.ans) ok++; }); // synchronous count
setSt(prev => { /* apply visual state only */ return ns; });
if (ok === total) markDone(...); // fires correctly
```

All existing lessons in `src/lessons/unit1/L1–L5`, `unit2`, `unit3`, `unit4`, `unit5` use the correct pattern. The bug was found and fixed in `L3_MultiplyDivide.jsx` — do not reintroduce it.

### Backend

`server/index.js` mounts all routers. `getDb()` in `server/db/connection.js` opens SQLite (`ddash.db`), enables WAL + foreign keys, runs `CREATE TABLE IF NOT EXISTS` for all tables, then applies additive column migrations via `addColumnIfMissing()`. **Schema changes go in `connection.js` only — additive, never destructive.**

**Tables:** `users`, `classes`, `class_enrollments`, `class_lessons`, `lesson_progress`, `lesson_drafts`, `lesson_locks`, `student_notes`, `report_log`, `certificates`, `quizzes`, `quiz_questions`, `quiz_attempts`.

**Soft-delete pattern:** `users.deleted_at`, `classes.archived_at`, `quizzes.deleted_at`. All list queries filter these by default; pass `?includeDeleted=1`/`?includeArchived=1` (admin only) to opt in.

### Certificates

Three types — all **teacher-issued** (no auto-issue, no triggers in `/api/progress`). `certificates` table with unique constraint on (`student_id`, `class_id`, `type`, `unit`, `lesson_num`); re-issue updates the existing row.

| Type | When teacher issues |
|---|---|
| `lesson` | After a student completes a lesson |
| `unit`   | After a student completes every lesson in a unit |
| `course` | After a student completes the whole class |

PDF: `server/lib/pdfCertificate.js` — landscape A4, decorative border, student name large/centered, course/unit/lesson title, score, date, signature line for teacher.

UX:
- **Student**: `/student/certificates` — grid of cards, each with download-PDF button.
- **Teacher**: a **Certificates** sub-section inside `StudentProfileModal` — collapsible per-lesson list + per-unit rows + course-cert button. Issue / Revoke buttons.

### Quizzes & Exams

A teacher composes a quiz from a list of questions, attaches it to a class, and publishes it. Students enrolled in that class take it under the **Quizzes** tab. Auto-graded on submit. **Unlimited attempts** — every quiz allows retake; the student card shows the latest attempt's score.

**Question types** (one row per question, no separate tables — `config` JSON varies):
- `mcq` — `{ options: ["…"], correctIndex: 2 }`
- `digit` — `{ answer: "1234" }` or `{ answer: 12.5, tolerance: 0.05 }`; supports a `decimal: true` flag for the palette
- `fraction` — `{ numerator: 3, denominator: 4 }`
- `true-false` — `{ correct: true }`

Auto-grading lives in `gradeQuestion()` in `server/routes/quizzes.js` — deterministic, no manual review.

UX:
- **Teacher** `/teacher/quizzes` — card grid; **New Quiz** opens `QuizBuilderModal` (basics + per-question editor with type dropdown, points, reorder, remove). Save as draft / Save & publish.
- **Teacher** `/teacher/quizzes/:id/results` — per-attempt table with student, time, score, pass/fail; click row to expand per-question correct/wrong.
- **Student** `/student/quizzes` — card grid; latest score shown when available.
- **Student** `/student/quiz/:id` — take screen with sticky submit bar; uses existing `MCQOptions`, `DigitDropZone+DigitPalette`, `LblCircle`. Optional countdown timer auto-submits at 0. Result screen shows score % + per-question correct/wrong + Retake button.

### Modals & toasts

All dialogs use `src/components/Modal.jsx`. `Toast.jsx` / `useToast()` provides the toast stack (mounted via `ToastProvider`). Shared modals in `src/components/modals/`: `ConfirmDialog`, `AddClassModal`, `EditClassModal`, `AddStudentModal`, `BulkImportStudentsModal`, `AddTeacherModal`, `EditTeacherModal`, `LessonDetailModal`, `StudentProfileModal`, `QuizBuilderModal`. `StudentNotesTimeline` is a standalone component mounted inside `StudentProfileModal`.

### Reports pipeline (manual delivery)

`server/lib/reportData.js` builds the weekly data → `server/lib/email.js` (nodemailer, fake-mode when SMTP unconfigured — admin downloads PDFs and sends manually via WhatsApp/email) + `server/lib/pdfReport.js` (pdfkit) → `server/lib/weeklyJob.js` runs via `node-cron` Sunday 18:00, skipping deleted users / archived classes. Manual trigger: `POST /api/reports/cron/run-now` (admin).

### Charts

Hand-rolled SVG components — no charting dependency. `src/components/charts/SvgBarChart.jsx`, `SvgLineChart.jsx`. Used on Reports.

## Responsive system

Defined in `src/design-tokens/tokens.css`:

```css
--bp-sm: 480px;    /* phone */
--bp-md: 768px;    /* tablet portrait */
--bp-lg: 1024px;   /* tablet landscape / small laptop */
--bp-xl: 1280px;   /* desktop */

--font-h1:    clamp(20px, 3.2vw, 28px);
--font-h2:    clamp(16px, 2.4vw, 20px);
--font-h3:    clamp(14px, 2vw,   16px);
--font-body:  clamp(14px, 1.8vw, 15px);
--font-small: clamp(12px, 1.5vw, 13px);
```

Rules:
- **Use clamp() typography variables** for headings in shell/layout; lesson-internal components may use explicit px values.
- **Card grids**: `repeat(auto-fit, minmax(<min>, 1fr))`; never `1fr 1fr`.
- **Sidebar**: collapses to slide-in drawer at ≤900px (handled in `DashboardLayout.module.css`).
- **Tables / table-like grids**: at ≤768px, convert to stacked card layout (use `s.respRow` / `s.respCell` helpers in `DashboardLayout.module.css`, or CSS media query).
- **Drag interactions**: `src/utils/touchDragPolyfill.js` is wired in `main.jsx` and covers all `[draggable=true]` elements — 200 ms hold before drag starts, `passive:false` on `touchmove` so scrolling is blocked during drag. No per-component touch wiring needed.
- **Lesson sticky header**: `Header.jsx` sits below the DashboardLayout top bar. Key CSS: `top: 64px; z-index: 45; margin: -24px -28px 0; width: calc(100% + 56px)` (at ≤480px: `-16px -16px 0` / `calc(100% + 32px)`).

## Lesson authoring rules (load-bearing — break a lesson if violated)

- **Feedback ladder — NEVER reveal the final answer at any attempt:** attempt 1 = correct/wrong only, attempt 2 = hint (direction clue, not the answer), attempt 3+ = stronger hint + lock (wrong zone stays red). The correct answer is NEVER shown — not even on the 3rd attempt or beyond. Special case: prime grid Q1 in U3L4 — check button never locks until all primes are found; wrong picks go red; unfound primes are NOT revealed.
- **Attempt-based performance scoring** — uses `scoreFromAttempts(att)` in `useProgress.js`: 1st attempt → 100%, 2nd → 90%, 3rd → 75%, 4th → 55%, 5th+ → 40% (floor, never zero). Pass `payload.score` to `markDone` for an explicit override.
- **Section completion = correctness-based:** `markDone` is only called once the student answers every question correctly at least once. The progress bar fills on completion only; no star rating.
- **1-question-per-DigitPalette rule:** every digit-input question that uses `DigitDropZone` gets its **own** `DigitPalette` + Check button. Never share one palette across two questions.
- **MCQ option shuffle:** shuffle option arrays once on mount (`useState` lazy initialiser) so the correct answer is never always-first. Keyed by question label for stability across renders: `const [shuf] = useState(() => ({ s1: Object.fromEntries(QS.map(q=>[q.lbl, sh(q.opts)])) }))`.
- **Each question gets its own check button + feedback** — no global submit.
- **English only.** No bilingual content.
- **Shell colours from `src/design-tokens/tokens.css`**; lesson-internal component colours may use hex directly.
- **Numbers in question text**: ≥24px bold pill — use `NumChip` from `SharedComponents.jsx`. Never inline a literal number in text-only style.
- **Fractions**: stacked numerator-over-denominator inside a card with a clear standing-out font — use the `Frac` component (or stacked `NumChip` pair). Mixed numbers: pill + Frac side by side.
- **Question letter badges:** 40px circle, bold (use `LblCircle`).
- **Mobile-first, 320px minimum.**
- **Drag-and-drop preferred for number input;** MCQ for complex option sets.
- **Venn diagrams:** SVG circles + absolutely-positioned transparent overlay drop zones.

## Shared component standards (current baseline)

These were updated globally and must stay consistent:

| Component | Key style |
|---|---|
| `CheckButton` | Amber/gold `#D97706` background (disabled → `#94A3B8`), `boxShadow: 0 3px 12px rgba(217,119,6,0.35)`, 17px, 900 weight |
| `MCQOptions` button | 20px, 700 weight, purple selected state (`#CE82FF`) |
| `QItemLabel` | 22px, 800 weight, `flexWrap:wrap`, `lineHeight:1.4` |
| `DigitPalette` | `decimal` prop defaults to `true` — decimal point card always shown |
| `NumChip` | Default 28px, 900 weight, solid blue background, white text |

## Adding a lesson

1. Create `src/lessons/unitX/LN_TopicName.jsx`. Use `useLessonDraft` + `useProgress`. Lift any state representing user progress into `state` slots; keep transient UI as `useState`.
2. Register in `LESSON_MAP` in `src/App.jsx` (lazy import + `'X-N': UXlLN` entry).
3. Add entry in `src/data/curriculum.json` (drives prev/next nav in `Header.jsx` and breadcrumb labels). Per-lesson JSON data files under `src/data/unitX/` are optional.
4. Add the lesson row in the Grade 5 Math class via the admin UI (or extend the `lessons` array in `seed.js`).
5. Run `npm run build` — must stay green.

## Platform status

All platform layers shipped:

- **Lesson resume** — `useLessonDraft` + `lesson_drafts` + `/api/drafts`
- **Nav** — Header back/prev/next from `curriculum.json`, `Breadcrumbs.jsx`, sidebar drawer at ≤900px
- **Locks** — per-student per-lesson (`lesson_locks` table, `/api/locks`), pre-checked in `POST /api/progress`
- **Reports** — SVG charts, PDF (pdfkit), node-cron weekly job, `report_log` table; admin downloads & delivers manually (no SMTP configured)
- **Admin/Teacher CRUD** — soft-delete + restore for users, archive + restore for classes, bulk student import, teacher unenroll, student notes timeline
- **Book → Unit → Lesson card navigation** — `/student/classes` ▸ `:classId` ▸ `:classId/unit/:unit`
- **Certificates** — teacher-issued (lesson / unit / course), printable PDF, student "Certificates" tab
- **Quizzes & Exams** — teacher builder (4 question types), publish toggle, results page; student takes with timer + retake
- **Responsive system** — breakpoint tokens + clamp typography + sidebar drawer + touch-drag polyfill

**Explicitly out of scope (do not implement):** parent portal login, streaks/XP/badges/gamification, adaptive difficulty, spaced repetition, password reset / forced-change-on-first-login, SMTP-driven email delivery, search across lessons, audit log, student profile / password-change page, automatic DB backup.

## API surface

```
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

GET    /api/classes                         ?includeArchived=1 (admin)
POST   /api/classes                         (admin)
GET    /api/classes/:id
PUT    /api/classes/:id                     (admin)
DELETE /api/classes/:id                     (admin) — archive
POST   /api/classes/:id/restore             (admin)
POST   /api/classes/:id/lessons/bulk        (admin) { lessonRefs }
DELETE /api/classes/:id/students/:studentId (teacher/admin) — unenroll
GET    /api/classes/:id/students            (teacher/admin)
GET    /api/classes/:id/progress            (teacher/admin)

GET    /api/users?role=&includeDeleted=1    (admin)
POST   /api/users                           (admin)
POST   /api/users/bulk-import               (admin)
PUT    /api/users/:id                       (admin/teacher)
DELETE /api/users/:id                       (admin) — soft-delete
POST   /api/users/:id/restore               (admin)
POST   /api/users/:id/reset-password        (admin) { password }

GET    /api/students                        ?includeDeleted=1 (admin)
GET    /api/students/:id

POST   /api/progress                        { classId, unit, lessonKey, sectionId, score, attempts, completed }
GET    /api/progress/:studentId

GET    /api/drafts/:classId/:unit/:lesson
PUT    /api/drafts/:classId/:unit/:lesson   { state }
DELETE /api/drafts/:classId/:unit/:lesson

GET    /api/locks/class/:classId
PUT    /api/locks/student/:studentId/lesson/:classId/:unit/:lessonNum  { locked }
POST   /api/locks/class/:classId/bulk       { locks: [...] }

GET    /api/notes/student/:studentId
POST   /api/notes/student/:studentId        { body }
DELETE /api/notes/:id

GET    /api/reports/class/:classId          ?unit=&studentId=
GET    /api/reports/student/:id/weekly      ?from=&to=
GET    /api/reports/student/:id/weekly.pdf
POST   /api/reports/student/:id/send-weekly
GET    /api/reports/unsubscribe             ?token=
POST   /api/reports/cron/run-now            (admin)

GET    /api/certificates/student/:studentId  (self or teacher/admin)
POST   /api/certificates                     (teacher/admin) { studentId, classId, type, unit?, lessonNum?, score? }
DELETE /api/certificates/:id                 (teacher/admin)
GET    /api/certificates/:id/pdf             (self or teacher/admin)

GET    /api/quizzes?classId=                 (teacher: own classes; student: published in enrolled classes)
POST   /api/quizzes                          (teacher/admin)
GET    /api/quizzes/:id                      (student view strips answer config)
PUT    /api/quizzes/:id                      (teacher/admin)
POST   /api/quizzes/:id/publish              (teacher/admin) — toggle
DELETE /api/quizzes/:id                      (teacher/admin) — soft-delete
POST   /api/quizzes/:id/attempts             (student) — start
PUT    /api/quizzes/:id/attempts/:attemptId/submit   (student) — { responses }
GET    /api/quizzes/:id/attempts             (teacher/admin)
GET    /api/quizzes/:id/attempts/me          (student)

GET    /api/lessons, /api/lessons/:unit/:lesson
GET    /api/health
```

## Conventions

- Components: `PascalCase.jsx`. Hooks: `useCamelCase.js`. Data: `kebab-case.json`. CSS classes: kebab-case. IDs/state keys: camelCase.
- ESM throughout (`"type": "module"`).
- Backend uses `sqlite` (promise wrapper) + `sqlite3` (N-API) — **not** `better-sqlite3` despite it being in deps. Use `getDb()` and `db.run`/`db.get`/`db.all` (async).
- Test files in `src/__tests__/` (vitest + jsdom).
