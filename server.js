// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// routes
const authRoutes = require("./routes/authRoutes");
const wantRoutes = require("./routes/wantRoutes");
const needRoutes = require("./routes/needRoutes");
const goalRoutes = require("./routes/goalRoutes");

dotenv.config();
console.log("ENV PORT:", process.env.PORT);

const app = express();

// Middlewares
app.use(cors());

// ✅ IMPORTANT: allow base64 avatar in JSON
app.use(express.json({ limit: "10mb" }));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "SpendSense API is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/wants", wantRoutes);
app.use("/api/needs", needRoutes);
app.use("/api/goals", goalRoutes);

// Port
const PORT = Number(process.env.PORT) || 5001;
console.log("USING PORT:", PORT);

// Start server (connect DB first)
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
