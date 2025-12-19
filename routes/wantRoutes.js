// routes/wantRoutes.js
const express = require('express');
const {
  createWant,
  getWants,
  updateWantStatus,
  deleteWant,
} = require('../controllers/wantController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All /api/wants routes require auth
router.use(protect);

// POST /api/wants        -> create a want
router.post('/', createWant);

// GET /api/wants         -> list wants
router.get('/', getWants);

// PATCH /api/wants/:id/status   -> change pending/purchased/skipped
router.patch('/:id/status', updateWantStatus);

// DELETE /api/wants/:id  -> delete want
router.delete('/:id', deleteWant);

module.exports = router;
