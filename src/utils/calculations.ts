import { OptionAnalysis, MatrixCriterion, OptionInput } from '../types.ts';

export interface ProsConsScoreResult {
  prosScore: number;
  consScore: number;
  net: number;
}

/**
 * Calculates net score for an option's pros and cons, accounting for
 * user weight overrides and dismissed/ignored items.
 */
export function calculateOptionProsConsScore(opt: OptionAnalysis): ProsConsScoreResult {
  const prosScore = (opt.pros || [])
    .filter((p) => !p.dismissed)
    .reduce((acc, p) => acc + (p.userWeight ?? p.weight), 0);

  const consScore = (opt.cons || [])
    .filter((c) => !c.dismissed)
    .reduce((acc, c) => acc + (c.userWeight ?? c.weight), 0);

  return {
    prosScore,
    consScore,
    net: prosScore - consScore,
  };
}

export interface MatrixScoresSummary {
  results: {
    [optId: string]: {
      scoreOutOf100: number;
      rawAverage: number;
    };
  };
  winningOptionId: string;
  highestScore: number;
}

/**
 * Calculates live multi-criteria weighted scores (0 to 100 index)
 * based on user criteria weights and individual option ratings.
 */
export function calculateMatrixOptionScores(
  criteria: MatrixCriterion[],
  options: OptionInput[]
): MatrixScoresSummary {
  const totals: {
    [optId: string]: { weightedSum: number; rawSum: number };
  } = {};

  options.forEach((opt) => {
    totals[opt.id] = { weightedSum: 0, rawSum: 0 };
  });

  let totalWeight = 0;

  criteria.forEach((criterion) => {
    const weight = criterion.userWeight ?? criterion.defaultWeight ?? 1;
    totalWeight += weight;

    (criterion.scores || []).forEach((sc) => {
      if (totals[sc.optionId]) {
        totals[sc.optionId].weightedSum += sc.score * weight;
        totals[sc.optionId].rawSum += sc.score;
      }
    });
  });

  const results: {
    [optId: string]: { scoreOutOf100: number; rawAverage: number };
  } = {};

  let highestScore = -1;
  let winningOptionId = options[0]?.id || '';

  options.forEach((opt) => {
    const weightedSum = totals[opt.id]?.weightedSum || 0;
    const scoreOutOf100 =
      totalWeight > 0 ? Math.round((weightedSum / (totalWeight * 10)) * 100) : 0;
    const rawAverage =
      criteria.length > 0 ? Number(((totals[opt.id]?.rawSum || 0) / criteria.length).toFixed(1)) : 0;

    results[opt.id] = { scoreOutOf100, rawAverage };

    if (scoreOutOf100 > highestScore) {
      highestScore = scoreOutOf100;
      winningOptionId = opt.id;
    }
  });

  return { results, winningOptionId, highestScore };
}
