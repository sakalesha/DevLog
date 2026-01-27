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
        bg-white rounded-2xl border border-gray-100 shadow-sm 
        ${hover ? 'hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group' : ''} 
        ${className}
      `}
        >
            {children}
        </div>
    );
};
