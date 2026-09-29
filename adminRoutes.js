// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
  listCourses,
  addCourse,
  editCourse,
  removeCourse,
  getStats,
  listNotifications,
  markNotificationsRead,
} = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');

router.use(verifyToken, requireAdmin);

router.get('/stats', getStats);
router.get('/courses', listCourses);
router.post('/courses', addCourse);
router.put('/courses/:courseId', editCourse);
router.delete('/courses/:courseId', removeCourse);
router.get('/notifications', listNotifications);
router.post('/notifications/mark-read', markNotificationsRead);

module.exports = router;