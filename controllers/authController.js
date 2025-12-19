// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const normalizeEmail = (email) => email.toLowerCase().trim();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// REGISTER
const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    console.log('Register body:', req.body);

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' });
    }

    email = normalizeEmail(email);
    password = password.trim();

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ⚠️ Do NOT hash here. Let User.js pre('save') do it.
    const user = new User({
      name: name.trim(),
      email,
      password, // plain for now – will be hashed in the model hook
    });

    await user.save();

    return res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    console.log('Login body:', req.body);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    email = normalizeEmail(email);
    password = password.trim();

    const user = await User.findOne({ email });

    if (!user) {
      console.log('Login: user not found for email', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Login bcrypt result for', email, '=', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    return res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PROFILE
const getProfile = async (req, res) => {
  try {
    return res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    let { email, newPassword } = req.body;

    console.log('Reset body:', req.body);

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Email and new password are required' });
    }

    email = normalizeEmail(email);
    newPassword = newPassword.trim();

    const user = await User.findOne({ email });

    if (!user) {
      console.log('Reset: user not found for email', email);
      return res.status(404).json({ message: 'User not found' });
    }

    // ⚠️ Again, do NOT hash here. Just assign:
    user.password = newPassword;
    await user.save(); // User.js pre('save') will hash it

    // sanity check
    const ok = await bcrypt.compare(newPassword, user.password);
    console.log('Reset: bcrypt check after save for', email, '=', ok);

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  resetPassword,
};
