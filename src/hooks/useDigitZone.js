// ============================================================
//  useDigitZone.js — manage digit-based answer zones
// ============================================================

import { useState, useCallback } from 'react';

/**
 * Manage one or more digit drop zones.
 * Each zone is keyed by zoneId and stores an array of digit strings.
 *
 * @returns {{ digits, appendDigit, deleteLastDigit, clearZone, getValue, setZone }}
 */
export function useDigitZone() {
  const [zones, setZones] = useState({});

  const appendDigit = useCallback((zoneId, digit) => {
    setZones(prev => ({
      ...prev,
      [zoneId]: [...(prev[zoneId] || []), String(digit)],
    }));
  }, []);

  const deleteLastDigit = useCallback((zoneId) => {
    setZones(prev => {
      const current = prev[zoneId] || [];
      return { ...prev, [zoneId]: current.slice(0, -1) };
    });
  }, []);

  const clearZone = useCallback((zoneId) => {
    setZones(prev => ({ ...prev, [zoneId]: [] }));
  }, []);

  const getValue = useCallback((zoneId) => {
    const d = zones[zoneId];
    if (!d || d.length === 0) return null;
    return parseInt(d.join(''), 10);
  }, [zones]);

  const getDigits = useCallback((zoneId) => zones[zoneId] || [], [zones]);

  const setZone = useCallback((zoneId, value) => {
    setZones(prev => ({
      ...prev,
      [zoneId]: String(value).split(''),
    }));
  }, []);

  return { appendDigit, deleteLastDigit, clearZone, getValue, getDigits, setZone, zones };
}
