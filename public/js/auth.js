// auth.js
// Handles user authentication (login/signup) and JWT management

import { API_URL } from './config.js';

// JWT management
export function setToken(token) {
    localStorage.setItem('token', token);
}

export function getToken() {
    return localStorage.getItem('token');
}

export function clearToken() {
    localStorage.removeItem('token');
}

// Helper: Add JWT to fetch headers
export function authFetch(url, options = {}) {
    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + getToken();
    return fetch(url, options);
}

// Check if user is logged in
export function isLoggedIn() {
    return !!getToken();
}

// Redirect to dashboard if logged in (only on login page)
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    if (isLoggedIn()) {
        window.location.href = 'dashboard.html';
    }
}

// Check if user is authenticated
export function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Display user name if available
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userName').textContent = userName;
    }

    // Set up logout handler
    document.getElementById('logoutBtn').onclick = logout;
}

// Helper function to show messages
function showMessage(message, isError = false) {
    const msgElement = document.getElementById('authMsg');
    msgElement.textContent = message;
    msgElement.className = isError ? 'text-red-500' : 'text-green-500';
    msgElement.style.display = 'block';
}

// Login function
export async function login(email, password) {
    try {
        showMessage('Logging in...', false);
        console.log('Attempting login to:', `${API_URL}/auth/login`);
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Login response:', response.status);
        const data = await response.json();
        console.log('Login data:', data);

        if (response.ok) {
            showMessage('Login successful! Redirecting...', false);
            setToken(data.token);
            localStorage.setItem('userName', data.user.name);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage(error.message || 'Login failed. Please try again.', true);
    }
}

// Signup function
export async function signup(name, email, password) {
    try {
        showMessage('Creating your account...', false);
        console.log('Attempting signup to:', `${API_URL}/auth/signup`);
        
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        console.log('Signup response:', response.status);
        const data = await response.json();
        console.log('Signup data:', data);

        if (response.ok) {
            showMessage('Signup successful! Redirecting...', false);
            setToken(data.token);
            localStorage.setItem('userName', data.user.name);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            throw new Error(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage(error.message || 'Signup failed. Please try again.', true);
    }
}

// Logout function
export function logout() {
    clearToken();
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
}

// Get auth headers for API requests
export function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${getToken()}`
    };
}

// Set up form handlers if on login page
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        await login(email, password);
    });
}

if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        if (!name || !email || !password) {
            showMessage('Please fill in all fields', true);
            return;
        }
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long', true);
            return;
        }
        
        await signup(name, email, password);
    });
} 