import React, { useState } from 'react';
import { 
  Coins, 
  RotateCw, 
  HeartHandshake, 
  Sparkles, 
  Lightbulb, 
  Check, 
  Smile, 
  Frown,
  Meh
} from 'lucide-react';
import { OptionInput } from '../types.ts';

interface GutCheckViewProps {
  options: OptionInput[];
  gutCheckPrompt: string;
  onCommitDecision: (optionId: string, notes?: string) => void;
}

export const GutCheckView: React.FC<GutCheckViewProps> = ({
  options,
  gutCheckPrompt,
  onCommitDecision,
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [landedOption, setLandedOption] = useState<OptionInput | null>(null);
  const [flipCount, setFlipCount] = useState(0);
  const [gutFeedback, setGutFeedback] = useState<'relieved' | 'disappointed' | 'neutral' | null>(null);

  const optA = options[0];
  const optB = options[1] || options[0];

  const handleFlipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setGutFeedback(null);

    // Flip for 1.8 seconds
    setTimeout(() => {
      const pick = options[Math.floor(Math.random() * options.length)];
      setLandedOption(pick);
      setIsFlipping(false);
      setFlipCount((prev) => prev + 1);
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 mb-2">
          <Coins className="h-3.5 w-3.5 text-amber-600" />
          <span>The Subconscious Tiebreaker Test</span>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          The Virtual Coin Flip & Gut Check
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          "When you are torn between two choices, flip a coin. In that brief second while the coin is in the air, you suddenly know what you are hoping for."
        </p>
      </div>

      {/* AI Provocative Gut Prompt Card */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white p-5 shadow-xs dark:border-indigo-900/60 dark:from-indigo-950/30 dark:to-slate-900">
        <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span>Visceral Reflection Prompt:</span>
        </div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
          "{gutCheckPrompt}"
        </p>
      </div>

      {/* Interactive Coin Flip Stage */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-center flex flex-col items-center">
        <div className="relative mb-6 flex items-center justify-center">
          {/* Animated Coin */}
          <div
            className={`relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-xl shadow-amber-500/20 text-slate-900 select-none transition-all ${
              isFlipping ? 'animate-bounce [transform:rotateY(720deg)] duration-1000' : 'hover:scale-105'
            }`}
          >
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <Coins className="h-8 w-8 text-amber-800 mb-1" />
              <span className="text-xs font-black uppercase tracking-tight text-amber-950">
                {isFlipping
                  ? 'FLIPPING...'
                  : landedOption
                  ? landedOption.label.slice(0, 18)
                  : 'FLIP ME'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleFlipCoin}
          disabled={isFlipping}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-50 transition"
        >
          <RotateCw className={`h-4 w-4 ${isFlipping ? 'animate-spin' : ''}`} />
          <span>{isFlipping ? 'Flipping through the air...' : flipCount > 0 ? 'Flip Again' : 'Toss The Tiebreaker Coin'}</span>
        </button>

        {/* Revealed Reaction Check */}
        {landedOption && !isFlipping && (
          <div className="mt-8 w-full border-t border-slate-100 dark:border-slate-800 pt-6 animate-fade-in">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              The Coin Decided:
            </span>
            <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {landedOption.label}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Stop! Notice your genuine reaction right now. Which did you feel?
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => setGutFeedback('relieved')}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs font-bold transition ${
                    gutFeedback === 'relieved'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Smile className="h-5 w-5 text-emerald-600" />
                  <span>Relief / Happy</span>
                </button>

                <button
                  onClick={() => setGutFeedback('disappointed')}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs font-bold transition ${
                    gutFeedback === 'disappointed'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Frown className="h-5 w-5 text-rose-600" />
                  <span>Disappointment</span>
                </button>

                <button
                  onClick={() => setGutFeedback('neutral')}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs font-bold transition ${
                    gutFeedback === 'neutral'
                      ? 'border-slate-500 bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Meh className="h-5 w-5 text-slate-500" />
                  <span>Indifferent</span>
                </button>
              </div>

              {/* Gut diagnosis */}
              {gutFeedback && (
                <div className="mt-4 p-3 rounded-lg text-xs leading-relaxed border text-left animate-fade-in">
                  {gutFeedback === 'relieved' ? (
                    <div className="text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/40 p-2.5 rounded-md">
                      <strong>Your gut agrees with this choice!</strong> The relief confirms that deep down, <em>{landedOption.label}</em> is what you truly desire.
                    </div>
                  ) : gutFeedback === 'disappointed' ? (
                    <div className="text-rose-800 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/40 p-2.5 rounded-md">
                      <strong>The tie is broken!</strong> You felt disappointed because your heart actually wanted the OTHER option! Reject the coin and choose the alternative.
                    </div>
                  ) : (
                    <div className="text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800 p-2.5 rounded-md">
                      Both options are truly close in emotional appeal. Rely heavily on the <strong>Comparison Matrix</strong> and <strong>Pre-Mortem</strong> to decide on objective risks.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
