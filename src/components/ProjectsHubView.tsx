import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Flame, 
  ChevronRight, 
  ChevronDown,
  Edit2,
  FolderTree
} from 'lucide-react';
import { Task, CategoryInfo, EisenhowerQuadrant, Language } from '../types/task';
import { TaskCard } from './TaskCard';
import { getTranslation } from '../i18n/translations';

interface ProjectsHubViewProps {
  tasks: Task[];
  categories: CategoryInfo[];
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onChangeQuadrant: (task: Task, quadrant: EisenhowerQuadrant) => void;
  onAddNewTask: (task: Partial<Task>) => void;
  onOpenManageCategories: () => void;
  onEditCategory: (category: CategoryInfo) => void;
  onDeleteCategory: (categoryId: string) => void;
  lang: Language;
}

export const ProjectsHubView: React.FC<ProjectsHubViewProps> = ({
  tasks,
  categories,
  onToggleComplete,
  onEdit,
  onChangeQuadrant,
  onAddNewTask,
  onOpenManageCategories,
  onEditCategory,
  onDeleteCategory: _onDeleteCategory,
  lang,
}) => {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(categories[0]?.id || null);

  const t = getTranslation(lang).projects;

  const toggleCategory = (catId: string) => {
    setExpandedCategoryId(expandedCategoryId === catId ? null : catId);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview stats header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>{t.headerTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.headerSub}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={onOpenManageCategories}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FolderTree className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{t.manageCategories}</span>
          </button>

          <button
            onClick={() => onAddNewTask({ priority: 'p2_high', quadrant: 'q2_schedule' })}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newTask}</span>
          </button>
        </div>
      </div>

      {/* Category Workspaces Cards */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const catTasks = tasks.filter((taskItem) => taskItem.category === cat.id);
          const completedCount = catTasks.filter((taskItem) => taskItem.status === 'done').length;
          const criticalCount = catTasks.filter((taskItem) => taskItem.status !== 'done' && taskItem.priority === 'p1_critical').length;
          const progress = catTasks.length > 0 ? Math.round((completedCount / catTasks.length) * 100) : 0;
          const isExpanded = expandedCategoryId === cat.id;

          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs transition-all"
            >
              {/* Category Header Row */}
              <div
                onClick={() => toggleCategory(cat.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        {cat.name}
                      </h3>
                      {criticalCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded-md">
                          <Flame className="w-3 h-3" />
                          {criticalCount} {t.p1Critical}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar, Quick Actions & Toggle */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 self-end sm:self-center">
                  
                  {/* Category edit button */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditCategory(cat)}
                      title={t.editCategory.replace('{name}', cat.name)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right w-32 sm:w-36">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-500 dark:text-slate-400">{completedCount}/{catTasks.length} {t.tasksDone}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>

                  <div className="p-1 text-slate-400">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Task List & Quick Add */}
              {isExpanded && (
                <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30 space-y-3">
                  
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {t.tasksIn.replace('{name}', cat.name)} ({catTasks.length})
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNewTask({ category: cat.id, priority: 'p2_high', quadrant: 'q2_schedule' });
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addTaskHere}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {catTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 py-4 col-span-2 text-center">{t.noTasksInWorkspace}</p>
                    ) : (
                      catTasks.map((taskItem) => (
                        <TaskCard
                          key={taskItem.id}
                          task={taskItem}
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
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
