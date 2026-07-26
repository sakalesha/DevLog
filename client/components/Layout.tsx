
import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { MotivationBanner } from './MotivationBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FFFBEB] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors duration-300">
      <MotivationBanner />
      <div className="flex flex-1 flex-col md:flex-row relative">
        {/* Premium Ambient Background */}
        <div className="fixed inset-0 bg-gradient-mesh opacity-60 dark:opacity-30 pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-amber-200/30 dark:bg-amber-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10 animate-float" />
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none -z-10 animate-float" style={{ animationDelay: '3s' }} />

        <Sidebar />
        <MobileHeader />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-screen scroll-smooth">
          <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-14 animate-fade-in relative z-0">
            {children}
          </div>
        </main>
      </div>
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 mt-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-6 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
          Built as a learning log — not to show expertise, but to build it.
        </div>
      </footer>
    </div>
  );
};
