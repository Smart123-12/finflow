import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Layout from './components/Layout';

// Pages lazy/direct imports (we will write these shortly)
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Profile from './pages/Profile';

// Guard for protected dashboards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-100 dark:border-brand-950/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <p className="mt-4 font-bold text-sm tracking-widest uppercase text-brand-600 dark:text-brand-400 font-sans animate-pulse">
          Securing Session
        </p>
      </div>
    );
  }

  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

// Guard for login/register pages
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // let the profile fetcher silent check run
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  const { theme } = useTheme();

  return (
    <Router>
      {/* Toast Notification engine with premium theme styling parameters */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'glass-card border border-slate-200/50 dark:border-slate-800/40 text-slate-800 dark:text-slate-100 rounded-2xl shadow-premium font-sans text-sm py-3 px-4 font-medium',
          style: {
            background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            color: theme === 'dark' ? '#f1f5f9' : '#1e293b'
          },
          duration: 4000
        }}
      />

      <Routes>
        {/* Public auth paths */}
        <Route path="/login" element={
          <PublicOnlyRoute>
            <Auth isLoginMode={true} />
          </PublicOnlyRoute>
        } />
        <Route path="/register" element={
          <PublicOnlyRoute>
            <Auth isLoginMode={false} />
          </PublicOnlyRoute>
        } />

        {/* Guarded application dashboard paths */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />
        <Route path="/budgets" element={
          <ProtectedRoute>
            <Budgets />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
