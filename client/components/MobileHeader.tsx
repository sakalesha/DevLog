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
        <div className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Code className="text-blue-600 w-6 h-6" />
                <span className="text-xl font-bold">DevLog</span>
            </div>
            <div className="flex gap-4">
                {navItems.map(item => (
                    <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'}>
                        {item.icon}
                    </Link>
                ))}
            </div>
        </div>
    );
};
