// controllers/goalController.js
const Goal = require('../models/Goal');

// POST /api/goals  -> create or replace the user's main goal
exports.createOrUpdateGoal = async (req, res) => {
  try {
    const { name, targetAmount, notes } = req.body;

    if (!name || targetAmount == null) {
      return res
        .status(400)
        .json({ message: 'Goal name and target amount are required.' });
    }

    const goal = await Goal.findOneAndUpdate(
      { user: req.user._id },
      {
        name,
        targetAmount,
        notes,
      },
      {
        new: true,
        upsert: true, // create if it doesn't exist
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json(goal);
  } catch (err) {
    console.error('Create/update goal error:', err);
    res.status(500).json({ message: 'Failed to save goal.' });
  }
};

// GET /api/goals/me -> get current user's goal (for Home + Goal Details)
exports.getMyGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'No goal set yet.' });
    }

    res.json(goal);
  } catch (err) {
    console.error('Get my goal error:', err);
    res.status(500).json({ message: 'Failed to fetch goal.' });
  }
};

// PATCH /api/goals/me/progress -> add or subtract amount
// body: { amount: 50, type: 'saved' }  or  { amount: 20, type: 'spent' }
exports.updateGoalProgress = async (req, res) => {
  try {
    const { amount, type, note } = req.body;

    if (!amount || !['saved', 'spent'].includes(type)) {
      return res.status(400).json({ message: 'Amount and valid type required.' });
    }

    const goal = await Goal.findOne({ user: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'No goal set yet.' });
    }

    let newAmount = goal.currentAmount;
    if (type === 'saved') {
      newAmount += amount;
    } else {
      newAmount -= amount;
      if (newAmount < 0) newAmount = 0;
    }

    goal.currentAmount = newAmount;
    goal.entries.unshift({
      amount,
      type,
      note,
    });

    await goal.save();

    res.json(goal);
  } catch (err) {
    console.error('Update goal progress error:', err);
    res.status(500).json({ message: 'Failed to update goal.' });
  }
};

// PATCH /api/goals/me  -> edit name/target/notes only
exports.editMyGoal = async (req, res) => {
  try {
    const { name, targetAmount, notes } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (targetAmount != null) updates.targetAmount = targetAmount;
    if (notes !== undefined) updates.notes = notes;

    const goal = await Goal.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'No goal set yet.' });
    }

    res.json(goal);
  } catch (err) {
    console.error('Edit goal error:', err);
    res.status(500).json({ message: 'Failed to edit goal.' });
  }
};
