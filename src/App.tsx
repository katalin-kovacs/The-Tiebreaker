import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Table, 
  Compass, 
  Coins, 
  Hourglass, 
  Download, 
  Share2, 
  ArrowLeft,
  Sliders,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { 
  DecisionRecord, 
  OptionInput, 
  OptionAnalysis, 
  MatrixCriterion, 
  RefinementLog, 
  ViewTab 
} from './types.ts';
import { loadSavedDecisions, saveDecisionRecord, deleteDecisionRecord } from './utils/storage.ts';
import { DecisionPreset } from './data/presets.ts';

import { Navbar } from './components/Navbar.tsx';
import { DecisionForm } from './components/DecisionForm.tsx';
import { VerdictBanner } from './components/VerdictBanner.tsx';
import { ProsConsView } from './components/ProsConsView.tsx';
import { ComparisonMatrixView } from './components/ComparisonMatrixView.tsx';
import { SWOTView } from './components/SWOTView.tsx';
import { TimelineRiskView } from './components/TimelineRiskView.tsx';
import { GutCheckView } from './components/GutCheckView.tsx';
import { DecisionRefiner } from './components/DecisionRefiner.tsx';
import { ExportReportModal } from './components/ExportReportModal.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { PresetsModal } from './components/PresetsModal.tsx';

export default function App() {
  const [savedDecisions, setSavedDecisions] = useState<DecisionRecord[]>([]);
  const [activeDecision, setActiveDecision] = useState<DecisionRecord | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('verdict');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptedData, setLastAttemptedData] = useState<{
    title: string;
    options: OptionInput[];
    context: string;
    primaryGoal: string;
  } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Modals & Drawers
  const [showHistory, setShowHistory] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Load saved decisions on mount
  useEffect(() => {
    const list = loadSavedDecisions();
    setSavedDecisions(list);
    if (list.length > 0 && !activeDecision) {
      // Don't auto-open unless user wants, but we can set as recent if desired
    }
  }, []);

  const handleCancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setLoadingStep('');
    setError(null);
  };

  const handleAnalyzeDecision = async (formData: {
    title: string;
    options: OptionInput[];
    context: string;
    primaryGoal: string;
  }) => {
    setLastAttemptedData(formData);
    setIsLoading(true);
    setError(null);
    setLoadingStep('Reviewing dilemma and option constraints...');

    // Setup fresh AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer1 = setTimeout(() => {
      setLoadingStep('Generating categorized pros & cons with mitigations...');
    }, 1500);

    const timer2 = setTimeout(() => {
      setLoadingStep('Constructing SWOT matrices & 10-10-10 forecasts...');
    }, 3500);

    const timer3 = setTimeout(() => {
      setLoadingStep('Formulating decisive Tiebreaker verdict...');
    }, 6000);

    try {
      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze decision');
      }

      const data = await response.json();

      const newRecord: DecisionRecord = {
        id: `decision_${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        title: formData.title,
        context: formData.context,
        primaryGoal: formData.primaryGoal,
        summary: data.summary,
        options:
          data.options && data.options.length >= 2
            ? data.options
            : formData.options && formData.options.length >= 2
            ? formData.options
            : data.optionsAnalysis.map((oa: any) => ({
                id: oa.optionId,
                label: oa.optionLabel,
                description: '',
              })),
        verdict: data.verdict,
        optionsAnalysis: data.optionsAnalysis,
        comparisonMatrix: data.comparisonMatrix,
        gutCheckPrompt: data.gutCheckPrompt,
        refinements: [],
      };

      saveDecisionRecord(newRecord);
      setSavedDecisions((prev) => [newRecord, ...prev.filter((d) => d.id !== newRecord.id)]);
      setActiveDecision(newRecord);
      setActiveTab('verdict');

      // Light celebratory confetti for completing analysis
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (err?.name === 'AbortError' || controller.signal.aborted) {
        console.log('Analysis cancelled by user');
        return;
      }

      console.error(err);
      setError(err?.message || 'An error occurred while analyzing. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
      abortControllerRef.current = null;
    }
  };

  const handleUpdateAnalysis = (updatedAnalysis: OptionAnalysis[]) => {
    if (!activeDecision) return;
    const updatedRecord: DecisionRecord = {
      ...activeDecision,
      optionsAnalysis: updatedAnalysis,
      updatedAt: Date.now(),
    };
    setActiveDecision(updatedRecord);
    saveDecisionRecord(updatedRecord);
    setSavedDecisions((prev) =>
      prev.map((d) => (d.id === updatedRecord.id ? updatedRecord : d))
    );
  };

  const handleUpdateCriteria = (updatedCriteria: MatrixCriterion[]) => {
    if (!activeDecision) return;
    const updatedRecord: DecisionRecord = {
      ...activeDecision,
      comparisonMatrix: { criteria: updatedCriteria },
      updatedAt: Date.now(),
    };
    setActiveDecision(updatedRecord);
    saveDecisionRecord(updatedRecord);
    setSavedDecisions((prev) =>
      prev.map((d) => (d.id === updatedRecord.id ? updatedRecord : d))
    );
  };

  const handleCommitDecision = (chosenOptionId: string, notes?: string) => {
    if (!activeDecision) return;
    const updatedRecord: DecisionRecord = {
      ...activeDecision,
      finalDecision: {
        chosenOptionId,
        chosenAt: Date.now(),
        notes,
      },
      updatedAt: Date.now(),
    };
    setActiveDecision(updatedRecord);
    saveDecisionRecord(updatedRecord);
    setSavedDecisions((prev) =>
      prev.map((d) => (d.id === updatedRecord.id ? updatedRecord : d))
    );
  };

  const handleReopenDecision = () => {
    if (!activeDecision) return;
    const { finalDecision, ...rest } = activeDecision;
    const updatedRecord: DecisionRecord = {
      ...rest,
      updatedAt: Date.now(),
    };
    setActiveDecision(updatedRecord);
    saveDecisionRecord(updatedRecord);
    setSavedDecisions((prev) =>
      prev.map((d) => (d.id === updatedRecord.id ? updatedRecord : d))
    );
  };

  const handleAddRefinement = (refinement: RefinementLog) => {
    if (!activeDecision) return;
    const updatedRecord: DecisionRecord = {
      ...activeDecision,
      refinements: [refinement, ...(activeDecision.refinements || [])],
      updatedAt: Date.now(),
    };
    setActiveDecision(updatedRecord);
    saveDecisionRecord(updatedRecord);
    setSavedDecisions((prev) =>
      prev.map((d) => (d.id === updatedRecord.id ? updatedRecord : d))
    );
  };

  const handleDeleteDecision = (id: string) => {
    const updated = deleteDecisionRecord(id);
    setSavedDecisions(updated);
    if (activeDecision?.id === id) {
      setActiveDecision(null);
    }
  };

  const handleSelectPreset = (preset: DecisionPreset) => {
    handleAnalyzeDecision({
      title: preset.title,
      options: preset.options,
      context: preset.context,
      primaryGoal: preset.primaryGoal,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* Navbar */}
      <Navbar
        onNewDecision={() => setActiveDecision(null)}
        onOpenHistory={() => setShowHistory(true)}
        savedCount={savedDecisions.length}
        onOpenPresets={() => setShowPresets(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-indigo-500/30 bg-slate-900 p-8 text-center text-white shadow-2xl space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30">
                <Scale className="h-8 w-8 animate-pulse text-white" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">
                The Tiebreaker is at Work
              </h3>
              <p className="text-sm text-indigo-300 font-medium">
                {loadingStep || 'Analyzing trade-offs, weights, and blindspots...'}
              </p>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-indeterminate" />
              </div>
              <p className="text-2xs text-slate-400">
                Evaluating criteria, generating mitigations, and cross-checking cognitive biases
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCancelAnalysis}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel Analysis</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner with Quick Retry */}
        {error && (
          <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-200 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide text-rose-800 dark:text-rose-300">
                      Temporary Service Notice
                    </h4>
                    <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300/90 leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {lastAttemptedData && (
                    <button
                      onClick={() => handleAnalyzeDecision(lastAttemptedData)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-500 active:scale-95 transition"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Try Again</span>
                    </button>
                  )}
                  <button
                    onClick={() => setError(null)}
                    className="rounded-lg border border-rose-300 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/40 transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Dilemma Input Form OR Analysis Dashboard */}
        {!activeDecision ? (
          <DecisionForm
            onSubmit={handleAnalyzeDecision}
            isLoading={isLoading}
            onSelectPreset={handleSelectPreset}
          />
        ) : (
          <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-6">
            {/* Top Back & Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setActiveDecision(null)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>New / Change Dilemma</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
                  title="Export markdown report or print"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Brief</span>
                </button>
              </div>
            </div>

            {/* Dilemma Title & Meta */}
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Decision Dilemma
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {activeDecision.title}
              </h1>
              {activeDecision.context && (
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Context:</strong> {activeDecision.context}
                </p>
              )}
            </div>

            {/* Executive Verdict Hero Banner */}
            <VerdictBanner
              decision={activeDecision}
              onCommitDecision={handleCommitDecision}
              onReopenDecision={handleReopenDecision}
            />

            {/* Analysis Perspective Navigation Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800">
              <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none">
                <button
                  onClick={() => setActiveTab('verdict')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                    activeTab === 'verdict'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Executive Verdict</span>
                </button>

                <button
                  onClick={() => setActiveTab('proscons')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                    activeTab === 'proscons'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Pros & Cons List</span>
                </button>

                <button
                  onClick={() => setActiveTab('matrix')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                    activeTab === 'matrix'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Table className="h-4 w-4" />
                  <span>Comparison Table</span>
                </button>

                <button
                  onClick={() => setActiveTab('swot')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                    activeTab === 'swot'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Compass className="h-4 w-4" />
                  <span>SWOT Analysis</span>
                </button>

                <button
                  onClick={() => setActiveTab('tententen')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                    activeTab === 'tententen'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Hourglass className="h-4 w-4" />
                  <span>10-10-10 & Pre-Mortem</span>
                </button>

                <button
                  onClick={() => setActiveTab('gutcheck')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                    activeTab === 'gutcheck'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span>Coin Toss & Gut Check</span>
                </button>
              </nav>
            </div>

            {/* Active Tab View Body */}
            <div className="pt-2">
              {activeTab === 'verdict' && (
                <div className="space-y-6">
                  {/* Summary card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                      Core Trade-Off Synthesis
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {activeDecision.summary}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>Key Advantages of {activeDecision.verdict.recommendedOptionLabel}</span>
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {activeDecision.verdict.rationale}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
                      <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm mb-2 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-amber-600" />
                        <span>What Breaks The Tie</span>
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {activeDecision.verdict.keyDecisiveFactor}
                      </p>
                    </div>
                  </div>

                  {/* AI Refiner & What-If Simulator embedded on verdict */}
                  <DecisionRefiner
                    decision={activeDecision}
                    onAddRefinement={handleAddRefinement}
                  />
                </div>
              )}

              {activeTab === 'proscons' && (
                <ProsConsView
                  optionsAnalysis={activeDecision.optionsAnalysis}
                  onUpdateAnalysis={handleUpdateAnalysis}
                />
              )}

              {activeTab === 'matrix' && (
                <ComparisonMatrixView
                  criteria={activeDecision.comparisonMatrix.criteria}
                  options={activeDecision.options}
                  onUpdateCriteria={handleUpdateCriteria}
                />
              )}

              {activeTab === 'swot' && (
                <SWOTView optionsAnalysis={activeDecision.optionsAnalysis} />
              )}

              {activeTab === 'tententen' && (
                <TimelineRiskView optionsAnalysis={activeDecision.optionsAnalysis} />
              )}

              {activeTab === 'gutcheck' && (
                <GutCheckView
                  options={activeDecision.options}
                  gutCheckPrompt={activeDecision.gutCheckPrompt}
                  onCommitDecision={handleCommitDecision}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        savedDecisions={savedDecisions}
        activeDecisionId={activeDecision?.id || null}
        onSelectDecision={(d) => {
          setActiveDecision(d);
          setActiveTab('verdict');
        }}
        onDeleteDecision={handleDeleteDecision}
      />

      {/* Presets Modal */}
      <PresetsModal
        isOpen={showPresets}
        onClose={() => setShowPresets(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Export Report Modal */}
      {showExportModal && activeDecision && (
        <ExportReportModal
          decision={activeDecision}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
