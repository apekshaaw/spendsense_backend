// models/GoalHistory.js
const mongoose = require("mongoose");

const goalEntrySchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    type: { type: String, enum: ["saved", "spent"], required: true },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

const goalHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // snapshot of the previous goal
    name: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },

    status: {
      type: String,
      enum: ["completed", "replaced"],
      default: "replaced",
    },

    completedAt: { type: Date, default: Date.now },

    entries: [goalEntrySchema],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.GoalHistory || mongoose.model("GoalHistory", goalHistorySchema);
