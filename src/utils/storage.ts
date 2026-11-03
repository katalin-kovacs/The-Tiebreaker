import { DecisionRecord } from '../types.ts';

const STORAGE_KEY = 'the_tiebreaker_decisions_v1';

export function loadSavedDecisions(): DecisionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load decisions from localStorage:', err);
    return [];
  }
}

export function saveDecisionRecord(record: DecisionRecord): void {
  try {
    const existing = loadSavedDecisions();
    const index = existing.findIndex((item) => item.id === record.id);
    if (index >= 0) {
      existing[index] = { ...record, updatedAt: Date.now() };
    } else {
      existing.unshift(record);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save decision to localStorage:', err);
  }
}

export function deleteDecisionRecord(id: string): DecisionRecord[] {
  try {
    const existing = loadSavedDecisions();
    const filtered = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Failed to delete decision from localStorage:', err);
    return [];
  }
}
