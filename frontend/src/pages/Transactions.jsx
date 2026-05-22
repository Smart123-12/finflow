import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import API from '../services/api';

const Categories = [
  'Salary',
  'Freelance',
  'Investment',
  'Food & Dining',
  'Rent',
  'Utilities',
  'Entertainment',
  'Travel',
  'Miscellaneous'
];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal / Drawer states
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formType, setFormType] = useState('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const qParams = {};
      if (search) qParams.search = search;
      if (type) qParams.type = type;
      if (category) qParams.category = category;
      if (startDate) qParams.startDate = startDate;
      if (endDate) qParams.endDate = endDate;

      const response = await API.get('/transactions', { params: qParams });
      setTransactions(response.data);
    } catch (error) {
      console.error('[Fetch Tx Error]:', error.message);
      toast.error('Could not retrieve transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, type, category, startDate, endDate]);

  const openAddModal = () => {
    setEditId(null);
    setFormType('expense');
    setFormAmount('');
    setFormCategory('Food & Dining');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDesc('');
    setModalOpen(true);
  };

  const openEditModal = (tx) => {
    setEditId(tx._id);
    setFormType(tx.type);
    setFormAmount(tx.amount.toString());
    setFormCategory(tx.category);
    setFormDate(new Date(tx.date).toISOString().split('T')[0]);
    setFormDesc(tx.description || '');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this cash flow record?')) return;
    
    const toastId = toast.loading('Deleting transaction record...');
    try {
      await API.delete(`/transactions/${id}`);
      toast.success('Transaction deleted.', { id: toastId });
      fetchTransactions();
    } catch (error) {
      toast.error(error.message || 'Deletion failed.', { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }
    if (!formCategory) {
      toast.error('Please select a category');
      return;
    }

    setSaving(true);
    const toastId = toast.loading(editId ? 'Updating ledger record...' : 'Recording cash flow...');
    
    try {
      const payload = {
        amount: Number(formAmount),
        type: formType,
        category: formCategory,
        date: formDate,
        description: formDesc
      };

      if (editId) {
        await API.put(`/transactions/${editId}`, payload);
        toast.success('Transaction updated.', { id: toastId });
      } else {
        const res = await API.post('/transactions', payload);
        toast.success('Transaction logged.', { id: toastId });
        
        // Show budget limits toasts
        if (res.data.budgetAlert) {
          const alert = res.data.budgetAlert;
          if (alert.type === 'danger') {
            toast(alert.message, { icon: '🚨', duration: 6000 });
          } else if (alert.type === 'warning') {
            toast(alert.message, { icon: '🟡', duration: 5000 });
          }
        }
      }

      setModalOpen(false);
      fetchTransactions();
    } catch (error) {
      toast.error(error.message || 'Transaction record failed.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // CSV Exporter client logic
  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions available to export.');
      return;
    }

    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = transactions.map(t => [
      t._id,
      new Date(t.date).toLocaleDateString(),
      t.type.toUpperCase(),
      t.category,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FinFlow_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV spreadsheet exported successfully!');
  };

  // Print friendly view
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-slide-up print:p-0">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Transaction Ledger
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track, query, refine, and catalog all incoming and outgoing cash flows.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-all duration-200"
            title="Export spreadsheet CSV"
          >
            <Download className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          
          <button
            onClick={triggerPrint}
            className="inline-flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-all duration-200"
            title="Download PDF/Print ledger"
          >
            <Printer className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-premium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Record Cash Flow</span>
          </button>
        </div>
      </div>

      {/* Filter and query builder layout (Slate card) */}
      <div className="glass-card rounded-3xl p-6 shadow-premium space-y-4 print:hidden">
        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-extrabold uppercase tracking-wider">Search & Filter Ledgers</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Keyword Search input */}
          <div className="relative col-span-1 lg:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-xs focus:border-brand-500 transition-all duration-200"
            />
          </div>

          {/* Type picker selector */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-xs focus:border-brand-500 transition-all duration-200 font-semibold"
          >
            <option value="">All Flow Types</option>
            <option value="income">Inward Flow (Income)</option>
            <option value="expense">Outward Flow (Expense)</option>
          </select>

          {/* Category picker selector */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-xs focus:border-brand-500 transition-all duration-200 font-semibold"
          >
            <option value="">All Categories</option>
            {Categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Date range pickers */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-xs focus:border-brand-500 transition-all duration-200"
              title="Filter Start date"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-xs focus:border-brand-500 transition-all duration-200"
              title="Filter End date"
            />
          </div>

        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-premium">
        
        {/* Printable Invoice Header detail */}
        <div className="hidden print:flex items-center justify-between p-8 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 text-white">
              💎
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">FinFlow Ledger</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Cash Flow Audit Statement</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold text-slate-800">Date Compiled: {new Date().toLocaleDateString()}</p>
            <p className="text-slate-400 mt-1">Audit Record ID: FFL-{Math.floor(Math.random()*900000+100000)}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand-100 dark:border-brand-950/30 border-t-brand-500 animate-spin"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="max-w-xs mx-auto space-y-1">
                <h5 className="font-bold text-slate-800 dark:text-slate-200">No records compiled</h5>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
                  Try adjusting your filter search criteria, or add your first transaction.
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/50 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200/60 dark:border-slate-800/40">
                  <th className="px-6 py-4.5">Description & Note</th>
                  <th className="px-6 py-4.5">Category</th>
                  <th className="px-6 py-4.5">Date Added</th>
                  <th className="px-6 py-4.5 text-right">Cash Flow Amount</th>
                  <th className="px-6 py-4.5 text-center print:hidden">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30 text-xs">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-100/20 dark:hover:bg-slate-800/10 transition-colors">
                    
                    {/* Description details */}
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 font-sans">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-500' : 'bg-brand-500'}`}></span>
                        <span className="truncate max-w-[200px] sm:max-w-[300px]">{tx.description || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Category details */}
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full font-semibold text-[10px] tracking-wide bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/30">
                        {tx.category}
                      </span>
                    </td>

                    {/* Date details */}
                    <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">
                      {new Date(tx.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* Amount details */}
                    <td className={`px-6 py-4 font-extrabold text-right text-sm ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>

                    {/* CRUD edit/delete buttons */}
                    <td className="px-6 py-4 text-center print:hidden">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-all"
                          title="Edit transaction"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Transaction Slideover Modal Drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 md:p-6 bg-slate-900/40 backdrop-blur-xs">
          <div 
            className="absolute inset-0"
            onClick={() => setModalOpen(false)}
          />
          
          <div className="relative w-full max-w-md h-full md:h-auto max-h-[90vh] flex flex-col glass-card border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-premium overflow-y-auto animate-scale-in">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/40">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-sans">
                {editId ? 'Edit Ledger Record' : 'Record Cash Flow'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 flex-1">
              
              {/* Type Switcher (Toggles) */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Flow Direction
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormType('expense')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                      formType === 'expense'
                        ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-slate-100 border border-slate-200/10'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5 text-brand-500" />
                    <span>Outward (Expense)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('income')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                      formType === 'income'
                        ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-slate-100 border border-slate-200/10'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Inward (Income)</span>
                  </button>
                </div>
              </div>

              {/* Cash Flow Amount */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Amount ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-sm font-bold text-slate-800 dark:text-slate-100 focus:border-brand-500 transition-all duration-200"
                />
              </div>

              {/* Category Picker selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Allocations Category
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

              {/* Transaction Date picker */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Ledger Record Date
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-brand-500 transition-all duration-200"
                />
              </div>

              {/* Description notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Notes & Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. Weekly organic grocery runs, AWS bill"
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none text-xs text-slate-800 dark:text-slate-100 focus:border-brand-500 transition-all duration-200"
                />
              </div>

              {/* Control buttons */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs shadow-premium hover:scale-[1.01] active:scale-[0.99] transition duration-200 disabled:opacity-50 mt-4"
              >
                {saving ? 'Saving Ledger Entry...' : (editId ? 'Commit Changes' : 'Log Cash Flow')}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;
