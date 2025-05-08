// server.js
// Main entry point for the Expense Tracker backend

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const paymentMethodsRoutes = require('./routes/paymentMethods');
const expensesRoutes = require('./routes/expenses');
const budgetsRoutes = require('./routes/budgets');
const summaryRoutes = require('./routes/summary');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Log environment variables (excluding sensitive data)
console.log('Environment check:', {
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST ? 'Set' : 'Not set',
    DB_USER: process.env.DB_USER ? 'Set' : 'Not set',
    DB_NAME: process.env.DB_NAME ? 'Set' : 'Not set',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Enable CORS for all origins (for development)
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// JWT authentication middleware
// This checks for a valid JWT in the Authorization header for protected routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: 'Bearer <token>'
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user; // Attach user info to request
    next();
  });
}

// Public routes (signup, login)
app.use('/auth', authRoutes(JWT_SECRET));

// Protected routes (require JWT)
app.use('/categories', authenticateToken, categoriesRoutes);
app.use('/payment-methods', authenticateToken, paymentMethodsRoutes);
app.use('/expenses', authenticateToken, expensesRoutes);
app.use('/budgets', authenticateToken, budgetsRoutes);
app.use('/summary', authenticateToken, summaryRoutes);

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 