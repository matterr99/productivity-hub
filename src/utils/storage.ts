import { Task, CategoryInfo, Language, Theme } from '../types/task';
import { INITIAL_TASKS, INITIAL_CATEGORIES } from '../data/initialTasks';

const TASKS_STORAGE_KEY = 'prioritize_hq_tasks_v2';
const CATEGORIES_STORAGE_KEY = 'prioritize_hq_categories_v2';
const GOAL_STORAGE_KEY = 'prioritize_hq_focus_goal_v2';
const LANG_STORAGE_KEY = 'prioritize_hq_lang_v2';
const THEME_STORAGE_KEY = 'prioritize_hq_theme_v2';

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_TASKS;
  } catch (err) {
    console.error('Failed to load tasks from localStorage, returning defaults', err);
    return INITIAL_TASKS;
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function loadCategoriesFromStorage(): CategoryInfo[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CATEGORIES;
  } catch (err) {
    return INITIAL_CATEGORIES;
  }
}

export function saveCategoriesToStorage(categories: CategoryInfo[]): void {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories', err);
  }
}

export function loadFocusGoal(lang: Language = 'es'): string {
  try {
    const stored = localStorage.getItem(GOAL_STORAGE_KEY);
    if (stored) return stored;
    return lang === 'es'
      ? 'Iniciar operaciones clave, desbloquear trámites legales y completar la web'
      : 'Launch core operations, unblock legal permits, and complete website setup';
  } catch {
    return lang === 'es'
      ? 'Iniciar operaciones clave, desbloquear trámites legales y completar la web'
      : 'Launch core operations, unblock legal permits, and complete website setup';
  }
}

export function saveFocusGoal(goal: string): void {
  try {
    localStorage.setItem(GOAL_STORAGE_KEY, goal);
  } catch (err) {
    console.error('Failed to save focus goal', err);
  }
}

export function loadLanguageFromStorage(): Language {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'es') return saved;
    // Default to Spanish or English based on browser
    return navigator.language.startsWith('es') ? 'es' : 'en';
  } catch {
    return 'es';
  }
}

export function saveLanguageToStorage(lang: Language): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (err) {
    console.error('Failed to save language', err);
  }
}

export function loadThemeFromStorage(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveThemeToStorage(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.error('Failed to save theme', err);
  }
}

export function resetToDefaultDataset(): { tasks: Task[]; categories: CategoryInfo[] } {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
  return { tasks: INITIAL_TASKS, categories: INITIAL_CATEGORIES };
}
