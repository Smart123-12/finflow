const express = require('express');
const router = express.Router();
const { getBudgets, setBudget, deleteBudget } = require('../controllers/budgetController');
const authMiddleware = require('../middleware/auth');

// Protect route endpoints
router.use(authMiddleware);

router.get('/', getBudgets);
router.post('/', setBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
