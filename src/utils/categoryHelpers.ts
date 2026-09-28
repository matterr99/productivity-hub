import { CategoryInfo, Task } from '../types/task';

export const CATEGORY_COLOR_PALETTE = [
  { color: '#2563EB', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200' },       // Blue
  { color: '#7C3AED', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200' },   // Purple
  { color: '#059669', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },// Emerald
  { color: '#D97706', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200' },     // Amber
  { color: '#DB2777', badgeBg: 'bg-pink-50 text-pink-700 border-pink-200' },         // Pink
  { color: '#0891B2', badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200' },         // Cyan
  { color: '#4F46E5', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },   // Indigo
  { color: '#DC2626', badgeBg: 'bg-rose-50 text-rose-700 border-rose-200' },         // Rose
  { color: '#0D9488', badgeBg: 'bg-teal-50 text-teal-800 border-teal-200' },         // Teal
  { color: '#EA580C', badgeBg: 'bg-orange-50 text-orange-800 border-orange-200' },   // Orange
  { color: '#64748B', badgeBg: 'bg-slate-100 text-slate-700 border-slate-300' },     // Slate
];

/**
 * Extracts all unique categories from tasks and explicit category definitions,
 * merging any new categories into the master category list avoiding duplicates.
 */
export function mergeCategoriesFromImport(
  existingCategories: CategoryInfo[],
  incomingTasks: Task[],
  incomingCategories?: CategoryInfo[]
): { mergedCategories: CategoryInfo[]; normalizedTasks: Task[] } {
  const categoriesMap = new Map<string, CategoryInfo>();

  // 1. Seed with existing categories (keyed by normalized lowercase ID and Name)
  for (const cat of existingCategories) {
    if (!cat || !cat.id) continue;
    categoriesMap.set(cat.id.toLowerCase().trim(), cat);
    if (cat.name) {
      categoriesMap.set(cat.name.toLowerCase().trim(), cat);
    }
  }

  // Final array of unique categories to return
  const resultCategories: CategoryInfo[] = [...existingCategories];

  // 2. Add incoming explicit categories first if provided
  if (Array.isArray(incomingCategories)) {
    for (const inCat of incomingCategories) {
      if (!inCat || !inCat.id || !inCat.name) continue;
      const normalizedKey = inCat.id.toLowerCase().trim();
      const normalizedNameKey = inCat.name.toLowerCase().trim();

      if (!categoriesMap.has(normalizedKey) && !categoriesMap.has(normalizedNameKey)) {
        const paletteChoice = CATEGORY_COLOR_PALETTE[resultCategories.length % CATEGORY_COLOR_PALETTE.length];
        const newCategory: CategoryInfo = {
          id: inCat.id.trim(),
          name: inCat.name.trim(),
          color: inCat.color || paletteChoice.color,
          badgeBg: inCat.badgeBg || paletteChoice.badgeBg,
          description: inCat.description || `Workspace for ${inCat.name.trim()}`,
        };
        categoriesMap.set(normalizedKey, newCategory);
        categoriesMap.set(normalizedNameKey, newCategory);
        resultCategories.push(newCategory);
      }
    }
  }

  // 3. Extract every unique category string from all incoming tasks
  const normalizedTasks: Task[] = [];

  for (const task of incomingTasks) {
    if (!task) continue;
    const rawCategory = (task.category || '').trim();
    if (!rawCategory) {
      // Default to first existing category
      const fallback = resultCategories[0]?.id || 'GENERAL';
      normalizedTasks.push({ ...task, category: fallback });
      continue;
    }

    const normalizedKey = rawCategory.toLowerCase();

    // Check if category already exists
    let matchedCategory = categoriesMap.get(normalizedKey);

    if (!matchedCategory) {
      // Create new custom category from the task's category string
      const paletteChoice = CATEGORY_COLOR_PALETTE[resultCategories.length % CATEGORY_COLOR_PALETTE.length];
      const newCatId = rawCategory; // Preserve exact name/ID
      matchedCategory = {
        id: newCatId,
        name: rawCategory,
        color: paletteChoice.color,
        badgeBg: paletteChoice.badgeBg,
        description: `Imported workspace for ${rawCategory}`,
      };

      categoriesMap.set(normalizedKey, matchedCategory);
      resultCategories.push(matchedCategory);
    }

    normalizedTasks.push({
      ...task,
      category: matchedCategory.id,
    });
  }

  return {
    mergedCategories: resultCategories,
    normalizedTasks,
  };
}
