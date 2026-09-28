import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload,
  FileSpreadsheet, 
  X, 
  Copy, 
  Check, 
  AlertCircle,
  FileJson,
  FileText,
  RotateCcw,
  Sparkles,
  FolderTree
} from 'lucide-react';
import { Task, CategoryInfo, Language, AppBackupData } from '../types/task';
import { getTranslation } from '../i18n/translations';
import { mergeCategoriesFromImport } from '../utils/categoryHelpers';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  categories: CategoryInfo[];
  onImportTasks: (newTasks: Task[], newCategories?: CategoryInfo[]) => void;
  onRestoreBackup?: (tasks: Task[], categories?: CategoryInfo[]) => void;
  lang: Language;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  categories,
  onImportTasks,
  onRestoreBackup,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'import_file' | 'import_paste' | 'export'>('import_file');
  const [rawText, setRawText] = useState('');
  const [defaultCategory, setDefaultCategory] = useState(categories[0]?.id || 'GENERAL');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{
    tasks: Task[];
    categories?: CategoryInfo[];
    isFullBackup: boolean;
    detectedCategories: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = getTranslation(lang).importExport;

  if (!isOpen) return null;

  const resetState = () => {
    setError(null);
    setSuccessMsg(null);
    setSelectedFile(null);
    setParsedPreview(null);
    setRawText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      parseContent(content, file.name.endsWith('.json') ? 'json' : 'text');
    };
    reader.onerror = () => {
      setError(lang === 'es' ? 'Error al leer el archivo.' : 'Failed to read file.');
    };
    reader.readAsText(file);
  };

  const parseContent = (content: string, typeHint?: 'json' | 'text') => {
    setError(null);
    try {
      const trimmed = content.trim();
      
      // Try JSON parsing
      if (typeHint === 'json' || trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          
          // Case 1: Full App Backup object { tasks: [...], categories: [...] }
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.tasks)) {
            const rawTasks: Task[] = parsed.tasks.map((item: any, idx: number) => ({
              id: item.id || `task-imp-${Date.now()}-${idx}`,
              title: item.title || item.name || 'Untitled Task',
              category: (item.category || defaultCategory).trim(),
              status: item.status || 'todo',
              priority: item.priority || 'p2_high',
              quadrant: item.quadrant || 'q2_schedule',
              dueDate: item.dueDate || undefined,
              estimatedDuration: item.estimatedDuration || undefined,
              notes: item.notes || undefined,
              nextImmediateStep: item.nextImmediateStep || undefined,
              subtasks: Array.isArray(item.subtasks) ? item.subtasks : [],
              tags: Array.isArray(item.tags) ? item.tags : [item.category || defaultCategory],
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: item.completedAt || undefined,
            }));

            const explicitCategories: CategoryInfo[] | undefined = Array.isArray(parsed.categories) 
              ? parsed.categories.map((c: any) => ({
                  id: (c.id || c.name || `CAT-${Date.now()}`).trim(),
                  name: (c.name || c.id || 'Category').trim(),
                  color: c.color || '#2563EB',
                  badgeBg: c.badgeBg || 'bg-blue-50 text-blue-700 border-blue-200',
                  description: c.description || `Workspace for ${c.name || c.id}`,
                }))
              : undefined;

            const { mergedCategories, normalizedTasks } = mergeCategoriesFromImport(
              categories,
              rawTasks,
              explicitCategories
            );

            const uniqueCatNames = Array.from(new Set(normalizedTasks.map((tItem) => tItem.category)));

            setParsedPreview({
              tasks: normalizedTasks,
              categories: mergedCategories,
              isFullBackup: Boolean(explicitCategories && explicitCategories.length > 0),
              detectedCategories: uniqueCatNames,
            });
            return;
          }

          // Case 2: Array of Task objects [...]
          if (Array.isArray(parsed)) {
            const rawTasks: Task[] = parsed.map((item: any, idx: number) => ({
              id: item.id || `task-imp-${Date.now()}-${idx}`,
              title: item.title || item.name || 'Untitled Task',
              category: (item.category || defaultCategory).trim(),
              status: item.status === 'done' ? 'done' : (item.status || 'todo'),
              priority: item.priority || 'p2_high',
              quadrant: item.quadrant || 'q2_schedule',
              dueDate: item.dueDate || undefined,
              estimatedDuration: item.estimatedDuration || undefined,
              notes: item.notes || undefined,
              nextImmediateStep: item.nextImmediateStep || undefined,
              subtasks: Array.isArray(item.subtasks) ? item.subtasks : [],
              tags: Array.isArray(item.tags) ? item.tags : [item.category || defaultCategory],
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: item.completedAt || undefined,
            })).filter((tItem) => tItem.title && tItem.title.trim().length > 0);

            if (rawTasks.length > 0) {
              const { mergedCategories, normalizedTasks } = mergeCategoriesFromImport(
                categories,
                rawTasks
              );
              const uniqueCatNames = Array.from(new Set(normalizedTasks.map((tItem) => tItem.category)));

              setParsedPreview({
                tasks: normalizedTasks,
                categories: mergedCategories,
                isFullBackup: false,
                detectedCategories: uniqueCatNames,
              });
              return;
            }
          }
        } catch {
          // If JSON parse fails, continue to CSV/line parser
        }
      }

      // Case 3: CSV / Tab / Line-by-line parsing
      const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
      const parsedTasks: Task[] = [];
      let currentCat = defaultCategory;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip CSV header row if present
        if (i === 0 && (line.toLowerCase().includes('title') || line.toLowerCase().includes('task name'))) {
          continue;
        }

        // Match category header
        const matchingCat = categories.find(
          (c) => c.name.toLowerCase() === line.toLowerCase() || c.id.toLowerCase() === line.toLowerCase()
        );
        if (matchingCat) {
          currentCat = matchingCat.id;
          continue;
        }

        // Delimiter split (tab or comma)
        const delimiter = line.includes('\t') ? '\t' : line.includes(',') ? ',' : null;
        if (delimiter) {
          const parts = line.split(delimiter).map((p) => p.replace(/^["']|["']$/g, '').trim());
          const title = parts[0] || parts[1];
          if (title && title.length > 1) {
            const taskCategory = parts[2] ? parts[2].trim() : currentCat;
            parsedTasks.push({
              id: `task-imp-${Date.now()}-${parsedTasks.length}`,
              title,
              category: taskCategory,
              status: parts[3] === 'done' || parts[3] === 'completed' ? 'done' : 'todo',
              priority: 'p2_high',
              quadrant: 'q2_schedule',
              notes: parts[4] || undefined,
              subtasks: [],
              tags: [taskCategory],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          // Plain text single line task
          parsedTasks.push({
            id: `task-imp-${Date.now()}-${parsedTasks.length}`,
            title: line,
            category: currentCat,
            status: 'todo',
            priority: 'p2_high',
            quadrant: 'q2_schedule',
            subtasks: [],
            tags: [currentCat],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      if (parsedTasks.length === 0) {
        setError(t.noValidTasksError);
        setParsedPreview(null);
        return;
      }

      const { mergedCategories, normalizedTasks } = mergeCategoriesFromImport(
        categories,
        parsedTasks
      );
      const uniqueCatNames = Array.from(new Set(normalizedTasks.map((tItem) => tItem.category)));

      setParsedPreview({
        tasks: normalizedTasks,
        categories: mergedCategories,
        isFullBackup: false,
        detectedCategories: uniqueCatNames,
      });

    } catch (err: any) {
      setError(err.message || t.parseError);
      setParsedPreview(null);
    }
  };

  const handleApplyImport = (mode: 'append' | 'restore') => {
    if (!parsedPreview || parsedPreview.tasks.length === 0) return;

    if (mode === 'restore' && onRestoreBackup) {
      onRestoreBackup(parsedPreview.tasks, parsedPreview.categories);
    } else {
      onImportTasks(parsedPreview.tasks, parsedPreview.categories);
    }

    setSuccessMsg(
      lang === 'es'
        ? `¡Se importaron con éxito ${parsedPreview.tasks.length} tareas y ${parsedPreview.detectedCategories.length} categorías!`
        : `Successfully imported ${parsedPreview.tasks.length} tasks and synchronized ${parsedPreview.detectedCategories.length} categories!`
    );
    setTimeout(() => {
      onClose();
      resetState();
    }, 900);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Status', 'Priority', 'Quadrant', 'Due Date', 'Estimated Duration', 'Next Action', 'Notes'];
    const rows = tasks.map((tItem) => [
      `"${tItem.id}"`,
      `"${(tItem.title || '').replace(/"/g, '""')}"`,
      `"${(tItem.category || '').replace(/"/g, '""')}"`,
      `"${tItem.status}"`,
      `"${tItem.priority}"`,
      `"${tItem.quadrant}"`,
      `"${tItem.dueDate || ''}"`,
      `"${(tItem.estimatedDuration || '').replace(/"/g, '""')}"`,
      `"${(tItem.nextImmediateStep || '').replace(/"/g, '""')}"`,
      `"${(tItem.notes || '').replace(/"/g, '""')}"`,
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
    const backup: AppBackupData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      tasks,
      categories,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
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
    const backup: AppBackupData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      tasks,
      categories,
    };
    navigator.clipboard.writeText(JSON.stringify(backup, null, 2));
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
                {lang === 'es' ? 'Importa y exporta archivos JSON o CSV de copia de seguridad.' : 'Import and export JSON backups or spreadsheet CSV files.'}
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
            onClick={() => { setActiveTab('import_file'); setError(null); }}
            className={`px-3 sm:px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'import_file'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 rounded-t-lg'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Subir Archivo (JSON / CSV)' : 'Import File (JSON / CSV)'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('import_paste'); setError(null); }}
            className={`px-3 sm:px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'import_paste'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 rounded-t-lg'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Pegar Texto / Filas' : 'Paste Rows'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('export'); setError(null); }}
            className={`px-3 sm:px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'export'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 rounded-t-lg'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportTab}</span>
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

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: File Upload (JSON & CSV) */}
          {activeTab === 'import_file' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/30 dark:hover:bg-slate-800/80 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : (lang === 'es' ? 'Selecciona o arrastra tu archivo JSON o CSV' : 'Select or drop your JSON or CSV file')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'es' ? 'Extrae y sincroniza automáticamente tareas y categorías personalizadas' : 'Automatically extracts and synchronizes tasks and custom categories'}
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs">
                    {lang === 'es' ? 'Examinar archivos...' : 'Browse files...'}
                  </span>
                </div>
              </div>

              {/* Preview & Action Buttons */}
              {parsedPreview && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{lang === 'es' ? 'Archivo detectado' : 'Detected File Content'}</span>
                    </span>
                    <span className="font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-semibold">
                      {parsedPreview.tasks.length} {lang === 'es' ? 'tareas' : 'tasks'} · {parsedPreview.detectedCategories.length} {lang === 'es' ? 'categorías' : 'categories'}
                    </span>
                  </div>

                  {/* List of categories detected */}
                  {parsedPreview.detectedCategories.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        {lang === 'es' ? 'Categorías detectadas:' : 'Detected categories:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {parsedPreview.detectedCategories.map((catName) => (
                          <span 
                            key={catName}
                            className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                          >
                            <FolderTree className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            <span>{catName}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handleApplyImport('append')}
                      className="py-2.5 px-4 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{lang === 'es' ? 'Importar y Fusionar Categorías' : 'Import & Merge Categories'}</span>
                    </button>

                    {parsedPreview.isFullBackup && onRestoreBackup && (
                      <button
                        onClick={() => {
                          if (confirm(lang === 'es' ? '¿Deseas restaurar la copia completa? Esto reemplazará las tareas y cargará las categorías del archivo.' : 'Restore full backup? This will replace current tasks and load all categories from the file.')) {
                            handleApplyImport('restore');
                          }
                        }}
                        className="py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-600" />
                        <span>{lang === 'es' ? 'Restaurar Copia Completa' : 'Restore Full Backup'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Paste text / CSV / JSON */}
          {activeTab === 'import_paste' && (
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
                rows={7}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  if (e.target.value.trim()) {
                    parseContent(e.target.value);
                  } else {
                    setParsedPreview(null);
                  }
                }}
                placeholder={t.pastePlaceholder}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800"
              />

              <button
                onClick={() => {
                  if (rawText.trim()) {
                    parseContent(rawText);
                    handleApplyImport('append');
                  }
                }}
                disabled={!rawText.trim()}
                className="w-full py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{t.importBtn}</span>
              </button>
            </div>
          )}

          {/* TAB 3: Export */}
          {activeTab === 'export' && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.exportDatasetTitle.replace('{count}', String(tasks.length))}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'es' 
                    ? 'Descarga una copia completa en JSON con categorías o una hoja de cálculo en CSV.'
                    : 'Download a complete JSON backup with all categories or a spreadsheet CSV file.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleExportJSON}
                  className="py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{lang === 'es' ? 'Descargar Copia JSON (.json)' : 'Download Backup (.json)'}</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.downloadCsv}</span>
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
