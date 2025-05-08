// db.js
// This file sets up the MySQL connection using mysql2 for the expense tracker backend.

const mysql = require('mysql2/promise');

// Create a connection pool for efficient query handling
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'Asmit',
    password: process.env.DB_PASSWORD || '9336',
    database: process.env.DB_NAME || 'expense_tracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool; 