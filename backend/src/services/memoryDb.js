const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'temp_db.json');

const loadData = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = { users: [], transactions: [], budgets: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[Mock DB] Error loading temp_db.json, returning empty structure.', error);
    return { users: [], transactions: [], budgets: [] };
  }
};

const saveData = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Mock DB] Error writing to temp_db.json', error);
  }
};

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// User Model Simulator
const UserMock = {
  findOne: async (query) => {
    const data = loadData();
    if (query.email) {
      return data.users.find(u => u.email.toLowerCase() === query.email.toLowerCase()) || null;
    }
    return null;
  },
  findById: async (id) => {
    const data = loadData();
    const user = data.users.find(u => u._id === id);
    if (!user) return null;
    // return copy with password excluded from standard view
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, _id: user._id };
  },
  create: async (userData) => {
    const data = loadData();
    const newUser = {
      _id: generateId(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    saveData(data);
    return newUser;
  }
};

// Transaction Model Simulator
const TransactionMock = {
  find: async (query = {}) => {
    const data = loadData();
    let results = data.transactions.filter(t => t.userId === query.userId);
    
    if (query.category) {
      results = results.filter(t => t.category === query.category);
    }
    if (query.type) {
      results = results.filter(t => t.type === query.type);
    }
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(t => 
        (t.description && t.description.toLowerCase().includes(searchLower)) ||
        (t.category && t.category.toLowerCase().includes(searchLower))
      );
    }
    if (query.startDate) {
      results = results.filter(t => new Date(t.date) >= new Date(query.startDate));
    }
    if (query.endDate) {
      results = results.filter(t => new Date(t.date) <= new Date(query.endDate));
    }
    
    // Sort descending by date by default
    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  
  findById: async (id) => {
    const data = loadData();
    return data.transactions.find(t => t._id === id) || null;
  },
  
  create: async (txData) => {
    const data = loadData();
    const newTx = {
      _id: generateId(),
      userId: txData.userId,
      amount: Number(txData.amount),
      type: txData.type, // 'income' or 'expense'
      category: txData.category,
      date: txData.date || new Date().toISOString().split('T')[0],
      description: txData.description || '',
      createdAt: new Date().toISOString()
    };
    data.transactions.push(newTx);
    saveData(data);
    return newTx;
  },
  
  findByIdAndUpdate: async (id, updateData, options = {}) => {
    const data = loadData();
    const index = data.transactions.findIndex(t => t._id === id);
    if (index === -1) return null;
    
    const updated = {
      ...data.transactions[index],
      ...updateData,
      amount: updateData.amount !== undefined ? Number(updateData.amount) : data.transactions[index].amount,
      updatedAt: new Date().toISOString()
    };
    
    data.transactions[index] = updated;
    saveData(data);
    return updated;
  },
  
  findByIdAndDelete: async (id) => {
    const data = loadData();
    const index = data.transactions.findIndex(t => t._id === id);
    if (index === -1) return null;
    const deleted = data.transactions[index];
    data.transactions.splice(index, 1);
    saveData(data);
    return deleted;
  }
};

// Budget Model Simulator
const BudgetMock = {
  find: async (query = {}) => {
    const data = loadData();
    return data.budgets.filter(b => b.userId === query.userId);
  },
  
  findOne: async (query = {}) => {
    const data = loadData();
    return data.budgets.find(b => b.userId === query.userId && b.category.toLowerCase() === query.category.toLowerCase()) || null;
  },
  
  findOneAndUpdate: async (query = {}, updateData, options = {}) => {
    const data = loadData();
    let budget = data.budgets.find(b => b.userId === query.userId && b.category.toLowerCase() === query.category.toLowerCase());
    
    if (budget) {
      budget.limit = Number(updateData.limit);
      budget.updatedAt = new Date().toISOString();
    } else {
      if (options.upsert) {
        budget = {
          _id: generateId(),
          userId: query.userId,
          category: query.category,
          limit: Number(updateData.limit),
          createdAt: new Date().toISOString()
        };
        data.budgets.push(budget);
      } else {
        return null;
      }
    }
    saveData(data);
    return budget;
  },
  
  create: async (budgetData) => {
    const data = loadData();
    const newBudget = {
      _id: generateId(),
      userId: budgetData.userId,
      category: budgetData.category,
      limit: Number(budgetData.limit),
      createdAt: new Date().toISOString()
    };
    data.budgets.push(newBudget);
    saveData(data);
    return newBudget;
  },

  findByIdAndDelete: async (id) => {
    const data = loadData();
    const index = data.budgets.findIndex(b => b._id === id);
    if (index === -1) return null;
    const deleted = data.budgets[index];
    data.budgets.splice(index, 1);
    saveData(data);
    return deleted;
  }
};

module.exports = {
  UserMock,
  TransactionMock,
  BudgetMock
};
