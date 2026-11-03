import { describe, it, expect } from 'vitest';
import { 
  calculateOptionProsConsScore, 
  calculateMatrixOptionScores 
} from './calculations.ts';
import { OptionAnalysis, MatrixCriterion, OptionInput } from '../types.ts';

describe('calculateOptionProsConsScore', () => {
  it('correctly calculates default pros and cons sums and net score', () => {
    const mockOption: OptionAnalysis = {
      optionId: 'opt_1',
      optionLabel: 'Option A',
      pros: [
        { id: 'p1', title: 'High Salary', explanation: '', category: 'Finance', weight: 4 },
        { id: 'p2', title: 'Remote Work', explanation: '', category: 'Lifestyle', weight: 3 },
      ],
      cons: [
        { id: 'c1', title: 'Long Hours', explanation: '', category: 'Wellbeing', weight: 2 },
      ],
      swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      tenTenTen: { tenMinutes: '', tenMonths: '', tenYears: '' },
      preMortem: { worstCaseScenario: '', warningSigns: [], preventativeAction: '' },
    };

    const result = calculateOptionProsConsScore(mockOption);
    expect(result.prosScore).toBe(7); // 4 + 3
    expect(result.consScore).toBe(2); // 2
    expect(result.net).toBe(5); // 7 - 2
  });

  it('respects userWeight overrides over default weights', () => {
    const mockOption: OptionAnalysis = {
      optionId: 'opt_1',
      optionLabel: 'Option A',
      pros: [
        { id: 'p1', title: 'Pro 1', explanation: '', category: 'Test', weight: 2, userWeight: 5 },
      ],
      cons: [
        { id: 'c1', title: 'Con 1', explanation: '', category: 'Test', weight: 5, userWeight: 1 },
      ],
      swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      tenTenTen: { tenMinutes: '', tenMonths: '', tenYears: '' },
      preMortem: { worstCaseScenario: '', warningSigns: [], preventativeAction: '' },
    };

    const result = calculateOptionProsConsScore(mockOption);
    expect(result.prosScore).toBe(5);
    expect(result.consScore).toBe(1);
    expect(result.net).toBe(4);
  });

  it('excludes dismissed items from both pros and cons totals', () => {
    const mockOption: OptionAnalysis = {
      optionId: 'opt_1',
      optionLabel: 'Option A',
      pros: [
        { id: 'p1', title: 'Valid Pro', explanation: '', category: 'Test', weight: 4 },
        { id: 'p2', title: 'Dismissed Pro', explanation: '', category: 'Test', weight: 4, dismissed: true },
      ],
      cons: [
        { id: 'c1', title: 'Valid Con', explanation: '', category: 'Test', weight: 3 },
        { id: 'c2', title: 'Dismissed Con', explanation: '', category: 'Test', weight: 5, dismissed: true },
      ],
      swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      tenTenTen: { tenMinutes: '', tenMonths: '', tenYears: '' },
      preMortem: { worstCaseScenario: '', warningSigns: [], preventativeAction: '' },
    };

    const result = calculateOptionProsConsScore(mockOption);
    expect(result.prosScore).toBe(4);
    expect(result.consScore).toBe(3);
    expect(result.net).toBe(1);
  });

  it('returns 0 when lists are empty', () => {
    const mockOption: OptionAnalysis = {
      optionId: 'opt_1',
      optionLabel: 'Option A',
      pros: [],
      cons: [],
      swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      tenTenTen: { tenMinutes: '', tenMonths: '', tenYears: '' },
      preMortem: { worstCaseScenario: '', warningSigns: [], preventativeAction: '' },
    };

    const result = calculateOptionProsConsScore(mockOption);
    expect(result.prosScore).toBe(0);
    expect(result.consScore).toBe(0);
    expect(result.net).toBe(0);
  });
});

describe('calculateMatrixOptionScores', () => {
  const options: OptionInput[] = [
    { id: 'opt_a', label: 'Option A' },
    { id: 'opt_b', label: 'Option B' },
  ];

  it('correctly calculates weighted normalized scores and identifies winner', () => {
    const criteria: MatrixCriterion[] = [
      {
        id: 'crit_1',
        name: 'Financial Upside',
        description: '',
        defaultWeight: 3,
        scores: [
          { optionId: 'opt_a', score: 9, comment: '' },
          { optionId: 'opt_b', score: 4, comment: '' },
        ],
      },
      {
        id: 'crit_2',
        name: 'Work-Life Balance',
        description: '',
        defaultWeight: 3,
        scores: [
          { optionId: 'opt_a', score: 5, comment: '' },
          { optionId: 'opt_b', score: 8, comment: '' },
        ],
      },
    ];

    const summary = calculateMatrixOptionScores(criteria, options);

    // Option A: (9*3 + 5*3) = 42. Total possible: (3+3)*10 = 60. 42/60 = 70%
    // Option B: (4*3 + 8*3) = 36. 36/60 = 60%
    expect(summary.results['opt_a'].scoreOutOf100).toBe(70);
    expect(summary.results['opt_b'].scoreOutOf100).toBe(60);
    expect(summary.winningOptionId).toBe('opt_a');
  });

  it('shifts winning option when user adjusts importance weights', () => {
    const criteria: MatrixCriterion[] = [
      {
        id: 'crit_1',
        name: 'Financial Upside',
        description: '',
        defaultWeight: 3,
        userWeight: 1, // User lowers financial weight to 1
        scores: [
          { optionId: 'opt_a', score: 9, comment: '' },
          { optionId: 'opt_b', score: 4, comment: '' },
        ],
      },
      {
        id: 'crit_2',
        name: 'Work-Life Balance',
        description: '',
        defaultWeight: 3,
        userWeight: 5, // User raises balance weight to 5
        scores: [
          { optionId: 'opt_a', score: 5, comment: '' },
          { optionId: 'opt_b', score: 8, comment: '' },
        ],
      },
    ];

    const summary = calculateMatrixOptionScores(criteria, options);

    // Option A: 9*1 + 5*5 = 34. Total weight: 6 -> 60. 34/60 = 57%
    // Option B: 4*1 + 8*5 = 44. 44/60 = 73%
    expect(summary.winningOptionId).toBe('opt_b');
    expect(summary.results['opt_b'].scoreOutOf100).toBe(73);
  });

  it('handles empty criteria gracefully without crashing', () => {
    const summary = calculateMatrixOptionScores([], options);
    expect(summary.results['opt_a'].scoreOutOf100).toBe(0);
    expect(summary.results['opt_b'].scoreOutOf100).toBe(0);
  });
});
