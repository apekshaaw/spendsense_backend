// routes/goalRoutes.js
const express = require("express");
const {
  createOrUpdateGoal,
  getMyGoal,
  updateGoalProgress,
  editMyGoal,
  getMyGoalHistory,
} = require("../controllers/goalController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", createOrUpdateGoal);
router.get("/me", getMyGoal);
router.patch("/me", editMyGoal);
router.patch("/me/progress", updateGoalProgress);

router.get("/history", getMyGoalHistory);

module.exports = router;
