// dashboard.js
// Handles dashboard functionality: loading summary data and drawing charts

import { API_URL } from './config.js';
import { checkAuth } from './auth.js';

// Check authentication
checkAuth();

// Chart instances
let categoryChart = null;
let trendChart = null;

// Helper function to safely format numbers
function formatNumber(value) {
    const num = Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
}

// Fetch and display dashboard data
async function fetchDashboardData() {
    try {
        console.log('Fetching dashboard data from:', `${API_URL}/summary/dashboard`);
        const token = localStorage.getItem('token');
        console.log('Using token:', token ? 'Token exists' : 'No token found');
        
        const response = await fetch(`${API_URL}/summary/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            // Access data from the summary object
            updateSummaryCards(data.summary);
            updateCategoryChart(data.categoryData || []);
            updateTrendChart(data.trendData || []);
            displayRecentExpenses(data.recentExpenses || []);
        } else {
            throw new Error(data.message || 'Failed to fetch dashboard data');
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        alert('Failed to load dashboard data. Please try again.');
    }
}

// Update summary cards
function updateSummaryCards(data) {
    // Add null checks and default values
    const totalExpenses = parseFloat(data.totalExpenses || 0);
    const totalBudget = parseFloat(data.totalBudget || 0);
    const remainingBudget = totalBudget - totalExpenses;

    document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('totalBudget').textContent = `₹${totalBudget.toFixed(2)}`;
    document.getElementById('remainingBudget').textContent = `₹${remainingBudget.toFixed(2)}`;
}

// Update category chart
function updateCategoryChart(categoryData) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categoryData.map(item => item.category),
            datasets: [{
                data: categoryData.map(item => Number(item.amount)),
                backgroundColor: [
                    '#3B82F6', // blue-500
                    '#10B981', // emerald-500
                    '#F59E0B', // amber-500
                    '#EF4444', // red-500
                    '#8B5CF6', // violet-500
                    '#EC4899', // pink-500
                    '#14B8A6', // teal-500
                    '#F97316', // orange-500
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Update trend chart
function updateTrendChart(trendData) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    if (trendChart) {
        trendChart.destroy();
    }
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.map(item => new Date(item.month).toLocaleDateString('default', { month: 'short', year: 'numeric' })),
            datasets: [{
                label: 'Expenses',
                data: trendData.map(item => Number(item.expenses)),
                borderColor: '#3B82F6',
                tension: 0.1
            }, {
                label: 'Budget',
                data: trendData.map(item => Number(item.budget)),
                borderColor: '#10B981',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `₹${formatNumber(value)}`
                    }
                }
            }
        }
    });
}

// Display recent expenses
function displayRecentExpenses(expenses) {
    const tbody = document.getElementById('recentExpenses');
    tbody.innerHTML = expenses.map(expense => `
        <tr>
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.description || ''}</td>
            <td>₹${formatNumber(expense.amount)}</td>
            <td>${expense.category?.name || expense.category || 'N/A'}</td>
            <td>${expense.payment_method?.method || expense.payment_method || 'N/A'}</td>
        </tr>
    `).join('');
}

// Initial load
fetchDashboardData(); 