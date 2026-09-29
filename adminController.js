// controllers/adminController.js
const {
  getCoursesForAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  createRequirement,
  updateRequirement,
} = require('../models/courseModel');
const { getAdminStats } = require('../models/statsModel');
const { getNotifications, getUnreadCount, markAllRead } = require('../models/notificationModel');

async function listCourses(req, res) {
  try {
    const courses = await getCoursesForAdmin();
    res.status(200).json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function addCourse(req, res) {
  try {
    const { courseName, university, faculty, department, relatedAptitudeCategory, requiredSubjects, minGrade } = req.body;

    if (!courseName || !department || !requiredSubjects || !minGrade) {
      return res.status(400).json({ error: 'courseName, department, requiredSubjects, and minGrade are required' });
    }

    const course = await createCourse(courseName, university, faculty, department, relatedAptitudeCategory);
    const requirement = await createRequirement(course.course_id, requiredSubjects, minGrade);

    res.status(201).json({ message: 'Course added', course, requirement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function editCourse(req, res) {
  try {
    const { courseId } = req.params;
    const { courseName, university, faculty, department, relatedAptitudeCategory, requirementId, requiredSubjects, minGrade } = req.body;

    const updated = await updateCourse(courseId, courseName, university, faculty, department, relatedAptitudeCategory);
    if (!updated) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let updatedRequirement = null;
    if (requirementId && requiredSubjects && minGrade) {
      updatedRequirement = await updateRequirement(requirementId, requiredSubjects, minGrade);
    }

    res.status(200).json({ message: 'Course updated', course: updated, requirement: updatedRequirement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function removeCourse(req, res) {
  try {
    const { courseId } = req.params;
    const deleted = await deleteCourse(courseId);
    if (!deleted) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted', course: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getStats(req, res) {
  try {
    const stats = await getAdminStats();
    res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function listNotifications(req, res) {
  try {
    const notifications = await getNotifications();
    const unreadCount = await getUnreadCount();
    res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function markNotificationsRead(req, res) {
  try {
    await markAllRead();
    res.status(200).json({ message: 'Marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = {
  listCourses,
  addCourse,
  editCourse,
  removeCourse,
  getStats,
  listNotifications,
  markNotificationsRead,
};