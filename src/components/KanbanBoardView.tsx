import React, { useState } from 'react';
import { 
  Plus, 
  CircleDot, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Search 
} from 'lucide-react';
import { Task, CategoryInfo, TaskStatus, EisenhowerQuadrant, Language } from '../types/task';
import { TaskCard } from './TaskCard';
import { getTranslation } from '../i18n/translations';

interface KanbanBoardViewProps {
  tasks: Task[];
  categories: CategoryInfo[];
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onChangeQuadrant: (task: Task, quadrant: EisenhowerQuadrant) => void;
  onChangeStatus: (task: Task, status: TaskStatus) => void;
  onAddNewTask: (task: Partial<Task>) => void;
  lang: Language;
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onEdit,
  onChangeQuadrant,
  onChangeStatus,
  onAddNewTask,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const t = getTranslation(lang).kanban;

  const filteredTasks = tasks.filter((tItem) => {
    if (selectedCategory !== 'ALL' && tItem.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tItem.title.toLowerCase().includes(q) ||
        tItem.notes?.toLowerCase().includes(q) ||
        tItem.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns: {
    status: TaskStatus;
    title: string;
    icon: React.ReactNode;
    badgeBg: string;
    headerColor: string;
  }[] = [
    {
      status: 'todo',
      title: t.todoTitle,
      icon: <CircleDot className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      headerColor: 'text-slate-800 dark:text-slate-200',
    },
    {
      status: 'in_progress',
      title: t.inProgressTitle,
      icon: <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
      headerColor: 'text-indigo-900 dark:text-indigo-200',
    },
    {
      status: 'blocked',
      title: t.blockedTitle,
      icon: <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
      headerColor: 'text-amber-900 dark:text-amber-200',
    },
    {
      status: 'done',
      title: t.doneTitle,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
      headerColor: 'text-emerald-900 dark:text-emerald-200',
    },
  ];

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t.allProjects} ({tasks.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Kanban 4 Columns (Horizontal swipeable on mobile/tablet, 4 columns on large screens) */}
      <div className="flex xl:grid xl:grid-cols-4 overflow-x-auto gap-4 pb-3 snap-x no-scrollbar">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((tItem) => tItem.status === col.status);

          return (
            <div
              key={col.status}
              className="flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-3.5 min-h-[500px] min-w-[280px] sm:min-w-[320px] xl:min-w-0 snap-start shrink-0 xl:shrink"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h3 className={`text-xs font-bold tracking-tight uppercase ${col.headerColor}`}>
                    {col.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${col.badgeBg} tabular-nums`}>
                    {colTasks.length}
                  </span>
                  <button
                    onClick={() =>
                      onAddNewTask({
                        status: col.status,
                        category: selectedCategory !== 'ALL' ? selectedCategory : (categories[0]?.id || 'GENERAL'),
                        priority: 'p2_high',
                        quadrant: 'q2_schedule',
                      })
                    }
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card List in Column */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[640px] pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-white/40 dark:bg-slate-800/20">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {t.noTasks.replace('{col}', col.title)}
                    </p>
                  </div>
                ) : (
                  colTasks.map((taskItem) => (
                    <div key={taskItem.id} className="relative group">
                      <TaskCard
                        task={taskItem}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEdit}
                        onChangeQuadrant={onChangeQuadrant}
                        lang={lang}
                      />
                      
                      {/* Move status buttons on hover / touch */}
                      <div className="mt-1 flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {col.status !== 'todo' && (
                          <button
                            onClick={() => onChangeStatus(taskItem, 'todo')}
                            className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-2xs cursor-pointer"
                          >
                            {t.btnTodo}
                          </button>
                        )}
                        {col.status !== 'in_progress' && (
                          <button
                            onClick={() => onChangeStatus(taskItem, 'in_progress')}
                            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-2xs cursor-pointer"
                          >
                            {t.btnInProgress}
                          </button>
                        )}
                        {col.status !== 'blocked' && (
                          <button
                            onClick={() => onChangeStatus(taskItem, 'blocked')}
                            className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-2xs cursor-pointer"
                          >
                            {t.btnBlocked}
                          </button>
                        )}
                        {col.status !== 'done' && (
                          <button
                            onClick={() => onChangeStatus(taskItem, 'done')}
                            className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-2xs cursor-pointer"
                          >
                            {t.btnDone}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
