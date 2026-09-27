import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  X, 
  Copy, 
  Check, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { Task, CategoryInfo, Language } from '../types/task';
import { calculateIceScore } from '../utils/priorityCalculations';
import { getTranslation } from '../i18n/translations';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  categories: CategoryInfo[];
  onImportTasks: (newTasks: Task[]) => void;
  lang: Language;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  categories,
  onImportTasks,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [rawText, setRawText] = useState('');
  const [defaultCategory, setDefaultCategory] = useState(categories[0]?.id || 'GENERAL');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const t = getTranslation(lang).importExport;

  if (!isOpen) return null;

  const handleParseAndImport = () => {
    if (!rawText.trim()) return;
    setError(null);
    try {
      const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
      const parsedTasks: Task[] = [];

      // Check if user pasted JSON
      if (rawText.trim().startsWith('[') || rawText.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(rawText.trim());
          const array = Array.isArray(parsed) ? parsed : [parsed];
          for (const item of array) {
            if (item && (item.title || item.name)) {
              parsedTasks.push({
                id: item.id || `task-imp-${Date.now()}-${parsedTasks.length}`,
                title: item.title || item.name || 'Untitled Task',
                category: item.category || defaultCategory,
                status: item.status === 'done' ? 'done' : 'todo',
                priority: item.priority || 'p2_high',
                quadrant: item.quadrant || 'q2_schedule',
                impact: item.impact || 7,
                effort: item.effort || 3,
                iceScore: item.iceScore || calculateIceScore(item.impact || 7, item.effort || 3, item.priority || 'p2_high'),
                notes: item.notes || '',
                nextImmediateStep: item.nextImmediateStep || '',
                subtasks: Array.isArray(item.subtasks) ? item.subtasks : [],
                tags: Array.isArray(item.tags) ? item.tags : [item.category || defaultCategory],
                createdAt: item.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          }
        } catch {
          // fallback to line-by-line parser
        }
      }

      // If not parsed as JSON, parse CSV / Tabular / Line-by-line
      if (parsedTasks.length === 0) {
        let currentCat = defaultCategory;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Check if line is a Category Header
          const matchingCat = categories.find(
            (c) => c.name.toLowerCase() === line.toLowerCase() || c.id.toLowerCase() === line.toLowerCase()
          );
          if (matchingCat) {
            currentCat = matchingCat.id;
            continue;
          }

          // CSV split by comma or tab
          const delimiter = line.includes('\t') ? '\t' : line.includes(',') ? ',' : null;
          if (delimiter) {
            const parts = line.split(delimiter).map((p) => p.replace(/^["']|["']$/g, '').trim());
            const title = parts[0] || parts[1];
            if (title && title.length > 1) {
              parsedTasks.push({
                id: `task-imp-${Date.now()}-${parsedTasks.length}`,
                title,
                category: parts[2] && categories.some(c => c.id === parts[2]) ? parts[2] : currentCat,
                status: parts[3] === 'done' || parts[3] === 'completed' ? 'done' : 'todo',
                priority: 'p2_high',
                quadrant: 'q2_schedule',
                impact: 7,
                effort: 3,
                iceScore: 75,
                notes: parts[4] || '',
                subtasks: [],
                tags: [currentCat],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          } else {
            // Plain text line
            parsedTasks.push({
              id: `task-imp-${Date.now()}-${parsedTasks.length}`,
              title: line,
              category: currentCat,
              status: 'todo',
              priority: 'p2_high',
              quadrant: 'q2_schedule',
              impact: 7,
              effort: 3,
              iceScore: 75,
              subtasks: [],
              tags: [currentCat],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }

      if (parsedTasks.length === 0) {
        setError(t.noValidTasksError);
        return;
      }

      onImportTasks(parsedTasks);
      onClose();
    } catch (err: any) {
      setError(err.message || t.parseError);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Status', 'Priority', 'Quadrant', 'Impact', 'Effort', 'ICE Score', 'Notes', 'Next Step'];
    const rows = tasks.map((tItem) => [
      `"${tItem.id}"`,
      `"${(tItem.title || '').replace(/"/g, '""')}"`,
      `"${(tItem.category || '').replace(/"/g, '""')}"`,
      `"${tItem.status}"`,
      `"${tItem.priority}"`,
      `"${tItem.quadrant}"`,
      tItem.impact,
      tItem.effort,
      tItem.iceScore,
      `"${(tItem.notes || '').replace(/"/g, '""')}"`,
      `"${(tItem.nextImmediateStep || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `prioritizehq_tasks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `prioritizehq_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(tasks, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-900 dark:bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {t.modalTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.modalSub}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-4 sm:px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'import'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 rounded-t-lg'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.importTab}
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'export'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 rounded-t-lg'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.exportTab}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'import' ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.pasteLabel}
                </label>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>{t.assignToLabel}</span>
                  <select
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={t.pastePlaceholder}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800"
              />

              <button
                onClick={handleParseAndImport}
                disabled={!rawText.trim()}
                className="w-full py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.importBtn}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.exportDatasetTitle.replace('{count}', String(tasks.length))}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.exportDatasetSub}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleExportCSV}
                  className="py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.downloadCsv}</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{t.downloadJson}</span>
                </button>
              </div>

              <button
                onClick={handleCopyJSON}
                className="w-full py-2 px-3 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copiedText : t.copyJson}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
