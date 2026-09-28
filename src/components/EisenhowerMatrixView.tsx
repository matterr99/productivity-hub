import React, { useState } from 'react';
import { 
  Flame, 
  Target, 
  Zap, 
  Trash2, 
  Search, 
  Plus
} from 'lucide-react';
import { Task, EisenhowerQuadrant, CategoryInfo, Language } from '../types/task';
import { TaskCard } from './TaskCard';
import { QUADRANT_CONFIG } from '../utils/priorityCalculations';
import { getTranslation } from '../i18n/translations';

interface EisenhowerMatrixViewProps {
  tasks: Task[];
  categories: CategoryInfo[];
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onChangeQuadrant: (task: Task, quadrant: EisenhowerQuadrant) => void;
  onQuickAddTask: (quadrant: EisenhowerQuadrant) => void;
  focusGoal: string;
  onUpdateFocusGoal: (goal: string) => void;
  lang: Language;
}

export const EisenhowerMatrixView: React.FC<EisenhowerMatrixViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onEdit,
  onChangeQuadrant,
  onQuickAddTask,
  focusGoal,
  onUpdateFocusGoal,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalDraft, setGoalDraft] = useState<string>(focusGoal);
  const [mobileActiveQuadrant, setMobileActiveQuadrant] = useState<'ALL' | EisenhowerQuadrant>('ALL');

  const t = getTranslation(lang).matrix;

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (hideCompleted && task.status === 'done') return false;
    if (selectedCategory !== 'ALL' && task.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchNotes = task.notes?.toLowerCase().includes(q);
      const matchCategory = task.category.toLowerCase().includes(q);
      const matchTags = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchNotes && !matchCategory && !matchTags) return false;
    }
    return true;
  });

  const getQuadrantTasks = (q: EisenhowerQuadrant) => {
    return filteredTasks.filter((t) => t.quadrant === q);
  };

  const handleGoalSave = () => {
    onUpdateFocusGoal(goalDraft);
    setIsEditingGoal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Strategic Focus Goal Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/20 shrink-0">
              <Target className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                {t.weeklyGoalLabel}
              </span>
              {isEditingGoal ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={goalDraft}
                    onChange={(e) => setGoalDraft(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-slate-800 border border-indigo-400/50 rounded-lg text-white w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={t.goalPlaceholder}
                  />
                  <button
                    onClick={handleGoalSave}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                  >
                    {t.saveGoal}
                  </button>
                  <button
                    onClick={() => {
                      setGoalDraft(focusGoal);
                      setIsEditingGoal(false);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    {t.cancelGoal}
                  </button>
                </div>
              ) : (
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {focusGoal || t.goalPlaceholder}
                </h2>
              )}
            </div>
          </div>

          {!isEditingGoal && (
            <button
              onClick={() => setIsEditingGoal(true)}
              className="px-3 py-1.5 text-xs font-medium text-indigo-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors cursor-pointer self-end sm:self-auto shrink-0"
            >
              {t.editGoal}
            </button>
          )}
        </div>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.allProjects} ({tasks.length})
          </button>

          {categories.map((cat) => {
            const count = tasks.filter((t) => t.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                <span className="ml-1.5 opacity-60 font-mono text-[11px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Hide Completed */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none whitespace-nowrap px-2">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={(e) => setHideCompleted(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800"
            />
            <span>{t.hideCompleted}</span>
          </label>
        </div>

      </div>

      {/* Mobile Quadrant Quick Switcher Pills (visible only on small mobile screens) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setMobileActiveQuadrant('ALL')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
            mobileActiveQuadrant === 'ALL'
              ? 'bg-slate-900 dark:bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {lang === 'es' ? 'Todos los Cuadrantes' : 'All 4 Quadrants'}
        </button>
        <button
          onClick={() => setMobileActiveQuadrant('q1_do')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
            mobileActiveQuadrant === 'q1_do'
              ? 'bg-rose-600 text-white'
              : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
          }`}
        >
          Q1 ({getQuadrantTasks('q1_do').length})
        </button>
        <button
          onClick={() => setMobileActiveQuadrant('q2_schedule')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
            mobileActiveQuadrant === 'q2_schedule'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60'
          }`}
        >
          Q2 ({getQuadrantTasks('q2_schedule').length})
        </button>
        <button
          onClick={() => setMobileActiveQuadrant('q3_delegate')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
            mobileActiveQuadrant === 'q3_delegate'
              ? 'bg-amber-600 text-white'
              : 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
          }`}
        >
          Q3 ({getQuadrantTasks('q3_delegate').length})
        </button>
        <button
          onClick={() => setMobileActiveQuadrant('q4_eliminate')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
            mobileActiveQuadrant === 'q4_eliminate'
              ? 'bg-slate-700 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Q4 ({getQuadrantTasks('q4_eliminate').length})
        </button>
      </div>

      {/* Eisenhower 2x2 Interactive Grid (Responsive: 1 col on mobile/filtered, 2 cols on tablet/iPad & desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Q1: Urgent & Important (Do First) */}
        {(mobileActiveQuadrant === 'ALL' || mobileActiveQuadrant === 'q1_do') && (
          <QuadrantCard
            quadrantKey="q1_do"
            config={QUADRANT_CONFIG.q1_do}
            titleOverride={t.q1.title}
            subOverride={t.q1.subtitle}
            descOverride={t.q1.description}
            badgeOverride={t.q1.badge}
            tasks={getQuadrantTasks('q1_do')}
            icon={<Flame className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onChangeQuadrant={onChangeQuadrant}
            onQuickAdd={() => onQuickAddTask('q1_do')}
            lang={lang}
          />
        )}

        {/* Q2: Not Urgent & Important (Schedule / Deep Work) */}
        {(mobileActiveQuadrant === 'ALL' || mobileActiveQuadrant === 'q2_schedule') && (
          <QuadrantCard
            quadrantKey="q2_schedule"
            config={QUADRANT_CONFIG.q2_schedule}
            titleOverride={t.q2.title}
            subOverride={t.q2.subtitle}
            descOverride={t.q2.description}
            badgeOverride={t.q2.badge}
            tasks={getQuadrantTasks('q2_schedule')}
            icon={<Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onChangeQuadrant={onChangeQuadrant}
            onQuickAdd={() => onQuickAddTask('q2_schedule')}
            lang={lang}
          />
        )}

        {/* Q3: Urgent & Not Important (Delegate / Fast Errand) */}
        {(mobileActiveQuadrant === 'ALL' || mobileActiveQuadrant === 'q3_delegate') && (
          <QuadrantCard
            quadrantKey="q3_delegate"
            config={QUADRANT_CONFIG.q3_delegate}
            titleOverride={t.q3.title}
            subOverride={t.q3.subtitle}
            descOverride={t.q3.description}
            badgeOverride={t.q3.badge}
            tasks={getQuadrantTasks('q3_delegate')}
            icon={<Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onChangeQuadrant={onChangeQuadrant}
            onQuickAdd={() => onQuickAddTask('q3_delegate')}
            lang={lang}
          />
        )}

        {/* Q4: Not Urgent & Not Important (Eliminate / Evaluate) */}
        {(mobileActiveQuadrant === 'ALL' || mobileActiveQuadrant === 'q4_eliminate') && (
          <QuadrantCard
            quadrantKey="q4_eliminate"
            config={QUADRANT_CONFIG.q4_eliminate}
            titleOverride={t.q4.title}
            subOverride={t.q4.subtitle}
            descOverride={t.q4.description}
            badgeOverride={t.q4.badge}
            tasks={getQuadrantTasks('q4_eliminate')}
            icon={<Trash2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onChangeQuadrant={onChangeQuadrant}
            onQuickAdd={() => onQuickAddTask('q4_eliminate')}
            lang={lang}
          />
        )}

      </div>

    </div>
  );
};

interface QuadrantCardProps {
  quadrantKey: EisenhowerQuadrant;
  config: typeof QUADRANT_CONFIG.q1_do;
  titleOverride: string;
  subOverride: string;
  descOverride: string;
  badgeOverride: string;
  tasks: Task[];
  icon: React.ReactNode;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onChangeQuadrant: (task: Task, quadrant: EisenhowerQuadrant) => void;
  onQuickAdd: () => void;
  lang: Language;
}

const QuadrantCard: React.FC<QuadrantCardProps> = ({
  config,
  titleOverride,
  subOverride,
  descOverride,
  tasks,
  icon,
  onToggleComplete,
  onEdit,
  onChangeQuadrant,
  onQuickAdd,
  lang,
}) => {
  const pendingCount = tasks.filter((t) => t.status !== 'done').length;
  const t = getTranslation(lang).matrix;

  return (
    <div className={`flex flex-col rounded-2xl border ${config.borderColor} ${config.bgAccent} p-4 sm:p-5 transition-all min-h-[360px]`}>
      
      {/* Quadrant Header */}
      <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-base font-bold tracking-tight ${config.headerColor}`}>
                {titleOverride}
              </h3>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs tabular-nums">
                {pendingCount} {t.openCount}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {subOverride} · {descOverride}
            </p>
          </div>
        </div>

        <button
          onClick={onQuickAdd}
          title={`Add task directly to ${titleOverride}`}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[520px] pr-1">
        {tasks.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300/80 dark:border-slate-700 rounded-xl bg-white/40 dark:bg-slate-800/30">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.noTasksInQuadrant}</p>
            <button
              onClick={onQuickAdd}
              className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
            >
              {t.addTaskHere}
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onChangeQuadrant={onChangeQuadrant}
              showQuadrantSelector={true}
              lang={lang}
            />
          ))
        )}
      </div>

    </div>
  );
};
