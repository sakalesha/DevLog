import React, { useState } from 'react';
import { Category, CategoryTreeNode } from '../../types';
import { categoryService, buildCategoryTree } from '../../services/categoryService';
import { getCategoryIcon } from '../../constants';
import { X, Plus, Trash2, Edit2, Check, ChevronRight, ChevronDown, Folder, AlertTriangle, Loader2 } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdate: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdate,
}) => {
  const [addingToParentId, setAddingToParentId] = useState<string | null | undefined>(undefined);
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const tree = buildCategoryTree(categories);

  const handleCreate = async (parentId: string | null) => {
    if (!newCatName.trim()) return;
    setLoadingId(parentId || 'root-create');
    try {
      await categoryService.createCategory({
        name: newCatName.trim(),
        parentId: parentId || null,
        color: '#6366F1',
        icon: 'Folder',
      });
      setNewCatName('');
      setAddingToParentId(undefined);
      onUpdate();
    } catch (err) {
      alert('Failed to create category.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdateName = async (id: string) => {
    if (!editName.trim()) return;
    setLoadingId(id);
    try {
      await categoryService.updateCategory(id, { name: editName.trim() });
      setEditingId(null);
      onUpdate();
    } catch (err) {
      alert('Failed to update category.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" and ALL its nested subcategories?`)) return;
    setLoadingId(id);
    try {
      await categoryService.deleteCategory(id);
      onUpdate();
    } catch (err) {
      alert('Failed to delete category.');
    } finally {
      setLoadingId(null);
    }
  };

  const renderNode = (node: CategoryTreeNode, depth: number = 0) => {
    const Icon = getCategoryIcon(node.name);
    const isEditing = editingId === node._id;
    const isAddingChild = addingToParentId === node._id;
    const isLoading = loadingId === node._id;

    return (
      <div key={node._id} className="select-none">
        <div 
          className={`flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group ${
            depth > 0 ? 'ml-6 border-l border-slate-200 dark:border-slate-700/80 pl-4' : ''
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName(node._id)}
                  className="text-sm px-2 py-1 rounded bg-white dark:bg-slate-900 border border-primary-500 text-slate-900 dark:text-slate-100 w-full focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleUpdateName(node._id)}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {node.name}
              </span>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => { setAddingToParentId(node._id); setNewCatName(''); }}
                className="p-1.5 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1"
                title="Add Subcategory"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sub</span>
              </button>
              <button
                onClick={() => { setEditingId(node._id); setEditName(node.name); }}
                className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg"
                title="Rename"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(node._id, node.name)}
                className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg"
                title="Delete"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Inline add subcategory box */}
        {isAddingChild && (
          <div className="ml-10 my-1.5 flex items-center gap-2 p-2 rounded-lg bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200/50 dark:border-primary-800/50 animate-fade-in">
            <input
              type="text"
              placeholder={`Subcategory under ${node.name}...`}
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate(node._id)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 flex-1 focus:outline-none focus:border-primary-500"
              autoFocus
            />
            <button
              onClick={() => handleCreate(node._id)}
              disabled={loadingId === node._id}
              className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-md flex items-center gap-1 shadow-sm"
            >
              {loadingId === node._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              <span>Add</span>
            </button>
            <button
              onClick={() => { setAddingToParentId(undefined); setNewCatName(''); }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Render children recursively */}
        {node.children && node.children.length > 0 && (
          <div className="space-y-0.5">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Folder className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span>Manage $N$-Depth Category Tree</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Create, organize, and nest custom categories for your learning log.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Root Create Box */}
        <div className="p-4 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2">
          <input
            type="text"
            placeholder="New root category name (e.g. Frontend, DevOps, AI)..."
            value={addingToParentId === null ? newCatName : ''}
            onChange={(e) => { setAddingToParentId(null); setNewCatName(e.target.value); }}
            onKeyDown={(e) => e.key === 'Enter' && addingToParentId === null && handleCreate(null)}
            className="text-sm px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-sm"
          />
          <button
            onClick={() => { setAddingToParentId(null); handleCreate(null); }}
            disabled={loadingId === 'root-create' || addingToParentId !== null || !newCatName.trim()}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-primary-600/20 transition-all"
          >
            {loadingId === 'root-create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Add Root</span>
          </button>
        </div>

        {/* Tree Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-1">
          {tree.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No categories created yet
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Use the box above to create your first root category!
              </p>
            </div>
          ) : (
            tree.map(node => renderNode(node))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Deleting a folder will delete all subcategories inside it.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl shadow-sm transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
