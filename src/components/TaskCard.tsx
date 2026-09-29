import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ListChecks,
  Calendar,
  FileText
} from 'lucide-react';
import { Task, EisenhowerQuadrant, Language } from '../types/task';
import { PRIORITY_CONFIG } from '../utils/priorityCalculations';
import { getTranslation } from '../i18n/translations';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onChangeQuadrant?: (task: Task, quadrant: EisenhowerQuadrant) => void;
  showQuadrantSelector?: boolean;
  lang?: Language;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onChangeQuadrant,
  showQuadrantSelector = false,
  lang = 'en',
}) => {
  const isDone = task.status === 'done';
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.p3_medium;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const t = getTranslation(lang);

  return (
    <div
      className={`group relative bg-white dark:bg-slate-800/90 rounded-xl border transition-all duration-150 shadow-xs hover:shadow-md ${
        isDone
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-65'
          : 'border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="p-3.5">
        
        {/* Top bar of card: Category and Priority Badge */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <span className="font-semibold text-slate-700 dark:text-slate-300 tracking-tight">{task.category}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span className={`font-semibold ${
              task.priority === 'p1_critical' ? 'text-rose-600 dark:text-rose-400' :
              task.priority === 'p2_high' ? 'text-amber-600 dark:text-amber-400' :
              task.priority === 'p3_medium' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {t.priorities[task.priority] || priorityInfo.label}
            </span>
          </div>

          {(task.dueDate || task.startDate) && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>
                {task.startDate && task.dueDate ? `${task.startDate} → ${task.dueDate}` : (task.dueDate || task.startDate)}
              </span>
            </span>
          )}
        </div>

        {/* Task Title & Checkbox */}
        <div className="flex items-start gap-2.5">
          <button
            onClick={() => onToggleComplete(task)}
            className="mt-0.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 cursor-pointer p-0.5"
            aria-label={isDone ? 'Mark as incomplete' : 'Mark as completed'}
          >
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950/40" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400" />
            )}
          </button>

          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(task)}>
            <h4
              className={`text-sm font-semibold leading-snug tracking-tight transition-colors ${
                isDone 
                  ? 'line-through text-slate-400 dark:text-slate-500' 
                  : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
              }`}
            >
              {task.title}
            </h4>

            {/* Context Notes & Requirements shown directly under task title */}
            {task.notes && (
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-md border border-slate-100 dark:border-slate-700/50">
                {task.notes}
              </p>
            )}
          </div>
        </div>

        {/* Footer info: Duration, Subtasks, Quadrant Shift */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            {totalSubtasks > 0 && (
              <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                <ListChecks className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}

            {task.estimatedDuration && (
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span>{task.estimatedDuration}</span>
              </span>
            )}
          </div>

          {/* Quadrant Quick Shift dropdown (if enabled) */}
          {showQuadrantSelector && onChangeQuadrant && (
            <select
              value={task.quadrant}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onChangeQuadrant(task, e.target.value as EisenhowerQuadrant)}
              className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="q1_do">{t.quadrants.q1_do}</option>
              <option value="q2_schedule">{t.quadrants.q2_schedule}</option>
              <option value="q3_delegate">{t.quadrants.q3_delegate}</option>
              <option value="q4_eliminate">{t.quadrants.q4_eliminate}</option>
            </select>
          )}
        </div>

      </div>
    </div>
  );
};
