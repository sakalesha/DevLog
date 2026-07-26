import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Code, LogOut, Sun, Moon, FolderTree, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Category, CategoryTreeNode } from '../types';
import { categoryService, buildCategoryTree } from '../services/categoryService';
import { getCategoryIcon } from '../constants';
import { CategoryManagerModal } from './categories/CategoryManagerModal';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load sidebar categories', err);
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
    const handleUpdate = () => fetchCategories();
    window.addEventListener('categories-updated', handleUpdate);
    return () => window.removeEventListener('categories-updated', handleUpdate);
  }, [fetchCategories]);

  const tree = buildCategoryTree(categories);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCategoryClick = (id: string) => {
    navigate(`/?category=${id}`);
  };

  const renderNavItemNode = (node: CategoryTreeNode, depth: number = 0) => {
    const Icon = getCategoryIcon(node.name);
    const isExpanded = expandedIds.has(node._id);
    const hasChildren = node.children && node.children.length > 0;
    const searchParams = new URLSearchParams(location.search);
    const isActive = location.pathname === '/' && searchParams.get('category') === node._id;

    return (
      <div key={node._id} className="select-none">
        <div
          onClick={() => handleCategoryClick(node._id)}
          className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
            depth > 0 ? 'ml-3 border-l border-slate-200 dark:border-slate-800 pl-3' : ''
          } ${
            isActive
              ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-primary-500'}`} />
            <span className="truncate">{node.name}</span>
          </div>
          {hasChildren && (
            <button
              onClick={(e) => toggleExpand(node._id, e)}
              className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-0.5 mt-0.5 animate-fade-in">
            {node.children!.map(child => renderNavItemNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/' },
    { label: 'New Log', icon: <PlusCircle className="w-5 h-5" />, path: '/entry/new' },
  ];

  return (
    <>
      <aside className="hidden md:flex w-72 glass dark:glass-dark flex-col sticky top-4 h-[calc(100vh-2rem)] m-4 rounded-3xl z-40 transition-colors duration-300">
        {/* Brand */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-xl shadow-lg shadow-primary-500/30 ring-1 ring-white/20">
              <Code className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight font-display">DevLog</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>

        {/* Main Nav */}
        <nav className="px-4 py-2 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path && !location.search.includes('category');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ease-out relative overflow-hidden
                ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-950/60 dark:to-transparent text-primary-700 dark:text-primary-300 shadow-sm ring-1 ring-primary-100/50 dark:ring-primary-800/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-full" />}
                <span className={`transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 group-hover:text-primary-500'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Category Tree Section */}
        <div className="flex-1 px-4 py-3 overflow-y-auto flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              <span>Categories</span>
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5"
            >
              <span>Manage</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
            <div
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                location.pathname === '/' && !location.search.includes('category')
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-slate-400" />
              <span>All Logs</span>
            </div>
            {tree.map(node => renderNavItemNode(node))}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-white/60 to-slate-50/60 dark:from-slate-850/60 dark:to-slate-900/60 border border-white/60 dark:border-white/10 shadow-inner">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 ring-2 ring-white dark:ring-slate-700 shadow-md overflow-hidden p-0.5 flex-shrink-0">
              <img
                src={user?.avatar || "https://picsum.photos/seed/dev/100/100"}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-display">{user?.name || 'Guest User'}</p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider">{user?.email || 'guest@example.com'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2.5 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 rounded-xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/40 group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      <CategoryManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        onUpdate={() => {
          fetchCategories();
          window.dispatchEvent(new Event('categories-updated'));
        }}
      />
    </>
  );
};
