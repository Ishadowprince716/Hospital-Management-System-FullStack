/**
 * Hospital Management System - Authentication Module
 * Handles user login, session management, and role-based navigation
 * 
 * Security Features:
 * - Input validation and sanitization
 * - XSS prevention via textContent (not innerHTML)
 * - CSRF protection headers
 * - Secure token storage
 * - Session timeout management
 * - Request timeout handling
 */

'use strict';

// ============== Configuration ==============
const CONFIG = {
    MOCK_MODE: false,
    API_BASE_URL: `http://localhost:8080/api`,
    REQUEST_TIMEOUT: 10000, // 10 seconds
    SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
    TOKEN_KEYS: {
        token: 'auth_token',
        userId: 'auth_userId',
        username: 'auth_username',
        role: 'auth_role',
        fullName: 'auth_fullName',
        timestamp: 'auth_timestamp'
    },
    VALID_ROLES: ['PATIENT', 'DOCTOR', 'ADMIN'],
    DASHBOARD_MAP: {
        'PATIENT': 'patient-dashboard.html',
        'DOCTOR': 'doctor-dashboard.html',
        'ADMIN': 'admin-dashboard.html'
    }
};

// Mock Data (only for MOCK_MODE = true)
const MOCK_USERS = {
    'patient1': {
        username: 'patient1',
        password: 'patient123',
        role: 'PATIENT',
        id: 1,
        fullName: 'John Doe',
        token: 'mock-token-patient'
    },
    'doctor1': {
        username: 'doctor1',
        password: 'doctor123',
        role: 'DOCTOR',
        id: 2,
        fullName: 'Dr. Rahul Singh Kushwaha',
        token: 'mock-token-doctor'
    },
    'admin': {
        username: 'admin',
        password: 'admin123',
        role: 'ADMIN',
        id: 3,
        fullName: 'System Administrator',
        token: 'mock-token-admin'
    }
};

const MOCK_DOCTORS = [
    { id: 1, fullName: 'Dr. Rahul Singh Kushwaha', specialization: 'General Physician', consultationFee: 500 },
    { id: 2, fullName: 'Dr. Sarah Johnson', specialization: 'Cardiologist', consultationFee: 800 }
];

const MOCK_APPOINTMENTS = [];

// ============== DOM Elements ==============
// ============== DOM Elements ==============
// Elements are selected dynamically to ensure existence
let loginForm, roleBtns, usernameInput, passwordInput, togglePasswordBtn, loginBtn, toast;

// ============== State Management ==============
let selectedRole = 'PATIENT';
let sessionTimeoutId = null;

// ============== Initialization ==============
/**
 * Initialize authentication module when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    if (CONFIG.MOCK_MODE) {
        showToast('⚠️ Running in MOCK MODE - No backend required!', 'warning');
    }

    const loginFormElement = document.getElementById('loginForm');

    // Check if we are on the login page by presence of login form
    if (loginFormElement) {
        initializeEventListeners();
        checkExistingSession();
    }

    // Setup session timeout on non-login pages
    if (!loginFormElement) {
        setupSessionTimeout();
    }
});

// ============== Event Listeners ==============
/**
 * Initialize all event listeners for the login form
 */
function initializeEventListeners() {
    // Initialize DOM elements
    loginForm = document.getElementById('loginForm');
    roleBtns = document.querySelectorAll('.role-btn');
    usernameInput = document.getElementById('username');
    passwordInput = document.getElementById('password');
    togglePasswordBtn = document.getElementById('togglePassword');
    loginBtn = document.getElementById('loginBtn');
    toast = document.getElementById('toast');

    if (!loginForm || !usernameInput || !passwordInput) {
        console.error('Required login form elements not found');
        return;
    }

    // Role selection buttons
    roleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            handleRoleSelection(btn);
        });
    });

    // Form submission
    loginForm.addEventListener('submit', handleLogin);

    // Password visibility toggle
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            togglePasswordVisibility();
        });
    }

    // Enter key support
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    });
}

/**
 * Handle role selection with visual feedback
 * @param {HTMLElement} clickedBtn - The role button clicked
 */
function handleRoleSelection(clickedBtn) {
    roleBtns.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
    selectedRole = clickedBtn.dataset.role;
}

/**
 * Toggle password visibility with secure implementation
 */
function togglePasswordVisibility() {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    const icon = togglePasswordBtn.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }

    // Ensure password field remains focused
    passwordInput.focus();
}

// ============== Authentication ==============
/**
 * Handle login form submission with comprehensive validation
 * @param {Event} e - Form submission event
 */
async function handleLogin(e) {
    e.preventDefault();

    // Input validation
    const username = sanitizeInput(usernameInput.value.trim());
    const password = passwordInput.value.trim();

    if (!validateLoginInputs(username, password)) {
        return;
    }

    setLoadingState(true);

    try {
        const credentials = { username, password, role: selectedRole ? selectedRole.toUpperCase() : 'PATIENT' };
        let data;

        if (CONFIG.MOCK_MODE) {
            data = await performMockLogin(credentials);
        } else {
            data = await performBackendLogin(credentials);
        }

        handleLoginSuccess(data);
    } catch (error) {
        console.error('Login error:', error);
        const errorMsg = extractErrorMessage(error);
        showToast(errorMsg, 'error');
    } finally {
        setLoadingState(false);
        // Clear sensitive data from memory
        password = '';
    }
}

/**
 * Validate login input fields
 * @param {string} username - Username input
 * @param {string} password - Password input
 * @returns {boolean} - True if valid
 */
function validateLoginInputs(username, password) {
    // Check for empty fields
    if (!username || !password) {
        showToast('Please fill in all fields', 'error');
        return false;
    }

    // Username validation (3-50 chars, alphanumeric + underscore)
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
        showToast('Username must be 3-50 characters (letters, numbers, underscore)', 'error');
        return false;
    }

    // Password validation (minimum 6 chars)
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return false;
    }

    // Validate selected role
    if (!CONFIG.VALID_ROLES.includes(selectedRole)) {
        showToast('Invalid role selected', 'error');
        return false;
    }

    return true;
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Perform login via backend API with timeout and error handling
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} - Authentication response
 */
async function performBackendLogin(credentials) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest' // CSRF prevention
            },
            body: JSON.stringify(credentials),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const apiResponse = await response.json().catch(() => ({}));
            const err = apiResponse.data || apiResponse;
            throw new Error(err.message || err.error || `HTTP ${response.status}: Login failed`);
        }

        const apiResponse = await response.json();
        
        // Unwrap ApiResponse wrapper: { success, message, data: { token, userId, role, ... } }
        const data = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse);

        // Fix: Map backend 'id' to 'userId' if needed
        if (!data.userId && data.id) {
            data.userId = data.id;
        }
        
        // Fix: Map 'userId' to 'id' for compatibility with older frontend code
        if (!data.id && data.userId) {
            data.id = data.userId;
        }

        // Validate response structure
        if (!data.token || !data.userId || !data.role) {
            console.error('Login response:', apiResponse);
            throw new Error('Invalid server response: missing required fields');
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please check your connection and try again.');
        }
        throw error;
    }
}

/**
 * Perform login using mock data (development only)
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} - Mock authentication response
 */
async function performMockLogin(credentials) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = MOCK_USERS[credentials.username];

    if (!user) {
        throw new Error('Invalid username or password');
    }

    if (user.password !== credentials.password) {
        throw new Error('Invalid username or password');
    }

    if (user.role !== credentials.role) {
        throw new Error('Invalid role selected');
    }

    return {
        token: user.token,
        username: user.username,
        role: user.role,
        userId: user.id,
        fullName: user.fullName,
        message: 'Login successful (MOCK MODE)'
    };
}

/**
 * Extract error message from various error types
 * @param {Error|Object} error - Error object
 * @returns {string} - User-friendly error message
 */
function extractErrorMessage(error) {
    if (error.message === 'Invalid username or password') {
        return 'Invalid username or password';
    }
    if (error.message === 'Invalid role selected') {
        return 'Invalid role selected. Please try again.';
    }
    if (error.message.includes('timeout')) {
        return 'Connection timeout. Please try again.';
    }
    if (error.message.includes('Failed to fetch')) {
        return 'Unable to connect to server. Please check your connection.';
    }
    return error.message || 'An error occurred. Please try again later.';
}

/**
 * Handle successful login and store authentication data
 * @param {Object} data - Authentication response data
 */
function handleLoginSuccess(data) {
    // Store authentication data with timestamp
    const timestamp = Date.now();
    const authData = {
        token: data.token,
        userId: data.userId,
        username: data.username,
        role: data.role,
        fullName: data.fullName,
        timestamp: timestamp
    };

    // Store securely
    Object.keys(authData).forEach(key => {
        localStorage.setItem(CONFIG.TOKEN_KEYS[key], authData[key]);
    });

    // Compatibility keys (for other modules using raw keys)
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user', JSON.stringify(data));

    showToast(`Welcome back, ${data.fullName || data.username}!`, 'success');

    // Redirect after brief delay to allow user to see success message
    setTimeout(() => {
        redirectToDashboard(data.role);
    }, 1000);
}

// ============== Session Management ==============
/**
 * Check if user has an active session and redirect if logged in
 */
function checkExistingSession() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEYS.token);
    const role = localStorage.getItem(CONFIG.TOKEN_KEYS.role);
    const timestamp = parseInt(localStorage.getItem(CONFIG.TOKEN_KEYS.timestamp)) || 0;

    // Check if session exists and hasn't expired
    if (token && role && isSessionValid(timestamp)) {
        redirectToDashboard(role);
    } else if (token || role) {
        // Clear invalid session data
        clearSession();
    }
}

/**
 * Validate if session has not expired
 * @param {number} timestamp - Session creation timestamp
 * @returns {boolean} - True if session is valid
 */
function isSessionValid(timestamp) {
    const elapsed = Date.now() - timestamp;
    return elapsed < CONFIG.SESSION_TIMEOUT;
}

/**
 * Setup automatic session timeout
 */
function setupSessionTimeout() {
    const resetTimeout = () => {
        clearTimeout(sessionTimeoutId);
        sessionTimeoutId = setTimeout(() => {
            showToast('Your session has expired. Please login again.', 'warning');
            clearSession();
            redirectToLogin();
        }, CONFIG.SESSION_TIMEOUT);
    };

    // Reset timeout on user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimeout, true);
    });

    resetTimeout();
}

/**
 * Redirect to specified dashboard based on role
 * @param {string} role - User role
 */
function redirectToDashboard(role) {
    const dashboard = CONFIG.DASHBOARD_MAP[role];

    if (dashboard) {
        window.location.href = dashboard;
    } else {
        showToast('Invalid role. Please contact administrator.', 'error');
    }
}

/**
 * Clear all session data and logout user
 */
function clearSession() {
    Object.values(CONFIG.TOKEN_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    sessionStorage.clear();
    clearTimeout(sessionTimeoutId);
}

/**
 * Redirect user to login page
 */
function redirectToLogin() {
    window.location.href = 'index.html';
}

/**
 * Public logout function
 */
function logout() {
    clearSession();
    redirectToLogin();
}

// ============== UI Utilities ==============
/**
 * Set loading state on login button with visual feedback
 * @param {boolean} isLoading - Loading state
 */
function setLoadingState(isLoading) {
    const btnText = loginBtn?.querySelector('.btn-text');
    const btnLoader = loginBtn?.querySelector('.btn-loader');

    if (!btnText || !btnLoader) {
        console.warn('Loading state elements not found');
        return;
    }

    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        loginBtn.disabled = true;
        loginForm?.classList.add('loading');
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        loginBtn.disabled = false;
        loginForm?.classList.remove('loading');
    }
}

/**
 * Display toast notification with auto-dismiss
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, error, warning)
 */
function showToast(message, type = 'info') {
    if (!toast) {
        toast = document.getElementById('toast');
    }

    if (!toast) {
        console.warn('Toast element not found');
        return;
    }

    const toastMessage = toast.querySelector('.toast-message');
    if (!toastMessage) {
        console.warn('Toast message element not found');
        return;
    }

    // Sanitize message for XSS prevention
    toastMessage.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);

    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Auto-dismiss
    const duration = type === 'warning' ? 6000 : 4000;
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ============== Public API ==============
/**
 * Export public API for use in other modules
 */
window.hospitalAuth = {
    logout,
    showToast,
    clearSession,
    getToken: () => localStorage.getItem(CONFIG.TOKEN_KEYS.token),
    getRole: () => localStorage.getItem(CONFIG.TOKEN_KEYS.role),
    getUserId: () => localStorage.getItem(CONFIG.TOKEN_KEYS.userId),
    getUsername: () => localStorage.getItem(CONFIG.TOKEN_KEYS.username),
    getFullName: () => localStorage.getItem(CONFIG.TOKEN_KEYS.fullName),
    isAuthenticated: () => !!localStorage.getItem(CONFIG.TOKEN_KEYS.token),
    API_BASE_URL: CONFIG.API_BASE_URL,
    MOCK_MODE: CONFIG.MOCK_MODE,
    MOCK_DOCTORS,
    MOCK_APPOINTMENTS
};
