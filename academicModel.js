// models/academicModel.js
const pool = require('../config/db');

async function deleteRecordsByUser(userId) {
  await pool.query(`DELETE FROM AcademicRecords WHERE user_id = $1`, [userId]);
}

async function addRecord(userId, subjectName, ssClass, score) {
  const result = await pool.query(
    `INSERT INTO AcademicRecords (user_id, subject_name, ss_class, score)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, subjectName, ssClass, score]
  );
  return result.rows[0];
}

async function getRecordsByUser(userId) {
  const result = await pool.query(
    `SELECT * FROM AcademicRecords WHERE user_id = $1 ORDER BY ss_class, subject_name`,
    [userId]
  );
  return result.rows;
}

module.exports = { deleteRecordsByUser, addRecord, getRecordsByUser };