// routes/budgets.js
// Handles budget listing and creation for the logged-in user

const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /budgets?month=YYYY-MM
// Returns each category's budget limit and spent so far for the given month
router.get('/', async (req, res) => {
  const { month } = req.query;
  if (!month) {
    return res.status(400).json({ message: 'Month is required (YYYY-MM)' });
  }
  try {
    // SQL JOIN to get budget, category name, and sum of expenses for the month
    const [rows] = await pool.query(
      `SELECT b.id AS budget_id, c.id AS category_id, c.name AS category, 
              b.amount_limit, b.month,
              IFNULL(SUM(e.amount), 0) AS spent
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       LEFT JOIN expenses e ON e.category_id = c.id 
           AND e.user_id = b.user_id 
           AND DATE_FORMAT(e.date, '%Y-%m') = b.month
       WHERE b.user_id = ? AND b.month = ?
       GROUP BY b.id, c.id, c.name, b.amount_limit, b.month`,
      [req.user.id, month]
    );
    console.log('Budgets query result:', rows); // Debug log
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /budgets
// Adds a new budget for the logged-in user
router.post('/', async (req, res) => {
  const { category_id, amount_limit, month } = req.body;
  if (!category_id || !amount_limit || !month) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    // Insert new budget for this user
    const [result] = await pool.query(
      'INSERT INTO budgets (user_id, category_id, amount_limit, month) VALUES (?, ?, ?, ?)',
      [req.user.id, category_id, amount_limit, month]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /budgets/:id
// Deletes a budget for the logged-in user
router.delete('/:id', async (req, res) => {
  try {
    // Delete the budget if it belongs to the user
    const [result] = await pool.query(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Budget not found or unauthorized' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 