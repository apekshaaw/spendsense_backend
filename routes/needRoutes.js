// routes/needRoutes.js
const express = require('express');
const {
  createNeed,
  getNeeds,
  deleteNeed,
} = require('../controllers/needController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// all need routes require login
router.use(protect);

router.post('/', createNeed);    // POST /api/needs
router.get('/', getNeeds);       // GET  /api/needs
router.delete('/:id', deleteNeed); // DELETE /api/needs/:id

module.exports = router;
