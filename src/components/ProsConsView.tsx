import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Plus, 
  ShieldCheck, 
  SlidersHorizontal, 
  Tag, 
  EyeOff, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  LayoutGrid,
  Columns,
  Layers
} from 'lucide-react';
import { OptionAnalysis, ProConItem } from '../types.ts';
import { calculateOptionProsConsScore } from '../utils/calculations.ts';

interface ProsConsViewProps {
  optionsAnalysis: OptionAnalysis[];
  onUpdateAnalysis: (updated: OptionAnalysis[]) => void;
}

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  optionsAnalysis,
  onUpdateAnalysis,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    optionsAnalysis[0]?.optionId || ''
  );
  const [displayMode, setDisplayMode] = useState<'side-by-side' | 'grouped-categories'>('side-by-side');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<{
    optionId: string;
    type: 'pro' | 'con';
  } | null>(null);

  // New item form state
  const [newTitle, setNewTitle] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');
  const [newWeight, setNewWeight] = useState(3);
  const [newMitigation, setNewMitigation] = useState('');

  const currentOption = optionsAnalysis.find((o) => o.optionId === selectedOptionId) || optionsAnalysis[0];

  // Collect all unique categories
  const categories = Array.from(
    new Set(
      optionsAnalysis.flatMap((opt) => [
        ...opt.pros.map((p) => p.category),
        ...opt.cons.map((c) => c.category),
      ])
    )
  ).filter(Boolean);

  // Use pure calculation helper for net score
  const calculateOptionScore = calculateOptionProsConsScore;

  const handleToggleDismiss = (optId: string, type: 'pro' | 'con', itemId: string) => {
    const updated = optionsAnalysis.map((opt) => {
      if (opt.optionId !== optId) return opt;
      if (type === 'pro') {
        return {
          ...opt,
          pros: opt.pros.map((p) => (p.id === itemId ? { ...p, dismissed: !p.dismissed } : p)),
        };
      } else {
        return {
          ...opt,
          cons: opt.cons.map((c) => (c.id === itemId ? { ...c, dismissed: !c.dismissed } : c)),
        };
      }
    });
    onUpdateAnalysis(updated);
  };

  const handleAdjustWeight = (
    optId: string,
    type: 'pro' | 'con',
    itemId: string,
    delta: number
  ) => {
    const updated = optionsAnalysis.map((opt) => {
      if (opt.optionId !== optId) return opt;
      const list = type === 'pro' ? opt.pros : opt.cons;
      const newList = list.map((item) => {
        if (item.id !== itemId) return item;
        const currentWeight = item.userWeight ?? item.weight;
        const newW = Math.max(1, Math.min(5, currentWeight + delta));
        return { ...item, userWeight: newW };
      });
      return type === 'pro' ? { ...opt, pros: newList } : { ...opt, cons: newList };
    });
    onUpdateAnalysis(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddModal || !newTitle.trim()) return;

    const newItem: ProConItem = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      explanation: newExplanation.trim() || 'Custom factor added by you.',
      category: newCategory.trim() || 'General',
      weight: newWeight,
      mitigation: showAddModal.type === 'con' ? newMitigation.trim() : undefined,
      isCustom: true,
    };

    const updated = optionsAnalysis.map((opt) => {
      if (opt.optionId !== showAddModal.optionId) return opt;
      if (showAddModal.type === 'pro') {
        return { ...opt, pros: [...opt.pros, newItem] };
      } else {
        return { ...opt, cons: [...opt.cons, newItem] };
      }
    });

    onUpdateAnalysis(updated);
    setShowAddModal(null);
    setNewTitle('');
    setNewExplanation('');
    setNewMitigation('');
    setNewWeight(3);
  };

  const filteredPros = currentOption.pros.filter(
    (p) => activeCategoryFilter === 'all' || p.category.toLowerCase() === activeCategoryFilter.toLowerCase()
  );
  const filteredCons = currentOption.cons.filter(
    (c) => activeCategoryFilter === 'all' || c.category.toLowerCase() === activeCategoryFilter.toLowerCase()
  );

  // Render a single Pro card
  const renderProCard = (pro: ProConItem) => {
    const currentWeight = pro.userWeight ?? pro.weight;
    return (
      <div
        key={pro.id}
        className={`group rounded-xl border p-4 transition-all ${
          pro.dismissed
            ? 'border-slate-200 bg-slate-100/50 opacity-50 dark:border-slate-800 dark:bg-slate-900/40'
            : 'border-emerald-200/80 bg-white shadow-2xs hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {pro.category}
              </span>
              {pro.isCustom && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-2xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  Custom
                </span>
              )}
              {pro.dismissed && (
                <span className="text-xs text-slate-400 italic">Dismissed from calculation</span>
              )}
            </div>
            <h4 className={`text-sm font-bold text-slate-900 dark:text-white ${pro.dismissed ? 'line-through' : ''}`}>
              {pro.title}
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {pro.explanation}
            </p>
          </div>

          {/* Weight badge & controls */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
              <span>Impact:</span>
              <span>+{currentWeight}</span>
            </div>

            {/* Weight adjustments */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
              <button
                onClick={() => handleAdjustWeight(currentOption.optionId, 'pro', pro.id, -1)}
                disabled={currentWeight <= 1}
                className="h-5 w-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center text-xs font-bold disabled:opacity-30 cursor-pointer"
                title="Decrease impact"
              >
                -
              </button>
              <button
                onClick={() => handleAdjustWeight(currentOption.optionId, 'pro', pro.id, 1)}
                disabled={currentWeight >= 5}
                className="h-5 w-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center text-xs font-bold disabled:opacity-30 cursor-pointer"
                title="Increase impact"
              >
                +
              </button>
              <button
                onClick={() => handleToggleDismiss(currentOption.optionId, 'pro', pro.id)}
                className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={pro.dismissed ? 'Re-enable this pro' : 'Ignore this pro'}
              >
                {pro.dismissed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render a single Con card
  const renderConCard = (con: ProConItem) => {
    const currentWeight = con.userWeight ?? con.weight;
    return (
      <div
        key={con.id}
        className={`group rounded-xl border p-4 transition-all ${
          con.dismissed
            ? 'border-slate-200 bg-slate-100/50 opacity-50 dark:border-slate-800 dark:bg-slate-900/40'
            : 'border-rose-200/80 bg-white shadow-2xs hover:border-rose-300 dark:border-rose-900/50 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                {con.category}
              </span>
              {con.isCustom && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-2xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  Custom
                </span>
              )}
              {con.dismissed && (
                <span className="text-xs text-slate-400 italic">Dismissed from calculation</span>
              )}
            </div>
            <h4 className={`text-sm font-bold text-slate-900 dark:text-white ${con.dismissed ? 'line-through' : ''}`}>
              {con.title}
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {con.explanation}
            </p>

            {/* Mitigation Strategy */}
            {con.mitigation && !con.dismissed && (
              <div className="mt-2.5 rounded-lg border border-emerald-200/60 bg-emerald-50/50 p-2 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                <span className="font-semibold flex items-center gap-1 text-emerald-800 dark:text-emerald-400 mb-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Mitigation Strategy:
                </span>
                <span className="leading-snug">{con.mitigation}</span>
              </div>
            )}
          </div>

          {/* Weight badge & controls */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
              <span>Severity:</span>
              <span>-{currentWeight}</span>
            </div>

            {/* Weight adjustments */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
              <button
                onClick={() => handleAdjustWeight(currentOption.optionId, 'con', con.id, -1)}
                disabled={currentWeight <= 1}
                className="h-5 w-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center text-xs font-bold disabled:opacity-30 cursor-pointer"
                title="Decrease severity"
              >
                -
              </button>
              <button
                onClick={() => handleAdjustWeight(currentOption.optionId, 'con', con.id, 1)}
                disabled={currentWeight >= 5}
                className="h-5 w-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center text-xs font-bold disabled:opacity-30 cursor-pointer"
                title="Increase severity"
              >
                +
              </button>
              <button
                onClick={() => handleToggleDismiss(currentOption.optionId, 'con', con.id)}
                className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={con.dismissed ? 'Re-enable this con' : 'Ignore this con'}
              >
                {con.dismissed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Option selector tabs & Score Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {optionsAnalysis.map((opt) => {
          const isSelected = opt.optionId === selectedOptionId;
          const { prosScore, consScore, net } = calculateOptionScore(opt);

          return (
            <div
              key={opt.optionId}
              onClick={() => setSelectedOptionId(opt.optionId)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-md dark:border-indigo-500 dark:bg-slate-800'
                  : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Option
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                    {opt.optionLabel}
                  </h3>
                </div>
                <div
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                    net > 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : net < 0
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Net: {net > 0 ? `+${net}` : net}
                </div>
              </div>

              {/* Progress split */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <TrendingUp className="h-3.5 w-3.5" /> +{prosScore} Pros
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                  <TrendingDown className="h-3.5 w-3.5" /> -{consScore} Cons
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Bar: View Switcher and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        {/* View Switcher Button */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
            <LayoutGrid className="h-3.5 w-3.5 text-indigo-500" /> View Layout:
          </span>
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 dark:border-slate-800 dark:bg-slate-800">
            <button
              onClick={() => setDisplayMode('side-by-side')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                displayMode === 'side-by-side'
                  ? 'bg-white text-indigo-700 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setDisplayMode('grouped-categories')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                displayMode === 'grouped-categories'
                  ? 'bg-white text-indigo-700 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>All Categories Grouped</span>
            </button>
          </div>
        </div>

        {/* Category Filters (visible when in side-by-side mode) */}
        {displayMode === 'side-by-side' ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> Filter:
            </span>
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition cursor-pointer ${
                  activeCategoryFilter.toLowerCase() === cat.toLowerCase()
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            All categories shown in paired columns for <strong className="text-slate-800 dark:text-slate-200">{currentOption.optionLabel}</strong>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: Standard Side-by-Side View */}
      {displayMode === 'side-by-side' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pros Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Pros & Upsides ({filteredPros.length})
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal({ optionId: currentOption.optionId, type: 'pro' })}
                className="flex items-center gap-1 rounded-lg border border-emerald-300/80 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Pro</span>
              </button>
            </div>

            <div className="space-y-3">
              {filteredPros.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                  No pros found for this filter.
                </div>
              ) : (
                filteredPros.map((pro) => renderProCard(pro))
              )}
            </div>
          </div>

          {/* Cons Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-rose-900/60">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                  <XCircle className="h-4 w-4" />
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Cons & Risks ({filteredCons.length})
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal({ optionId: currentOption.optionId, type: 'con' })}
                className="flex items-center gap-1 rounded-lg border border-rose-300/80 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Con</span>
              </button>
            </div>

            <div className="space-y-3">
              {filteredCons.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                  No cons found for this filter.
                </div>
              ) : (
                filteredCons.map((con) => renderConCard(con))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: All Categories Grouped View (Two Columns with Category Section Dividers) */}
      {displayMode === 'grouped-categories' && (
        <div className="space-y-6">
          {/* Main Column Headers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Pros & Upsides ({currentOption.pros.length})
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal({ optionId: currentOption.optionId, type: 'pro' })}
                className="flex items-center gap-1 rounded-lg border border-emerald-300/80 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Pro</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                  <XCircle className="h-4 w-4" />
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Cons & Risks ({currentOption.cons.length})
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal({ optionId: currentOption.optionId, type: 'con' })}
                className="flex items-center gap-1 rounded-lg border border-rose-300/80 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Con</span>
              </button>
            </div>
          </div>

          {/* List of categories as separate sections */}
          <div className="space-y-8">
            {categories.map((cat) => {
              const catPros = currentOption.pros.filter(
                (p) => p.category.toLowerCase() === cat.toLowerCase()
              );
              const catCons = currentOption.cons.filter(
                (c) => c.category.toLowerCase() === cat.toLowerCase()
              );

              return (
                <div 
                  key={cat} 
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/40 space-y-4"
                >
                  {/* Category Section Header Divider */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                        <Tag className="h-3.5 w-3.5" />
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                        {cat}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-2xs font-semibold">
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {catPros.length} {catPros.length === 1 ? 'pro' : 'pros'}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-rose-700 dark:text-rose-400">
                        {catCons.length} {catCons.length === 1 ? 'con' : 'cons'}
                      </span>
                    </div>
                  </div>

                  {/* Two Columns for this category */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column: Category Pros */}
                    <div className="space-y-3">
                      {catPros.length > 0 ? (
                        catPros.map((pro) => renderProCard(pro))
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400 dark:border-slate-800">
                          No pros recorded under {cat}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Category Cons */}
                    <div className="space-y-3">
                      {catCons.length > 0 ? (
                        catCons.map((con) => renderConCard(con))
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400 dark:border-slate-800">
                          No cons recorded under {cat}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Add Custom {showAddModal.type === 'pro' ? 'Pro / Upside' : 'Con / Risk'}
            </h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Daily commute will double"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Explanation
                </label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Why this matters to your situation..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Financial, Family, Growth"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Impact Weight (1 to 5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {showAddModal.type === 'con' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mitigation / Countermeasure (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMitigation}
                    onChange={(e) => setNewMitigation(e.target.value)}
                    placeholder="How could you neutralize this downside?"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-xs cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
