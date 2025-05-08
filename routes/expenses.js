// routes/expenses.js
// Handles expense listing and creation for the logged-in user

const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /expenses?month=YYYY-MM
// Returns all expenses for the user in the given month, with category and payment method names
router.get('/', async (req, res) => {
  const { month } = req.query; // Format: YYYY-MM
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const targetMonth = month || currentMonth;

  try {
    // SQL JOIN to get category and payment method names
    const [rows] = await pool.query(
      `SELECT e.id, e.amount, e.date, e.description, 
              c.name AS category, pm.method AS payment_method
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       JOIN payment_methods pm ON e.payment_method_id = pm.id
       WHERE e.user_id = ? AND DATE_FORMAT(e.date, '%Y-%m') = ?
       ORDER BY e.date DESC`,
      [req.user.id, targetMonth]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /expenses
// Adds a new expense for the logged-in user
router.post('/', async (req, res) => {
  const { category_id, amount, date, description, payment_method_id } = req.body;
  if (!category_id || !amount || !date || !payment_method_id) {
    return res.status(400).json({ message: 'All fields except description are required' });
  }
  try {
    // Insert new expense for this user
    const [result] = await pool.query(
      'INSERT INTO expenses (user_id, category_id, amount, date, description, payment_method_id) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, category_id, amount, date, description || '', payment_method_id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /expenses/:id
// Deletes an expense for the logged-in user
router.delete('/:id', async (req, res) => {
  try {
    // Delete the expense if it belongs to the user
    const [result] = await pool.query(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 