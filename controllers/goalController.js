// controllers/goalController.js
const Goal = require("../models/Goal");
const GoalHistory = require("../models/GoalHistory");

// POST /api/goals  -> create or replace the user's main goal
// body: { name, targetAmount, notes, resetProgress?: true }
exports.createOrUpdateGoal = async (req, res) => {
  try {
    const { name, targetAmount, notes, resetProgress } = req.body;

    if (!name || targetAmount == null) {
      return res
        .status(400)
        .json({ message: "Goal name and target amount are required." });
    }

    const parsedTarget = Number(targetAmount);
    if (Number.isNaN(parsedTarget) || parsedTarget <= 0) {
      return res.status(400).json({ message: "Target amount must be valid." });
    }

    // Find existing goal first (so we can archive it if needed)
    const existing = await Goal.findOne({ user: req.user._id });

    // ✅ If they are setting a NEW goal and want to reset progress:
    // archive old progress + reset goal
    if (existing && resetProgress === true) {
      await GoalHistory.create({
        user: req.user._id,
        name: existing.name,
        targetAmount: existing.targetAmount,
        finalAmount: existing.currentAmount,
        notes: existing.notes,
        status:
          existing.currentAmount >= existing.targetAmount ? "completed" : "replaced",
        completedAt: new Date(),
        entries: existing.entries || [],
      });

      existing.name = name;
      existing.targetAmount = parsedTarget;
      existing.notes = notes;

      // ✅ Reset for the new goal
      existing.currentAmount = 0;
      existing.entries = [];

      await existing.save();
      return res.status(200).json(existing);
    }

    // ✅ If resetProgress is true but no existing goal, just create normally
    // (prevents weird behavior)
    const goal = await Goal.findOneAndUpdate(
      { user: req.user._id },
      { name, targetAmount: parsedTarget, notes },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json(goal);
  } catch (err) {
    console.error("Create/update goal error:", err);
    res.status(500).json({ message: "Failed to save goal." });
  }
};

// GET /api/goals/me -> current goal
exports.getMyGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: "No goal set yet." });
    }

    res.json(goal);
  } catch (err) {
    console.error("Get my goal error:", err);
    res.status(500).json({ message: "Failed to fetch goal." });
  }
};

// GET /api/goals/history -> list history (latest first)
exports.getMyGoalHistory = async (req, res) => {
  try {
    const history = await GoalHistory.find({ user: req.user._id })
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(50);

    res.json(history);
  } catch (err) {
    console.error("Get goal history error:", err);
    res.status(500).json({ message: "Failed to fetch goal history." });
  }
};

// PATCH /api/goals/me/progress -> add or subtract amount
exports.updateGoalProgress = async (req, res) => {
  try {
    const { amount, type, note } = req.body;

    if (!amount || !["saved", "spent"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Amount and valid type required." });
    }

    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      return res.status(400).json({ message: "Amount must be valid." });
    }

    const goal = await Goal.findOne({ user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: "No goal set yet." });
    }

    let newAmount = goal.currentAmount;
    if (type === "saved") {
      newAmount += parsed;
    } else {
      newAmount -= parsed;
      if (newAmount < 0) newAmount = 0;
    }

    goal.currentAmount = newAmount;
    goal.entries.unshift({ amount: parsed, type, note });

    await goal.save();

    res.json(goal);
  } catch (err) {
    console.error("Update goal progress error:", err);
    res.status(500).json({ message: "Failed to update goal." });
  }
};

// PATCH /api/goals/me -> edit goal details only
exports.editMyGoal = async (req, res) => {
  try {
    const { name, targetAmount, notes } = req.body;

    const updates = {};
    if (name) updates.name = name;

    if (targetAmount != null) {
      const parsedTarget = Number(targetAmount);
      if (Number.isNaN(parsedTarget) || parsedTarget <= 0) {
        return res.status(400).json({ message: "Target amount must be valid." });
      }
      updates.targetAmount = parsedTarget;
    }

    if (notes !== undefined) updates.notes = notes;

    const goal = await Goal.findOneAndUpdate({ user: req.user._id }, updates, {
      new: true,
    });

    if (!goal) {
      return res.status(404).json({ message: "No goal set yet." });
    }

    res.json(goal);
  } catch (err) {
    console.error("Edit goal error:", err);
    res.status(500).json({ message: "Failed to edit goal." });
  }
};
