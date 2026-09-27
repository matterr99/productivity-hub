import React, { useState } from 'react';
import { 
  Zap, 
  Trophy, 
  Layers, 
  AlertOctagon, 
  Search, 
  Plus
} from 'lucide-react';
import { Task, CategoryInfo, Language } from '../types/task';
import { TaskCard } from './TaskCard';
import { getImpactEffortQuadrant } from '../utils/priorityCalculations';
import { getTranslation } from '../i18n/translations';

interface ImpactEffortMatrixViewProps {
  tasks: Task[];
  categories: CategoryInfo[];
  onToggleComplete: (task: Task) => void;
  onToggleDailyFocus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onQuickAdd: () => void;
  lang: Language;
}

export const ImpactEffortMatrixView: React.FC<ImpactEffortMatrixViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onToggleDailyFocus,
  onEdit,
  onQuickAdd,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const t = getTranslation(lang).impactEffort;

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const quickWins = filteredTasks.filter((t) => getImpactEffortQuadrant(t.impact, t.effort) === 'quick_wins');
  const majorBets = filteredTasks.filter((t) => getImpactEffortQuadrant(t.impact, t.effort) === 'major_bets');
  const fillIns = filteredTasks.filter((t) => getImpactEffortQuadrant(t.impact, t.effort) === 'fill_ins');
  const timeSinks = filteredTasks.filter((t) => getImpactEffortQuadrant(t.impact, t.effort) === 'time_sinks');

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{t.headerTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.headerSub}
          </p>
        </div>

        {/* Category & Search */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">{t.allCategories} ({tasks.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <button
            onClick={onQuickAdd}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addTask}</span>
          </button>
        </div>
      </div>

      {/* 2x2 Impact-Effort Matrix (Responsive on tablet & mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Quick Wins (High Impact, Low Effort) - The best! */}
        <div className="flex flex-col rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 sm:p-5 min-h-[340px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200/70 dark:border-emerald-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">{t.quickWinsTitle}</h3>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 tabular-nums">
                    {quickWins.filter(t => t.status !== 'done').length} {t.openLabel}
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-0.5 font-medium">
                  {t.quickWinsSub}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[480px] pr-1">
            {quickWins.length === 0 ? (
              <p className="text-xs text-emerald-800/60 dark:text-emerald-400/60 text-center py-10">{t.quickWinsEmpty}</p>
            ) : (
              quickWins.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onToggleDailyFocus={onToggleDailyFocus}
                  onEdit={onEdit}
                  lang={lang}
                />
              ))
            )}
          </div>
        </div>

        {/* Major Bets (High Impact, High Effort) */}
        <div className="flex flex-col rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 sm:p-5 min-h-[340px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-200/70 dark:border-indigo-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded-xl">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-200">{t.majorBetsTitle}</h3>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 tabular-nums">
                    {majorBets.filter(t => t.status !== 'done').length} {t.openLabel}
                  </span>
                </div>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-400/80 mt-0.5 font-medium">
                  {t.majorBetsSub}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[480px] pr-1">
            {majorBets.length === 0 ? (
              <p className="text-xs text-indigo-800/60 dark:text-indigo-400/60 text-center py-10">{t.majorBetsEmpty}</p>
            ) : (
              majorBets.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onToggleDailyFocus={onToggleDailyFocus}
                  onEdit={onEdit}
                  lang={lang}
                />
              ))
            )}
          </div>
        </div>

        {/* Fill-Ins (Low Impact, Low Effort) */}
        <div className="flex flex-col rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 sm:p-5 min-h-[340px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-200/70 dark:border-amber-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-amber-950 dark:text-amber-200">{t.fillInsTitle}</h3>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 tabular-nums">
                    {fillIns.filter(t => t.status !== 'done').length} {t.openLabel}
                  </span>
                </div>
                <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-0.5 font-medium">
                  {t.fillInsSub}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[480px] pr-1">
            {fillIns.length === 0 ? (
              <p className="text-xs text-amber-800/60 dark:text-amber-400/60 text-center py-10">{t.fillInsEmpty}</p>
            ) : (
              fillIns.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onToggleDailyFocus={onToggleDailyFocus}
                  onEdit={onEdit}
                  lang={lang}
                />
              ))
            )}
          </div>
        </div>

        {/* Time Sinks (Low Impact, High Effort) */}
        <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-4 sm:p-5 min-h-[340px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.timeSinksTitle}</h3>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
                    {timeSinks.filter(t => t.status !== 'done').length} {t.openLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {t.timeSinksSub}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[480px] pr-1">
            {timeSinks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">{t.timeSinksEmpty}</p>
            ) : (
              timeSinks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onToggleDailyFocus={onToggleDailyFocus}
                  onEdit={onEdit}
                  lang={lang}
                />
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
