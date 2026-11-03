import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  FileText 
} from 'lucide-react';
import { DecisionRecord } from '../types.ts';

interface ExportReportModalProps {
  decision: DecisionRecord;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  decision,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const generateMarkdown = () => {
    const lines = [
      `# The Tiebreaker: Executive Decision Memo`,
      `**Dilemma:** ${decision.title}`,
      decision.context ? `**Context & Constraints:** ${decision.context}` : '',
      decision.primaryGoal ? `**Primary Value Goal:** ${decision.primaryGoal}` : '',
      `**Date:** ${new Date(decision.createdAt).toLocaleDateString()}`,
      decision.finalDecision ? `**Final Decision Status:** COMMITTED to ${decision.options.find(o => o.id === decision.finalDecision?.chosenOptionId)?.label}` : '**Status:** In Evaluation',
      '',
      `---`,
      `## 🏆 AI Tiebreaker Verdict`,
      `**Recommended Winner:** ${decision.verdict.recommendedOptionLabel} (${decision.verdict.confidenceScore}% Confidence)`,
      `**Verdict Headline:** "${decision.verdict.headline}"`,
      `**Rationale:** ${decision.verdict.rationale}`,
      `**The Decisive Pivot Point:** ${decision.verdict.keyDecisiveFactor}`,
      '',
      `### Critical Blindspots to Guard Against:`,
      ...decision.verdict.blindspots.map((b) => `- ${b}`),
      '',
      `---`,
      `## ⚖️ Options & Weighted Pros/Cons Analysis`,
      ...decision.optionsAnalysis.flatMap((opt) => [
        `### Option: ${opt.optionLabel}`,
        `#### Pros & Upsides:`,
        ...opt.pros.map((p) => `- **[+${p.userWeight ?? p.weight}] ${p.title}** (${p.category}): ${p.explanation}${p.dismissed ? ' *(Dismissed)*' : ''}`),
        `#### Cons & Mitigations:`,
        ...opt.cons.map((c) => `- **[-${c.userWeight ?? c.weight}] ${c.title}** (${c.category}): ${c.explanation}\n  *Mitigation:* ${c.mitigation || 'N/A'}${c.dismissed ? ' *(Dismissed)*' : ''}`),
        '',
      ]),
      `---`,
      `## 📊 Comparison Matrix Summary`,
      `| Criterion | Weight | ` + decision.options.map(o => o.label).join(' | ') + ` |`,
      `| --- | --- | ` + decision.options.map(() => '---').join(' | ') + ` |`,
      ...decision.comparisonMatrix.criteria.map((c) => {
        const row = [
          c.name,
          `${c.userWeight ?? c.defaultWeight}x`,
          ...decision.options.map((opt) => {
            const sc = c.scores.find((s) => s.optionId === opt.id);
            return `${sc?.score ?? 5}/10`;
          }),
        ];
        return `| ${row.join(' | ')} |`;
      }),
      '',
      `---`,
      `## 🧭 SWOT Highlights`,
      ...decision.optionsAnalysis.flatMap((opt) => [
        `### SWOT for ${opt.optionLabel}:`,
        `- **Strengths:** ${opt.swot.strengths.join(', ')}`,
        `- **Weaknesses:** ${opt.swot.weaknesses.join(', ')}`,
        `- **Opportunities:** ${opt.swot.opportunities.join(', ')}`,
        `- **Threats:** ${opt.swot.threats.join(', ')}`,
        '',
      ]),
      `*Report produced by The Tiebreaker AI Decision Engine.*`,
    ];

    return lines.filter(Boolean).join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = generateMarkdown();
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tiebreaker-Decision-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Export Decision Brief
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download or copy formatted Markdown report
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

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <pre className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-mono text-slate-800 whitespace-pre-wrap dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {generateMarkdown()}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Ready to paste into Notion, Slack, or Docs
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span>.MD</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-xs transition"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
