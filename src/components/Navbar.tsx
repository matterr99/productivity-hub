import React from 'react';
import { 
  LayoutGrid, 
  Target, 
  Table2, 
  Kanban, 
  FolderKanban, 
  Plus, 
  Download, 
  ScatterChart, 
  RotateCcw, 
  FolderTree,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { Language, Theme } from '../types/task';
import { getTranslation } from '../i18n/translations';

export type ActiveTab = 'matrix' | 'impact_effort' | 'daily_focus' | 'table' | 'kanban' | 'projects';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTask: () => void;
  onOpenManageCategories: () => void;
  onOpenImportExport: () => void;
  onResetData: () => void;
  pendingCount: number;
  criticalCount: number;
  categoriesCount: number;
  lang: Language;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTask,
  onOpenManageCategories,
  onOpenImportExport,
  onResetData,
  pendingCount,
  criticalCount,
  categoriesCount,
  lang,
  onToggleLanguage,
  theme,
  onToggleTheme,
}) => {
  const t = getTranslation(lang).navbar;
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Zone 1: Single text element Brand Zone */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              P
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('matrix'); }} className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-baseline gap-2">
              <span>PrioritizeHQ</span>
              <span className="hidden md:inline text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">
                {pendingCount} {t.open} · {criticalCount} {t.critical}
              </span>
            </a>
          </div>

          {/* Zone 2: Clean text navigation links (Hidden on mobile / iPad portrait, shown on desktop / iPad landscape) */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t.matrix}</span>
            </button>

            <button
              onClick={() => setActiveTab('impact_effort')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'impact_effort'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <ScatterChart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.impactEffort}</span>
            </button>

            <button
              onClick={() => setActiveTab('daily_focus')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'daily_focus'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Target className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{t.dailyFocus}</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Table2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t.table}</span>
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Kanban className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.kanban}</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{t.projects}</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Dark/Light Mode Switcher */}
            <button
              onClick={onToggleTheme}
              title={isDark ? (lang === 'es' ? 'Cambiar a modo claro' : 'Switch to Light Mode') : (lang === 'es' ? 'Cambiar a modo oscuro' : 'Switch to Dark Mode')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={onToggleLanguage}
              title={lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-mono">{lang === 'en' ? 'ES' : 'EN'}</span>
            </button>

            {/* Manage Categories Button */}
            <button
              onClick={onOpenManageCategories}
              title="Create, edit, or delete categories"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <FolderTree className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden md:inline">{t.categories}</span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">({categoriesCount})</span>
            </button>

            {/* Add Task Button */}
            <button
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addTask}</span>
            </button>

            {/* Overflow & Utility icons */}
            <div className="flex items-center pl-1 border-l border-slate-200 dark:border-slate-800 gap-1">
              <button
                onClick={onOpenImportExport}
                title={t.importExport}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                aria-label={t.importExport}
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onResetData}
                title={t.resetData}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                aria-label={t.resetData}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Tablet & Mobile navigation tab bar (Optimized for touch, horizontal swipe and clean active pills) */}
        <div className="xl:hidden flex items-center overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/80 gap-1.5 no-scrollbar">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.matrix}
          </button>
          <button
            onClick={() => setActiveTab('impact_effort')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'impact_effort'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.impactEffort}
          </button>
          <button
            onClick={() => setActiveTab('daily_focus')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'daily_focus'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.dailyFocus}
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'table'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.table}
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.kanban}
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.projects}
          </button>
          
          {/* Quick Categories trigger for small screens */}
          <button
            onClick={onOpenManageCategories}
            className="sm:hidden px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800"
          >
            {t.categories} ({categoriesCount})
          </button>
        </div>

      </div>
    </header>
  );
};
