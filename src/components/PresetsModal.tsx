import React from 'react';
import { X, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { DECISION_PRESETS, DecisionPreset } from '../data/presets.ts';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: DecisionPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Dilemma Templates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a pre-configured scenario to see The Tiebreaker in action
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List of presets */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {DECISION_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-500 hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/20 transition cursor-pointer shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-2xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {preset.category}
                  </span>
                  <h4 className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {preset.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {preset.context}
                  </p>
                </div>
                <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-700 dark:text-slate-300 transition">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* Options pills */}
              <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                {preset.options.map((opt, i) => (
                  <span
                    key={opt.id}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-2xs text-slate-700 dark:bg-slate-700/60 dark:text-slate-300 font-medium"
                  >
                    {String.fromCharCode(65 + i)}: {opt.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
