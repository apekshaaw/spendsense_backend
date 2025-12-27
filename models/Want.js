// models/Want.js
const mongoose = require('mongoose');

const wantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    // when to remind the user about this temptation
    remindAt: {
      type: Date,
    },
    // pending = waiting, purchased = they bought it, skipped = they resisted
    status: {
      type: String,
      enum: ['pending', 'purchased', 'skipped'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// IMPORTANT: use existing model if it’s already compiled to avoid OverwriteModelError
module.exports = mongoose.models.Want || mongoose.model('Want', wantSchema);