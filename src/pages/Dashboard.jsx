import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Sparkles, 
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PlusCircle,
  Gem
} from 'lucide-react';
import API from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(true);

  // Curated premium HSL colors for Pie chart categories
  const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1'];

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      // 1. Fetch Stats & Graphs
      const statsRes = await API.get('/transactions/stats');
      setStats(statsRes.data);

      // 2. Fetch Recent Transactions
      const txRes = await API.get('/transactions');
      setRecentTx(txRes.data.slice(0, 5));
    } catch (error) {
      console.error('[Dashboard Error]:', error.message);
      toast.error('Failed to load transaction metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAIInsights = async () => {
    setLoadingAI(true);
    try {
      const aiRes = await API.get('/ai/insights');
      setAiInsights(aiRes.data);
    } catch (error) {
      console.error('[AI Insights Fetch Error]:', error.message);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAIInsights();
  }, []);

  const handleRefresh = async () => {
    await fetchDashboardData(true);
    await fetchAIInsights();
    toast.success('Ledger parameters synchronized!');
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-brand-100 dark:border-brand-950/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Compiling Ledger Statistics...
        </p>
      </div>
    );
  }

  const hasData = recentTx.length > 0;

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Finance Control Center
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Institutional-grade cash flow tracking, budget warning thresholds, and predictive insights.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <NavLink
            to="/transactions"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-premium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Cash Flow</span>
          </NavLink>
        </div>
      </div>

      {!hasData ? (
        /* Empty Dashboard Notice seeding invitation */
        <div className="glass-card rounded-3xl p-12 text-center shadow-premium space-y-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-500 mx-auto">
            <Gem className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Welcome to FinFlow Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              To activate charts, cash flows, saving trends, and our premium AI Financial Insights engine, record a transaction or seed sample demo cash flows instantly.
            </p>
          </div>
          <div>
            <NavLink
              to="/profile"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-premium"
            >
              <span>Go to Profile & Seed Demo Cash Flow</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      ) : (
        <>
          {/* Key Stat Cards (Balance, Income, Expense, Savings) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Balance Card */}
            <div className="glass-card rounded-3xl p-6 shadow-premium hover:scale-[1.02] transition-all duration-300 relative overflow-hidden border-b-2 hover:border-b-indigo-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Total Sovereignty Balance
                </span>
                <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-500">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                  ${stats?.summary.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase mt-1">
                  Cumulative Net Wealth
                </p>
              </div>
            </div>

            {/* Monthly Income Card */}
            <div className="glass-card rounded-3xl p-6 shadow-premium hover:scale-[1.02] transition-all duration-300 relative overflow-hidden border-b-2 hover:border-b-emerald-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Monthly Revenue
                </span>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                  ${stats?.summary.monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase mt-1 flex items-center gap-1">
                  <span className="text-emerald-500 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" /> Current</span> billing cycle
                </p>
              </div>
            </div>

            {/* Monthly Expense Card */}
            <div className="glass-card rounded-3xl p-6 shadow-premium hover:scale-[1.02] transition-all duration-300 relative overflow-hidden border-b-2 hover:border-b-rose-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Monthly Outgoings
                </span>
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                  ${stats?.summary.monthlyExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase mt-1 flex items-center gap-1">
                  <span className="text-rose-500 font-bold flex items-center"><ArrowDownRight className="w-3 h-3" /> Out</span> current billing cycle
                </p>
              </div>
            </div>

            {/* Savings Rate Card */}
            <div className="glass-card rounded-3xl p-6 shadow-premium hover:scale-[1.02] transition-all duration-300 relative overflow-hidden border-b-2 hover:border-b-cyan-500">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl"></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Emergency Margin Rate
                </span>
                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-50">
                  <Percent className="w-5 h-5 text-cyan-500" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                  {stats?.summary.savingsRate}%
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase mt-1">
                  Net Savings: ${stats?.summary.monthlySavings.toLocaleString()}
                </p>
              </div>
            </div>

          </div>

          {/* Core Graphical Dashboard Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Savings Growth Trend Card (Left 8 cols) */}
            <div className="lg:col-span-8 glass-card rounded-3xl p-6 shadow-premium flex flex-col h-[400px]">
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Cumulative Savings Trend
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Visual mapping of net assets compounding Chronologically.
                </p>
              </div>
              
              <div className="flex-1 mt-6 min-h-0 text-xs font-medium text-slate-400">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.savingsTrend || []}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="currentColor" opacity={0.5} tickLine={false} axisLine={false} />
                    <YAxis stroke="currentColor" opacity={0.5} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.9)', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: '#f8fafc' 
                      }} 
                    />
                    <Area type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Categories Distribution (Right 4 cols) */}
            <div className="lg:col-span-4 glass-card rounded-3xl p-6 shadow-premium flex flex-col h-[400px]">
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Expense Allocations
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Category distribution breakdown.
                </p>
              </div>

              <div className="flex-1 mt-4 min-h-0 relative flex items-center justify-center">
                {stats?.categoryBreakdown.length === 0 ? (
                  <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
                    No expense allocations recorded yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.categoryBreakdown || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(stats?.categoryBreakdown || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(15, 23, 42, 0.9)', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#f8fafc' 
                        }} 
                        formatter={(value) => `$${value.toFixed(2)}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              {/* Category legends lists */}
              <div className="mt-4 space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                {(stats?.categoryBreakdown || []).slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="font-semibold truncate max-w-[120px]">{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">${entry.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Double Bar Comparison Graphic (Monthly cash flows) */}
          <div className="glass-card rounded-3xl p-6 shadow-premium flex flex-col h-[320px]">
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Monthly Spending Comparison
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Income vs Expense parameters mapped for the last 6 cycles.
              </p>
            </div>
            
            <div className="flex-1 mt-6 min-h-0 text-xs font-semibold text-slate-400">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlySpending || []}>
                  <XAxis dataKey="month" stroke="currentColor" opacity={0.5} tickLine={false} axisLine={false} />
                  <YAxis stroke="currentColor" opacity={0.5} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.9)', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#f8fafc' 
                    }} 
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} name="Inward Flow" />
                  <Bar dataKey="expense" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={40} name="Outward Flow" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Details Row: Ledger Logs (Left 7 cols) & AI Insights Box (Right 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Recent Transaction items */}
            <div className="lg:col-span-7 glass-card rounded-3xl p-6 shadow-premium space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Recent Transactions
                  </h4>
                  <NavLink 
                    to="/transactions" 
                    className="text-xs text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 font-bold flex items-center gap-1"
                  >
                    <span>Full Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NavLink>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Latest cash flows recorded.
                </p>
              </div>

              <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/40">
                {recentTx.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 overflow-hidden pr-2">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                        tx.type === 'income' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500' 
                          : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500'
                      }`}>
                        {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                          {tx.description || tx.category}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">
                          {tx.category} • {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`text-sm font-extrabold ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Advisor Panel (Right 5 cols) */}
            <div className="lg:col-span-5 glass-card rounded-3xl p-6 shadow-premium relative overflow-hidden flex flex-col justify-between glow-brand">
              
              {/* Background gradient layout decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl"></div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 text-white shadow-brand-500/25">
                      <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                        AI Wealth Coaching
                      </h4>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                        Heuristic Expert
                      </span>
                    </div>
                  </div>
                  
                  {aiInsights && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      aiInsights.isAI 
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-500' 
                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500'
                    }`}>
                      {aiInsights.isAI ? 'Gemini AI Model' : 'Local Heuristic'}
                    </span>
                  )}
                </div>

                <div className="border-t border-slate-200/60 dark:border-slate-800/40 pt-4 relative z-10">
                  {loadingAI ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <div className="w-6 h-6 rounded-full border-2 border-brand-100 dark:border-brand-950/30 border-t-brand-500 animate-spin"></div>
                      <p className="text-[10px] text-slate-400 mt-2 font-semibold uppercase">Consulting AI advisor...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Advisor Diagnosis
                        </span>
                        <h5 className="text-base font-extrabold text-brand-600 dark:text-brand-400 leading-tight mt-0.5">
                          {aiInsights?.headline}
                        </h5>
                      </div>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                        {aiInsights?.paragraph}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action suggestions checklist */}
              {!loadingAI && aiInsights && aiInsights.suggestions.length > 0 && (
                <div className="border-t border-slate-200/60 dark:border-slate-800/40 pt-4 mt-4 relative z-10 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Recommended Actions
                  </span>
                  
                  <div className="space-y-2">
                    {aiInsights.suggestions.map((sug, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <input 
                          type="checkbox" 
                          id={`sug-${i}`}
                          className="mt-0.5 accent-brand-500 rounded border-slate-300 text-brand-500 focus:ring-brand-500" 
                        />
                        <label htmlFor={`sug-${i}`} className="leading-snug select-none cursor-pointer">
                          {sug}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default Dashboard;
