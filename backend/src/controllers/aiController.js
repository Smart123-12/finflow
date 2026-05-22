const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const aiService = require('../services/aiService');
const { getTransactionStats } = require('./transactionController');

const getInsights = async (req, res) => {
  try {
    // 1. Gather all transactions
    const allTx = await Transaction.find({ userId: req.userId });

    // 2. Fetch budget configuration
    const budgets = await Budget.find({ userId: req.userId });

    // Calculate core statistics for current month
    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

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

    // Compile active status stats
    const stats = {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      monthlySavings,
      savingsRate
    };

    // Calculate spent by budget category
    const categorySpentMap = {};
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyExpenses = allTx.filter(tx => {
      const txDate = new Date(tx.date);
      return tx.type === 'expense' && txDate >= startOfMonth && txDate <= endOfMonth;
    });

    monthlyExpenses.forEach(tx => {
      categorySpentMap[tx.category.toLowerCase()] = (categorySpentMap[tx.category.toLowerCase()] || 0) + Number(tx.amount);
    });

    // Format budgets list matching enrichment in budgetController
    const enrichedBudgets = budgets.map(b => {
      const spent = categorySpentMap[b.category.toLowerCase()] || 0;
      const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      let alertStatus = 'good';
      if (spent > b.limit) alertStatus = 'danger';
      else if (percent >= 85) alertStatus = 'warning';

      return {
        category: b.category,
        limit: b.limit,
        spent,
        percent,
        alertStatus
      };
    });

    // 3. Dispatch data models to AI advisor Engine
    const insights = await aiService.getAISuggestions(stats, enrichedBudgets, allTx);
    res.status(200).json(insights);
  } catch (error) {
    console.error('[AI Insights Controller Error]:', error);
    res.status(500).json({ message: 'Failed to generate financial insights' });
  }
};

module.exports = {
  getInsights
};
