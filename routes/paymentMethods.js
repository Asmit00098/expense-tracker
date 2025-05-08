// routes/paymentMethods.js
// Handles payment method listing and creation for the logged-in user

const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /payment-methods
// Returns all payment methods for the logged-in user
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, method FROM payment_methods WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /payment-methods
// Adds a new payment method for the logged-in user
router.post('/', async (req, res) => {
  const { method } = req.body;
  if (!method) {
    return res.status(400).json({ message: 'Payment method required' });
  }
  try {
    // Insert new payment method for this user
    const [result] = await pool.query('INSERT INTO payment_methods (user_id, method) VALUES (?, ?)', [req.user.id, method]);
    res.status(201).json({ id: result.insertId, method });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /payment-methods/:id
// Deletes a payment method for the logged-in user
router.delete('/:id', async (req, res) => {
  try {
    // First check if the payment method is being used in any expenses
    const [expenses] = await pool.query(
      'SELECT COUNT(*) as count FROM expenses WHERE payment_method_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (expenses[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete payment method that is being used in expenses' 
      });
    }

    // Delete the payment method if it belongs to the user
    const [result] = await pool.query(
      'DELETE FROM payment_methods WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment method not found or unauthorized' });
    }

    res.json({ message: 'Payment method deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 