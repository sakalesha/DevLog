
import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar />
      <MobileHeader />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
