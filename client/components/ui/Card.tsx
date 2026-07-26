import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    onClick,
    hover = false
}) => {
    return (
        <div
            onClick={onClick}
            className={`
        bg-white/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-md relative overflow-hidden transition-all duration-300
        ${hover ? 'hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/20 hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-1 cursor-pointer group' : ''} 
        ${className}
      `}
        >
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
};
