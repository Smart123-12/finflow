const mongoose = require('mongoose');
const { UserMock } = require('../services/memoryDb');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = {
  findOne: (query) => {
    if (global.isMockDb) return UserMock.findOne(query);
    return MongoUser.findOne(query);
  },
  findById: (id) => {
    if (global.isMockDb) return UserMock.findById(id);
    return MongoUser.findById(id);
  },
  create: (data) => {
    if (global.isMockDb) return UserMock.create(data);
    return MongoUser.create(data);
  }
};
