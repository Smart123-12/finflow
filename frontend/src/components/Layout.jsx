import React, { useState } from 'react';
import { Menu, Gem } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Panel Content Wrap */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Mobile Header Bar */}
        <header className="flex items-center justify-between px-6 py-4 glass-nav sticky top-0 z-30 lg:hidden">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 focus:outline-none"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500 text-white">
                <Gem className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-brand-600 dark:text-brand-400">
                FinFlow
              </span>
            </div>
          </div>
          
          <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
            F
          </div>
        </header>

        {/* Dashboard Pages Root Wrapper */}
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-7xl w-full mx-auto animate-fade-in focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
