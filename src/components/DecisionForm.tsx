import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Target, 
  Calendar, 
  ShieldAlert,
  Lightbulb,
  Info,
  Layers,
  FileQuestion,
  CheckCircle2
} from 'lucide-react';
import { OptionInput } from '../types.ts';
import { DECISION_PRESETS, DecisionPreset } from '../data/presets.ts';

interface DecisionFormProps {
  onSubmit: (formData: {
    title: string;
    options: OptionInput[];
    context: string;
    primaryGoal: string;
  }) => void;
  isLoading: boolean;
  onSelectPreset: (preset: DecisionPreset) => void;
}

export const DecisionForm: React.FC<DecisionFormProps> = ({
  onSubmit,
  isLoading,
  onSelectPreset,
}) => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<OptionInput[]>([
    { id: 'opt_1', label: '', description: '' },
    { id: 'opt_2', label: '', description: '' },
  ]);
  const [context, setContext] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddOption = () => {
    if (options.length >= 4) return;
    const newId = `opt_${Date.now()}`;
    setOptions([...options, { id: newId, label: '', description: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    const updated = [...options];
    updated.splice(index, 1);
    setOptions(updated);
  };

  const handleClearOptions = () => {
    setOptions([]);
  };

  const handleOptionChange = (index: number, field: 'label' | 'description', value: string) => {
    const updated = [...options];
    updated[index][field] = value;
    setOptions(updated);
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a decision or dilemma you want to resolve.');
      return;
    }

    // Keep any options that have at least some text, or pass empty array if user left them blank
    const filledOptions = options.filter((o) => o.label.trim().length > 0);

    setError(null);
    onSubmit({
      title: title.trim(),
      options: filledOptions,
      context: context.trim(),
      primaryGoal: primaryGoal.trim(),
    });
  };

  const loadPreset = (preset: DecisionPreset) => {
    setTitle(preset.title);
    setOptions(preset.options);
    setContext(preset.context);
    setPrimaryGoal(preset.primaryGoal);
    setError(null);
  };

  const filledOptionsCount = options.filter((o) => o.label.trim().length > 0).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/80 dark:bg-indigo-950/50 dark:text-indigo-300 mb-3 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Stop Overthinking • Start Choosing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Break The Tie On Tough Decisions
        </h1>
        <p className="mt-2.5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Describe the dilemma you are wrestling with. The Tiebreaker analyzes your trade-offs through weighted pros & cons, a multi-criteria comparison matrix, SWOT analysis, and a definitive verdict.
        </p>

        {/* Quick presets bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Quick examples:
          </span>
          {DECISION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:border-indigo-600 dark:hover:text-indigo-300 transition"
            >
              {preset.category}: {preset.title.slice(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-xs">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: Dilemma Title (Required) */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <label 
                htmlFor="decision-title" 
                className="block text-base font-bold text-slate-900 dark:text-white"
              >
                1. What is the decision you need to make? <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Required
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              State the question, fork in the road, or dilemma you are facing.
            </p>
            <div className="relative">
              <input
                id="decision-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Should I accept the senior offer at a startup vs stay at my corporate tech job?"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-3 focus:ring-indigo-600/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 text-base font-medium"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* SECTION 2: Options Under Consideration (Optional & Clearly Labeled) */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    2. Options Under Consideration
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Already have specific paths in mind? Enter them below. If you leave this blank, The Tiebreaker will automatically generate the 2–3 most logical paths to compare for your dilemma.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {options.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    <Plus className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Add Option</span>
                  </button>
                )}

                {options.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearOptions}
                    disabled={isLoading}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-1"
                    title="Clear all option boxes to let AI auto-generate options"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Options list or Auto-suggest Empty State */}
            {options.length === 0 ? (
              <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/20 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-indigo-500 mb-1.5" />
                <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  AI will auto-generate options for your dilemma
                </h4>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 max-w-md mx-auto mt-0.5">
                  You don't need to specify any choices. The Tiebreaker will automatically identify the most viable contrasting paths (e.g. Option A vs Option B) based on your dilemma.
                </p>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>I'd rather specify my own options</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {options.map((opt, idx) => (
                  <div 
                    key={opt.id}
                    className="group relative rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    {/* Option Header badge */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 font-bold text-xs text-white shadow-xs">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Option {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-2xs text-slate-400">
                          (Optional — fill in or leave empty)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Remove this option box"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Distinctly labeled fields explaining what each box represents */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Box 1: Option Title / Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span>Option Name / Action</span>
                          <span className="text-2xs font-normal text-slate-400">Primary label</span>
                        </label>
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                          placeholder={
                            idx === 0 
                              ? 'e.g. Accept the startup offer' 
                              : idx === 1 
                              ? 'e.g. Stay at current corporate role' 
                              : 'e.g. Negotiate internal transfer'
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          disabled={isLoading}
                        />
                        <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                          The distinct course of action you could take.
                        </p>
                      </div>

                      {/* Box 2: Specific Nuance or Conditions */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span>Key Nuance or Specifics (Optional)</span>
                          <span className="text-2xs font-normal text-slate-400">Extra detail</span>
                        </label>
                        <input
                          type="text"
                          value={opt.description || ''}
                          onChange={(e) => handleOptionChange(idx, 'description', e.target.value)}
                          placeholder={
                            idx === 0 
                              ? 'e.g. 1.5% equity stake, 60-hr weeks, higher upside' 
                              : idx === 1 
                              ? 'e.g. 40-hr weeks, 401k match, slower promotions' 
                              : 'e.g. Ask for 15% raise and hybrid schedule'
                          }
                          className="w-full rounded-lg border border-slate-300/90 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          disabled={isLoading}
                        />
                        <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                          Any specific terms, costs, or tradeoffs already attached to this choice.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: Personal Context, Constraints & Priorities (Openly Visible & Optional) */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Your Personal Context, Constraints & Values
              </h2>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Optional
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
              Decisions never happen in a vacuum. Adding your real-world circumstances helps The Tiebreaker give practical, nuanced advice rather than theoretical generalities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Field 1: Core Value Priority / Goal */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Primary Value Goal / North Star (Optional)</span>
                </label>
                <input
                  type="text"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  placeholder="e.g. Maximize 5-year wealth, peace of mind & family time, rapid learning, freedom"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  disabled={isLoading}
                />
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  What single factor matters most when push comes to shove?
                </p>
              </div>

              {/* Field 2: Real-World Constraints */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Real-World Context & Constraints (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. 6 months liquid emergency fund, toddler at home, need to decide by Friday, low risk tolerance"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  disabled={isLoading}
                />
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  Timelines, budget limits, family commitments, or hard non-negotiables.
                </p>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                {filledOptionsCount >= 2 
                  ? `Comparing your ${filledOptionsCount} specified options`
                  : filledOptionsCount === 1 
                  ? 'Comparing your option against the natural alternative' 
                  : 'AI will formulate and contrast the best options automatically'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>The Tiebreaker is evaluating trade-offs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {filledOptionsCount >= 2
                      ? 'Break The Tie & Compare'
                      : 'Break The Tie (Auto-Generate Options)'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
