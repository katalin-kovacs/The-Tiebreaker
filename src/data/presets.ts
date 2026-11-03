export interface DecisionPreset {
  id: string;
  category: string;
  title: string;
  context: string;
  primaryGoal: string;
  options: { id: string; label: string; description: string }[];
}

export const DECISION_PRESETS: DecisionPreset[] = [
  {
    id: 'career-startup-vs-corp',
    category: 'Career & Work',
    title: 'Should I join an early AI startup or stay at my stable corporate engineering job?',
    context: '3 years of experience, 6 months emergency savings. Current job is predictable with 401k match and good work-life balance, but promotion cycle is slow. Startup offers high equity stake, lead title, and rapid product velocity.',
    primaryGoal: 'Accelerate learning and career upside over a 5-year horizon',
    options: [
      {
        id: 'opt_1',
        label: 'Accept AI Startup Offer',
        description: 'Higher equity, lead responsibilities, fast-paced environment with market risk',
      },
      {
        id: 'opt_2',
        label: 'Remain at Corporate Job',
        description: 'Predictable hours, strong compensation safety net, structured internal ladder',
      },
      {
        id: 'opt_3',
        label: 'Counter-Offer / Negotiate Internal Transfer',
        description: 'Request higher level or pivot to high-impact internal innovation team',
      },
    ],
  },
  {
    id: 'housing-buy-vs-rent',
    category: 'Personal Finance',
    title: 'Should we purchase a suburban home or keep renting in the city center?',
    context: 'Both partners have hybrid work policies (2 days in office). Mortgage rates around 6.4%. Buying requires 70% of current liquid savings for down payment and closing costs. Renting leaves substantial monthly surplus for index fund investing.',
    primaryGoal: 'Long-term financial wealth, psychological peace of mind, and commute sanity',
    options: [
      {
        id: 'opt_1',
        label: 'Buy Suburban 3-Bedroom Home',
        description: 'Fixed mortgage, private yard, personal equity, longer commute',
      },
      {
        id: 'opt_2',
        label: 'Rent City Apartment & Invest Difference',
        description: 'Walkable neighborhood, 0 maintenance responsibility, high liquid investment flexibility',
      },
    ],
  },
  {
    id: 'tech-build-vs-buy',
    category: 'Product & Tech',
    title: 'Build custom AI workflow engine in-house vs integrate third-party enterprise platform',
    context: 'B2B SaaS product entering Series A. Engineering team of 8. Core value proposition is proprietary document analysis, but orchestration and integrations consume 40% of sprint capacity.',
    primaryGoal: 'Fast customer time-to-value while retaining proprietary competitive moat',
    options: [
      {
        id: 'opt_1',
        label: 'Build Custom In-House Engine',
        description: 'Total proprietary IP control, zero vendor lock-in, higher initial dev and maintenance cost',
      },
      {
        id: 'opt_2',
        label: 'Adopt Third-Party Managed Platform',
        description: 'Launches 3 months faster, vendor API cost, dependency on vendor roadmap',
      },
    ],
  },
  {
    id: 'personal-relocation',
    category: 'Life & Lifestyle',
    title: 'Relocate to a dynamic tech hub abroad vs stay close to family and longtime friends',
    context: 'Offered an internal transfer to London office. Great international exposure, exciting lifestyle, but higher cost of living and timezone difference from aging parents and close childhood circle.',
    primaryGoal: 'Personal expansion and novel life experiences without damaging family relationships',
    options: [
      {
        id: 'opt_1',
        label: 'Move Abroad to London (2-Year Commitment)',
        description: 'New cultural chapter, European travel access, independent personal growth',
      },
      {
        id: 'opt_2',
        label: 'Remain in Hometown with Active Travel',
        description: 'Deep relational roots, family proximity, lower rent, plan 4-6 international trips/year',
      },
    ],
  },
];
