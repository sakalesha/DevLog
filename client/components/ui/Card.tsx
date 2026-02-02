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
        bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden
        ${hover ? 'hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary-200/50 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer group' : ''} 
        ${className}
      `}
        >
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
};
