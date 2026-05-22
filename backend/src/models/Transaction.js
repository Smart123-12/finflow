const mongoose = require('mongoose');
const { TransactionMock } = require('../services/memoryDb');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    required: [true, 'Type must be income or expense'],
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MongoTransaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

module.exports = {
  find: (query) => {
    if (global.isMockDb) return TransactionMock.find(query);
    
    // Convert text filters for mongoose query
    const mQuery = { userId: query.userId };
    if (query.category) mQuery.category = query.category;
    if (query.type) mQuery.type = query.type;
    
    if (query.startDate || query.endDate) {
      mQuery.date = {};
      if (query.startDate) mQuery.date.$gte = new Date(query.startDate);
      if (query.endDate) mQuery.date.$lte = new Date(query.endDate);
    }
    
    if (query.search) {
      mQuery.$or = [
        { description: { $regex: query.search, $options: 'i' } },
        { category: { $regex: query.search, $options: 'i' } }
      ];
    }
    
    return MongoTransaction.find(mQuery).sort({ date: -1 });
  },
  
  findById: (id) => {
    if (global.isMockDb) return TransactionMock.findById(id);
    return MongoTransaction.findById(id);
  },
  
  create: (data) => {
    if (global.isMockDb) return TransactionMock.create(data);
    return MongoTransaction.create(data);
  },
  
  findByIdAndUpdate: (id, updateData, options = { new: true }) => {
    if (global.isMockDb) return TransactionMock.findByIdAndUpdate(id, updateData, options);
    return MongoTransaction.findByIdAndUpdate(id, updateData, options);
  },
  
  findByIdAndDelete: (id) => {
    if (global.isMockDb) return TransactionMock.findByIdAndDelete(id);
    return MongoTransaction.findByIdAndDelete(id);
  }
};
