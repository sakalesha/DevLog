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
        blue: 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/60 shadow-sm',
        gray: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60',
        green: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60',
        orange: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60',
        purple: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60',
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
