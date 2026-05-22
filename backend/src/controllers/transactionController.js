const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

const getTransactions = async (req, res) => {
  try {
    const { category, type, search, startDate, endDate } = req.query;
    
    const transactions = await Transaction.find({
      userId: req.userId,
      category,
      type,
      search,
      startDate,
      endDate
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('[Get Transactions Error]:', error);
    res.status(500).json({ message: 'Error retrieving transactions' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, description } = req.body;
    
    if (!amount || !type || !category) {
      return res.status(400).json({ message: 'Amount, type, and category are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const transaction = await Transaction.create({
      userId: req.userId,
      amount: Number(amount),
      type,
      category,
      date: date || new Date(),
      description: description || ''
    });

    // Check budget alert
    let budgetAlert = null;
    if (type === 'expense') {
      const budget = await Budget.findOne({ userId: req.userId, category });
      if (budget) {
        // Calculate total expenses for this category in the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const categoryExpenses = await Transaction.find({
          userId: req.userId,
          category,
          type: 'expense',
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0]
        });

        const totalSpent = categoryExpenses.reduce((sum, tx) => sum + tx.amount, 0);
        const pctSpent = (totalSpent / budget.limit) * 100;

        if (totalSpent > budget.limit) {
          budgetAlert = {
            type: 'danger',
            message: `CRITICAL ALERT: You have exceeded your $${budget.limit} budget for '${category}'! Spent: $${totalSpent.toFixed(2)}.`
          };
        } else if (pctSpent >= 85) {
          budgetAlert = {
            type: 'warning',
            message: `WARNING: You have spent ${pctSpent.toFixed(0)}% of your $${budget.limit} budget for '${category}'! Spent: $${totalSpent.toFixed(2)}.`
          };
        }
      }
    }

    res.status(201).json({ transaction, budgetAlert });
  } catch (error) {
    console.error('[Create Transaction Error]:', error);
    res.status(500).json({ message: 'Error creating transaction' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, date, description } = req.body;

    const tx = await Transaction.findById(id);
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify ownership
    if (tx.userId.toString() !== req.userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to modify this transaction' });
    }

    const updatedTx = await Transaction.findByIdAndUpdate(
      id,
      {
        amount: amount !== undefined ? Number(amount) : tx.amount,
        type: type || tx.type,
        category: category || tx.category,
        date: date || tx.date,
        description: description !== undefined ? description : tx.description
      },
      { new: true }
    );

    res.status(200).json(updatedTx);
  } catch (error) {
    console.error('[Update Transaction Error]:', error);
    res.status(500).json({ message: 'Error updating transaction' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const tx = await Transaction.findById(id);
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Verify ownership
    if (tx.userId.toString() !== req.userId.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this transaction' });
    }

    await Transaction.findByIdAndDelete(id);
    res.status(200).json({ message: 'Transaction successfully deleted' });
  } catch (error) {
    console.error('[Delete Transaction Error]:', error);
    res.status(500).json({ message: 'Error deleting transaction' });
  }
};

const getTransactionStats = async (req, res) => {
  try {
    const allTx = await Transaction.find({ userId: req.userId });
    
    // Core statistics
    let totalIncome = 0;
    let totalExpense = 0;
    
    // Monthly statistics for current month
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    allTx.forEach(tx => {
      const amount = Number(tx.amount);
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;

      if (tx.type === 'income') {
        totalIncome += amount;
        if (isCurrentMonth) monthlyIncome += amount;
      } else {
        totalExpense += amount;
        if (isCurrentMonth) monthlyExpense += amount;
      }
    });

    const totalBalance = totalIncome - totalExpense;
    const monthlySavings = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100) : 0;

    // 1. Pie Chart - Expenses Breakdown by Category (Current month or all time, let's do all expenses)
    const categoryMap = {};
    allTx.filter(tx => tx.type === 'expense').forEach(tx => {
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + Number(tx.amount);
    });

    const categoryBreakdown = Object.keys(categoryMap).map(category => ({
      name: category,
      value: categoryMap[category]
    }));

    // 2. Bar Chart - Monthly Spending (Last 6 Months)
    const monthlySpendingMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlySpendingMap[label] = { month: label, income: 0, expense: 0, timestamp: d.getTime() };
    }

    allTx.forEach(tx => {
      const txDate = new Date(tx.date);
      const label = txDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (monthlySpendingMap[label]) {
        if (tx.type === 'income') {
          monthlySpendingMap[label].income += Number(tx.amount);
        } else {
          monthlySpendingMap[label].expense += Number(tx.amount);
        }
      }
    });

    const monthlySpending = Object.values(monthlySpendingMap).sort((a, b) => a.timestamp - b.timestamp);

    // 3. Line Chart - Savings Growth Over Time
    // To construct savings growth, sort all transactions ascending, then accumulate net savings
    const sortedTx = [...allTx].sort((a, b) => new Date(a.date) - new Date(b.date));
    let currentSavings = 0;
    const savingsMap = {};

    sortedTx.forEach(tx => {
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        currentSavings += amount;
      } else {
        currentSavings -= amount;
      }
      
      const dateLabel = new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      savingsMap[dateLabel] = currentSavings; // key keeps sorting state
    });

    // Limit line chart dots to last 15 updates or unique chronological transactions for clean UI charts
    const savingsTrend = Object.keys(savingsMap).map(date => ({
      date,
      balance: Number(savingsMap[date].toFixed(2))
    })).slice(-15);

    res.status(200).json({
      summary: {
        totalBalance: Number(totalBalance.toFixed(2)),
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpense: Number(totalExpense.toFixed(2)),
        monthlyIncome: Number(monthlyIncome.toFixed(2)),
        monthlyExpense: Number(monthlyExpense.toFixed(2)),
        monthlySavings: Number(monthlySavings.toFixed(2)),
        savingsRate: Number(savingsRate.toFixed(1))
      },
      categoryBreakdown,
      monthlySpending,
      savingsTrend
    });
  } catch (error) {
    console.error('[Get Transaction Stats Error]:', error);
    res.status(500).json({ message: 'Error calculating transaction statistics' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
};
