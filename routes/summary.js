// routes/summary.js
// Handles summary reporting for the logged-in user

const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /dashboard
// Returns summary data for the dashboard
router.get('/dashboard', async (req, res) => {
    try {
        console.log('Dashboard request received for user:', req.user.id);
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        console.log('Current month:', currentMonth);

        // Get total expenses for current month
        const [expensesResult] = await pool.query(
            `SELECT IFNULL(SUM(amount), 0) as total
             FROM expenses
             WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?`,
            [req.user.id, currentMonth]
        );
        const totalExpenses = Number(expensesResult[0].total);
        console.log('Total expenses:', totalExpenses);

        // Get total budget for current month
        const [budgetResult] = await pool.query(
            `SELECT IFNULL(SUM(amount_limit), 0) as total
             FROM budgets
             WHERE user_id = ? AND month = ?`,
            [req.user.id, currentMonth]
        );
        const totalBudget = Number(budgetResult[0].total);
        console.log('Total budget:', totalBudget);

        // Get expenses by category for current month
        const [categoryData] = await pool.query(
            `SELECT c.name as category, IFNULL(SUM(e.amount), 0) as amount
             FROM categories c
             LEFT JOIN expenses e ON e.category_id = c.id 
             AND e.user_id = c.user_id 
             AND DATE_FORMAT(e.date, '%Y-%m') = ?
             WHERE c.user_id = ?
             GROUP BY c.id, c.name`,
            [currentMonth, req.user.id]
        );
        // Convert amounts to numbers
        const processedCategoryData = categoryData.map(item => ({
            ...item,
            amount: Number(item.amount)
        }));
        console.log('Category data:', processedCategoryData);

        // Get monthly trend (last 6 months)
        const [trendData] = await pool.query(
            `WITH months AS (
                SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL n MONTH), '%Y-%m') as month
                FROM (
                    SELECT 0 as n UNION SELECT 1 UNION SELECT 2 
                    UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
                ) numbers
            )
            SELECT 
                m.month,
                COALESCE((
                    SELECT SUM(amount)
                    FROM expenses
                    WHERE user_id = ?
                    AND DATE_FORMAT(date, '%Y-%m') = m.month
                ), 0) as expenses,
                COALESCE((
                    SELECT SUM(amount_limit)
                    FROM budgets
                    WHERE user_id = ?
                    AND month = m.month
                ), 0) as budget
            FROM months m
            ORDER BY m.month DESC`,
            [req.user.id, req.user.id]
        );
        // Convert amounts to numbers
        const processedTrendData = trendData.map(item => ({
            ...item,
            expenses: Number(item.expenses),
            budget: Number(item.budget)
        }));
        console.log('Trend data:', processedTrendData);

        // Get recent expenses
        const [recentExpenses] = await pool.query(
            `SELECT e.*, c.name as category_name, pm.method as payment_method
             FROM expenses e
             JOIN categories c ON e.category_id = c.id
             JOIN payment_methods pm ON e.payment_method_id = pm.id
             WHERE e.user_id = ?
             ORDER BY e.date DESC
             LIMIT 5`,
            [req.user.id]
        );
        // Convert amounts to numbers
        const processedRecentExpenses = recentExpenses.map(expense => ({
            ...expense,
            amount: Number(expense.amount),
            category: { name: expense.category_name },
            payment_method: { method: expense.payment_method }
        }));
        console.log('Recent expenses:', processedRecentExpenses);

        const response = {
            summary: {
                totalExpenses,
                totalBudget
            },
            categoryData: processedCategoryData,
            trendData: processedTrendData,
            recentExpenses: processedRecentExpenses
        };
        console.log('Sending response:', response);
        res.json(response);
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /summary?month=YYYY-MM
// Returns perCategory and perMethod spending for the given month
router.get('/', async (req, res) => {
  const { month } = req.query;
  if (!month) {
    return res.status(400).json({ message: 'Month is required (YYYY-MM)' });
  }
  try {
    // Per-category: join expenses, categories, budgets
    const [perCategory] = await pool.query(
      `SELECT c.name AS category, IFNULL(SUM(e.amount), 0) AS spent, IFNULL(b.amount_limit, 0) AS limit
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = c.user_id AND DATE_FORMAT(e.date, '%Y-%m') = ?
       LEFT JOIN budgets b ON b.category_id = c.id AND b.user_id = c.user_id AND b.month = ?
       WHERE c.user_id = ?
       GROUP BY c.id, c.name, b.amount_limit`
      , [month, month, req.user.id]
    );
    // Per-method: join expenses, payment_methods
    const [perMethod] = await pool.query(
      `SELECT pm.method, IFNULL(SUM(e.amount), 0) AS spent
       FROM payment_methods pm
       LEFT JOIN expenses e ON e.payment_method_id = pm.id AND e.user_id = pm.user_id AND DATE_FORMAT(e.date, '%Y-%m') = ?
       WHERE pm.user_id = ?
       GROUP BY pm.id, pm.method`
      , [month, req.user.id]
    );
    res.json({ perCategory, perMethod });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 