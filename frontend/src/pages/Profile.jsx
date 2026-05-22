import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Database, 
  RefreshCw, 
  AlertTriangle,
  Play,
  Heart,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [dbMode, setDbMode] = useState('Checking...');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ txCount: 0, budgetCount: 0 });

  const fetchProfileStats = async () => {
    try {
      const healthRes = await API.get('/health');
      setDbMode(healthRes.data.databaseMode);

      // Fetch actual counts
      const txRes = await API.get('/transactions');
      const bRes = await API.get('/budgets');
      setStats({
        txCount: txRes.data.length,
        budgetCount: bRes.data.length
      });
    } catch (e) {
      setDbMode('Connection Offline');
    }
  };

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const seedSampleData = async () => {
    setLoading(true);
    const toastId = toast.loading('Seeding premium fintech demo data...');
    try {
      // 1. Create Sample Budgets
      await API.post('/budgets', { category: 'Food & Dining', limit: 400 });
      await API.post('/budgets', { category: 'Entertainment', limit: 150 });
      await API.post('/budgets', { category: 'Utilities', limit: 300 });

      // 2. Create Sample Transactions
      const txs = [
        { amount: 4800, type: 'income', category: 'Salary', date: '2026-05-01', description: 'Tech Corp Monthly Salary' },
        { amount: 150, type: 'income', category: 'Freelance', date: '2026-05-15', description: 'Web UI Refactor Contract' },
        { amount: 120, type: 'expense', category: 'Food & Dining', date: '2026-05-02', description: 'Organic Grocery shopping' },
        { amount: 45, type: 'expense', category: 'Food & Dining', date: '2026-05-08', description: 'Aesthetic Sushi night out' },
        { amount: 80, type: 'expense', category: 'Entertainment', date: '2026-05-10', description: 'Concert booking ticket' },
        { amount: 180, type: 'expense', category: 'Utilities', date: '2026-05-05', description: 'High-speed broadband & power' },
        { amount: 950, type: 'expense', category: 'Rent', date: '2026-05-01', description: 'SaaS Studio Loft lease' },
        { amount: 65, type: 'expense', category: 'Travel', date: '2026-05-12', description: 'Uber rides & transit card topup' }
      ];

      for (const tx of txs) {
        await API.post('/transactions', tx);
      }

      toast.success('Successfully loaded 8 transactions and 3 active budgets! Explore your new live metrics.', { id: toastId });
      fetchProfileStats();
    } catch (error) {
      toast.error(error.message || 'Seeding failed.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Visual Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
          Identity Profile Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Verify authorization keys, monitor system database triggers, and explore demo pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - User Credentials Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 shadow-premium relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-xl"></div>
            
            <div className="flex flex-col items-center text-center py-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 font-extrabold text-2xl font-sans mb-4 glow-brand">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {user?.name || 'Authorized Member'}
              </h3>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-bold bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/30 px-3 py-1 rounded-full mt-1.5 uppercase tracking-wider">
                Fintech Subscriber
              </span>
            </div>

            <div className="border-t border-slate-200/60 dark:border-slate-800/40 pt-6 space-y-4">
              <div className="flex items-center gap-3.5 px-2">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Full Username</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{user?.name || 'User Name'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 px-2">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">E-Mail Address</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats totals widgets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Transactions</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{stats.txCount}</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Active Budgets</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{stats.budgetCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - System settings & seed module (Right 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Database Info Card */}
          <div className="glass-card rounded-3xl p-6 shadow-premium space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/30 text-brand-500">
                <Database className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Resilient Architecture Core
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Your server is configured with custom resilience drivers. If local MongoDB isn't running or goes offline, the server silently handles requests via JSON file persistence.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/30">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${dbMode.includes('Live') ? 'bg-emerald-500 animate-ping' : 'bg-cyan-500'}`}></div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Current Storage Driver:</span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${dbMode.includes('Live') ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400'}`}>
                {dbMode}
              </span>
            </div>

            <div className="rounded-2xl p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex gap-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Database Setup Notice:</span> To use real MongoDB schemas, install MongoDB and ensure a server is running at <code className="bg-amber-100 dark:bg-amber-950/80 px-1 py-0.5 rounded font-mono text-[10px]">localhost:27017</code>, or configure the <code className="bg-amber-100 dark:bg-amber-950/80 px-1 py-0.5 rounded font-mono text-[10px]">MONGO_URI</code> environment key in your backend's <code className="font-mono text-[10px]">.env</code> file.
              </div>
            </div>
          </div>

          {/* Seed demo data module */}
          <div className="glass-card rounded-3xl p-6 shadow-premium space-y-4">
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Fintech Demo Pipeline
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Press the button below to instantly populate your personal finance tracker with gorgeous, sample mock datasets. This is highly recommended to visualize the complete power of graphs, spending suggestions, and AI advisor insights immediately.
              </p>
            </div>

            <button
              onClick={seedSampleData}
              disabled={loading || stats.txCount > 0}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-premium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{stats.txCount > 0 ? 'Demo Data Seeded' : 'Seed Sample Cash Flow'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Crafted details */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 py-6 border-t border-slate-200/50 dark:border-slate-800/40">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
        <span>by DeepMind Antigravity for engineering review.</span>
      </div>
    </div>
  );
};

export default Profile;
