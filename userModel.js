// models/userModel.js
const pool = require('../config/db');

async function createUser(fullName, email, passwordHash, gender) {
  const result = await pool.query(
    `INSERT INTO Users (full_name, email, password_hash, gender)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, full_name, email, role, gender, created_at`,
    [fullName, email, passwordHash, gender]
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM Users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

async function setResetToken(email, token, expiry) {
  const result = await pool.query(
    `UPDATE Users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3 RETURNING user_id, email`,
    [token, expiry, email]
  );
  return result.rows[0];
}

async function findUserByResetToken(token) {
  const result = await pool.query(
    `SELECT * FROM Users WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
    [token]
  );
  return result.rows[0];
}

async function updatePasswordAndClearToken(userId, passwordHash) {
  const result = await pool.query(
    `UPDATE Users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = $2 RETURNING user_id`,
    [passwordHash, userId]
  );
  return result.rows[0];
}
module.exports = { createUser, findUserByEmail, setResetToken, findUserByResetToken, updatePasswordAndClearToken };