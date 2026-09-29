// server.js
require('dotenv').config();
const express = require('express');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const academicRoutes = require('./routes/academicRoutes');
const profileRoutes = require('./routes/profileRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'public', 'index.html'));
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Database connected! Server time: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database connection failed');
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/academic-records', academicRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);

// Vercel imports the Express app directly.
// Only start a local server when running this file outside Vercel.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;