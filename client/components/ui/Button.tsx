import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 focus:ring-blue-500',
        secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-200',
        ghost: 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-200',
        danger: 'text-red-600 hover:bg-red-50 focus:ring-red-200',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
            {children}
        </button>
    );
};
