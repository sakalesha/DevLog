import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

const QUOTES = [
    "Confusion is not failure. It’s the start of understanding.",
    "Document learning, not perfection.",
    "If I can explain it, I understand it.",
    "Code it. Write it. Own it."
];

export const MotivationBanner: React.FC = () => {
    const [quote, setQuote] = useState("");
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Select a random quote on mount
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        setQuote(randomQuote);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="bg-slate-900 text-white py-2 px-4 shadow-md relative z-50 animate-fade-in mb-0">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-medium tracking-wide text-center">
                    {quote}
                </p>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 text-slate-500 hover:text-white transition-colors"
                    aria-label="Close banner"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
