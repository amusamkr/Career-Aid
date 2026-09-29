// models/notificationModel.js
const pool = require('../config/db');

async function createNotification(message) {
  const result = await pool.query(
    `INSERT INTO AdminNotifications (message) VALUES ($1) RETURNING *`,
    [message]
  );
  return result.rows[0];
}

async function getNotifications() {
  const result = await pool.query(
    `SELECT * FROM AdminNotifications ORDER BY created_at DESC LIMIT 50`
  );
  return result.rows;
}

async function getUnreadCount() {
  const result = await pool.query(
    `SELECT COUNT(*) FROM AdminNotifications WHERE is_read = FALSE`
  );
  return Number(result.rows[0].count);
}

async function markAllRead() {
  await pool.query(`UPDATE AdminNotifications SET is_read = TRUE WHERE is_read = FALSE`);
}

module.exports = { createNotification, getNotifications, getUnreadCount, markAllRead };