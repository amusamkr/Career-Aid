// routes/academicRoutes.js
const express = require('express');
const router = express.Router();
const { submitRecords, getMyRecords } = require('../controllers/academicController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, submitRecords);
router.get('/', verifyToken, getMyRecords);

module.exports = router;
