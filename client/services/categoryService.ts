import { Category, CategoryTreeNode } from '../types';
import { apiClient } from './apiClient';

// ─── Tree Utilities ────────────────────────────────────────────────────────────

export const buildCategoryTree = (categories: Category[]): CategoryTreeNode[] => {
  const map = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  categories.forEach(cat => {
    map.set(cat._id, { ...cat, children: [] });
  });

  categories.forEach(cat => {
    const node = map.get(cat._id);
    if (!node) return;

    if (cat.parentId && map.has(cat.parentId)) {
      const parent = map.get(cat.parentId);
      parent?.children?.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

export const getCategoryPath = (categories: Category[], targetId?: string): string[] => {
  if (!targetId) return [];
  const map = new Map(categories.map(c => [c._id, c]));
  const path: string[] = [];
  let current = map.get(targetId);
  while (current) {
    path.unshift(current.name);
    current = current.parentId ? map.get(current.parentId) : undefined;
  }
  return path;
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const categoryService = {
  getCategories: (): Promise<Category[]> =>
    apiClient.get<Category[]>('/categories'),

  createCategory: (categoryData: Partial<Category>): Promise<Category> =>
    apiClient.post<Category>('/categories', categoryData),

  updateCategory: (id: string, categoryData: Partial<Category>): Promise<Category> =>
    apiClient.put<Category>(`/categories/${id}`, categoryData),

  deleteCategory: (id: string): Promise<void> =>
    apiClient.delete(`/categories/${id}`),
};
