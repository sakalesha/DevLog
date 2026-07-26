import React, { useState, useMemo } from 'react';
import { Category } from '../../types';
import { getCategoryIcon } from '../../constants';
import { categoryService, getCategoryPath } from '../../services/categoryService';
import { Plus, FolderPlus, ChevronRight, Check, X, Loader2 } from 'lucide-react';

interface CategoryTreeSelectorProps {
  categories: Category[];
  selectedCategoryId?: string;
  onSelect: (categoryId: string | undefined, categoryName: string, categoryPath: string[]) => void;
  onCategoryCreated?: (newCategory: Category) => void;
}

export const CategoryTreeSelector: React.FC<CategoryTreeSelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelect,
  onCategoryCreated,
}) => {
  const [creatingAtParentId, setCreatingAtParentId] = useState<string | null | undefined>(undefined);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Map category by ID
  const catMap = useMemo(() => new Map(categories.map(c => [c._id, c])), [categories]);

  // Derive the chain of selected ID IDs from root to current leaf
  const selectedChain = useMemo(() => {
    if (!selectedCategoryId) return [];
    const chain: string[] = [];
    let curr = catMap.get(selectedCategoryId);
    while (curr) {
      chain.unshift(curr._id);
      curr = curr.parentId ? catMap.get(curr.parentId) : undefined;
    }
    return chain;
  }, [selectedCategoryId, catMap]);

  // Compute available levels to render
  // Level 0: root categories (parentId === null)
  // Level k: children of selectedChain[k-1]
  const levels = useMemo(() => {
    const lvlArrays: { parentId: string | null; items: Category[] }[] = [];
    // Level 0
    lvlArrays.push({
      parentId: null,
      items: categories.filter(c => !c.parentId || c.parentId === 'null'),
    });

    // Subsequent levels
    for (const parentId of selectedChain) {
      const children = categories.filter(c => c.parentId === parentId);
      if (children.length > 0) {
        lvlArrays.push({
          parentId,
          items: children,
        });
      } else {
        // Even if empty, allow adding subcategory inside this folder
        lvlArrays.push({
          parentId,
          items: [],
        });
      }
    }
    return lvlArrays;
  }, [categories, selectedChain]);

  const handleSelectAtLevel = (levelIndex: number, catId: string) => {
    if (!catId) {
      // User selected "Select..." or deselected at this level
      if (levelIndex === 0) {
        onSelect(undefined, 'General', []);
      } else {
        const prevId = selectedChain[levelIndex - 1];
        const prevCat = catMap.get(prevId);
        const path = getCategoryPath(categories, prevId);
        onSelect(prevId, prevCat ? prevCat.name : 'General', path);
      }
      return;
    }

    const cat = catMap.get(catId);
    if (!cat) return;
    const path = getCategoryPath(categories, catId);
    onSelect(catId, cat.name, path);
  };

  const handleCreateCategory = async (parentId: string | null) => {
    if (!newCategoryName.trim()) return;
    setIsCreating(true);
    try {
      const created = await categoryService.createCategory({
        name: newCategoryName.trim(),
        parentId: parentId || null,
        color: '#6366F1',
        icon: 'Folder',
      });
      setNewCategoryName('');
      setCreatingAtParentId(undefined);
      if (onCategoryCreated) {
        onCategoryCreated(created);
      }
      // Auto select the newly created category
      const newCatList = [...categories, created];
      const path = getCategoryPath(newCatList, created._id);
      onSelect(created._id, created.name, path);
    } catch (err) {
      console.error('Failed to create category', err);
      alert('Failed to create category. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        Category Hierarchy ($N$-Depth Tree)
      </label>
      
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
        {levels.map((level, idx) => {
          const currentSelectedId = selectedChain[idx] || '';
          const isLastLevel = idx === levels.length - 1;

          return (
            <React.Fragment key={level.parentId || 'root'}>
              {idx > 0 && (
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                <select
                  value={currentSelectedId}
                  onChange={(e) => handleSelectAtLevel(idx, e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none pr-2 py-1 pl-2 cursor-pointer"
                >
                  <option value="" className="text-slate-400 dark:bg-slate-900">
                    {idx === 0 ? '-- Select Root Category --' : '-- Select Subcategory --'}
                  </option>
                  {level.items.map(item => {
                    const Icon = getCategoryIcon(item.name);
                    return (
                      <option key={item._id} value={item._id} className="dark:bg-slate-900 dark:text-slate-100">
                        {item.name}
                      </option>
                    );
                  })}
                </select>

                {creatingAtParentId === level.parentId ? (
                  <div className="flex items-center gap-1 px-1 border-l border-slate-200 dark:border-slate-700 pl-2 animate-fade-in">
                    <input
                      type="text"
                      placeholder="Folder name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory(level.parentId)}
                      className="w-28 text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      disabled={isCreating}
                      onClick={() => handleCreateCategory(level.parentId)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded"
                      title="Save"
                    >
                      {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCreatingAtParentId(undefined); setNewCategoryName(''); }}
                      className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setCreatingAtParentId(level.parentId); setNewCategoryName(''); }}
                    className="p-1 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded flex items-center gap-1 text-xs font-medium pr-2 transition-colors"
                    title={idx === 0 ? "Create new root category" : "Create subcategory in this folder"}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {selectedChain.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pl-1">
          <span>Active Path:</span>
          <div className="flex items-center gap-1">
            {selectedChain.map((id, index) => {
              const cat = catMap.get(id);
              return (
                <React.Fragment key={id}>
                  {index > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                  <span className="font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-md border border-primary-200/50 dark:border-primary-800/50">
                    {cat ? cat.name : 'Unknown'}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
