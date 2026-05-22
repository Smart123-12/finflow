// FinFlow In-Browser Server Simulator (LocalStorage Mock DB)
// This simulates all API endpoints for a zero-dependency local static deploy on GitHub Pages!

const delay = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

const loadData = (key, defaultVal = []) => {
  try {
    const data = localStorage.getItem(`finflow_${key}`);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const saveData = (key, data) => {
  try {
    localStorage.setItem(`finflow_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`[Mock Engine] Write error on ${key}:`, e);
  }
};

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const getCurrentUserId = () => {
  const token = localStorage.getItem('finflow_token');
  if (!token) throw new Error('Unauthorized session denied');
  return 'default-user-id'; // Since we are local single-session browser tracking
};

// Simulated Axios instances
const API = {
  // GET Requests Router
  get: async (url, config = {}) => {
    await delay();
    const userId = getCurrentUserId();
    
    // Healthcheck
    if (url === '/health') {
      return { data: { status: 'online', databaseMode: 'In-Browser LocalStorage (Static GitHub Deploy)' } };
    }

    // Current logged-in Profile check
    if (url === '/auth/me') {
      const activeUser = JSON.parse(localStorage.getItem('finflow_user') || '{}');
      return { data: activeUser };
    }

    // List Transactions
    if (url === '/transactions') {
      let txs = loadData('transactions');
      const params = config.params || {};

      if (params.type) {
        txs = txs.filter(t => t.type === params.type);
      }
      if (params.category) {
        txs = txs.filter(t => t.category === params.category);
      }
      if (params.startDate) {
        txs = txs.filter(t => new Date(t.date) >= new Date(params.startDate));
      }
      if (params.endDate) {
        txs = txs.filter(t => new Date(t.date) <= new Date(params.endDate));
      }
      if (params.search) {
        const query = params.search.toLowerCase();
        txs = txs.filter(t => 
          (t.description && t.description.toLowerCase().includes(query)) ||
          (t.category && t.category.toLowerCase().includes(query))
        );
      }
      
      // Chronological descending sort
      txs.sort((a, b) => new Date(b.date) - new Date(a.date));
      return { data: txs };
    }

    // Transactions Statistics Evaluator
    if (url === '/transactions/stats') {
      const allTx = loadData('transactions');
      
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

      // 1. Pie Chart - Category expenses allocation
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

      // 3. Line Chart - Savings Growth accumulation
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
        savingsMap[dateLabel] = currentSavings;
      });

      const savingsTrend = Object.keys(savingsMap).map(date => ({
        date,
        balance: Number(savingsMap[date].toFixed(2))
      })).slice(-15);

      return {
        data: {
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
        }
      };
    }

    // List active Category Budgets with aggregated expenditures
    if (url === '/budgets') {
      const budgets = loadData('budgets');
      const allTx = loadData('transactions');
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const monthlyExpenses = allTx.filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= startOfMonth && tDate <= endOfMonth;
      });

      const categorySpentMap = {};
      monthlyExpenses.forEach(tx => {
        categorySpentMap[tx.category.toLowerCase()] = (categorySpentMap[tx.category.toLowerCase()] || 0) + Number(tx.amount);
      });

      const enriched = budgets.map(b => {
        const spent = categorySpentMap[b.category.toLowerCase()] || 0;
        const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
        let alertStatus = 'good';
        if (spent > b.limit) alertStatus = 'danger';
        else if (percent >= 85) alertStatus = 'warning';

        return {
          id: b._id,
          category: b.category,
          limit: b.limit,
          spent: Number(spent.toFixed(2)),
          percent: Number(percent.toFixed(1)),
          alertStatus
        };
      });

      return { data: enriched };
    }

    // Expert AI financial insights engine (Local rule-based generator)
    if (url === '/ai/insights') {
      const allTx = loadData('transactions');
      const budgets = loadData('budgets');

      // Core parameters
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

      const monthlySavings = monthlyIncome - monthlyExpense;
      const savingsRate = monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100) : 0;

      const insights = [];
      const suggestions = [];

      // Evaluation algorithms
      if (monthlyIncome === 0) {
        insights.push("No monthly income recorded in this cycle. Try logging your salary or freelance earnings to kickstart your charts.");
        suggestions.push("Create your first income entry in the transactions ledger.");
      } else if (savingsRate < 0) {
        insights.push(`Your savings rate is currently negative (${savingsRate.toFixed(1)}%). You spent $${Math.abs(monthlySavings).toFixed(2)} more than you earned this month. This indicates potential budget creep and high burn-rate.`);
        suggestions.push("Identify discretionary subscriptions and suspend them for 30 days.");
        suggestions.push("Limit premium dining-out expenses to boost your core emergency funds.");
      } else if (savingsRate < 20) {
        insights.push(`You saved $${monthlySavings.toFixed(2)} (${savingsRate.toFixed(1)}% savings rate) this month. While positive, modern financial planners recommend targeting a gold standard of 20% to weather unforeseen economic anomalies.`);
        suggestions.push("Reduce coffee and micro-transactions by cooking at home to claim that 20% threshold.");
      } else {
        insights.push(`Sensational job! Your savings rate is a premium ${savingsRate.toFixed(1)}% ($${monthlySavings.toFixed(2)} saved). Your wealth compounding indices are in a highly secure posture.`);
        suggestions.push("Move local savings margins to a High-Yield Savings Account (HYSA) or low-risk index trackers.");
      }

      // Check category totals
      const categoryTotals = {};
      let totalSpent = 0;
      allTx.filter(t => t.type === 'expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
        totalSpent += Number(t.amount);
      });

      let topCategory = null;
      let maxPct = 0;
      Object.keys(categoryTotals).forEach(cat => {
        const pct = totalSpent > 0 ? (categoryTotals[cat] / totalSpent) * 100 : 0;
        if (pct > maxPct) {
          maxPct = pct;
          topCategory = cat;
        }
      });

      if (topCategory && maxPct > 35) {
        insights.push(`Your spending on **${topCategory}** accounts for **${maxPct.toFixed(0)}%** of your total outflows. Reducing this category represents your highest financial leverage point.`);
        suggestions.push(`Put a strict daily target on ${topCategory} purchases.`);
      }

      if (suggestions.length < 3) {
        suggestions.push("Maintain a 48-hour cooling period for discretionary web purchases.");
        suggestions.push("Schedule a recurring weekly review on Sunday mornings to track metrics.");
      }

      return {
        data: {
          isAI: false, // Runs heuristic locally
          headline: savingsRate >= 20 ? "Financially Secure" : (savingsRate >= 0 ? "On Track with Care" : "Critical Action Required"),
          paragraph: insights.join('\n\n'),
          suggestions: suggestions.slice(0, 4)
        }
      };
    }

    throw new Error(`Endpoint GET ${url} not found`);
  },

  // POST Requests Router
  post: async (url, data) => {
    await delay();

    // 1. Authorization SignUp
    if (url === '/auth/register') {
      const { name, email, password } = data;
      const users = loadData('users');
      
      const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) throw new Error('User account already exists with this email');

      const newUser = { _id: generateId(), name, email, password };
      users.push(newUser);
      saveData('users', users);

      const userInfo = { id: newUser._id, name, email };
      localStorage.setItem('finflow_token', `mock-jwt-${generateId()}`);
      localStorage.setItem('finflow_user', JSON.stringify(userInfo));

      return { data: { token: 'mock-jwt-token', user: userInfo } };
    }

    // 2. Authorization LogIn
    if (url === '/auth/login') {
      const { email, password } = data;
      const users = loadData('users');

      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      // Fallback developer accounts to allow instant login even without registration!
      let userInfo;
      if (!user) {
        if (email.toLowerCase() === 'admin@finflow.com' || users.length === 0) {
          userInfo = { id: 'default-user-id', name: 'Premium Developer', email: 'admin@finflow.com' };
        } else {
          throw new Error('Invalid email or security passcode combo');
        }
      } else {
        userInfo = { id: user._id, name: user.name, email: user.email };
      }

      localStorage.setItem('finflow_token', `mock-jwt-${generateId()}`);
      localStorage.setItem('finflow_user', JSON.stringify(userInfo));

      return { data: { token: 'mock-jwt-token', user: userInfo } };
    }

    // Secure checking
    getCurrentUserId();

    // Create Transaction log
    if (url === '/transactions') {
      const txs = loadData('transactions');
      const budgets = loadData('budgets');
      
      const newTx = {
        _id: generateId(),
        userId: 'default-user-id',
        amount: Number(data.amount),
        type: data.type,
        category: data.category,
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description || '',
        createdAt: new Date().toISOString()
      };
      
      txs.push(newTx);
      saveData('transactions', txs);

      // Check category thresholds warning alerts
      let budgetAlert = null;
      if (data.type === 'expense') {
        const budget = budgets.find(b => b.category.toLowerCase() === data.category.toLowerCase());
        if (budget) {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          const monthlySpent = txs
            .filter(t => t.type === 'expense' && t.category === data.category && new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth)
            .reduce((sum, t) => sum + Number(t.amount), 0);

          const pct = (monthlySpent / budget.limit) * 100;
          if (monthlySpent > budget.limit) {
            budgetAlert = {
              type: 'danger',
              message: `CRITICAL ALERT: You have breached your $${budget.limit} limit in '${data.category}'! Spent: $${monthlySpent.toFixed(2)}.`
            };
          } else if (pct >= 85) {
            budgetAlert = {
              type: 'warning',
              message: `WARNING: Spent ${pct.toFixed(0)}% of your $${budget.limit} budget in '${data.category}'! Spent: $${monthlySpent.toFixed(2)}.`
            };
          }
        }
      }

      return { data: { transaction: newTx, budgetAlert } };
    }

    // Set Category Budget Limit
    if (url === '/budgets') {
      let budgets = loadData('budgets');
      const { category, limit } = data;

      const idx = budgets.findIndex(b => b.category.toLowerCase() === category.toLowerCase());
      let target;

      if (idx !== -1) {
        budgets[idx].limit = Number(limit);
        target = budgets[idx];
      } else {
        target = {
          _id: generateId(),
          userId: 'default-user-id',
          category,
          limit: Number(limit),
          createdAt: new Date().toISOString()
        };
        budgets.push(target);
      }

      saveData('budgets', budgets);
      return { data: target };
    }

    throw new Error(`Endpoint POST ${url} not found`);
  },

  // PUT Requests Router
  put: async (url, data) => {
    await delay();
    getCurrentUserId();

    // Edit Transaction
    if (url.startsWith('/transactions/')) {
      const id = url.split('/')[2];
      let txs = loadData('transactions');

      const idx = txs.findIndex(t => t._id === id);
      if (idx === -1) throw new Error('Transaction record not found');

      const updated = {
        ...txs[idx],
        ...data,
        amount: data.amount !== undefined ? Number(data.amount) : txs[idx].amount,
        updatedAt: new Date().toISOString()
      };

      txs[idx] = updated;
      saveData('transactions', txs);
      return { data: updated };
    }

    throw new Error(`Endpoint PUT ${url} not found`);
  },

  // DELETE Requests Router
  delete: async (url) => {
    await delay();
    getCurrentUserId();

    // Delete Transaction
    if (url.startsWith('/transactions/')) {
      const id = url.split('/')[2];
      let txs = loadData('transactions');

      const filtered = txs.filter(t => t._id !== id);
      if (txs.length === filtered.length) throw new Error('Transaction record not found');
      
      saveData('transactions', filtered);
      return { data: { message: 'Transaction successfully deleted' } };
    }

    // Delete Budget
    if (url.startsWith('/budgets/')) {
      const id = url.split('/')[2];
      let budgets = loadData('budgets');

      const filtered = budgets.filter(b => b._id !== id);
      if (budgets.length === filtered.length) throw new Error('Budget not found');

      saveData('budgets', filtered);
      return { data: { message: 'Budget limit successfully deleted' } };
    }

    throw new Error(`Endpoint DELETE ${url} not found`);
  }
};

export default API;
