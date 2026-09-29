// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const useConnectionString = Boolean(process.env.DATABASE_URL);

const poolConfig = useConnectionString
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      ...(process.env.DB_SSL === 'true'
        ? { ssl: { rejectUnauthorized: false } }
        : {}),
    };

const pool = new Pool(poolConfig);

module.exports = pool;
