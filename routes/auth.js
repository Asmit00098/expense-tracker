// routes/auth.js
// Handles user signup and login with JWT authentication

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Export a function so we can inject the JWT secret from server.js
module.exports = (JWT_SECRET) => {
  const router = express.Router();

  // POST /auth/signup
  // Registers a new user
  router.post('/signup', async (req, res) => {
    console.log('Signup request received:', req.body);
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }
    try {
      // Check if email already exists
      const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      // Hash the password
      const hash = await bcrypt.hash(password, 10);
      // Insert user
      const [result] = await pool.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
      // Issue JWT
      const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '2h' });
      res.status(201).json({ token, user: { name, email } });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // POST /auth/login
  // Authenticates a user and returns a JWT
  router.post('/login', async (req, res) => {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }
    try {
      // Find user by email
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      console.log('User found:', rows.length > 0);
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const user = rows[0];
      // Compare password
      const match = await bcrypt.compare(password, user.password_hash);
      console.log('Password match:', match);
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      // Issue JWT
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
      res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
}; 