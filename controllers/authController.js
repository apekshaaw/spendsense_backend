// controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

// POST /api/auth/signup
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      phone: phone || "",
      password,
    });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
        darkMode: user.darkMode || false,
      },
    });
  } catch (err) {
    console.error("registerUser error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
        darkMode: user.darkMode || false,
      },
    });
  } catch (err) {
    console.error("loginUser error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and newPassword are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("resetPassword error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/me (protected)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("getProfile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/auth/me (protected)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, avatarUrl, darkMode } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (darkMode !== undefined) updates.darkMode = darkMode;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    console.error("updateProfile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ NEW: POST /api/auth/verify-password (protected)
 * body: { password }
 * returns 200 only if password is correct
 */
exports.verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid password" });

    return res.json({ valid: true });
  } catch (err) {
    console.error("verifyPassword error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ NEW: POST /api/auth/change-password (protected)
 * body: { currentPassword, newPassword }
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword and newPassword are required" });
    }

    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await user.matchPassword(currentPassword);
    if (!ok) return res.status(401).json({ message: "Invalid current password" });

    user.password = newPassword; // model hashes
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ NEW: POST /api/auth/delete-account (protected)
 * body: { password }
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid password" });

    await User.findByIdAndDelete(req.user.id);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("deleteAccount error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
