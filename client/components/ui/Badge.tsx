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
        blue: 'bg-blue-50 text-blue-600',
        gray: 'bg-gray-100 text-gray-600',
        green: 'bg-green-50 text-green-700',
        orange: 'bg-orange-50 text-orange-700',
        purple: 'bg-purple-50 text-purple-700',
    };

    const sizes = {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
    };

    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    );
};
