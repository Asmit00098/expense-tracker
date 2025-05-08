// routes/categories.js
// Handles category listing and creation for the logged-in user

const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /categories
// Returns all categories for the logged-in user
router.get('/', async (req, res) => {
  try {
    // Only fetch categories belonging to the current user
    const [rows] = await pool.query('SELECT id, name FROM categories WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /categories
// Adds a new category for the logged-in user
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Category name required' });
  }
  try {
    // Insert new category for this user
    const [result] = await pool.query('INSERT INTO categories (user_id, name) VALUES (?, ?)', [req.user.id, name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /categories/:id
// Deletes a category for the logged-in user
router.delete('/:id', async (req, res) => {
  try {
    // First check if the category is being used in any expenses or budgets
    const [expenses] = await pool.query(
      'SELECT COUNT(*) as count FROM expenses WHERE category_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    const [budgets] = await pool.query(
      'SELECT COUNT(*) as count FROM budgets WHERE category_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (expenses[0].count > 0 || budgets[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that is being used in expenses or budgets' 
      });
    }

    // Delete the category if it belongs to the user
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found or unauthorized' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 