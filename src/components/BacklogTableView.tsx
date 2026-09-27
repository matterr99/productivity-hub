import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  Search, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  Star, 
  CheckSquare, 
  Square, 
  Edit2 
} from 'lucide-react';
import { Task, CategoryInfo, TaskStatus, TaskPriority, EisenhowerQuadrant, Language } from '../types/task';
import { PRIORITY_CONFIG, calculateIceScore } from '../utils/priorityCalculations';
import { getTranslation } from '../i18n/translations';

interface BacklogTableViewProps {
  tasks: Task[];
  categories: CategoryInfo[];
  onToggleComplete: (task: Task) => void;
  onToggleDailyFocus: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onBatchUpdateStatus: (taskIds: string[], status: TaskStatus) => void;
  onBatchUpdateQuadrant: (taskIds: string[], quadrant: EisenhowerQuadrant) => void;
  onBatchDelete: (taskIds: string[]) => void;
  onEdit: (task: Task) => void;
  onAddNewTask: (task: Partial<Task>) => void;
  lang: Language;
}

type SortField = 'title' | 'category' | 'status' | 'priority' | 'quadrant' | 'iceScore' | 'impact' | 'effort';
type SortOrder = 'asc' | 'desc';

export const BacklogTableView: React.FC<BacklogTableViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onToggleDailyFocus,
  onUpdateTask,
  onDeleteTask,
  onBatchUpdateStatus,
  onBatchUpdateQuadrant,
  onBatchDelete,
  onEdit,
  onAddNewTask,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedQuadrant, setSelectedQuadrant] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [sortField, setSortField] = useState<SortField>('iceScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState(categories[0]?.id || 'GENERAL');

  const t = getTranslation(lang).table;
  const tPriorities = getTranslation(lang).priorities;
  const tQuadrants = getTranslation(lang).quadrants;

  // Filter tasks
  const filteredTasks = tasks.filter((taskItem) => {
    if (selectedCategory !== 'ALL' && taskItem.category !== selectedCategory) return false;
    if (selectedPriority !== 'ALL' && taskItem.priority !== selectedPriority) return false;
    if (selectedQuadrant !== 'ALL' && taskItem.quadrant !== selectedQuadrant) return false;
    if (selectedStatus !== 'ALL' && taskItem.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        taskItem.title.toLowerCase().includes(q) ||
        taskItem.category.toLowerCase().includes(q) ||
        taskItem.notes?.toLowerCase().includes(q) ||
        taskItem.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let factor = sortOrder === 'asc' ? 1 : -1;
    if (sortField === 'iceScore') return (a.iceScore - b.iceScore) * factor;
    if (sortField === 'impact') return (a.impact - b.impact) * factor;
    if (sortField === 'effort') return (a.effort - b.effort) * factor;
    if (sortField === 'title') return a.title.localeCompare(b.title) * factor;
    if (sortField === 'category') return a.category.localeCompare(b.category) * factor;
    if (sortField === 'status') return a.status.localeCompare(b.status) * factor;
    if (sortField === 'priority') {
      const orderMap: Record<TaskPriority, number> = {
        p1_critical: 4,
        p2_high: 3,
        p3_medium: 2,
        p4_low: 1,
      };
      return ((orderMap[a.priority] || 0) - (orderMap[b.priority] || 0)) * factor;
    }
    if (sortField === 'quadrant') {
      const qMap: Record<EisenhowerQuadrant, number> = {
        q1_do: 4,
        q2_schedule: 3,
        q3_delegate: 2,
        q4_eliminate: 1,
      };
      return ((qMap[a.quadrant] || 0) - (qMap[b.quadrant] || 0)) * factor;
    }
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'iceScore' || field === 'impact' ? 'desc' : 'asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === sortedTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(sortedTasks.map((taskItem) => taskItem.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleQuickAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleInput.trim()) return;
    onAddNewTask({
      title: newTitleInput.trim(),
      category: newCategoryInput,
      priority: 'p2_high',
      quadrant: 'q2_schedule',
      status: 'todo',
      impact: 7,
      effort: 3,
    });
    setNewTitleInput('');
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Multi-Filter Control Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">{t.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">{t.allPriorities}</option>
              <option value="p1_critical">{tPriorities.p1_critical}</option>
              <option value="p2_high">{tPriorities.p2_high}</option>
              <option value="p3_medium">{tPriorities.p3_medium}</option>
              <option value="p4_low">{tPriorities.p4_low}</option>
            </select>

            {/* Quadrant Filter */}
            <select
              value={selectedQuadrant}
              onChange={(e) => setSelectedQuadrant(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">{t.allQuadrants}</option>
              <option value="q1_do">{tQuadrants.q1_do}</option>
              <option value="q2_schedule">{tQuadrants.q2_schedule}</option>
              <option value="q3_delegate">{tQuadrants.q3_delegate}</option>
              <option value="q4_eliminate">{tQuadrants.q4_eliminate}</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">{t.allStatuses}</option>
              <option value="todo">{lang === 'es' ? 'Por Hacer' : 'To Do'}</option>
              <option value="in_progress">{lang === 'es' ? 'En Progreso' : 'In Progress'}</option>
              <option value="blocked">{lang === 'es' ? 'Bloqueado' : 'Blocked'}</option>
              <option value="done">{lang === 'es' ? 'Completada' : 'Done'}</option>
            </select>
          </div>

        </div>

        {/* Quick Add Row Input */}
        <form onSubmit={handleQuickAddRow} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            value={newTitleInput}
            onChange={(e) => setNewTitleInput(e.target.value)}
            placeholder={t.quickAddPlaceholder}
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800"
          />
          <select
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addRowBtn}</span>
          </button>
        </form>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="bg-indigo-900 dark:bg-indigo-950 text-white rounded-xl p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-indigo-700/50 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckSquare className="w-4 h-4 text-indigo-300" />
            <span>
              {selectedTaskIds.length} {t.tasksSelected.replace('{s}', selectedTaskIds.length > 1 ? (lang === 'es' ? 's' : 's') : '')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => onBatchUpdateStatus(selectedTaskIds, 'done')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-md font-semibold transition-colors cursor-pointer"
            >
              {t.markDone}
            </button>
            <button
              onClick={() => onBatchUpdateStatus(selectedTaskIds, 'todo')}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold transition-colors cursor-pointer"
            >
              {t.markTodo}
            </button>
            <button
              onClick={() => onBatchUpdateQuadrant(selectedTaskIds, 'q1_do')}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 rounded-md font-semibold transition-colors cursor-pointer"
            >
              {t.moveToQ1}
            </button>
            <button
              onClick={() => onBatchUpdateQuadrant(selectedTaskIds, 'q2_schedule')}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-md font-semibold transition-colors cursor-pointer"
            >
              {t.moveToQ2}
            </button>
            <button
              onClick={() => onBatchDelete(selectedTaskIds)}
              className="px-2.5 py-1 bg-red-700 hover:bg-red-600 rounded-md font-semibold transition-colors cursor-pointer"
            >
              {t.delete}
            </button>
            <button
              onClick={() => setSelectedTaskIds([])}
              className="text-indigo-200 hover:text-white ml-2 text-[11px] cursor-pointer"
            >
              {t.deselectAll}
            </button>
          </div>
        </div>
      )}

      {/* Spreadsheet Power Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                
                <th className="p-3 pl-4 w-10">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                    {selectedTaskIds.length > 0 && selectedTaskIds.length === sortedTasks.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>

                <th className="p-3 w-10 text-center">{t.doneCol}</th>

                <th className="p-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1.5">
                    <span>{t.taskNameCol}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="p-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors w-40" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-1.5">
                    <span>{t.categoryCol}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="p-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors w-32" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1.5">
                    <span>{t.priorityCol}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="p-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors w-36" onClick={() => handleSort('quadrant')}>
                  <div className="flex items-center gap-1.5">
                    <span>{t.eisenhowerCol}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="p-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors w-24 text-right" onClick={() => handleSort('iceScore')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{t.iceScoreCol}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="p-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors w-20 text-center" onClick={() => handleSort('impact')}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span>{t.impactCol}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="p-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors w-20 text-center" onClick={() => handleSort('effort')}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span>{t.effortCol}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                <th className="p-3 text-right pr-4 w-20">{t.actionsCol}</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    {t.noTasksFound}
                  </td>
                </tr>
              ) : (
                sortedTasks.map((taskItem) => {
                  const isDone = taskItem.status === 'done';
                  const isSelected = selectedTaskIds.includes(taskItem.id);

                  return (
                    <tr
                      key={taskItem.id}
                      className={`group hover:bg-slate-50/90 dark:hover:bg-slate-800/60 transition-colors ${
                        isDone ? 'bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 dark:text-slate-500' : ''
                      } ${isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/40' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 pl-4">
                        <button
                          onClick={() => toggleSelectOne(taskItem.id)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Status Checkbox */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onToggleComplete(taskItem)}
                          className="text-slate-300 dark:text-slate-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950/40" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                          )}
                        </button>
                      </td>

                      {/* Title & Notes */}
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleDailyFocus(taskItem)}
                            title="Star as Today's Focus"
                            className={`transition-colors cursor-pointer ${
                              taskItem.isDailyFocus ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${taskItem.isDailyFocus ? 'fill-amber-400' : ''}`} />
                          </button>
                          <span
                            onClick={() => onEdit(taskItem)}
                            className={`cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors ${
                              isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100 font-semibold'
                            }`}
                          >
                            {taskItem.title}
                          </span>
                        </div>
                        {taskItem.nextImmediateStep && !isDone && (
                          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-normal mt-0.5 truncate max-w-md">
                            👉 {taskItem.nextImmediateStep}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <select
                          value={taskItem.category}
                          onChange={(e) =>
                            onUpdateTask({ ...taskItem, category: e.target.value })
                          }
                          className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-transparent border-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1.5 py-1 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id} className="dark:bg-slate-800 dark:text-slate-200">
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Priority */}
                      <td className="p-3">
                        <select
                          value={taskItem.priority}
                          onChange={(e) => {
                            const newP = e.target.value as TaskPriority;
                            const newIce = calculateIceScore(taskItem.impact, taskItem.effort, newP);
                            onUpdateTask({ ...taskItem, priority: newP, iceScore: newIce });
                          }}
                          className={`text-[11px] font-semibold bg-transparent border-0 rounded px-1.5 py-1 cursor-pointer ${
                            taskItem.priority === 'p1_critical' ? 'text-rose-700 dark:text-rose-400' :
                            taskItem.priority === 'p2_high' ? 'text-amber-700 dark:text-amber-400' :
                            taskItem.priority === 'p3_medium' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <option value="p1_critical" className="dark:bg-slate-800 dark:text-slate-200">{tPriorities.p1_critical}</option>
                          <option value="p2_high" className="dark:bg-slate-800 dark:text-slate-200">{tPriorities.p2_high}</option>
                          <option value="p3_medium" className="dark:bg-slate-800 dark:text-slate-200">{tPriorities.p3_medium}</option>
                          <option value="p4_low" className="dark:bg-slate-800 dark:text-slate-200">{tPriorities.p4_low}</option>
                        </select>
                      </td>

                      {/* Quadrant */}
                      <td className="p-3">
                        <select
                          value={taskItem.quadrant}
                          onChange={(e) =>
                            onUpdateTask({ ...taskItem, quadrant: e.target.value as EisenhowerQuadrant })
                          }
                          className="text-[11px] text-slate-700 dark:text-slate-300 bg-transparent border-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1.5 py-1 cursor-pointer"
                        >
                          <option value="q1_do" className="dark:bg-slate-800 dark:text-slate-200">{tQuadrants.q1_do}</option>
                          <option value="q2_schedule" className="dark:bg-slate-800 dark:text-slate-200">{tQuadrants.q2_schedule}</option>
                          <option value="q3_delegate" className="dark:bg-slate-800 dark:text-slate-200">{tQuadrants.q3_delegate}</option>
                          <option value="q4_eliminate" className="dark:bg-slate-800 dark:text-slate-200">{tQuadrants.q4_eliminate}</option>
                        </select>
                      </td>

                      {/* ICE Score */}
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {taskItem.iceScore}
                      </td>

                      {/* Impact (1-10) */}
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={taskItem.impact}
                          onChange={(e) => {
                            const val = Math.min(10, Math.max(1, parseInt(e.target.value) || 1));
                            const newIce = calculateIceScore(val, taskItem.effort, taskItem.priority);
                            onUpdateTask({ ...taskItem, impact: val, iceScore: newIce });
                          }}
                          className="w-10 text-center font-mono bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded py-0.5 text-slate-800 dark:text-slate-200"
                        />
                      </td>

                      {/* Effort (1-10) */}
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={taskItem.effort}
                          onChange={(e) => {
                            const val = Math.min(10, Math.max(1, parseInt(e.target.value) || 1));
                            const newIce = calculateIceScore(taskItem.impact, val, taskItem.priority);
                            onUpdateTask({ ...taskItem, effort: val, iceScore: newIce });
                          }}
                          className="w-10 text-center font-mono bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded py-0.5 text-slate-800 dark:text-slate-200"
                        />
                      </td>

                      {/* Row Actions */}
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(taskItem)}
                            title={lang === 'es' ? 'Editar Detalles' : 'Edit Details'}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(taskItem.id)}
                            title={lang === 'es' ? 'Eliminar Tarea' : 'Delete Task'}
                            className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* Footer summary bar */}
        <div className="p-3 px-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>
            {t.showingSummary
              .replace('{count}', String(sortedTasks.length))
              .replace('{total}', String(tasks.length))}
          </span>
          <span className="tabular-nums">
            {t.completedSummary
              .replace('{done}', String(tasks.filter((taskItem) => taskItem.status === 'done').length))
              .replace('{p1}', String(tasks.filter((taskItem) => taskItem.priority === 'p1_critical').length))}
          </span>
        </div>

      </div>

    </div>
  );
};
