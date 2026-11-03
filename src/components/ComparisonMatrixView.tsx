import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Sliders, 
  Trophy, 
  Plus, 
  Info, 
  Award, 
  Check, 
  HelpCircle,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { MatrixCriterion, OptionInput } from '../types.ts';
import { calculateMatrixOptionScores } from '../utils/calculations.ts';

interface ComparisonMatrixViewProps {
  criteria: MatrixCriterion[];
  options: OptionInput[];
  onUpdateCriteria: (updatedCriteria: MatrixCriterion[]) => void;
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({
  criteria,
  options,
  onUpdateCriteria,
}) => {
  const [showAddCriterionModal, setShowAddCriterionModal] = useState(false);
  const [newCritName, setNewCritName] = useState('');
  const [newCritDesc, setNewCritDesc] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(3);
  const [newScores, setNewScores] = useState<{ [optId: string]: number }>({});

  // Calculate live weighted scores for each option
  const optionScoresSummary = useMemo(() => {
    return calculateMatrixOptionScores(criteria, options);
  }, [criteria, options]);

  const handleWeightChange = (criterionId: string, newWeight: number) => {
    const updated = criteria.map((c) => (c.id === criterionId ? { ...c, userWeight: newWeight } : c));
    onUpdateCriteria(updated);
  };

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName.trim()) return;

    const newCriterion: MatrixCriterion = {
      id: `crit_${Date.now()}`,
      name: newCritName.trim(),
      description: newCritDesc.trim() || 'Custom priority criterion',
      defaultWeight: newCritWeight,
      userWeight: newCritWeight,
      scores: options.map((opt) => ({
        optionId: opt.id,
        score: newScores[opt.id] || 6,
        comment: 'User-specified score',
      })),
    };

    onUpdateCriteria([...criteria, newCriterion]);
    setShowAddCriterionModal(false);
    setNewCritName('');
    setNewCritDesc('');
    setNewCritWeight(3);
    setNewScores({});
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards with Live Weighted Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((opt) => {
          const isWinner = opt.id === optionScoresSummary.winningOptionId;
          const scoreData = optionScoresSummary.results[opt.id];

          return (
            <div
              key={opt.id}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
                isWinner
                  ? 'border-indigo-600 bg-gradient-to-b from-indigo-50/70 to-white shadow-md dark:border-indigo-500 dark:from-indigo-950/40 dark:to-slate-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              {isWinner && (
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <Trophy className="h-3.5 w-3.5 text-amber-600" />
                  <span>Weighted Leader</span>
                </div>
              )}

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Option Evaluation
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 pr-24 line-clamp-1">
                {opt.label}
              </h3>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
                  {scoreData?.scoreOutOf100 ?? 0}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  / 100 weighted index
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isWinner ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-400 dark:bg-slate-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, scoreData?.scoreOutOf100 ?? 0))}%` }}
                />
              </div>

              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                <span>Avg raw score: {scoreData?.rawAverage ?? 0} / 10</span>
                <span>{criteria.length} criteria</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Comparison Matrix Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Table className="h-4 w-4 text-indigo-600" />
              <span>Side-by-Side Multi-Criteria Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adjust importance weights below to see how shifts in your personal values tilt the outcome.
            </p>
          </div>

          <button
            onClick={() => setShowAddCriterionModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-2xs transition"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Add Custom Criterion</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-3 px-4 sm:px-6 w-1/3 min-w-[220px]">
                  Evaluation Criterion & Importance
                </th>
                {options.map((opt) => (
                  <th key={opt.id} className="py-3 px-4 sm:px-6 min-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <span>{opt.label}</span>
                      {opt.id === optionScoresSummary.winningOptionId && (
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {criteria.map((criterion) => {
                const weight = criterion.userWeight ?? criterion.defaultWeight;

                return (
                  <tr 
                    key={criterion.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Criterion Name & Weight Slider */}
                    <td className="py-4 px-4 sm:px-6 align-top">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {criterion.name}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {criterion.description}
                      </p>

                      {/* Weight slider */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                          Weight:
                        </span>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={weight}
                          onChange={(e) => handleWeightChange(criterion.id, Number(e.target.value))}
                          className="h-1.5 w-24 accent-indigo-600 bg-slate-200 rounded-lg cursor-pointer dark:bg-slate-700"
                        />
                        <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-2xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800">
                          {weight}x
                        </span>
                      </div>
                    </td>

                    {/* Option Scores */}
                    {options.map((opt) => {
                      const scoreObj = criterion.scores.find((s) => s.optionId === opt.id);
                      const score = scoreObj?.score ?? 5;
                      const comment = scoreObj?.comment ?? '';

                      return (
                        <td key={opt.id} className="py-4 px-4 sm:px-6 align-top">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold ${
                                score >= 8
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : score >= 5
                                  ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              }`}
                            >
                              {score} / 10
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {comment}
                          </p>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Criterion Modal */}
      {showAddCriterionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Add Custom Evaluation Criterion
            </h3>
            <form onSubmit={handleAddCriterion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Criterion Name
                </label>
                <input
                  type="text"
                  required
                  value={newCritName}
                  onChange={(e) => setNewCritName(e.target.value)}
                  placeholder="e.g. Commute Time, Family Stability, Tech Debt"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newCritDesc}
                  onChange={(e) => setNewCritDesc(e.target.value)}
                  placeholder="Why this metric matters..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Importance Weight (1 = Minor, 5 = Critical)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={newCritWeight}
                  onChange={(e) => setNewCritWeight(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rate each option on this criterion (1-10):
                </div>
                {options.map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                      {opt.label}:
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      defaultValue={6}
                      onChange={(e) => setNewScores({ ...newScores, [opt.id]: Number(e.target.value) })}
                      className="w-20 rounded-md border border-slate-300 px-2 py-1 text-center font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCriterionModal(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-xs"
                >
                  Save Criterion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
