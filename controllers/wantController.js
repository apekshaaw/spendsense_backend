// controllers/wantController.js
const Want = require('../models/Want');

// helper to compute remindAt from remindAfterMinutes
const computeRemindAt = ({ remindAt, remindAfterMinutes }) => {
  if (remindAt === null) return null; // allow clearing
  if (remindAt) return new Date(remindAt);

  if (remindAfterMinutes != null) {
    const mins = Number(remindAfterMinutes);
    if (!Number.isNaN(mins) && mins > 0) {
      return new Date(Date.now() + mins * 60 * 1000);
    }
  }
  return undefined; // leave unchanged / not set
};

// CREATE – POST /api/wants
const createWant = async (req, res) => {
  try {
    const { name, price, notes, remindAt, remindAfterMinutes } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ message: 'Name and price are required.' });
    }

    const finalRemindAt = computeRemindAt({ remindAt, remindAfterMinutes });

    const want = await Want.create({
      user: req.user._id,
      name,
      price,
      notes,
      ...(finalRemindAt === null ? { remindAt: undefined } : finalRemindAt ? { remindAt: finalRemindAt } : {}),
    });

    res.status(201).json(want);
  } catch (err) {
    console.error('Create want error:', err);
    res.status(500).json({ message: 'Failed to create want.' });
  }
};

// READ – GET /api/wants
const getWants = async (req, res) => {
  try {
    const wants = await Want.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(wants);
  } catch (err) {
    console.error('Get wants error:', err);
    res.status(500).json({ message: 'Failed to fetch wants.' });
  }
};

// ✅ NEW: UPDATE DETAILS – PATCH /api/wants/:id
// body can include: { name, price, notes, remindAt OR remindAfterMinutes }
const updateWant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, notes, remindAt, remindAfterMinutes } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = price;
    if (notes !== undefined) updates.notes = notes;

    const finalRemindAt = computeRemindAt({ remindAt, remindAfterMinutes });
    if (finalRemindAt === null) updates.remindAt = undefined; // clear
    if (finalRemindAt instanceof Date) updates.remindAt = finalRemindAt;

    const updated = await Want.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Want not found.' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Update want error:', err);
    res.status(500).json({ message: 'Failed to update want.' });
  }
};

// UPDATE STATUS – PATCH /api/wants/:id/status
const updateWantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'purchased', 'skipped'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const want = await Want.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { status },
      { new: true }
    );

    if (!want) {
      return res.status(404).json({ message: 'Want not found.' });
    }

    res.json(want);
  } catch (err) {
    console.error('Update want status error:', err);
    res.status(500).json({ message: 'Failed to update want status.' });
  }
};

// DELETE – DELETE /api/wants/:id
const deleteWant = async (req, res) => {
  try {
    const { id } = req.params;

    const want = await Want.findOneAndDelete({ _id: id, user: req.user._id });

    if (!want) {
      return res.status(404).json({ message: 'Want not found.' });
    }

    res.json({ message: 'Want deleted.' });
  } catch (err) {
    console.error('Delete want error:', err);
    res.status(500).json({ message: 'Failed to delete want.' });
  }
};

module.exports = {
  createWant,
  getWants,
  updateWant,       // ✅ NEW export
  updateWantStatus,
  deleteWant,
};
