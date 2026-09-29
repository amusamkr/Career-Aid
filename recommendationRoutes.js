// routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const { generate, getMine, remove } = require('../controllers/recommendationController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/generate', verifyToken, generate);
router.get('/', verifyToken, getMine);
router.delete('/:batchId', verifyToken, remove);

module.exports = router;