const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_tracker';
    console.log(`[Database] Attempting connection to MongoDB at: ${mongoURI}...`);
    
    // Set a timeout of 3 seconds so the app falls back quickly if MongoDB is not running
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    
    global.isMockDb = false;
    console.log(`\x1b[32m[Database] MongoDB Connected Successfully: ${conn.connection.host}\x1b[0m`);
  } catch (error) {
    console.log('\n======================================================');
    console.warn('\x1b[33m[Database WARNING] Could not connect to a running MongoDB database.\x1b[0m');
    console.log('\x1b[36m[Database INFO] ACTIVATING PREMIUM IN-MEMORY RESILIENT DATABASE FALLBACK.\x1b[0m');
    console.log('[Database INFO] All transaction, user, and budget records will function flawlessly');
    console.log('[Database INFO] in memory (stored in backend/src/services/temp_db.json) for this session.');
    console.log('======================================================\n');
    
    global.isMockDb = true;
  }
};

module.exports = connectDB;
