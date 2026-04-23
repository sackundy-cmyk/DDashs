// ============================================================
//  useLessonDraft.js — persistent in-progress lesson state
//  localStorage primary (instant) + debounced backend mirror
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';

const API = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';
const SYNC_DEBOUNCE_MS = 1500;

function readLocalDraft(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function writeLocalDraft(key, payload) {
  try { localStorage.setItem(key, JSON.stringify(payload)); } catch {}
}

function clearLocalDraft(key) {
  try { localStorage.removeItem(key); } catch {}
}

function lessonContextFromUrl() {
  const parts     = window.location.pathname.split('/');
  const li        = parts.indexOf('lesson');
  const unit      = li >= 0 ? parseInt(parts[li + 1], 10) || null : null;
  const lessonNum = li >= 0 ? parseInt(parts[li + 2], 10) || null : null;
  const classId   = parseInt(new URLSearchParams(window.location.search).get('classId'), 10) || null;
  return { unit, lessonNum, classId };
}

/**
 * Persist a lesson's UI state across refreshes and devices.
 *
 * Returns { state, setState, clearDraft, hydrated }
 *  - state: current state (initial = {} until hydrated)
 *  - setState: update state — accepts value or updater function
 *  - clearDraft: remove the draft locally and on the backend (call after lesson complete)
 *  - hydrated: false until the initial load (local + backend) finishes
 */
export function useLessonDraft() {
  const ctx = useRef(lessonContextFromUrl());
  const { unit, lessonNum, classId } = ctx.current;
  const localKey = `ddash_draft_${classId ?? 'na'}_${unit ?? 'na'}_${lessonNum ?? 'na'}`;

  const [state, setStateRaw] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const debounceRef = useRef(null);
  const skipFirstSync = useRef(true);

  // Hydration: load local immediately, then check backend for newer copy
  useEffect(() => {
    const local = readLocalDraft(localKey);
    if (local && local.state) setStateRaw(local.state);

    const token = localStorage.getItem('ddash_token');
    if (!token || !classId || !unit || !lessonNum) {
      setHydrated(true);
      return;
    }

    fetch(`${API}/drafts/${classId}/${unit}/${lessonNum}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        const draft = json?.draft;
        if (!draft || !draft.state) return;
        const localTs = local?.updatedAt ? new Date(local.updatedAt).getTime() : 0;
        const remoteTs = draft.updatedAt ? new Date(draft.updatedAt).getTime() : 0;
        if (remoteTs > localTs) setStateRaw(draft.state);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced backend sync on state changes (skip first render)
  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSync.current) { skipFirstSync.current = false; return; }

    const updatedAt = new Date().toISOString();
    writeLocalDraft(localKey, { state, updatedAt });

    const token = localStorage.getItem('ddash_token');
    if (!token || !classId || !unit || !lessonNum) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`${API}/drafts/${classId}/${unit}/${lessonNum}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ state }),
      }).catch(() => {});
    }, SYNC_DEBOUNCE_MS);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, hydrated]);

  const setState = useCallback((updater) => {
    setStateRaw(prev => typeof updater === 'function' ? updater(prev) : updater);
  }, []);

  // Helper: returns a setter for a single field that mimics useState's API.
  //   const setSel1 = setField('sel1');
  //   setSel1(p => ({ ...p, a: 'X' }));
  // Optional `initial` is the fallback value passed to functional updaters when
  // the field is undefined — important for fields with structured defaults.
  const setField = useCallback((key, initial) => (updater) => {
    setStateRaw(prev => {
      const current = prev[key] !== undefined ? prev[key] : (initial !== undefined ? initial : {});
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [key]: next };
    });
  }, []);

  const clearDraft = useCallback(() => {
    clearLocalDraft(localKey);
    const token = localStorage.getItem('ddash_token');
    if (!token || !classId || !unit || !lessonNum) return;
    fetch(`${API}/drafts/${classId}/${unit}/${lessonNum}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, setState, setField, clearDraft, hydrated };
}
