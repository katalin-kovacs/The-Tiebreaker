import React from 'react';
import { 
  X, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Scale,
  Sparkles
} from 'lucide-react';
import { DecisionRecord } from '../types.ts';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionRecord[];
  activeDecisionId: string | null;
  onSelectDecision: (decision: DecisionRecord) => void;
  onDeleteDecision: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  activeDecisionId,
  onSelectDecision,
  onDeleteDecision,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              <Scale className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Decision History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {savedDecisions.length} recorded {savedDecisions.length === 1 ? 'dilemma' : 'dilemmas'}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedDecisions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No saved decisions yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                When you break ties and analyze options, they will be archived here automatically.
              </p>
            </div>
          ) : (
            savedDecisions.map((record) => {
              const isActive = record.id === activeDecisionId;
              const isResolved = !!record.finalDecision;
              const chosenOption = record.options.find(
                (o) => o.id === record.finalDecision?.chosenOptionId
              );

              return (
                <div
                  key={record.id}
                  className={`group relative rounded-xl border p-4 transition-all cursor-pointer ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/60'
                  }`}
                  onClick={() => {
                    onSelectDecision(record);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                      {record.title}
                    </h4>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDecision(record.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete decision"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-2xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>

                    {isResolved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Chosen: {chosenOption?.label || 'Committed'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <span>Evaluating</span>
                      </span>
                    )}

                    <span className="ml-auto font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                      Open <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
