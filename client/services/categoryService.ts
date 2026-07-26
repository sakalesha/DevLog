import { Category, CategoryTreeNode } from '../types';
import { API_URL } from '../constants';

const getHeaders = () => {
  const userStr = localStorage.getItem('user');
  let token = '';
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      token = user.token;
    } catch (e) {
      console.error('Error parsing user token', e);
    }
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

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

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_URL}/categories`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  deleteCategory: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete category');
  }
};
