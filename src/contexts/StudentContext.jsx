// ============================================================
//  contexts/StudentContext.jsx
//  Provides a simple student identity (stored in localStorage).
//  Usage: const { studentId, studentName } = useStudent();
// ============================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext(null);

/** Generate a simple anonymous ID if none exists */
function makeId() {
  return 'student_' + Math.random().toString(36).slice(2, 10);
}

export function StudentProvider({ children }) {
  const [studentId, setStudentId] = useState(() => {
    try { return localStorage.getItem('ddash_student_id') || makeId(); } catch { return makeId(); }
  });
  const [studentName, setStudentName] = useState(() => {
    try { return localStorage.getItem('ddash_student_name') || ''; } catch { return ''; }
  });

  // Persist to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem('ddash_student_id', studentId); } catch {}
  }, [studentId]);

  useEffect(() => {
    try { if (studentName) localStorage.setItem('ddash_student_name', studentName); } catch {}
  }, [studentName]);

  return (
    <StudentContext.Provider value={{ studentId, studentName, setStudentName }}>
      {children}
    </StudentContext.Provider>
  );
}

/** Hook to consume student context */
export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudent must be used inside <StudentProvider>');
  return ctx;
}
