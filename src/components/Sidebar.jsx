import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Wallet, 
  User, 
  LogOut,
  Sparkles,
  Gem,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
    { name: 'Budget Planner', path: '/budgets', icon: Wallet },
    { name: 'My Profile', path: '/profile', icon: User }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-72 h-screen
        glass-card border-r border-slate-200 dark:border-slate-800/60
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header Branding */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 text-white glow-brand">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight font-sans text-brand-600 dark:text-brand-400">
                FinFlow
              </h1>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                SaaS Personal AI
              </span>
            </div>
          </div>
          
          {/* Close button on Mobile */}
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm
                  transition-all duration-200 hover:scale-[1.02] active:scale-98
                  ${isActive 
                    ? 'bg-brand-500 text-white glow-brand shadow-brand-500/10' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'}
                `}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Profile Card & Theme Toggle Section */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/40 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Preferences
            </span>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/40 dark:border-slate-800/20">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 font-bold font-sans flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200 leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] truncate text-slate-400 dark:text-slate-500">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
