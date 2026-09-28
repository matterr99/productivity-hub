import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { EisenhowerMatrixView } from './components/EisenhowerMatrixView';
import { BacklogTableView } from './components/BacklogTableView';
import { KanbanBoardView } from './components/KanbanBoardView';
import { ProjectsHubView } from './components/ProjectsHubView';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { ImportExportModal } from './components/ImportExportModal';
import { TaskModal } from './components/TaskModal';
import { Task, CategoryInfo, TaskStatus, EisenhowerQuadrant, Language, Theme } from './types/task';
import { 
  loadTasksFromStorage, 
  saveTasksToStorage, 
  loadCategoriesFromStorage, 
  saveCategoriesToStorage,
  loadFocusGoal,
  saveFocusGoal,
  loadLanguageFromStorage,
  saveLanguageToStorage,
  loadThemeFromStorage,
  saveThemeToStorage,
  resetToDefaultDataset
} from './utils/storage';
import { getTranslation } from './i18n/translations';
import { mergeCategoriesFromImport } from './utils/categoryHelpers';

export default function App() {
  const [lang, setLang] = useState<Language>(() => loadLanguageFromStorage());
  const [theme, setTheme] = useState<Theme>(() => loadThemeFromStorage());
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [categories, setCategories] = useState<CategoryInfo[]>(() => loadCategoriesFromStorage());
  const [focusGoal, setFocusGoal] = useState<string>(() => loadFocusGoal(lang));
  const [activeTab, setActiveTab] = useState<ActiveTab>('table');

  // Modals state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState<boolean>(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);

  const tNavbar = getTranslation(lang).navbar;

  // Auto-sync tasks, categories, focusGoal, language and theme
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  useEffect(() => {
    saveCategoriesToStorage(categories);
  }, [categories]);

  useEffect(() => {
    saveFocusGoal(focusGoal);
  }, [focusGoal]);

  useEffect(() => {
    saveLanguageToStorage(lang);
  }, [lang]);

  useEffect(() => {
    saveThemeToStorage(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'es' : 'en'));
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Task Mutations
  const handleToggleComplete = (task: Task) => {
    const isNowDone = task.status !== 'done';
    const updated = tasks.map((t) =>
      t.id === task.id
        ? {
            ...t,
            status: (isNowDone ? 'done' : 'todo') as TaskStatus,
            completedAt: isNowDone ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    setTasks(updated);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(updated);
  };

  const handleSaveTask = (taskToSave: Task) => {
    const exists = tasks.some((t) => t.id === taskToSave.id);
    if (exists) {
      setTasks(tasks.map((t) => (t.id === taskToSave.id ? taskToSave : t)));
    } else {
      setTasks([taskToSave, ...tasks]);
    }
  };

  const handleAddNewTask = (partial: Partial<Task>) => {
    const defaultCat = categories[0]?.id || 'GENERAL';
    const newTask: Task = {
      id: partial.id || `task-${Date.now()}`,
      title: partial.title || (lang === 'es' ? 'Nueva Tarea' : 'Untitled Task'),
      category: partial.category || defaultCat,
      status: partial.status || 'todo',
      priority: partial.priority || 'p2_high',
      quadrant: partial.quadrant || 'q2_schedule',
      dueDate: partial.dueDate || undefined,
      estimatedDuration: partial.estimatedDuration || undefined,
      subtasks: partial.subtasks || [],
      tags: partial.tags || [partial.category || defaultCat],
      notes: partial.notes || undefined,
      nextImmediateStep: partial.nextImmediateStep || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleChangeQuadrant = (task: Task, quadrant: EisenhowerQuadrant) => {
    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, quadrant, updatedAt: new Date().toISOString() } : t
    );
    setTasks(updated);
  };

  const handleChangeStatus = (task: Task, status: TaskStatus) => {
    const updated = tasks.map((t) =>
      t.id === task.id
        ? {
            ...t,
            status,
            completedAt: status === 'done' ? (task.completedAt || new Date().toISOString()) : undefined,
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    setTasks(updated);
  };

  // Batch actions
  const handleBatchUpdateStatus = (taskIds: string[], status: TaskStatus) => {
    setTasks(
      tasks.map((t) =>
        taskIds.includes(t.id)
          ? {
              ...t,
              status,
              completedAt: status === 'done' ? (t.completedAt || new Date().toISOString()) : undefined,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const handleBatchUpdateQuadrant = (taskIds: string[], quadrant: EisenhowerQuadrant) => {
    setTasks(
      tasks.map((t) =>
        taskIds.includes(t.id) ? { ...t, quadrant, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const handleBatchDelete = (taskIds: string[]) => {
    setTasks(tasks.filter((t) => !taskIds.includes(t.id)));
  };

  // Category CRUD Handlers
  const handleAddCategory = (newCategory: CategoryInfo) => {
    setCategories([...categories, newCategory]);
  };

  const handleUpdateCategory = (oldId: string, updatedCategory: CategoryInfo) => {
    const updatedCats = categories.map((c) => (c.id === oldId ? updatedCategory : c));
    setCategories(updatedCats);

    // If ID changed, update tasks in this category
    if (oldId !== updatedCategory.id) {
      setTasks(
        tasks.map((t) =>
          t.category === oldId ? { ...t, category: updatedCategory.id, updatedAt: new Date().toISOString() } : t
        )
      );
    }
  };

  const handleDeleteCategory = (categoryId: string, reassignedCategoryId?: string) => {
    const fallbackCatId = reassignedCategoryId || categories.find((c) => c.id !== categoryId)?.id || 'GENERAL';
    const remainingCats = categories.filter((c) => c.id !== categoryId);
    setCategories(remainingCats);

    // Reassign tasks
    setTasks(
      tasks.map((t) =>
        t.category === categoryId ? { ...t, category: fallbackCatId, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  // Quick Task Creation Helpers
  const handleQuickAddTask = (defaultProps?: Partial<Task>) => {
    const defaultCat = categories[0]?.id || 'GENERAL';
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: '',
      category: defaultProps?.category || defaultCat,
      status: defaultProps?.status || 'todo',
      priority: defaultProps?.priority || 'p2_high',
      quadrant: defaultProps?.quadrant || 'q2_schedule',
      estimatedDuration: defaultProps?.estimatedDuration || '',
      dueDate: defaultProps?.dueDate || '',
      subtasks: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingTask(newTask);
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleImportTasks = (newTasks: Task[], newCategories?: CategoryInfo[]) => {
    const { mergedCategories, normalizedTasks } = mergeCategoriesFromImport(
      categories,
      newTasks,
      newCategories
    );
    setCategories(mergedCategories);
    setTasks([...normalizedTasks, ...tasks]);
  };

  const handleRestoreBackup = (restoredTasks: Task[], restoredCategories?: CategoryInfo[]) => {
    const { mergedCategories, normalizedTasks } = mergeCategoriesFromImport(
      restoredCategories && restoredCategories.length > 0 ? restoredCategories : categories,
      restoredTasks,
      restoredCategories
    );
    setCategories(mergedCategories);
    setTasks(normalizedTasks);
  };

  const handleResetData = () => {
    if (confirm(tNavbar.resetConfirm)) {
      const reset = resetToDefaultDataset();
      setTasks(reset.tasks);
      setCategories(reset.categories);
    }
  };

  const pendingCount = tasks.filter((t) => t.status !== 'done').length;
  const criticalCount = tasks.filter((t) => t.status !== 'done' && t.priority === 'p1_critical').length;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200`}>
      
      {/* Navbar with 4 primary views and utility actions */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTask={() => handleQuickAddTask()}
        onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onResetData={handleResetData}
        pendingCount={pendingCount}
        criticalCount={criticalCount}
        categoriesCount={categories.length}
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === 'table' && (
          <BacklogTableView
            tasks={tasks}
            categories={categories}
            onToggleComplete={handleToggleComplete}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onBatchUpdateStatus={handleBatchUpdateStatus}
            onBatchUpdateQuadrant={handleBatchUpdateQuadrant}
            onBatchDelete={handleBatchDelete}
            onEdit={handleOpenEdit}
            onAddNewTask={handleAddNewTask}
            lang={lang}
          />
        )}

        {activeTab === 'matrix' && (
          <EisenhowerMatrixView
            tasks={tasks}
            categories={categories}
            onToggleComplete={handleToggleComplete}
            onEdit={handleOpenEdit}
            onChangeQuadrant={handleChangeQuadrant}
            onQuickAddTask={(q) => handleQuickAddTask({ quadrant: q })}
            focusGoal={focusGoal}
            onUpdateFocusGoal={setFocusGoal}
            lang={lang}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoardView
            tasks={tasks}
            categories={categories}
            onToggleComplete={handleToggleComplete}
            onEdit={handleOpenEdit}
            onChangeQuadrant={handleChangeQuadrant}
            onChangeStatus={handleChangeStatus}
            onAddNewTask={handleQuickAddTask}
            lang={lang}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsHubView
            tasks={tasks}
            categories={categories}
            onToggleComplete={handleToggleComplete}
            onEdit={handleOpenEdit}
            onChangeQuadrant={handleChangeQuadrant}
            onAddNewTask={handleQuickAddTask}
            onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
            onEditCategory={(_cat) => {
              setIsManageCategoriesOpen(true);
            }}
            onDeleteCategory={(catId) => handleDeleteCategory(catId)}
            lang={lang}
          />
        )}
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        categories={categories}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        lang={lang}
      />

      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        categories={categories}
        tasks={tasks}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        lang={lang}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        tasks={tasks}
        categories={categories}
        onImportTasks={handleImportTasks}
        onRestoreBackup={handleRestoreBackup}
        lang={lang}
      />

    </div>
  );
}
