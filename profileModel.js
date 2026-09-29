// models/profileModel.js
const pool = require('../config/db');

async function createProfile(userId, preferredField) {
  const result = await pool.query(
    `INSERT INTO NonAcademicProfile (user_id, preferred_field)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, preferredField]
  );
  return result.rows[0];
}

async function updateProfileField(profileId, preferredField) {
  const result = await pool.query(
    `UPDATE NonAcademicProfile SET preferred_field = $1 WHERE profile_id = $2 RETURNING *`,
    [preferredField, profileId]
  );
  return result.rows[0];
}

async function updateAptitudeCategory(profileId, aptitudeCategory) {
  const result = await pool.query(
    `UPDATE NonAcademicProfile SET aptitude_category = $1 WHERE profile_id = $2 RETURNING *`,
    [aptitudeCategory, profileId]
  );
  return result.rows[0];
}

async function deleteAnswersForProfile(profileId) {
  await pool.query(`DELETE FROM AptitudeAnswers WHERE profile_id = $1`, [profileId]);
}

async function saveAnswer(profileId, questionNumber, questionText, selectedAnswer) {
  const result = await pool.query(
    `INSERT INTO AptitudeAnswers (profile_id, question_number, question_text, selected_answer)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [profileId, questionNumber, questionText, selectedAnswer]
  );
  return result.rows[0];
}

async function getProfileByUser(userId) {
  const result = await pool.query(
    `SELECT * FROM NonAcademicProfile WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
}

async function getAnswersByProfile(profileId) {
  const result = await pool.query(
    `SELECT question_number, question_text, selected_answer FROM AptitudeAnswers WHERE profile_id = $1 ORDER BY question_number`,
    [profileId]
  );
  return result.rows;
}

module.exports = {
  createProfile,
  updateProfileField,
  updateAptitudeCategory,
  deleteAnswersForProfile,
  saveAnswer,
  getProfileByUser,
  getAnswersByProfile,
};

