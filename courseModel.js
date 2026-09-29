// models/courseModel.js
const pool = require('../config/db');

async function getCoursesWithRequirements() {
  const result = await pool.query(`
    SELECT c.course_id, c.course_name, c.university, c.faculty, c.department, c.related_aptitude_category,
           sr.required_subjects, sr.min_grade
    FROM Courses c
    JOIN SubjectRequirements sr ON sr.course_id = c.course_id
  `);

  return result.rows.map(row => ({
    course_id: row.course_id,
    course_name: row.course_name,
    university: row.university,
    faculty: row.faculty,
    department: row.department,
    related_aptitude_category: row.related_aptitude_category,
    requirement: {
      required_subjects: row.required_subjects,
      min_grade: row.min_grade,
    },
  }));
}

async function getAllCourses() {
  const result = await pool.query(`SELECT * FROM Courses ORDER BY course_id`);
  return result.rows;
}

async function getCoursesForAdmin() {
  const result = await pool.query(`
    SELECT c.course_id, c.course_name, c.university, c.faculty, c.department, c.related_aptitude_category,
           sr.requirement_id, sr.required_subjects, sr.min_grade
    FROM Courses c
    LEFT JOIN SubjectRequirements sr ON sr.course_id = c.course_id
    ORDER BY c.course_id
  `);
  return result.rows;
}

async function createCourse(courseName, university, faculty, department, relatedAptitudeCategory) {
  const result = await pool.query(
    `INSERT INTO Courses (course_name, university, faculty, department, related_aptitude_category)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [courseName, university, faculty, department, relatedAptitudeCategory]
  );
  return result.rows[0];
}

async function updateCourse(courseId, courseName, university, faculty, department, relatedAptitudeCategory) {
  const result = await pool.query(
    `UPDATE Courses SET course_name = $1, university = $2, faculty = $3, department = $4, related_aptitude_category = $5
     WHERE course_id = $6 RETURNING *`,
    [courseName, university, faculty, department, relatedAptitudeCategory, courseId]
  );
  return result.rows[0];
}

async function deleteCourse(courseId) {
  const result = await pool.query(`DELETE FROM Courses WHERE course_id = $1 RETURNING *`, [courseId]);
  return result.rows[0];
}

async function createRequirement(courseId, requiredSubjects, minGrade) {
  const result = await pool.query(
    `INSERT INTO SubjectRequirements (course_id, required_subjects, min_grade)
     VALUES ($1, $2, $3) RETURNING *`,
    [courseId, requiredSubjects, minGrade]
  );
  return result.rows[0];
}

async function updateRequirement(requirementId, requiredSubjects, minGrade) {
  const result = await pool.query(
    `UPDATE SubjectRequirements SET required_subjects = $1, min_grade = $2
     WHERE requirement_id = $3 RETURNING *`,
    [requiredSubjects, minGrade, requirementId]
  );
  return result.rows[0];
}

module.exports = {
  getCoursesWithRequirements,
  getAllCourses,
  getCoursesForAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
  createRequirement,
  updateRequirement,
};