import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, PlusCircle, Code, LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/' },
        { label: 'Challenges', icon: <Target className="w-5 h-5" />, path: '/challenges' },
        { label: 'New Log', icon: <PlusCircle className="w-5 h-5" />, path: '/entry/new' },
    ];

    return (
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen">
            <div className="p-6 flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Code className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">DevLog</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        <img src="https://picsum.photos/seed/dev/100/100" alt="Avatar" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                        <p className="text-xs text-gray-500 truncate">john@example.com</p>
                    </div>
                </div>
                <button className="mt-2 w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};
