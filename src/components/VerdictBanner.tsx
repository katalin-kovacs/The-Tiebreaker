import React, { useState } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle, 
  Check, 
  RotateCcw,
  Compass,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DecisionRecord, OptionInput } from '../types.ts';

interface VerdictBannerProps {
  decision: DecisionRecord;
  onCommitDecision: (optionId: string, notes?: string) => void;
  onReopenDecision: () => void;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({
  decision,
  onCommitDecision,
  onReopenDecision,
}) => {
  const { verdict, options, finalDecision } = decision;
  const [selectedCommitOption, setSelectedCommitOption] = useState<string>(
    finalDecision?.chosenOptionId || verdict.recommendedOptionId
  );
  const [commitNotes, setCommitNotes] = useState<string>(finalDecision?.notes || '');
  const [isCommitting, setIsCommitting] = useState(false);

  const handleCommit = () => {
    // Fire celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b'],
      });
    } catch {
      // ignore
    }
    onCommitDecision(selectedCommitOption, commitNotes);
    setIsCommitting(false);
  };

  const chosenOption = options.find((o) => o.id === finalDecision?.chosenOptionId);
  const recommendedOpt = options.find((o) => o.id === verdict.recommendedOptionId);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white">
      <div className="p-6 sm:p-8">
        {/* Top Tag & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 ring-1 ring-amber-300/60 dark:ring-amber-700">
              <Trophy className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              The Tiebreaker Recommendation
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>{verdict.confidenceScore}% Confidence</span>
            </span>

            {finalDecision ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Resolved: {chosenOption?.label}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                <span>In Evaluation</span>
              </span>
            )}
          </div>
        </div>

        {/* Hero Title & Rationale */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Suggested Winner:
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>{verdict.recommendedOptionLabel}</span>
              </h2>
              <p className="mt-1 text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400">
                "{verdict.headline}"
              </p>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {verdict.rationale}
            </p>

            {/* Decisive Pivot Factor (Preserved Background Block) */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs sm:text-sm dark:border-indigo-900/60 dark:bg-indigo-950/40">
              <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
                <Compass className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>The Decisive Factor:</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {verdict.keyDecisiveFactor}
              </p>
            </div>
          </div>

          {/* Right Column: Blindspots & Commit Action */}
          <div className="lg:col-span-4 space-y-4">
            {/* Blindspots card (Preserved Background Block) */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="font-bold flex items-center gap-1.5 mb-1.5 text-amber-900 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Watch Out For These Blindspots:</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
                {verdict.blindspots.map((spot, i) => (
                  <li key={i} className="leading-snug">{spot}</li>
                ))}
              </ul>
            </div>

            {/* Action Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              {!finalDecision ? (
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Ready to lock in your decision?
                  </div>
                  {!isCommitting ? (
                    <button
                      onClick={() => setIsCommitting(true)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-500 active:scale-95 transition cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Commit to an Option</span>
                    </button>
                  ) : (
                    <div className="space-y-2.5">
                      <select
                        value={selectedCommitOption}
                        onChange={(e) => setSelectedCommitOption(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label} {opt.id === verdict.recommendedOptionId ? '★ (AI Recommended)' : ''}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={commitNotes}
                        onChange={(e) => setCommitNotes(e.target.value)}
                        placeholder="Optional note: Why you decided this..."
                        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCommit}
                          className="flex-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition cursor-pointer"
                        >
                          Lock It In
                        </button>
                        <button
                          onClick={() => setIsCommitting(false)}
                          className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Decision committed!</span>
                    {finalDecision.notes && <p className="italic text-slate-500 dark:text-slate-400 mt-0.5">"{finalDecision.notes}"</p>}
                  </div>
                  <button
                    onClick={onReopenDecision}
                    className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Change or reopen decision"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Change</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
