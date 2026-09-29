// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { getQuiz, submitProfile, getMyProfile } = require('../controllers/profileController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/quiz', getQuiz);
router.post('/', verifyToken, submitProfile);
router.get('/', verifyToken, getMyProfile);

module.exports = router;