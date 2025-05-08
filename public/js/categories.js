import { API_URL } from './config.js';
import { checkAuth } from './auth.js';

// DOM Elements
const categoryForm = document.getElementById('categoryForm');
const paymentForm = document.getElementById('paymentForm');
const categoriesList = document.getElementById('categoriesList');
const paymentMethodsList = document.getElementById('paymentMethodsList');

// Check authentication
checkAuth();

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
            displayCategories(data);
        } else {
            throw new Error(data.message || 'Failed to fetch categories');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Failed to load categories. Please try again.');
    }
}

// Display categories in the table
function displayCategories(categories) {
    categoriesList.innerHTML = categories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>
                <button onclick="deleteCategory(${category.id})" class="text-red-600 hover:text-red-800">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Add new category
categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('categoryName').value;

    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (response.ok) {
            categoryForm.reset();
            fetchCategories();
        } else {
            throw new Error(data.message || 'Failed to add category');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        alert('Failed to add category. Please try again.');
    }
});

// Delete category
window.deleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
        const response = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            fetchCategories();
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
    }
};

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
            displayPaymentMethods(data);
        } else {
            throw new Error(data.message || 'Failed to fetch payment methods');
        }
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        alert('Failed to load payment methods. Please try again.');
    }
}

// Display payment methods in the table
function displayPaymentMethods(methods) {
    paymentMethodsList.innerHTML = methods.map(method => `
        <tr>
            <td>${method.method}</td>
            <td>
                <button onclick="deletePaymentMethod(${method.id})" class="text-red-600 hover:text-red-800">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Add new payment method
paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const method = document.getElementById('paymentMethod').value;

    try {
        const response = await fetch(`${API_URL}/payment-methods`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ method })
        });

        const data = await response.json();

        if (response.ok) {
            paymentForm.reset();
            fetchPaymentMethods();
        } else {
            throw new Error(data.message || 'Failed to add payment method');
        }
    } catch (error) {
        console.error('Error adding payment method:', error);
        alert('Failed to add payment method. Please try again.');
    }
});

// Delete payment method
window.deletePaymentMethod = async (id) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
        const response = await fetch(`${API_URL}/payment-methods/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            fetchPaymentMethods();
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete payment method');
        }
    } catch (error) {
        console.error('Error deleting payment method:', error);
        alert('Failed to delete payment method. Please try again.');
    }
};

// Initial load
fetchCategories();
fetchPaymentMethods(); 