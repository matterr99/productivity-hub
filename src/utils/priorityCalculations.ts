import { Task, TaskPriority, EisenhowerQuadrant } from '../types/task';

export const QUADRANT_CONFIG: Record<
  EisenhowerQuadrant,
  {
    id: EisenhowerQuadrant;
    title: string;
    subtitle: string;
    description: string;
    badgeText: string;
    badgeColor: string;
    borderColor: string;
    bgAccent: string;
    headerColor: string;
  }
> = {
  q1_do: {
    id: 'q1_do',
    title: 'Q1: Do First',
    subtitle: 'Urgent & Important',
    description: 'Critical deadlines, legal bottlenecks, customer blockers & urgent fires.',
    badgeText: 'Do Now',
    badgeColor: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/50 dark:border-rose-800/70',
    borderColor: 'border-rose-200 dark:border-rose-900/60',
    bgAccent: 'bg-rose-50/40 dark:bg-rose-950/20',
    headerColor: 'text-rose-900 dark:text-rose-200',
  },
  q2_schedule: {
    id: 'q2_schedule',
    title: 'Q2: Schedule & Deep Work',
    subtitle: 'Not Urgent & High Impact',
    description: 'Strategic growth, tech improvements, high-ROI systems & proactive planning.',
    badgeText: 'High ROI',
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/50 dark:border-indigo-800/70',
    borderColor: 'border-indigo-200 dark:border-indigo-900/60',
    bgAccent: 'bg-indigo-50/40 dark:bg-indigo-950/20',
    headerColor: 'text-indigo-900 dark:text-indigo-200',
  },
  q3_delegate: {
    id: 'q3_delegate',
    title: 'Q3: Delegate / Quick Win',
    subtitle: 'Urgent & Lower Leverage',
    description: 'Routine inquiries, quick phone calls, simple administrative followups.',
    badgeText: 'Delegate/Fast',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-800/70',
    borderColor: 'border-amber-200 dark:border-amber-900/60',
    bgAccent: 'bg-amber-50/40 dark:bg-amber-950/20',
    headerColor: 'text-amber-900 dark:text-amber-200',
  },
  q4_eliminate: {
    id: 'q4_eliminate',
    title: 'Q4: Eliminate / Re-evaluate',
    subtitle: 'Low Urgency & Low Impact',
    description: 'Nice-to-haves, stale backlog ideas, or low-yield time sinks.',
    badgeText: 'Evaluate',
    badgeColor: 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700',
    borderColor: 'border-slate-200 dark:border-slate-800',
    bgAccent: 'bg-slate-50/60 dark:bg-slate-900/40',
    headerColor: 'text-slate-800 dark:text-slate-200',
  },
};

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  {
    label: string;
    badgeClass: string;
    borderClass: string;
    dotColor: string;
    scoreWeight: number;
  }
> = {
  p1_critical: {
    label: 'P1 · Critical',
    badgeClass: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-800/70',
    borderClass: 'border-l-4 border-l-rose-500',
    dotColor: 'bg-rose-500',
    scoreWeight: 4,
  },
  p2_high: {
    label: 'P2 · High',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800/70',
    borderClass: 'border-l-4 border-l-amber-500',
    dotColor: 'bg-amber-500',
    scoreWeight: 3,
  },
  p3_medium: {
    label: 'P3 · Medium',
    badgeClass: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/60 dark:border-blue-800/70',
    borderClass: 'border-l-4 border-l-blue-500',
    dotColor: 'bg-blue-500',
    scoreWeight: 2,
  },
  p4_low: {
    label: 'P4 · Low',
    badgeClass: 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700',
    borderClass: 'border-l-4 border-l-slate-400',
    dotColor: 'bg-slate-400',
    scoreWeight: 1,
  },
};

export function calculateIceScore(impact: number, effort: number, priority: TaskPriority): number {
  // Impact: 1-10, Ease: 11 - effort (so low effort = high ease)
  const ease = Math.max(1, 11 - effort);
  const priorityMultiplier = priority === 'p1_critical' ? 1.2 : priority === 'p2_high' ? 1.0 : priority === 'p3_medium' ? 0.85 : 0.7;
  const rawScore = (impact * 1.5 + ease * 1.2) * 3.5 * priorityMultiplier;
  return Math.min(100, Math.max(1, Math.round(rawScore)));
}

export function getImpactEffortQuadrant(impact: number, effort: number): 'quick_wins' | 'major_bets' | 'fill_ins' | 'time_sinks' {
  if (impact >= 6 && effort <= 5) return 'quick_wins';
  if (impact >= 6 && effort > 5) return 'major_bets';
  if (impact < 6 && effort <= 5) return 'fill_ins';
  return 'time_sinks';
}
