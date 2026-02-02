import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'blue' | 'gray' | 'green' | 'orange' | 'purple';
    icon?: LucideIcon;
    size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'gray',
    icon: Icon,
    size = 'md'
}) => {
    const variants = {
        blue: 'bg-primary-50 text-primary-700 border border-primary-100 shadow-sm shadow-primary-500/10',
        gray: 'bg-slate-50 text-slate-600 border border-slate-100',
        green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        orange: 'bg-amber-50 text-amber-700 border border-amber-100',
        purple: 'bg-violet-50 text-violet-700 border border-violet-100',
    };

    const sizes = {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors ${variants[variant]} ${sizes[size]}`}>
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    );
};
