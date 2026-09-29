// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createNotification } = require('../models/notificationModel');
const { createUser, findUserByEmail, setResetToken, findUserByResetToken, updatePasswordAndClearToken } = require('../models/userModel');

async function register(req, res) {
  try {
    const { fullName, email, password, gender } = req.body;

    if (!fullName || !email || !password || !gender) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser(fullName, email, passwordHash, gender);

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.user_id, fullName: user.full_name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // Don't reveal whether the email exists - just say it succeeded either way
      return res.status(200).json({ message: 'If that email is registered, a reset link has been generated.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    await setResetToken(email, token, expiry);

    const resetLink = `${req.protocol}://${req.get('host')}/reset-password.html?token=${token}`;

    res.status(200).json({
      message: 'Reset link generated. Since email sending is not set up, use the link below.',
      resetLink,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const user = await findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updatePasswordAndClearToken(user.user_id, passwordHash);

    await createNotification(`Password changed for ${user.email}`);

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { register, login, forgotPassword, resetPassword };