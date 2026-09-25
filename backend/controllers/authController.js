const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, constituency, designation } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // Build user data — NEVER send empty constituency to MongoDB
    const userData = { name, email, password, role: role || 'citizen' };

    if (role === 'authority') {
      if (!constituency) {
        return res.status(400).json({ message: 'Constituency is required for authorities' });
      }
      userData.constituency = constituency;
      if (designation) userData.designation = designation;
    }
    // Citizens — do NOT include constituency at all

    const user = await User.create(userData);

    res.status(201).json({
      _id:          user._id,
      name:         user.name,
      email:        user.email,
      role:         user.role,
      constituency: user.constituency,
      designation:  user.designation,
      token:        generateToken(user._id),
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id:          user._id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        constituency: user.constituency,
        designation:  user.designation,
        createdAt:    user.createdAt,
        token:        generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };