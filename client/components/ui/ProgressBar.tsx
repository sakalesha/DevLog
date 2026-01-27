import React from 'react';

interface ProgressBarProps {
    progress: number;
    height?: 'sm' | 'md';
    color?: string; // Allow custom color class if needed, default to blue-600
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 'md',
    color = 'bg-blue-600'
}) => {
    const heightClass = height === 'sm' ? 'h-1.5' : 'h-2';

    // Ensure progress is between 0 and 100
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className={`${heightClass} bg-gray-100 rounded-full overflow-hidden`}>
            <div
                className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${clampedProgress}%` }}
            />
        </div>
    );
};
