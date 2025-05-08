// expenses.js
// Handles expense management functionality

import { API_URL } from './config.js';
import { checkAuth } from './auth.js';

// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');
const categorySelect = document.getElementById('category');
const paymentMethodSelect = document.getElementById('paymentMethod');
const monthFilter = document.getElementById('monthFilter');

// Check authentication
checkAuth();

// Set default date to today
document.getElementById('date').valueAsDate = new Date();

// Set default month filter to current month
const currentMonth = new Date().toISOString().slice(0, 7);
monthFilter.value = currentMonth;

// Fetch and display categories
async function fetchCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        
        if (response.ok) {
            // Update category select options
            categorySelect.innerHTML = `
                <option value="">Select a category</option>
                ${data.map(category => `
                    <option value="${category.id}">${category.name}</option>
                `).join('')}
            `;
        } else {
            throw new Error(data.message || 'Failed to fetch categories');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Failed to load categories. Please try again.');
    }
}

// Fetch and display payment methods
async function fetchPaymentMethods() {
    try {
        const response = await fetch(`${API_URL}/payment-methods`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        
        if (response.ok) {
            // Update payment method select options
            paymentMethodSelect.innerHTML = `
                <option value="">Select a payment method</option>
                ${data.map(method => `
                    <option value="${method.id}">${method.method}</option>
                `).join('')}
            `;
        } else {
            throw new Error(data.message || 'Failed to fetch payment methods');
        }
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        alert('Failed to load payment methods. Please try again.');
    }
}

// Fetch and display expenses
async function fetchExpenses() {
    try {
        const month = monthFilter.value;
        console.log('Fetching expenses for month:', month);
        
        const response = await fetch(`${API_URL}/expenses?month=${month}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        console.log('Received expenses:', data);
        
        if (response.ok) {
            displayExpenses(data);
        } else {
            throw new Error(data.message || 'Failed to fetch expenses');
        }
    } catch (error) {
        console.error('Error fetching expenses:', error);
        alert('Failed to load expenses. Please try again.');
    }
}

// Display expenses in the table
function displayExpenses(expenses) {
    console.log('Displaying expenses:', expenses);
    if (!Array.isArray(expenses)) {
        console.error('Expected array of expenses, got:', expenses);
        return;
    }
    
    expensesList.innerHTML = expenses.map(expense => {
        return `
            <tr>
                <td>${new Date(expense.date).toLocaleDateString()}</td>
                <td>${expense.description || ''}</td>
                <td>₹${parseFloat(expense.amount).toFixed(2)}</td>
                <td>${expense.category}</td>
                <td>${expense.payment_method}</td>
                <td>
                    <button onclick="window.deleteExpense(${expense.id})" class="text-red-600 hover:text-red-800">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Add new expense
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    const categoryId = document.getElementById('category').value;
    const paymentMethodId = document.getElementById('paymentMethod').value;

    if (!amount || !description || !date || !categoryId || !paymentMethodId) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                amount: Number(amount),
                description,
                date,
                category_id: Number(categoryId),
                payment_method_id: Number(paymentMethodId)
            })
        });

        const data = await response.json();

        if (response.ok) {
            expenseForm.reset();
            // Set default date back to today
            document.getElementById('date').valueAsDate = new Date();
            fetchExpenses();
        } else {
            throw new Error(data.message || 'Failed to add expense');
        }
    } catch (error) {
        console.error('Error adding expense:', error);
        alert('Failed to add expense. Please try again.');
    }
});

// Delete expense
window.deleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
        const response = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            fetchExpenses();
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete expense');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
    }
};

// Handle month filter change
monthFilter.addEventListener('change', fetchExpenses);

// Initial load
fetchCategories();
fetchPaymentMethods();
fetchExpenses(); 