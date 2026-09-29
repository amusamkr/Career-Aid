// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'You are authenticated!', user: req.user });
});

module.exports = router;