import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, PlusCircle, Code, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/' },
        { label: 'Challenges', icon: <Target className="w-5 h-5" />, path: '/challenges' },
        { label: 'New Log', icon: <PlusCircle className="w-5 h-5" />, path: '/entry/new' },
    ];

    return (
        <aside className="hidden md:flex w-72 glass flex-col sticky top-4 h-[calc(100vh-2rem)] m-4 rounded-3xl z-50">
            <div className="p-8 pb-6 flex items-center gap-4">
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2.5 rounded-xl shadow-lg shadow-primary-500/30 ring-1 ring-white/20">
                    <Code className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight font-display">DevLog</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ease-out relative overflow-hidden
                            ${isActive
                                    ? 'bg-gradient-to-r from-primary-50 to-transparent text-primary-700 shadow-sm ring-1 ring-primary-100/50'
                                    : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-900'
                                }`}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-full" />}
                            <span className={`transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-white/50 to-slate-50/50 border border-white/60 shadow-inner">
                <div className="flex items-center gap-3 px-2 py-1">
                    <div className="w-10 h-10 rounded-full bg-white ring-2 ring-white shadow-md overflow-hidden p-0.5">
                        <img
                            src={user?.avatar || "https://picsum.photos/seed/dev/100/100"}
                            alt="Avatar"
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate font-display">{user?.name || 'Guest User'}</p>
                        <p className="text-[10px] font-medium text-slate-500 truncate uppercase tracking-wider">{user?.email || 'guest@example.com'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-all border border-transparent hover:border-red-100 group"
                >
                    <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};
