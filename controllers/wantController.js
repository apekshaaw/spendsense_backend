// controllers/wantController.js
const Want = require('../models/Want');

// CREATE – POST /api/wants  -> log a temptation
const createWant = async (req, res) => {
  try {
    const { name, price, notes, remindAt } = req.body;

    if (!name || price == null) {
      return res
        .status(400)
        .json({ message: 'Name and price are required.' });
    }

    const want = await Want.create({
      user: req.user._id,
      name,
      price,
      notes,
      remindAt: remindAt ? new Date(remindAt) : undefined,
    });

    res.status(201).json(want);
  } catch (err) {
    console.error('Create want error:', err);
    res.status(500).json({ message: 'Failed to create want.' });
  }
};

// READ – GET /api/wants  -> list all wants for logged-in user
const getWants = async (req, res) => {
  try {
    const wants = await Want.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(wants);
  } catch (err) {
    console.error('Get wants error:', err);
    res.status(500).json({ message: 'Failed to fetch wants.' });
  }
};

// UPDATE STATUS – PATCH /api/wants/:id/status
// body: { status: 'pending' | 'purchased' | 'skipped' }
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
    res.status(500).json({ message: 'Failed to update want.' });
  }
};

// DELETE – DELETE /api/wants/:id
const deleteWant = async (req, res) => {
  try {
    const { id } = req.params;

    const want = await Want.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

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
  updateWantStatus,
  deleteWant,
};
