import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  X, 
  AlertTriangle, 
  Info,
  HelpCircle,
  TrendingDown,
  Sparkles,
  Gauge
} from 'lucide-react';
import API from '../services/api';

const Categories = [
  'Food & Dining',
  'Rent',
  'Utilities',
  'Entertainment',
  'Travel',
  'Miscellaneous'
];

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal configure state
  const [modalOpen, setModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState('Food & Dining');
  const [formLimit, setFormLimit] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await API.get('/budgets');
      setBudgets(response.data);
    } catch (error) {
      console.error('[Fetch Budgets Error]:', error.message);
      toast.error('Failed to load category budgets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const openConfigureModal = () => {
    setFormCategory('Food & Dining');
    setFormLimit('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category budget limit?')) return;
    
    const toastId = toast.loading('Deleting budget parameters...');
    try {
      await API.delete(`/budgets/${id}`);
      toast.success('Budget deleted successfully.', { id: toastId });
      fetchBudgets();
    } catch (error) {
      toast.error(error.message || 'Deletion failed.', { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formLimit || Number(formLimit) < 0) {
      toast.error('Please enter a valid budget limit greater than or equal to 0');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Configuring budget limit...');
    
    try {
      await API.post('/budgets', {
        category: formCategory,
        limit: Number(formLimit)
      });

      toast.success(`Allocated $${formLimit} limit for '${formCategory}'!`, { id: toastId });
      setModalOpen(false);
      fetchBudgets();
    } catch (error) {
      toast.error(error.message || 'Configuring budget failed.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Calculate total values across all configurations
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalLimit - totalSpent;
  const overallPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  // Track over-budget counts
  const overBudgetsCount = budgets.filter(b => b.spent > b.limit).length;
  const warningsCount = budgets.filter(b => b.alertStatus === 'warning').length;

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Category Budget Planner
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Delegate monthly caps, verify remaining balance thresholds, and check overspend triggers.
          </p>
        </div>
        
        <button
          onClick={openConfigureModal}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-premium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Allocate Category Limit</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-100 dark:border-brand-950/30 border-t-brand-500 animate-spin"></div>
        </div>
      ) : budgets.length === 0 ? (
        /* Empty budgets screen seeder invite */
        <div className="glass-card rounded-3xl p-12 text-center shadow-premium space-y-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mx-auto">
            <Wallet className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans">
              Budget Ledger Empty
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Allocate a monthly budget for items like Food, Rent, or Entertainment to activate spending gauges and warning alerts.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openConfigureModal}
              className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-premium"
            >
              Configure First Budget
            </button>
            <span className="text-xs text-slate-400 font-semibold uppercase">Or</span>
            <NavLink
              to="/profile"
              className="text-xs text-brand-500 hover:text-brand-600 font-bold underline"
            >
              Seed complete mock ledger data
            </NavLink>
          </div>
        </div>
      ) : (
        <>
          {/* Summary gauge grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Top row cards - General budget gauge (Left 7 cols) */}
            <div className="lg:col-span-7 glass-card rounded-3xl p-6 shadow-premium flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Comprehensive Budget Margin
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
                    Aggregate active target thresholds
                  </p>
                </div>
              </div>

              {/* Master progress line */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 dark:text-slate-500">Total Spent: ${totalSpent.toFixed(2)}</span>
                  <span className="text-slate-800 dark:text-slate-200">Total Limit: ${totalLimit.toFixed(2)}</span>
                </div>
                
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      overallPercent > 100 
                        ? 'bg-rose-500 shadow-lg shadow-rose-500/20' 
                        : (overallPercent >= 85 ? 'bg-amber-500' : 'bg-brand-500 glow-brand')
                    }`}
                    style={{ width: `${Math.min(overallPercent, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 dark:text-slate-500">
                    Gauged capacity: <span className="font-extrabold text-slate-800 dark:text-slate-200">{overallPercent.toFixed(1)}%</span>
                  </span>
                  
                  <span className={`font-bold ${totalRemaining >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {totalRemaining >= 0 ? `$${totalRemaining.toFixed(2)} remaining` : `$${Math.abs(totalRemaining).toFixed(2)} deficit`}
                  </span>
                </div>
              </div>
            </div>

            {/* Total System warnings (Right 5 cols) */}
            <div className="lg:col-span-5 glass-card rounded-3xl p-6 shadow-premium flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Anomaly Warning Registers
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Overrun flags active.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {overBudgetsCount > 0 ? (
                  <div className="flex gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 text-xs leading-relaxed">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Breached categories:</span> You have completely overrun limits across <span className="font-extrabold underline">{overBudgetsCount} budget categories</span>! Consider trimming active transaction streams.
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Ledgers fully compliant!</span> No category budget limits are currently breached. Splendid spending self-discipline!
                    </div>
                  </div>
                )}

                {warningsCount > 0 && (
                  <div className="flex gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Close limit warnings:</span> Category outgoings are exceeding <span className="font-bold">85% limit capacity</span> in {warningsCount} budgets.
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Budgets Progress Goal Meters list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {budgets.map((b) => {
              const remaining = b.limit - b.spent;
              
              // Progress bar styling depending on warnings/overrun limits
              let barColor = 'bg-brand-500 glow-brand';
              let borderClass = 'hover:border-indigo-500';
              let textBadge = 'text-brand-600 bg-brand-50 dark:bg-brand-950/30 border-brand-200/20';

              if (b.alertStatus === 'danger') {
                barColor = 'bg-rose-500 shadow-lg shadow-rose-500/20';
                borderClass = 'hover:border-rose-500 border-rose-500/25';
                textBadge = 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 border-rose-200/20';
              } else if (b.alertStatus === 'warning') {
                barColor = 'bg-amber-500 shadow-lg shadow-amber-500/20';
                borderClass = 'hover:border-amber-500 border-amber-500/20';
                textBadge = 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200/20';
              }

              return (
                <div 
                  key={b.id} 
                  className={`glass-card rounded-3xl p-6 shadow-premium flex flex-col justify-between border-t-4 transition-all duration-300 hover:scale-[1.01] ${borderClass}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                        {b.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      title="Remove category limit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Limits and actuals indicators */}
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Current Spent</p>
                      <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">${b.spent.toLocaleString()}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Limit</p>
                      <p className="text-base font-bold text-slate-600 dark:text-slate-300 font-sans">${b.limit.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Bar and percentages details */}
                  <div className="mt-4 space-y-2">
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(b.percent, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px] font-semibold">
                      <span className="text-slate-400 dark:text-slate-500">
                        Capacity: <span className="font-extrabold text-slate-800 dark:text-slate-200">{b.percent}%</span>
                      </span>
                      
                      <span className={remaining >= 0 ? 'text-slate-400 dark:text-slate-500' : 'text-rose-500 font-bold'}>
                        {remaining >= 0 ? `$${remaining.toFixed(0)} left` : `$${Math.abs(remaining).toFixed(0)} overrun`}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Configure limit Modal drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div 
            className="absolute inset-0"
            onClick={() => setModalOpen(false)}
          />
          
          <div className="relative w-full max-w-sm glass-card border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-premium animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/40">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
                Allocate Budget Limit
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              
              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Outgoings Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-brand-500 transition-all duration-200"
                >
                  {Categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Budget Limit value */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Monthly Limit ($ USD)
                </label>
                <input
                  type="number"
                  required
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-sm font-bold text-slate-800 dark:text-slate-100 focus:border-brand-500 transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs shadow-premium hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50 mt-4"
              >
                {saving ? 'Configuring Limit...' : 'Allocate Category Limit'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Budgets;
