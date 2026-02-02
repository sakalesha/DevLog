import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: LucideIcon;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, error, className = '', ...props }) => {
    return (
        <div className="space-y-1.5">
            {label && <label className="block text-sm font-bold text-slate-700 ml-1">{label}</label>}
            <div className="relative group">
                <input
                    className={`
                        w-full px-4 py-3 rounded-xl border bg-white/50 backdrop-blur-sm
                        outline-none transition-all duration-300 font-medium text-slate-900 placeholder:text-slate-400
                        ${Icon ? 'pl-11' : ''}
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                            : 'border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 hover:border-slate-300'
                        }
                        ${className}
                    `}
                    {...props}
                />
                {Icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors duration-300">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
            {error && <p className="text-xs font-semibold text-red-500 ml-1 animate-slide-up">{error}</p>}
        </div>
    );
};
