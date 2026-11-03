import React, { useState } from 'react';
import { 
  Hourglass, 
  Calendar, 
  Clock, 
  AlertOctagon, 
  ShieldCheck, 
  Eye, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { OptionAnalysis } from '../types.ts';

interface TimelineRiskViewProps {
  optionsAnalysis: OptionAnalysis[];
}

export const TimelineRiskView: React.FC<TimelineRiskViewProps> = ({ optionsAnalysis }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    optionsAnalysis[0]?.optionId || ''
  );

  const currentOption = optionsAnalysis.find((o) => o.optionId === selectedOptionId) || optionsAnalysis[0];
  const { tenTenTen, preMortem } = currentOption;

  return (
    <div className="space-y-6">
      {/* Option switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            Temporal Horizons & Pre-Mortem Stress Test
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evaluating long-term emotional resonance and stress-testing potential points of failure
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-800">
          {optionsAnalysis.map((opt) => (
            <button
              key={opt.optionId}
              onClick={() => setSelectedOptionId(opt.optionId)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                opt.optionId === currentOption.optionId
                  ? 'bg-white text-indigo-700 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {opt.optionLabel}
            </button>
          ))}
        </div>
      </div>

      {/* 10-10-10 Rule Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
            <Hourglass className="h-4 w-4" />
          </span>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            The 10-10-10 Rule (Suzy Welch Framework)
          </h4>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Most bad decisions stem from short-term anxiety overriding long-term values. How does this option feel across three distinct horizons?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 10 Minutes */}
          <div className="relative rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                In 10 Minutes
              </span>
            </div>
            <div className="text-2xs font-semibold text-slate-400 mb-1">Immediate visceral reaction</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {tenTenTen.tenMinutes}
            </p>
          </div>

          {/* 10 Months */}
          <div className="relative rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                In 10 Months
              </span>
            </div>
            <div className="text-2xs font-semibold text-indigo-500/80 mb-1">Habitual routine & adaptation</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {tenTenTen.tenMonths}
            </p>
          </div>

          {/* 10 Years */}
          <div className="relative rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                In 10 Years
              </span>
            </div>
            <div className="text-2xs font-semibold text-emerald-600/80 mb-1">Life story & compound trajectory</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {tenTenTen.tenYears}
            </p>
          </div>
        </div>
      </div>

      {/* Pre-Mortem Stress Test Section */}
      <div className="rounded-2xl border border-rose-200/90 bg-rose-50/30 p-6 shadow-xs dark:border-rose-900/50 dark:bg-rose-950/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
            <AlertOctagon className="h-4 w-4" />
          </span>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
            Gary Klein Pre-Mortem: "What If This Option Fails?"
          </h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">
          Fast-forward 2 years. Assume you chose <strong>{currentOption.optionLabel}</strong> and it turned into an agonizing mistake.
          What went wrong, and how do we prevent it today?
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Failure Scenario */}
          <div className="rounded-xl border border-rose-200 bg-white p-4 dark:border-rose-900/60 dark:bg-slate-900 shadow-2xs">
            <span className="text-2xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-2">
              <AlertOctagon className="h-3.5 w-3.5" /> Plausible Failure Mode
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              "{preMortem.worstCaseScenario}"
            </p>
          </div>

          {/* Warning Signs */}
          <div className="rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-900/60 dark:bg-slate-900 shadow-2xs">
            <span className="text-2xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-2">
              <Eye className="h-3.5 w-3.5" /> Early Warning Signs (Month 1-3)
            </span>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700 dark:text-slate-300">
              {preMortem.warningSigns.map((sign, idx) => (
                <li key={idx} className="leading-snug">{sign}</li>
              ))}
            </ul>
          </div>

          {/* Immunization Action */}
          <div className="rounded-xl border border-emerald-200 bg-white p-4 dark:border-emerald-900/60 dark:bg-slate-900 shadow-2xs">
            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" /> Preventative Immunization
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {preMortem.preventativeAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
