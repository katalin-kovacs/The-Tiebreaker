import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  Send, 
  Sparkles, 
  Lightbulb, 
  Compass, 
  ArrowRight, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { DecisionRecord, RefinementLog } from '../types.ts';

interface DecisionRefinerProps {
  decision: DecisionRecord;
  onAddRefinement: (refinement: RefinementLog) => void;
}

export const DecisionRefiner: React.FC<DecisionRefinerProps> = ({
  decision,
  onAddRefinement,
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleQuestions = [
    'What if I can negotiate 20% higher compensation for Option A?',
    'What if I prioritize work-life balance over rapid growth for the next 12 months?',
    'What if economic conditions worsen in 6 months?',
    'How reversible is each of these options if I regret my choice?',
  ];

  const handleRefine = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/refine-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle: decision.title,
          options: decision.options,
          question: questionText.trim(),
          currentVerdict: decision.verdict,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to refine decision');
      }

      const data = await res.json();
      const newRefinement: RefinementLog = {
        question: questionText.trim(),
        answer: data.answer,
        verdictImpact: data.verdictImpact,
        actionSteps: data.actionSteps || [],
        timestamp: Date.now(),
      };

      onAddRefinement(newRefinement);
      setQuestion('');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to refine decision. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
            <MessageSquarePlus className="h-4 w-4" />
          </span>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            AI Decision Refiner & "What-If" Simulator
          </h3>
        </div>
        <span className="text-2xs text-slate-400">
          Stress-test hypotheticals and negotiate terms
        </span>
      </div>

      {/* Suggested Quick Queries */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          <span>Simulate hypothetical conditions:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleRefine(q)}
              disabled={isLoading}
              className="rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-left text-xs text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-600 dark:hover:text-indigo-300 transition"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRefine(question);
        }}
        className="relative"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a what-if question (e.g. 'What if I can negotiate working remote 3 days a week?')"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 active:scale-95 disabled:opacity-50 transition shrink-0"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Simulate</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg">
          {error}
        </div>
      )}

      {/* Log of past refinements */}
      {decision.refinements && decision.refinements.length > 0 && (
        <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            What-If Simulations Log ({decision.refinements.length})
          </h4>
          <div className="space-y-3">
            {decision.refinements.map((log, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-slate-400 font-medium">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    Q: {log.question}
                  </span>
                  <span className="flex items-center gap-1 text-2xs">
                    <Clock className="h-3 w-3" />
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                  {log.answer}
                </p>

                <div className="flex items-start gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/60 p-2 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                  <Compass className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span><strong>Verdict Impact:</strong> {log.verdictImpact}</span>
                </div>

                {log.actionSteps && log.actionSteps.length > 0 && (
                  <div className="pt-1">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Action items:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 mt-0.5">
                      {log.actionSteps.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
