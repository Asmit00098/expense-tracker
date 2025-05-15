// db.js
// This file sets up the MySQL connection using mysql2 for the expense tracker backend.
require('dotenv').config();

const mysql = require('mysql2/promise');

// Log database configuration (excluding sensitive data)
console.log('Database configuration:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'Asmit',
    database: process.env.DB_NAME || 'expense_tracker',
    connectionLimit: 10
});

// Create a connection pool for efficient query handling
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'Asmit',
    password: process.env.DB_PASSWORD || '9336',
    database: process.env.DB_NAME || 'expense_tracker',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, // 10 seconds
    acquireTimeout: 10000, // 10 seconds
    timeout: 10000, // 10 seconds
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
        console.error('Error details:', {
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            sqlMessage: err.sqlMessage
        });
    });

module.exports = pool; 