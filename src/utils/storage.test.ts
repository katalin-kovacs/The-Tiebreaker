import { describe, it, expect, beforeEach } from 'vitest';
import { 
  loadSavedDecisions, 
  saveDecisionRecord, 
  deleteDecisionRecord 
} from './storage.ts';
import { DecisionRecord } from '../types.ts';

// Mock localStorage for test environment
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('storage utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const mockRecord: DecisionRecord = {
    id: 'test_123',
    createdAt: 1000,
    updatedAt: 1000,
    title: 'Test Career Choice',
    summary: 'Summary of trade-offs',
    options: [
      { id: 'opt_1', label: 'Option 1' },
      { id: 'opt_2', label: 'Option 2' },
    ],
    verdict: {
      recommendedOptionId: 'opt_1',
      recommendedOptionLabel: 'Option 1',
      confidenceScore: 85,
      headline: 'Clear choice',
      rationale: 'Reasoning',
      keyDecisiveFactor: 'Pivot',
      blindspots: ['Blindspot 1'],
    },
    optionsAnalysis: [],
    comparisonMatrix: { criteria: [] },
    gutCheckPrompt: 'Test gut prompt',
  };

  it('saves a new decision record and loads it back', () => {
    saveDecisionRecord(mockRecord);
    const loaded = loadSavedDecisions();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('test_123');
    expect(loaded[0].title).toBe('Test Career Choice');
  });

  it('updates an existing decision record in place without duplicating', () => {
    saveDecisionRecord(mockRecord);
    const updatedRecord: DecisionRecord = {
      ...mockRecord,
      title: 'Updated Career Choice Title',
      finalDecision: {
        chosenOptionId: 'opt_1',
        chosenAt: 2000,
        notes: 'Final committed choice',
      },
    };

    saveDecisionRecord(updatedRecord);
    const loaded = loadSavedDecisions();
    expect(loaded.length).toBe(1);
    expect(loaded[0].title).toBe('Updated Career Choice Title');
    expect(loaded[0].finalDecision?.chosenOptionId).toBe('opt_1');
  });

  it('deletes a decision record correctly', () => {
    saveDecisionRecord(mockRecord);
    expect(loadSavedDecisions().length).toBe(1);

    const remaining = deleteDecisionRecord('test_123');
    expect(remaining.length).toBe(0);
    expect(loadSavedDecisions().length).toBe(0);
  });
});
