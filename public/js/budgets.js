import { API_URL } from './config.js';
import { checkAuth } from './auth.js';

// DOM Elements
const budgetForm = document.getElementById('budgetForm');
const budgetsList = document.getElementById('budgetsList');
const categorySelect = document.getElementById('category');
const monthFilter = document.getElementById('monthFilter');

// Check authentication
checkAuth();

// Set default month to current month
const today = new Date();
document.getElementById('month').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

// Fetch and populate categories
async function fetchCategories() {
    try {
        console.log('Fetching categories...');
        const response = await fetch(`${API_URL}/categories`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        console.log('Categories received:', data);
        
        if (response.ok) {
            categorySelect.innerHTML = data.map(category => 
                `<option value="${category.id}">${category.name}</option>`
            ).join('');
            console.log('Categories populated in select element');
        } else {
            throw new Error(data.message || 'Failed to fetch categories');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Failed to load categories. Please try again.');
    }
}

// Fetch and display budgets
async function fetchBudgets() {
    try {
        const month = monthFilter.value || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        console.log('Fetching budgets for month:', month);
        
        const response = await fetch(`${API_URL}/budgets?month=${month}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            if (!Array.isArray(data)) {
                console.error('Expected array of budgets, got:', data);
                throw new Error('Invalid response format from server');
            }
            displayBudgets(data);
        } else {
            throw new Error(data.message || `Failed to fetch budgets: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching budgets:', error);
        if (error.message.includes('401')) {
            // Token expired or invalid
            window.location.href = 'index.html';
        } else {
            alert('Failed to load budgets. Please try again.');
        }
    }
}

// Display budgets in the table
function displayBudgets(budgets) {
    console.log('Displaying budgets:', budgets);
    if (!Array.isArray(budgets)) {
        console.error('Expected array of budgets, got:', budgets);
        return;
    }
    
    budgetsList.innerHTML = budgets.map(budget => {
        // Convert string values to numbers
        const amountLimit = parseFloat(budget.amount_limit);
        const spent = parseFloat(budget.spent);
        const remaining = amountLimit - spent;
        const remainingClass = remaining < 0 ? 'text-red-600' : 'text-green-600';
        
        // Format the month properly with error handling
        let formattedDate = 'N/A';
        try {
            if (budget.month) {
                // Ensure month is in YYYY-MM format
                const [year, month] = budget.month.split('-');
                if (year && month) {
                    const date = new Date(year, parseInt(month) - 1); // month is 0-based in JavaScript
                    formattedDate = date.toLocaleDateString('default', { year: 'numeric', month: 'long' });
                }
            }
        } catch (error) {
            console.error('Error formatting date:', error, 'Month value:', budget.month);
        }
        
        return `
            <tr>
                <td>${budget.category || 'N/A'}</td>
                <td>₹${amountLimit.toFixed(2)}</td>
                <td>₹${spent.toFixed(2)}</td>
                <td class="${remainingClass}">₹${remaining.toFixed(2)}</td>
                <td>${formattedDate}</td>
                <td>
                    <button onclick="window.deleteBudget(${budget.budget_id})" class="text-red-600 hover:text-red-800">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Add new budget
budgetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const categoryId = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const month = document.getElementById('month').value;

    console.log('Form values:', { categoryId, amount, month });

    // Validate required fields
    if (!categoryId || !amount || !month) {
        alert('Please fill in all required fields');
        return;
    }

    const formData = {
        category_id: parseInt(categoryId),
        amount_limit: parseFloat(amount),
        month: month
    };

    console.log('Sending data to server:', formData);

    try {
        const response = await fetch(`${API_URL}/budgets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (response.ok) {
            budgetForm.reset();
            document.getElementById('month').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            fetchBudgets();
        } else {
            throw new Error(data.message || 'Failed to add budget');
        }
    } catch (error) {
        console.error('Error adding budget:', error);
        alert('Failed to add budget. Please try again.');
    }
});

// Delete budget
window.deleteBudget = async (id) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
        console.log('Deleting budget:', id);
        const response = await fetch(`${API_URL}/budgets/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        console.log('Delete response status:', response.status);
        if (response.ok) {
            console.log('Budget deleted successfully');
            fetchBudgets(); // Refresh the list
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete budget');
        }
    } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Failed to delete budget. Please try again.');
    }
};

// Filter budgets by month
monthFilter.addEventListener('change', fetchBudgets);

// Initial load
fetchCategories();
fetchBudgets(); 