import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Shield, 
  Target,
  ArrowRight
} from 'lucide-react';
import { OptionAnalysis } from '../types.ts';

interface SWOTViewProps {
  optionsAnalysis: OptionAnalysis[];
}

export const SWOTView: React.FC<SWOTViewProps> = ({ optionsAnalysis }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    optionsAnalysis[0]?.optionId || ''
  );

  const currentOption = optionsAnalysis.find((o) => o.optionId === selectedOptionId) || optionsAnalysis[0];
  const { swot } = currentOption;

  return (
    <div className="space-y-6">
      {/* Option Switcher Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            SWOT Strategic Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Internal Strengths & Weaknesses vs External Opportunities & Threats
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

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths (Internal Positive) */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                Strengths (Internal Advantages)
              </h4>
              <span className="text-2xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                What you control & excel at
              </span>
            </div>
          </div>
          <ul className="space-y-2">
            {swot.strengths.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-white p-3 text-xs text-slate-800 dark:border-emerald-900/40 dark:bg-slate-900 dark:text-slate-200 shadow-2xs"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  S{idx + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses (Internal Negative) */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900/60 dark:bg-amber-950/20 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Weaknesses (Internal Vulnerabilities)
              </h4>
              <span className="text-2xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Where you are constrained or deficient
              </span>
            </div>
          </div>
          <ul className="space-y-2">
            {swot.weaknesses.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-white p-3 text-xs text-slate-800 dark:border-amber-900/40 dark:bg-slate-900 dark:text-slate-200 shadow-2xs"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  W{idx + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities (External Positive) */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/20 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300">
              <TrendingUp className="h-4 w-4" />
            </span>
            <div>
              <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                Opportunities (External Upside)
              </h4>
              <span className="text-2xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                Tailwinds, trends & future doors opened
              </span>
            </div>
          </div>
          <ul className="space-y-2">
            {swot.opportunities.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-indigo-200/80 bg-white p-3 text-xs text-slate-800 dark:border-indigo-900/40 dark:bg-slate-900 dark:text-slate-200 shadow-2xs"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  O{idx + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Threats (External Negative) */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900/60 dark:bg-rose-950/20 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900/80 dark:text-rose-300">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div>
              <h4 className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                Threats (External Hazards)
              </h4>
              <span className="text-2xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                Risks, competition & uncontrollable shifts
              </span>
            </div>
          </div>
          <ul className="space-y-2">
            {swot.threats.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-rose-200/80 bg-white p-3 text-xs text-slate-800 dark:border-rose-900/40 dark:bg-slate-900 dark:text-slate-200 shadow-2xs"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-2xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  T{idx + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategic Playbook takeaway */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-indigo-600" />
          <span>Strategic Takeaways for {currentOption.optionLabel}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/30">
            <div className="font-bold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
              <span>Offensive Move (S + O):</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Leverage your key strength ({swot.strengths[0] || 'core capability'}) directly into seizing ({swot.opportunities[0] || 'market expansion'}).
            </p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 dark:border-amber-950 dark:bg-amber-950/30">
            <div className="font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
              <span>Defensive Buffer (W + T):</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Shield against ({swot.threats[0] || 'potential shocks'}) by proactively addressing ({swot.weaknesses[0] || 'key bottleneck'}).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
