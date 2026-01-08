// routes/needRoutes.js
const express = require('express');
const { createNeed, getNeeds, deleteNeed, updateNeed } = require('../controllers/needController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createNeed);
router.get('/', getNeeds);

// ✅ NEW
router.patch('/:id', updateNeed);

router.delete('/:id', deleteNeed);

module.exports = router;
