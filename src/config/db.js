const mysql = require('mysql2/promise');

const isCloud = process.env.DB_HOST?.includes('/cloudsql/');

const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: undefined,
  ...(isCloud
    ? {
        socketPath: process.env.DB_HOST
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT
      }),

  // 🔥 SOLUCIÓN REAL
  ssl: isCloud ? false : false,
  enableKeepAlive: true,
  connectTimeout: 10000
});