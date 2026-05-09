// Notification System - Shared Component
const NOTIFICATION_API = 'http://localhost:8080/api/notifications';
let notificationInterval = null;

/**
 * Initialize notification system for a user
 */
function initNotifications(userId) {
    if (!userId) {
        console.warn('No user ID provided for notifications');
        return;
    }

    // Load initial notifications
    loadNotifications(userId);

    // Start polling for new notifications every 30 seconds
    if (notificationInterval) {
        clearInterval(notificationInterval);
    }

    notificationInterval = setInterval(() => {
        loadNotifications(userId);
    }, 30000); // 30 seconds
}

/**
 * Load notifications for user
 */
async function loadNotifications(userId) {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${NOTIFICATION_API}/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const apiResponse = await response.json();
            const notifications = (apiResponse.data && apiResponse.data.content) ? apiResponse.data.content : (apiResponse.data || apiResponse);
            updateNotificationBadge(userId);
            displayNotifications(notifications);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

/**
 * Update notification badge count
 */
async function updateNotificationBadge(userId) {
    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${NOTIFICATION_API}/user/${userId}/unread-count`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const apiResponse = await response.json();
            const data = apiResponse.data || apiResponse;
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                const count = typeof data === 'object' ? data.count : data;
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}

/**
 * Display notifications in dropdown
 */
function displayNotifications(notifications) {
    const container = document.getElementById('notificationList');
    if (!container) return;

    if (!notifications || notifications.length === 0) {
        container.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications</p>
            </div>
        `;
        return;
    }

    container.innerHTML = notifications.slice(0, 10).map(notif => `
        <div class="notification-item ${notif.isRead ? 'read' : 'unread'}" 
             onclick="markNotificationAsRead(${notif.id}, '${notif.actionUrl || '#'}')">
            <div class="notification-icon ${getNotificationIconClass(notif.type)}">
                <i class="fas ${getNotificationIcon(notif.type)}"></i>
            </div>
            <div class="notification-content">
                <h4>${sanitizeInput(notif.title)}</h4>
                <p>${sanitizeInput(notif.message)}</p>
                <small>${formatNotificationTime(notif.createdAt)}</small>
            </div>
            ${!notif.isRead ? '<div class="notification-dot"></div>' : ''}
        </div>
    `).join('');
}

/**
 * Mark notification as read
 */
async function markNotificationAsRead(notificationId, actionUrl) {
    try {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('auth_userId');

        await fetch(`${NOTIFICATION_API}/${notificationId}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Reload notifications
        if (userId) {
            loadNotifications(userId);
        }

        // Navigate to action URL if provided
        if (actionUrl && actionUrl !== '#') {
            window.location.href = actionUrl;
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

/**
 * Mark all notifications as read
 */
async function markAllNotificationsAsRead() {
    try {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('auth_userId');

        if (!userId) return;

        await fetch(`${NOTIFICATION_API}/user/${userId}/read-all`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Reload notifications
        loadNotifications(userId);
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
}

/**
 * Toggle notification dropdown
 */
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
    const icons = {
        'APPOINTMENT': 'fa-calendar-check',
        'BILL': 'fa-file-invoice-dollar',
        'PRESCRIPTION': 'fa-prescription-bottle',
        'SUCCESS': 'fa-check-circle',
        'WARNING': 'fa-exclamation-triangle',
        'ERROR': 'fa-times-circle',
        'INFO': 'fa-info-circle'
    };
    return icons[type] || 'fa-bell';
}

/**
 * Get notification icon class based on type
 */
function getNotificationIconClass(type) {
    const classes = {
        'APPOINTMENT': 'icon-primary',
        'BILL': 'icon-warning',
        'PRESCRIPTION': 'icon-success',
        'SUCCESS': 'icon-success',
        'WARNING': 'icon-warning',
        'ERROR': 'icon-error',
        'INFO': 'icon-info'
    };
    return classes[type] || 'icon-info';
}

/**
 * Format notification time
 */
function formatNotificationTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
}

/**
 * Create sample notification (for testing)
 */
async function createSampleNotification(userId, title, message, type = 'INFO') {
    try {
        const token = localStorage.getItem('auth_token');
        await fetch(NOTIFICATION_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                title: title,
                message: message,
                type: type
            })
        });

        // Reload notifications
        loadNotifications(userId);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notificationDropdown');
    const bell = document.getElementById('notificationBell');

    if (dropdown && bell && !dropdown.contains(e.target) && !bell.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Export functions for global use
window.initNotifications = initNotifications;
window.toggleNotificationDropdown = toggleNotificationDropdown;
window.markNotificationAsRead = markNotificationAsRead;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.createSampleNotification = createSampleNotification;
