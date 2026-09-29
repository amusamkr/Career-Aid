// models/statsModel.js
const pool = require('../config/db');

async function getAdminStats() {
  const totalStudentsResult = await pool.query(
    `SELECT COUNT(*) FROM Users WHERE role = 'student'`
  );
  const totalAttemptsResult = await pool.query(
    `SELECT COUNT(*) FROM RecommendationBatches`
  );
  const studentsResult = await pool.query(`
    SELECT u.user_id, u.full_name, u.email,
           COUNT(rb.batch_id) AS attempts_count
    FROM Users u
    LEFT JOIN RecommendationBatches rb ON rb.user_id = u.user_id
    WHERE u.role = 'student'
    GROUP BY u.user_id
    ORDER BY u.full_name
  `);

  return {
    totalStudents: Number(totalStudentsResult.rows[0].count),
    totalAttempts: Number(totalAttemptsResult.rows[0].count),
    students: studentsResult.rows.map(s => ({
      ...s,
      attempts_count: Number(s.attempts_count),
    })),
  };
}

module.exports = { getAdminStats };