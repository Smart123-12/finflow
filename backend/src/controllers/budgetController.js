const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId });
    
    // Fetch transaction list for the current month to calculate spent amount
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyExpenses = await Transaction.find({
      userId: req.userId,
      type: 'expense',
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    });

    // Group expenses by category
    const categorySpentMap = {};
    monthlyExpenses.forEach(tx => {
      categorySpentMap[tx.category.toLowerCase()] = (categorySpentMap[tx.category.toLowerCase()] || 0) + Number(tx.amount);
    });

    // Enrich budgets with actual spent data
    const enrichedBudgets = budgets.map(b => {
      const spent = categorySpentMap[b.category.toLowerCase()] || 0;
      const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      let alertStatus = 'good'; // 'good', 'warning' (>=85%), 'danger' (>100%)
      
      if (spent > b.limit) {
        alertStatus = 'danger';
      } else if (percent >= 85) {
        alertStatus = 'warning';
      }

      return {
        id: b._id,
        category: b.category,
        limit: b.limit,
        spent: Number(spent.toFixed(2)),
        percent: Number(percent.toFixed(1)),
        alertStatus
      };
    });

    res.status(200).json(enrichedBudgets);
  } catch (error) {
    console.error('[Get Budgets Error]:', error);
    res.status(500).json({ message: 'Error retrieving category budgets' });
  }
};

const setBudget = async (req, res) => {
  try {
    const { category, limit } = req.body;

    if (!category || limit === undefined) {
      return res.status(400).json({ message: 'Category and limit are required' });
    }

    if (limit < 0) {
      return res.status(400).json({ message: 'Limit cannot be negative' });
    }

    // Upsert budget
    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId, category },
      { limit: Number(limit) },
      { upsert: true, new: true }
    );

    res.status(200).json(budget);
  } catch (error) {
    console.error('[Set Budget Error]:', error);
    res.status(500).json({ message: 'Error configuring budget limit' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findByIdAndDelete(id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget target not found' });
    }

    res.status(200).json({ message: 'Budget limit deleted successfully' });
  } catch (error) {
    console.error('[Delete Budget Error]:', error);
    res.status(500).json({ message: 'Error deleting budget limit' });
  }
};

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget
};
