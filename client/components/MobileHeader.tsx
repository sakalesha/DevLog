import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, PlusCircle, Code } from 'lucide-react';

export const MobileHeader: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/' },
        { label: 'Challenges', icon: <Target className="w-5 h-5" />, path: '/challenges' },
        { label: 'New Log', icon: <PlusCircle className="w-5 h-5" />, path: '/entry/new' },
    ];

    return (
        <div className="md:hidden glass sticky top-0 z-50 p-4 flex items-center justify-between border-b-0 shadow-lg shadow-slate-200/20">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-1.5 rounded-lg shadow-lg shadow-primary-500/20">
                    <Code className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold font-display text-slate-900">DevLog</span>
            </div>
            <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl">
                {navItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`p-2 rounded-lg transition-all ${isActive ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {React.cloneElement(item.icon as React.ReactElement, { className: "w-5 h-5" })}
                        </Link>
                    )
                })}
            </div>
        </div>
    );
};
