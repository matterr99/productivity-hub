import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Clock, 
  ArrowRight, 
  ListChecks, 
  Trophy 
} from 'lucide-react';
import { Task, Language } from '../types/task';
import { PRIORITY_CONFIG } from '../utils/priorityCalculations';
import { getTranslation } from '../i18n/translations';

interface DailyFocusViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onToggleDailyFocus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onToggleSubtask: (task: Task, subtaskId: string) => void;
  lang: Language;
}

export const DailyFocusView: React.FC<DailyFocusViewProps> = ({
  tasks,
  onToggleComplete,
  onToggleDailyFocus,
  onEdit,
  onToggleSubtask,
  lang,
}) => {
  const t = getTranslation(lang).dailyFocus;
  const tPriorities = getTranslation(lang).priorities;

  // Focus Tasks (starred as isDailyFocus or top P1)
  const focusTasks = tasks.filter((t) => t.isDailyFocus);
  const otherPendingTasks = tasks.filter((t) => !t.isDailyFocus && t.status !== 'done');
  
  const [activeTaskId, setActiveTaskId] = useState<string | null>(
    focusTasks[0]?.id || tasks.find((t) => t.status !== 'done')?.id || null
  );

  const activeTask = tasks.find((t) => t.id === activeTaskId) || focusTasks[0] || null;

  // Pomodoro Timer State
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setTimerRunning(false);
            if (timerMode === 'work') {
              setSessionsCompleted((s) => s + 1);
              setTimerMode('break');
              return 5 * 60;
            } else {
              setTimerMode('work');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, timerMode]);

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = (mode: 'work' | 'break' = 'work') => {
    setTimerRunning(false);
    setTimerMode(mode);
    setTimerSeconds(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalModeDuration = timerMode === 'work' ? 25 * 60 : 5 * 60;
  const progressPercent = ((totalModeDuration - timerSeconds) / totalModeDuration) * 100;

  const completedTodayCount = focusTasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner: Daily Focus Mission */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-lg">
              <Target className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.headerTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {t.headerSub}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 self-stretch md:self-auto justify-between md:justify-start">
          <div className="text-left md:text-right">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.todaysProgress}</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {completedTodayCount} {t.mitsCompleted.replace('{total}', String(focusTasks.length))}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold font-mono text-sm text-indigo-600 dark:text-indigo-400 shadow-2xs shrink-0">
            {focusTasks.length > 0 ? Math.round((completedTodayCount / focusTasks.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Main Grid: Active Task & Pomodoro (Left) + MIT Deck (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Pomodoro Focus Engine & Active Execution (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Pomodoro Timer Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Background ambient glow */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 transition-all ${
              timerRunning ? 'bg-indigo-500' : 'bg-rose-500'
            }`} />

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs font-medium mb-4 z-10">
              <button
                onClick={() => resetTimer('work')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  timerMode === 'work' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.deepFocus25}
              </button>
              <button
                onClick={() => resetTimer('break')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  timerMode === 'break' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.rechargeBreak5}
              </button>
            </div>

            {/* Timer Display */}
            <div className="my-2 z-10">
              <div className="text-5xl sm:text-7xl font-mono font-bold tracking-tight tabular-nums">
                {formattedTime}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {timerRunning ? (timerMode === 'work' ? t.sprintActive : t.restStretch) : t.timerPaused}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs bg-slate-800 h-1.5 rounded-full overflow-hidden my-4 z-10">
              <div
                className={`h-full transition-all duration-300 ${
                  timerMode === 'work' ? 'bg-indigo-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 z-10">
              <button
                onClick={toggleTimer}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
                  timerRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-white hover:bg-slate-100 text-slate-900'
                }`}
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-900" />}
                <span>{timerRunning ? t.pauseTimer : t.startTimer}</span>
              </button>

              <button
                onClick={() => resetTimer(timerMode)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                title={t.resetTimer}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Sessions tally */}
            {sessionsCompleted > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-1.5 z-10">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {sessionsCompleted} {t.sprintsCompleted.replace('{s}', sessionsCompleted > 1 ? 's' : '').replace('{s}', sessionsCompleted > 1 ? 's' : '')}
                </span>
              </div>
            )}
          </div>

          {/* Currently Selected Execution Spotlight */}
          {activeTask ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                      {t.currentTargetLabel}
                    </span>
                    <span>·</span>
                    <span>{activeTask.category}</span>
                    <span>·</span>
                    <span className={PRIORITY_CONFIG[activeTask.priority]?.badgeClass.split(' ')[0]}>
                      {tPriorities[activeTask.priority] || PRIORITY_CONFIG[activeTask.priority]?.label}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
                    {activeTask.title}
                  </h3>
                </div>

                <button
                  onClick={() => onToggleComplete(activeTask)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-start shrink-0 cursor-pointer ${
                    activeTask.status === 'done'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeTask.status === 'done' ? t.completedDone : t.markCompleted}</span>
                </button>
              </div>

              {/* Next Immediate Action Step Callout */}
              {activeTask.nextImmediateStep && (
                <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/50 rounded-xl border border-indigo-100 dark:border-indigo-800/60 flex items-start gap-2.5">
                  <div className="p-1 bg-indigo-600 text-white rounded-md mt-0.5 shrink-0">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300">{t.first60SecAction}</div>
                    <p className="text-xs text-indigo-950/80 dark:text-indigo-200 mt-0.5 leading-relaxed">
                      {activeTask.nextImmediateStep}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {activeTask.notes && (
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">{t.contextDetails}</span>
                  {activeTask.notes}
                </div>
              )}

              {/* Subtasks Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{t.actionChecklist} ({activeTask.subtasks.filter(s => s.completed).length}/{activeTask.subtasks.length})</span>
                  </span>

                  <button
                    onClick={() => onEdit(activeTask)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
                  >
                    {t.addEditSteps}
                  </button>
                </div>

                <div className="space-y-1.5">
                  {activeTask.subtasks.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.noSubtasksYet}</p>
                      <button
                        onClick={() => onEdit(activeTask)}
                        className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
                      >
                        {t.addActionSteps}
                      </button>
                    </div>
                  ) : (
                    activeTask.subtasks.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => onToggleSubtask(activeTask, st.id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                          st.completed
                            ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {st.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                          )}
                          <span className="text-xs font-medium">{st.title}</span>
                        </div>
                        {st.estimatedMinutes && (
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                            ~{st.estimatedMinutes}m
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.selectTaskPrompt}</p>
            </div>
          )}

        </div>

        {/* Right Column: Top 3 Most Important Tasks (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>{t.todaysTopTargets}</span>
              </h3>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {focusTasks.length} {t.starredCount}
              </span>
            </div>

            <div className="space-y-3">
              {focusTasks.length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{t.noStarredTasks}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{t.starFromPool}</p>
                </div>
              ) : (
                focusTasks.map((tItem, idx) => {
                  const isCurrent = activeTaskId === tItem.id;
                  const isDone = tItem.status === 'done';
                  return (
                    <div
                      key={tItem.id}
                      onClick={() => setActiveTaskId(tItem.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-500 ring-2 ring-indigo-200/60 dark:ring-indigo-900/60'
                          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-indigo-600 text-white text-[11px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{tItem.category}</span>
                              <span>·</span>
                              <span className={tItem.priority === 'p1_critical' ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                                {tPriorities[tItem.priority] || tItem.priority}
                              </span>
                            </div>
                            <h4 className={`text-xs font-bold mt-0.5 ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                              {tItem.title}
                            </h4>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleDailyFocus(tItem);
                          }}
                          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                          title="Remove from Daily Focus"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-mono">{tItem.estimatedDuration || '~30m'}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          {isCurrent ? t.activeInTimer : t.clickToFocus}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Add from Backlog Pool */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t.unstarredPool}
              </h4>
              <span className="text-xs font-mono text-slate-400">{otherPendingTasks.length} {t.remainingCount}</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {otherPendingTasks.slice(0, 8).map((tItem) => (
                <div
                  key={tItem.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[10px] text-slate-400 font-medium">{tItem.category}</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{tItem.title}</p>
                  </div>
                  <button
                    onClick={() => onToggleDailyFocus(tItem)}
                    className="px-2 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-white dark:hover:text-white bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 dark:hover:bg-indigo-600 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {t.addToToday}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
