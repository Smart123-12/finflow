const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment configuration
dotenv.config();

const app = express();

// Initialize Database connection (runs Mongo/In-Memory fallback automatically)
connectDB();

// Global Middlewares
app.use(cors({
  origin: '*', // Allow connections from frontend dev server, client exporters, etc.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    databaseMode: global.isMockDb ? 'Resilient Mock/File database' : 'Live MongoDB'
  });
});

// Mounted Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/ai', require('./routes/ai'));

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Global Server Error]:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`\x1b[32m✔ FinFlow Premium API running on port ${PORT}\x1b[0m`);
  console.log(`✔ Health endpoint: http://localhost:${PORT}/health`);
  console.log(`✔ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✔ DB Mode: ${global.isMockDb ? '\x1b[36mMOCK IN-MEMORY (resilient_db.json)\x1b[0m' : '\x1b[32mMONGODB\x1b[0m'}`);
  console.log(`======================================================\n`);
});
