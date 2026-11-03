export interface OptionInput {
  id: string;
  label: string;
  description?: string;
}

export interface ProConItem {
  id: string;
  title: string;
  explanation: string;
  category: string;
  weight: number; // 1 to 5
  mitigation?: string;
  userWeight?: number;
  dismissed?: boolean;
  isCustom?: boolean;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface TenTenTen {
  tenMinutes: string;
  tenMonths: string;
  tenYears: string;
}

export interface PreMortem {
  worstCaseScenario: string;
  warningSigns: string[];
  preventativeAction: string;
}

export interface OptionAnalysis {
  optionId: string;
  optionLabel: string;
  pros: ProConItem[];
  cons: ProConItem[];
  swot: SWOTAnalysis;
  tenTenTen: TenTenTen;
  preMortem: PreMortem;
}

export interface CriterionScore {
  optionId: string;
  score: number; // 1-10
  comment: string;
}

export interface MatrixCriterion {
  id: string;
  name: string;
  description: string;
  defaultWeight: number; // 1-5
  userWeight?: number; // 1-5 editable
  scores: CriterionScore[];
}

export interface Verdict {
  recommendedOptionId: string;
  recommendedOptionLabel: string;
  confidenceScore: number;
  headline: string;
  rationale: string;
  keyDecisiveFactor: string;
  blindspots: string[];
}

export interface RefinementLog {
  question: string;
  answer: string;
  verdictImpact: string;
  actionSteps: string[];
  timestamp: number;
}

export interface DecisionRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  context?: string;
  primaryGoal?: string;
  summary: string;
  options: OptionInput[];
  verdict: Verdict;
  optionsAnalysis: OptionAnalysis[];
  comparisonMatrix: {
    criteria: MatrixCriterion[];
  };
  gutCheckPrompt: string;
  finalDecision?: {
    chosenOptionId: string;
    chosenAt: number;
    notes?: string;
  };
  refinements?: RefinementLog[];
}

export type ViewTab = 'verdict' | 'proscons' | 'matrix' | 'swot' | 'tententen' | 'premortem' | 'gutcheck';
