const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// 1. REGISTER: POST /api/auth/register
const register = async (req, res) => {
  try {
    const { fullName, phone, password, role } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Ce numéro de téléphone est déjà utilisé.' });
    }

    const user = await User.create({
      fullName,
      phone,
      password,
      role: role || 'customer',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. LOGIN: POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Veuillez renseigner le téléphone et le mot de passe.' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };