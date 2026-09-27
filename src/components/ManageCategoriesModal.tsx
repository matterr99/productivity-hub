import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { CategoryInfo, Task, Language } from '../types/task';
import { getTranslation } from '../i18n/translations';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  tasks: Task[];
  onAddCategory: (category: CategoryInfo) => void;
  onUpdateCategory: (oldId: string, updatedCategory: CategoryInfo) => void;
  onDeleteCategory: (categoryId: string, reassignedCategoryId?: string) => void;
  lang: Language;
}

const COLOR_PRESETS = [
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Rose', hex: '#E11D48' },
  { name: 'Amber', hex: '#D97706' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Slate', hex: '#475569' },
  { name: 'Cyan', hex: '#0891B2' },
];

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  tasks,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  lang,
}) => {
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryInfo | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState(COLOR_PRESETS[0].hex);
  const [error, setError] = useState<string | null>(null);

  const t = getTranslation(lang).manageCategories;

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingCategory(null);
    setDeletingCategory(null);
    setFormName('');
    setFormDescription('');
    setFormColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)].hex);
    setError(null);
  };

  const handleStartEdit = (cat: CategoryInfo) => {
    setIsCreating(false);
    setEditingCategory(cat);
    setDeletingCategory(null);
    setFormName(cat.name);
    setFormDescription(cat.description || '');
    setFormColor(cat.color || COLOR_PRESETS[0].hex);
    setError(null);
  };

  const handleStartDelete = (cat: CategoryInfo) => {
    setDeletingCategory(cat);
    setEditingCategory(null);
    setIsCreating(false);
    const fallback = categories.find((c) => c.id !== cat.id)?.id || '';
    setReassignTargetId(fallback);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError(t.nameRequiredError);
      return;
    }

    const trimmedName = formName.trim();
    const newId = isCreating
      ? trimmedName.toUpperCase().replace(/[^A-Z0-9]/g, '_') || `CAT_${Date.now()}`
      : editingCategory!.id;

    if (isCreating) {
      if (categories.some((c) => c.id === newId || c.name.toLowerCase() === trimmedName.toLowerCase())) {
        setError(t.alreadyExistsError);
        return;
      }

      const newCategory: CategoryInfo = {
        id: newId,
        name: trimmedName,
        color: formColor,
        description: formDescription.trim() || (lang === 'es' ? 'Espacio de trabajo personalizado' : 'Custom operational workspace'),
      };
      onAddCategory(newCategory);
      setIsCreating(false);
    } else if (editingCategory) {
      const updatedCategory: CategoryInfo = {
        id: editingCategory.id,
        name: trimmedName,
        color: formColor,
        description: formDescription.trim() || editingCategory.description,
      };
      onUpdateCategory(editingCategory.id, updatedCategory);
      setEditingCategory(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;
    if (categories.length <= 1) {
      setError(t.minCategoryError);
      return;
    }
    onDeleteCategory(deletingCategory.id, reassignTargetId);
    setDeletingCategory(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-900 dark:bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl">
              <FolderKanban className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Delete Confirmation Warning */}
          {deletingCategory && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-900 dark:text-rose-200">
                <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>{t.deletePrompt.replace('{name}', deletingCategory.name)}</span>
              </div>
              
              {tasks.filter((taskItem) => taskItem.category === deletingCategory.id).length > 0 ? (
                <div className="text-xs text-rose-950 dark:text-rose-200 space-y-2">
                  <p>
                    {t.reassignNotice.replace('{count}', String(tasks.filter((taskItem) => taskItem.category === deletingCategory.id).length))}
                  </p>
                  <select
                    value={reassignTargetId}
                    onChange={(e) => setReassignTargetId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 rounded-lg text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
                  >
                    {categories
                      .filter((c) => c.id !== deletingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {t.moveToOption.replace('{name}', c.name)}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <p className="text-xs text-rose-800 dark:text-rose-300">
                  {t.noTasksNotice}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
                >
                  {t.confirmDelete}
                </button>
              </div>
            </div>
          )}

          {/* Create or Edit Form */}
          {(isCreating || editingCategory) && (
            <form onSubmit={handleSaveForm} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isCreating ? t.createTitle : t.editTitle.replace('{name}', editingCategory?.name || '')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCategory(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  {t.cancel}
                </button>
              </div>

              {/* Name & Color Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {t.themeColorLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-white dark:bg-slate-800"
                    />
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300 uppercase font-semibold">
                      {formColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preset Palette Pills */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {t.colorPresetsLabel}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setFormColor(preset.hex)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        formColor.toLowerCase() === preset.hex.toLowerCase()
                          ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t.descLabel}
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={t.descPlaceholder}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Save button */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isCreating ? t.createBtn : t.saveChangesBtn}</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Existing Categories */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t.currentCategories} ({categories.length})
              </span>

              {!isCreating && !editingCategory && (
                <button
                  onClick={handleStartCreate}
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.newCategory}</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {categories.map((cat) => {
                const count = tasks.filter((taskItem) => taskItem.category === cat.id).length;
                const completedCount = tasks.filter((taskItem) => taskItem.category === cat.id && taskItem.status === 'done').length;

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {cat.name}
                          </h4>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                            ({completedCount}/{count} {t.tasksDoneLabel})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        title="Edit category"
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {categories.length > 1 && (
                        <button
                          onClick={() => handleStartDelete(cat)}
                          title="Delete category"
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            {t.done}
          </button>
        </div>

      </div>
    </div>
  );
};
