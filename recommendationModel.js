// models/recommendationModel.js
const pool = require('../config/db');

async function createBatch(userId, preferredField, aptitudeCategory, academicSnapshot, quizSnapshot) {
  const result = await pool.query(
    `INSERT INTO RecommendationBatches (user_id, preferred_field, aptitude_category, academic_snapshot, quiz_snapshot)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, preferredField, aptitudeCategory, JSON.stringify(academicSnapshot), JSON.stringify(quizSnapshot)]
  );
  return result.rows[0];
}

async function saveRecommendation(batchId, userId, rec) {
  const result = await pool.query(
    `INSERT INTO Recommendations
      (batch_id, user_id, course_id, academic_match_score, aspiration_match_score, aptitude_match_score, overall_score, ai_explanation)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [batchId, userId, rec.course_id, rec.academic_match_score, rec.aspiration_match_score, rec.aptitude_match_score, rec.overall_score, rec.ai_explanation]
  );
  return result.rows[0];
}

async function getBatchesByUser(userId) {
  const batches = await pool.query(
    `SELECT * FROM RecommendationBatches WHERE user_id = $1 ORDER BY created_at ASC`,
    [userId]
  );

  const results = [];
  for (const batch of batches.rows) {
    const recs = await pool.query(
      `SELECT r.*, c.course_name, c.faculty
       FROM Recommendations r
       JOIN Courses c ON c.course_id = r.course_id
       WHERE r.batch_id = $1
       ORDER BY r.overall_score DESC`,
      [batch.batch_id]
    );
    results.push({ ...batch, recommendations: recs.rows });
  }

  return results;
}

async function deleteBatch(batchId, userId) {
  const result = await pool.query(
    `DELETE FROM RecommendationBatches WHERE batch_id = $1 AND user_id = $2 RETURNING *`,
    [batchId, userId]
  );
  return result.rows[0];
}

module.exports = { createBatch, saveRecommendation, getBatchesByUser, deleteBatch };