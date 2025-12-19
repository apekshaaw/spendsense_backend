// routes/goalRoutes.js
const express = require('express');
const {
  createOrUpdateGoal,
  getMyGoal,
  updateGoalProgress,
  editMyGoal,
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// all goal routes require login
router.use(protect);

// Create or replace main goal
router.post('/', createOrUpdateGoal);

// Get active goal
router.get('/me', getMyGoal);

// Edit goal details (name, target, notes)
router.patch('/me', editMyGoal);

// Update progress (+ / - amount, add to history)
router.patch('/me/progress', updateGoalProgress);

module.exports = router;
