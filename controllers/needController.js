// controllers/needController.js
const Need = require('../models/Need');

exports.createNeed = async (req, res) => {
  try {
    const { name, price, notes } = req.body;

    if (!name || price == null) {
      return res
        .status(400)
        .json({ message: 'Name and price are required.' });
    }

    const need = await Need.create({
      user: req.user._id,
      name,
      price,
      notes,
    });

    res.status(201).json(need);
  } catch (err) {
    console.error('Create need error:', err);
    res.status(500).json({ message: 'Failed to create need.' });
  }
};

exports.getNeeds = async (req, res) => {
  try {
    const needs = await Need.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(needs);
  } catch (err) {
    console.error('Get needs error:', err);
    res.status(500).json({ message: 'Failed to fetch needs.' });
  }
};

exports.deleteNeed = async (req, res) => {
  try {
    const { id } = req.params;

    const need = await Need.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!need) {
      return res.status(404).json({ message: 'Need not found.' });
    }

    res.json({ message: 'Need deleted.' });
  } catch (err) {
    console.error('Delete need error:', err);
    res.status(500).json({ message: 'Failed to delete need.' });
  }
};
