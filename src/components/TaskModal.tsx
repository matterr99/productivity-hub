import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Trash2, 
  ListChecks, 
  CheckCircle2, 
  Circle,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import { Task, CategoryInfo, TaskStatus, TaskPriority, EisenhowerQuadrant, Subtask, Language } from '../types/task';
import { getTranslation } from '../i18n/translations';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  categories: CategoryInfo[];
  onSaveTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  lang: Language;
}

const HOURS_LIST = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_LIST = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const DURATION_PRESETS = [
  { label: '15m', h: 0, m: 15 },
  { label: '30m', h: 0, m: 30 },
  { label: '45m', h: 0, m: 45 },
  { label: '1h', h: 1, m: 0 },
  { label: '1.5h', h: 1, m: 30 },
  { label: '2h', h: 2, m: 0 },
  { label: '4h', h: 4, m: 0 },
  { label: '8h', h: 8, m: 0 },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  categories,
  onSaveTask,
  onDeleteTask,
  lang,
}) => {
  const isEditing = Boolean(task?.id);
  const t = getTranslation(lang).taskModal;
  const tPriorities = getTranslation(lang).priorities;
  const tQuadrants = getTranslation(lang).quadrants;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'GENERAL');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('p2_high');
  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>('q2_schedule');
  
  // iOS Duration Clock Picker state
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(30);

  // Date range state
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Helper to parse duration string like "1 hr 30 min", "45 min", "2 hours"
  const parseDurationString = (str?: string) => {
    if (!str) return { h: 0, m: 30 };
    const hMatch = str.match(/(\d+)\s*(?:h|hr|hour|horas)/i);
    const mMatch = str.match(/(\d+)\s*(?:m|min|minute|minutos)/i);
    const h = hMatch ? parseInt(hMatch[1], 10) : 0;
    const m = mMatch ? parseInt(mMatch[1], 10) : 0;
    return { h: Math.min(23, h), m: Math.min(55, m) };
  };

  const formatDurationString = (h: number, m: number) => {
    if (h === 0 && m === 0) return '';
    if (h > 0 && m > 0) return `${h} hr ${m} min`;
    if (h > 0) return `${h} ${h === 1 ? 'hour' : 'hours'}`;
    return `${m} min`;
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setCategory(task.category || categories[0]?.id || 'GENERAL');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'p2_high');
      setQuadrant(task.quadrant || 'q2_schedule');
      const { h, m } = parseDurationString(task.estimatedDuration);
      setSelectedHours(h);
      setSelectedMinutes(m);
      setStartDate(task.startDate || '');
      setDueDate(task.dueDate || '');
      setNotes(task.notes || '');
      setSubtasks(task.subtasks || []);
    } else {
      setTitle('');
      setCategory(categories[0]?.id || 'GENERAL');
      setStatus('todo');
      setPriority('p2_high');
      setQuadrant('q2_schedule');
      setSelectedHours(0);
      setSelectedMinutes(30);
      setStartDate('');
      setDueDate('');
      setNotes('');
      setSubtasks([]);
    }
  }, [task, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSt: Subtask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      estimatedMinutes: 10,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const calculateDateSpan = () => {
    if (!startDate || !dueDate) return null;
    const start = new Date(startDate);
    const end = new Date(dueDate);
    const diffTime = end.getTime() - start.getTime();
    if (isNaN(diffTime) || diffTime < 0) return null;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedDuration = formatDurationString(selectedHours, selectedMinutes);

    const updatedTask: Task = {
      id: task?.id || `task-${Date.now()}`,
      title: title.trim(),
      category,
      status,
      priority,
      quadrant,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      estimatedDuration: formattedDuration || undefined,
      notes: notes.trim() || undefined,
      subtasks,
      tags: task?.tags || [category],
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: status === 'done' ? (task?.completedAt || new Date().toISOString()) : undefined,
    };

    onSaveTask(updatedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-900 dark:bg-slate-950 text-white">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {isEditing ? t.editTitle : t.addTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'es' 
                ? 'Organiza y prioriza tareas por urgencia, importancia y proyecto.'
                : 'Organize and prioritize tasks by urgency, importance, and project.'}
            </p>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {t.titleLabel}
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 font-medium"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.categoryLabel}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-slate-800 dark:text-slate-200">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.statusLabel}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="todo" className="dark:bg-slate-800 dark:text-slate-200">{t.todo}</option>
                <option value="in_progress" className="dark:bg-slate-800 dark:text-slate-200">{t.inProgress}</option>
                <option value="blocked" className="dark:bg-slate-800 dark:text-slate-200">{t.blocked}</option>
                <option value="done" className="dark:bg-slate-800 dark:text-slate-200">{t.done}</option>
              </select>
            </div>
          </div>

          {/* Eisenhower Quadrant & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.quadrantLabel}
              </label>
              <select
                value={quadrant}
                onChange={(e) => setQuadrant(e.target.value as EisenhowerQuadrant)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="q1_do" className="dark:bg-slate-800 dark:text-slate-200">{tQuadrants.q1_do} ({lang === 'es' ? 'Urgente e Importante' : 'Urgent & Important'})</option>
                <option value="q2_schedule" className="dark:bg-slate-800 dark:text-slate-200">{tQuadrants.q2_schedule} ({lang === 'es' ? 'No urgente pero Importante' : 'Important & Not Urgent'})</option>
                <option value="q3_delegate" className="dark:bg-slate-800 dark:text-slate-200">{tQuadrants.q3_delegate} ({lang === 'es' ? 'Urgente pero Menos crítico' : 'Urgent & Delegate'})</option>
                <option value="q4_eliminate" className="dark:bg-slate-800 dark:text-slate-200">{tQuadrants.q4_eliminate} ({lang === 'es' ? 'Backlog / Eliminar' : 'Backlog / Evaluate'})</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.priorityTierLabel}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="p1_critical" className="dark:bg-slate-800 dark:text-slate-200">{tPriorities.p1_critical}</option>
                <option value="p2_high" className="dark:bg-slate-800 dark:text-slate-200">{tPriorities.p2_high}</option>
                <option value="p3_medium" className="dark:bg-slate-800 dark:text-slate-200">{tPriorities.p3_medium}</option>
                <option value="p4_low" className="dark:bg-slate-800 dark:text-slate-200">{tPriorities.p4_low}</option>
              </select>
            </div>
          </div>

          {/* iOS Clock-Style Estimated Duration Picker */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{lang === 'es' ? 'Duración Estimada (Reloj iOS)' : 'Estimated Duration (iOS Clock Style)'}</span>
              </label>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {formatDurationString(selectedHours, selectedMinutes) || (lang === 'es' ? '0 min' : '0 min')}
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {DURATION_PRESETS.map((p) => {
                const isActive = selectedHours === p.h && selectedMinutes === p.m;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setSelectedHours(p.h);
                      setSelectedMinutes(p.m);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold'
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* iOS-Style Scroll Wheels for Hours & Minutes */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              
              {/* Hours Scroll Column */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 text-center shadow-inner">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  {lang === 'es' ? 'Horas' : 'Hours'}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <select
                    value={selectedHours}
                    onChange={(e) => setSelectedHours(parseInt(e.target.value, 10))}
                    className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono font-bold text-sm text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {HOURS_LIST.map((h) => (
                      <option key={h} value={h}>
                        {h} {h === 1 ? (lang === 'es' ? 'hora' : 'hour') : (lang === 'es' ? 'horas' : 'hours')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Minutes Scroll Column */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 text-center shadow-inner">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  {lang === 'es' ? 'Minutos' : 'Minutes'}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <select
                    value={selectedMinutes}
                    onChange={(e) => setSelectedMinutes(parseInt(e.target.value, 10))}
                    className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono font-bold text-sm text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {MINUTES_LIST.map((m) => (
                      <option key={m} value={m}>
                        {m < 10 ? `0${m}` : m} {lang === 'es' ? 'min' : 'min'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Date Duration Range (Start Date & Due Date) */}
          <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{lang === 'es' ? 'Fechas y Duración de Calendario' : 'Dates & Calendar Duration'}</span>
              </label>
              {calculateDateSpan() && (
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {calculateDateSpan()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {lang === 'es' ? 'Fecha de Inicio (Opcional)' : 'Start Date (Optional)'}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  {lang === 'es' ? 'Fecha Límite / Entrega' : 'Due / End Date'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Context Notes & Requirements */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.notesLabel}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {lang === 'es' ? 'Se mostrará debajo del título' : 'Shows directly under title'}
              </span>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Subtasks Checklist */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.checklistLabel} ({subtasks.length})</span>
            </label>

            {/* Subtasks List */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div
                      onClick={() => handleToggleSubtask(st.id)}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      {st.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                      )}
                      <span className={st.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}>
                        {st.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 ml-2 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder={t.addSubtaskPlaceholder}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600 rounded-lg cursor-pointer shrink-0"
              >
                {t.addStepBtn}
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {isEditing && task && onDeleteTask ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(t.deleteConfirm)) {
                    onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.deleteTaskBtn}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                {t.cancelBtn}
              </button>

              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{t.saveTaskBtn}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
