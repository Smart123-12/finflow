const express = require('express');
const router = express.Router();
const { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  getTransactionStats
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');

// All transactions routes are protected by jwt verification
router.use(authMiddleware);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.get('/stats', getTransactionStats);

module.exports = router;
