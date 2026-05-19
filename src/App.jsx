// ============================================================
//  App.jsx — React Router v6 full routing tree
// ============================================================

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';

// ── Public pages ─────────────────────────────────────────────
import Landing from './pages/Landing.jsx';
import Login   from './pages/Login.jsx';

// ── Student pages (lazy) ─────────────────────────────────────
const StudentDashboard = lazy(() => import('./pages/student/Dashboard.jsx'));
const StudentClasses      = lazy(() => import('./pages/student/Classes.jsx'));
const StudentClassDetail  = lazy(() => import('./pages/student/ClassDetail.jsx'));
const StudentUnitDetail   = lazy(() => import('./pages/student/UnitDetail.jsx'));
const StudentCertificates = lazy(() => import('./pages/student/Certificates.jsx'));
const StudentQuizzes      = lazy(() => import('./pages/student/Quizzes.jsx'));
const StudentTakeQuiz     = lazy(() => import('./pages/student/TakeQuiz.jsx'));

// ── Teacher pages (lazy) ─────────────────────────────────────
const TeacherDashboard   = lazy(() => import('./pages/teacher/Dashboard.jsx'));
const TeacherClasses     = lazy(() => import('./pages/teacher/Classes.jsx'));
const TeacherStudents    = lazy(() => import('./pages/teacher/Students.jsx'));
const TeacherReports     = lazy(() => import('./pages/teacher/Reports.jsx'));
const TeacherSettings    = lazy(() => import('./pages/teacher/Settings.jsx'));
const TeacherQuizzes     = lazy(() => import('./pages/teacher/Quizzes.jsx'));
const TeacherQuizResults = lazy(() => import('./pages/teacher/QuizResults.jsx'));

// ── Whiteboard pages (lazy) ──────────────────────────────────
const TeacherWhiteboard = lazy(() => import('./pages/teacher/Whiteboard.jsx'));
const AdminWhiteboard   = lazy(() => import('./pages/admin/Whiteboard.jsx'));

// ── Admin pages (lazy) ───────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const AdminTeachers  = lazy(() => import('./pages/admin/Teachers.jsx'));
const AdminStudents  = lazy(() => import('./pages/admin/Students.jsx'));
const AdminClasses   = lazy(() => import('./pages/admin/Classes.jsx'));
const AdminReports   = lazy(() => import('./pages/admin/Reports.jsx'));
const AdminSettings  = lazy(() => import('./pages/admin/Settings.jsx'));

// ── Lesson components (lazy) ─────────────────────────────────
const U1L1 = lazy(() => import('./lessons/unit1/L1_PlaceValue.jsx'));
const U1L2 = lazy(() => import('./lessons/unit1/L2_Thousandths.jsx'));
const U1L3 = lazy(() => import('./lessons/unit1/L3_MultiplyDivide.jsx'));
const U1L4 = lazy(() => import('./lessons/unit1/L4_Rounding.jsx'));
const U1L5 = lazy(() => import('./lessons/unit1/L5_ComparingOrdering.jsx'));
const U2L1 = lazy(() => import('./lessons/unit2/L1_Sequences.jsx'));
const U2L2 = lazy(() => import('./lessons/unit2/L2_NegativeNumbers.jsx'));
const U2L3 = lazy(() => import('./lessons/unit2/L3_FunctionMachines.jsx'));
const U2L4 = lazy(() => import('./lessons/unit2/L4_PatternsFormulae.jsx'));
const U2L5 = lazy(() => import('./lessons/unit2/L5_Equations.jsx'));
const U3L1 = lazy(() => import('./lessons/unit3/L1_Divisibility.jsx'));
const U3L2 = lazy(() => import('./lessons/unit3/L2_Multiples.jsx'));
const U3L3 = lazy(() => import('./lessons/unit3/L3_Factors.jsx'));
const U3L4 = lazy(() => import('./lessons/unit3/L4_PrimeSquare.jsx'));
const U4L1 = lazy(() => import('./lessons/unit4/L1_BracketsOrderOfOps.jsx'));
const U4L2 = lazy(() => import('./lessons/unit4/L2_MoreBrackets.jsx'));
const U4L3 = lazy(() => import('./lessons/unit4/L3_InverseOps.jsx'));
const U4L4 = lazy(() => import('./lessons/unit4/L4_MentalAddSub.jsx'));
const U4L5 = lazy(() => import('./lessons/unit4/L5_LargeNumbers.jsx'));
const U4L6 = lazy(() => import('./lessons/unit4/L6_DecimalTenths1.jsx'));
const U4L7 = lazy(() => import('./lessons/unit4/L7_DecimalTenths2.jsx'));
const U4L8 = lazy(() => import('./lessons/unit4/L8_DecimalHundredths.jsx'));
const U5L1 = lazy(() => import('./lessons/unit5/L1_Brackets.jsx'));
const U6L1  = lazy(() => import('./lessons/unit6/L1_Lines.jsx'));
const U6L2  = lazy(() => import('./lessons/unit6/L2_AngleTypes.jsx'));
const U6L3  = lazy(() => import('./lessons/unit6/L3_MeasuringAngles.jsx'));
const U6L4  = lazy(() => import('./lessons/unit6/L4_Polygons.jsx'));
const U6L5  = lazy(() => import('./lessons/unit6/L5_TrianglesQuadrilaterals.jsx'));
const U6L6  = lazy(() => import('./lessons/unit6/L6_LinesOfSymmetry.jsx'));
const U6L7  = lazy(() => import('./lessons/unit6/L7_3DShapes.jsx'));
const U6L8  = lazy(() => import('./lessons/unit6/L8_Nets.jsx'));
const U6L9  = lazy(() => import('./lessons/unit6/L9_Coordinates.jsx'));
const U6L10 = lazy(() => import('./lessons/unit6/L10_Transformations.jsx'));
const U6L11 = lazy(() => import('./lessons/unit6/L11_Circles.jsx'));
const U7L1  = lazy(() => import('./lessons/unit7/L1_NumberLineIntegers.jsx'));
const U7L2  = lazy(() => import('./lessons/unit7/L2_RoundingNumbers.jsx'));
const U7L3  = lazy(() => import('./lessons/unit7/L3_LargeNumbers.jsx'));
const U7L4  = lazy(() => import('./lessons/unit7/L4_DecimalNumbers.jsx'));
const U7L5  = lazy(() => import('./lessons/unit7/L5_AddSubDecimals.jsx'));
const U8L1  = lazy(() => import('./lessons/unit8/L1_DivisibilityRules.jsx'));

const LESSON_MAP = {
  '1-1': U1L1, '1-2': U1L2, '1-3': U1L3, '1-4': U1L4, '1-5': U1L5,
  '2-1': U2L1, '2-2': U2L2, '2-3': U2L3, '2-4': U2L4, '2-5': U2L5,
  '3-1': U3L1, '3-2': U3L2, '3-3': U3L3, '3-4': U3L4,
  '4-1': U4L1, '4-2': U4L2, '4-3': U4L3, '4-4': U4L4, '4-5': U4L5, '4-6': U4L6, '4-7': U4L7, '4-8': U4L8,
  '5-1': U5L1,
  '6-1': U6L1, '6-2': U6L2, '6-3': U6L3, '6-4': U6L4, '6-5': U6L5,
  '6-6': U6L6, '6-7': U6L7, '6-8': U6L8, '6-9': U6L9, '6-10': U6L10, '6-11': U6L11,
  '7-1': U7L1, '7-2': U7L2, '7-3': U7L3, '7-4': U7L4, '7-5': U7L5,
  '8-1': U8L1,
};

function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: 'var(--font)', color: 'var(--muted)',
      fontSize: 18, fontWeight: 700, background: '#f4f7fc',
    }}>
      Loading…
    </div>
  );
}

function LessonRoute() {
  const { unitId, lessonId } = useParams();
  const Component = LESSON_MAP[`${unitId}-${lessonId}`];
  if (!Component) {
    return (
      <div style={{ padding: 40, fontFamily: 'var(--font)', fontSize: 18 }}>
        Lesson not found. <a href="/student/dashboard" style={{ color: 'var(--blue)' }}>Back to dashboard</a>
      </div>
    );
  }
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh',
      fontFamily: 'var(--font)', color: 'var(--text)',
    }}>
      <h1 style={{ fontSize: 48, fontWeight: 900, color: 'var(--blue)' }}>404</h1>
      <p style={{ fontSize: 18, color: 'var(--muted)' }}>Page not found</p>
      <a href="/" style={{ marginTop: 16, color: 'var(--blue)', fontWeight: 700 }}>Go home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"      element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Legacy lesson routes (direct access) */}
          <Route path="/unit/:unitId/lesson/:lessonId" element={<LessonRoute />} />

          {/* Student */}
          <Route path="/student" element={
            <ProtectedRoute roles={['student']}>
              <Navigate to="/student/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/student/dashboard" element={
            <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/classes" element={
            <ProtectedRoute roles={['student']}><StudentClasses /></ProtectedRoute>
          } />
          <Route path="/student/classes/:classId" element={
            <ProtectedRoute roles={['student']}><StudentClassDetail /></ProtectedRoute>
          } />
          <Route path="/student/classes/:classId/unit/:unit" element={
            <ProtectedRoute roles={['student']}><StudentUnitDetail /></ProtectedRoute>
          } />
          <Route path="/student/certificates" element={
            <ProtectedRoute roles={['student']}><StudentCertificates /></ProtectedRoute>
          } />
          <Route path="/student/quizzes" element={
            <ProtectedRoute roles={['student']}><StudentQuizzes /></ProtectedRoute>
          } />
          <Route path="/student/quiz/:quizId" element={
            <ProtectedRoute roles={['student']}><StudentTakeQuiz /></ProtectedRoute>
          } />
          <Route path="/student/whiteboard" element={
            <ProtectedRoute roles={['student']}><Navigate to="/student/dashboard" replace /></ProtectedRoute>
          } />
          <Route path="/student/lesson/:unitId/:lessonId" element={
            <ProtectedRoute roles={['student']}><DashboardLayout><LessonRoute /></DashboardLayout></ProtectedRoute>
          } />

          {/* Teacher */}
          <Route path="/teacher" element={
            <ProtectedRoute roles={['teacher']}>
              <Navigate to="/teacher/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>
          } />
          <Route path="/teacher/classes" element={
            <ProtectedRoute roles={['teacher']}><TeacherClasses /></ProtectedRoute>
          } />
          <Route path="/teacher/students" element={
            <ProtectedRoute roles={['teacher']}><TeacherStudents /></ProtectedRoute>
          } />
          <Route path="/teacher/reports" element={
            <ProtectedRoute roles={['teacher']}><TeacherReports /></ProtectedRoute>
          } />
          <Route path="/teacher/settings" element={
            <ProtectedRoute roles={['teacher']}><TeacherSettings /></ProtectedRoute>
          } />
          <Route path="/teacher/quizzes" element={
            <ProtectedRoute roles={['teacher']}><TeacherQuizzes /></ProtectedRoute>
          } />
          <Route path="/teacher/quizzes/:quizId/results" element={
            <ProtectedRoute roles={['teacher']}><TeacherQuizResults /></ProtectedRoute>
          } />
          <Route path="/teacher/whiteboard" element={
            <ProtectedRoute roles={['teacher']}><TeacherWhiteboard /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/teachers" element={
            <ProtectedRoute roles={['admin']}><AdminTeachers /></ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute roles={['admin']}><AdminStudents /></ProtectedRoute>
          } />
          <Route path="/admin/classes" element={
            <ProtectedRoute roles={['admin']}><AdminClasses /></ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>
          } />
          <Route path="/admin/whiteboard" element={
            <ProtectedRoute roles={['admin']}><AdminWhiteboard /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
