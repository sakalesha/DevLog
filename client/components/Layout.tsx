
import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative overflow-hidden">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-60 pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10 animate-float" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none -z-10 animate-float" style={{ animationDelay: '3s' }} />

      <Sidebar />
      <MobileHeader />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-14 animate-fade-in relative z-0">
          {children}
        </div>
      </main>
    </div>
  );
};
