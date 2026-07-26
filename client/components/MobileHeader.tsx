import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Code, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const MobileHeader: React.FC = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/' },
        { label: 'New Log', icon: <PlusCircle className="w-5 h-5" />, path: '/entry/new' },
    ];

    return (
        <div className="md:hidden glass sticky top-0 z-50 p-4 flex items-center justify-between border-b-0 shadow-lg shadow-slate-200/20 dark:shadow-none">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-1.5 rounded-lg shadow-lg shadow-primary-500/20">
                    <Code className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold font-display text-slate-900 dark:text-white">DevLog</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                </button>
                <div className="flex gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`p-2 rounded-lg transition-all ${isActive ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

