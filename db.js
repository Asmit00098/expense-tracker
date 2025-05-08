// db.js
// This file sets up the MySQL connection using mysql2 for the expense tracker backend.

const mysql = require('mysql2/promise');

// Create a connection pool for efficient query handling
const pool = mysql.createPool({
  host: 'localhost',      // MySQL server address
  user: 'Asmit',           // Your MySQL username
  password: '9336',           // Your MySQL password
  database: 'expense_tracker', // The database name you created
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool; 