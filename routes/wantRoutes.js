// routes/wantRoutes.js
const express = require('express');
const {
  createWant,
  getWants,
  updateWant,        // ✅ NEW
  updateWantStatus,
  deleteWant,
} = require('../controllers/wantController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createWant);
router.get('/', getWants);

// ✅ NEW: edit want details
router.patch('/:id', updateWant);

router.patch('/:id/status', updateWantStatus);
router.delete('/:id', deleteWant);

module.exports = router;
