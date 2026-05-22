const mongoose = require('mongoose');
const { BudgetMock } = require('../services/memoryDb');

const BudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [0, 'Budget limit cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique key to make sure a user can only have one budget per category
BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });

const MongoBudget = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);

module.exports = {
  find: (query) => {
    if (global.isMockDb) return BudgetMock.find(query);
    return MongoBudget.find(query);
  },
  
  findOne: (query) => {
    if (global.isMockDb) return BudgetMock.findOne(query);
    return MongoBudget.findOne(query);
  },
  
  findOneAndUpdate: (query, updateData, options = { upsert: true, new: true }) => {
    if (global.isMockDb) return BudgetMock.findOneAndUpdate(query, updateData, options);
    return MongoBudget.findOneAndUpdate(query, updateData, options);
  },
  
  create: (data) => {
    if (global.isMockDb) return BudgetMock.create(data);
    return MongoBudget.create(data);
  },

  findByIdAndDelete: (id) => {
    if (global.isMockDb) return BudgetMock.findByIdAndDelete(id);
    return MongoBudget.findByIdAndDelete(id);
  }
};
