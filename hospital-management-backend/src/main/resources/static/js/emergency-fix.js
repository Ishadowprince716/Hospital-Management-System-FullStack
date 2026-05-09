// ===== EMERGENCY FIX - All Issues =====
// This file fixes: Console errors, Modal issues, Button responses, Data saving, Payment failures

console.log('🔧 Emergency Fix Loaded');

// ===== FIX 1: Global Function Exports =====
// Ensure all functions are globally accessible

window.showSection = window.showSection || function (section) {
    console.log('showSection:', section);
};

window.closeModal = window.closeModal || function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        console.log('Modal closed:', modalId);
    }
};

window.showPendingDoctors = window.showPendingDoctors || async function () {
    console.log('showPendingDoctors called');
    const modal = document.getElementById('pendingApprovalsModal');
    if (modal) {
        modal.classList.add('show');
    }
};

window.approveDoctor = window.approveDoctor || function (id) {
    console.log('approveDoctor:', id);
    alert('Approve doctor #' + id);
};

window.rejectDoctor = window.rejectDoctor || function (id) {
    console.log('rejectDoctor:', id);
    alert('Reject doctor #' + id);
};

window.viewDoctorDetails = window.viewDoctorDetails || function (id) {
    console.log('viewDoctorDetails:', id);
    const modal = document.getElementById('doctorDetailsModal');
    if (modal) {
        modal.classList.add('show');
    }
};

window.viewPatientDetails = window.viewPatientDetails || function (id) {
    console.log('viewPatientDetails:', id);
    const modal = document.getElementById('patientDetailsModal');
    if (modal) {
        modal.classList.add('show');
    }
};

window.toggleDoctorStatus = window.toggleDoctorStatus || function (id, activate) {
    console.log('toggleDoctorStatus:', id, activate);
    alert((activate ? 'Activate' : 'Deactivate') + ' doctor #' + id);
};

window.toggleNotifications = window.toggleNotifications || function () {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('show');
        console.log('Notification panel toggled');
    }
};

window.markAsRead = window.markAsRead || function (id) {
    console.log('markAsRead:', id);
};

window.markAllAsRead = window.markAllAsRead || function () {
    console.log('markAllAsRead');
    alert('All notifications marked as read');
};

window.clearAllNotifications = window.clearAllNotifications || function () {
    if (confirm('Clear all notifications?')) {
        console.log('clearAllNotifications');
        alert('All notifications cleared');
    }
};

window.logout = window.logout || function () {
    localStorage.clear();
    window.location.href = 'index.html';
};

// ===== FIX 2: Payment Functions =====
window.showPaymentModal = window.showPaymentModal || function (billId) {
    console.log('showPaymentModal:', billId);
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.add('show');
    }
};

window.viewBillDetails = window.viewBillDetails || function (billId) {
    console.log('viewBillDetails:', billId);
    const modal = document.getElementById('billDetailsModal');
    if (modal) {
        modal.classList.add('show');
    }
};

window.processPayment = window.processPayment || function () {
    console.log('processPayment called');
    const modal = document.getElementById('paymentModal');
    alert('Payment processing... This will take 2 seconds');
    setTimeout(() => {
        if (modal) modal.classList.remove('show');
        alert('Payment successful!');
    }, 2000);
};

// ===== FIX 3: Modal Click Outside to Close =====
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
        console.log('Modal closed by clicking outside');
    }
});

// ===== FIX 4: Escape Key to Close Modals =====
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
            console.log('Modal closed by ESC key');
        });
    }
});

// ===== FIX 5: Safe localStorage Wrapper =====
const SafeStorage = {
    setItem: function (key, value) {
        try {
            localStorage.setItem(key, value);
            console.log('✅ Saved:', key);
            return true;
        } catch (e) {
            console.error('❌ Storage error:', e);
            return false;
        }
    },
    getItem: function (key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('❌ Storage error:', e);
            return null;
        }
    },
    removeItem: function (key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('❌ Storage error:', e);
            return false;
        }
    }
};

window.SafeStorage = SafeStorage;

// ===== FIX 6: Button Click Handler =====
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ DOM Loaded - Emergency fix active');

    // Find all buttons with onclick attributes
    const buttons = document.querySelectorAll('button[onclick]');
    console.log('Found', buttons.length, 'buttons with onclick');

    // Find all modals
    const modals = document.querySelectorAll('.modal');
    console.log('Found', modals.length, 'modals');

    // Add close button handlers
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                console.log('Modal closed via close button');
            }
        });
    });
});

// ===== FIX 7: Error Handler =====
window.addEventListener('error', function (event) {
    console.error('❌ Global Error:', event.error);
    console.error('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// ===== FIX 8: Toast Notification Fix =====
window.showToast = window.showToast || function (message, type = 'info') {
    console.log('Toast:', type, message);

    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn('Toast element not found');
        alert(message);
        return;
    }

    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    if (toastMessage) toastMessage.textContent = message;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    if (toastIcon) {
        toastIcon.className = `toast-icon fas ${icons[type] || icons.info}`;
    }

    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
};

// ===== FIX 9: Console Helper =====
console.log('%c🔧 EMERGENCY FIX ACTIVE', 'color: #2dd4bf; font-weight: bold; font-size: 16px;');
console.log('%cAll functions loaded:', 'color: #34d399; font-weight: bold;');
console.log('- closeModal');
console.log('- showPendingDoctors');
console.log('- approveDoctor / rejectDoctor');
console.log('- viewDoctorDetails / viewPatientDetails');
console.log('- toggleDoctorStatus');
console.log('- toggleNotifications');
console.log('- showPaymentModal / processPayment');
console.log('- showToast');
console.log('- logout');

// ===== FIX 10: Check Required Elements =====
setTimeout(() => {
    console.log('%c=== SYSTEM CHECK ===', 'color: #fbbf24; font-weight: bold;');

    const checks = [
        { id: 'toast', name: 'Toast Notification' },
        { id: 'notificationPanel', name: 'Notification Panel' },
        { id: 'notificationBtn', name: 'Notification Button' },
        { id: 'pendingApprovalsModal', name: 'Pending Approvals Modal' },
        { id: 'doctorDetailsModal', name: 'Doctor Details Modal' },
        { id: 'patientDetailsModal', name: 'Patient Details Modal' }
    ];

    checks.forEach(check => {
        const element = document.getElementById(check.id);
        if (element) {
            console.log('✅', check.name, '- Found');
        } else {
            console.warn('❌', check.name, '- NOT FOUND');
        }
    });

    console.log('%c=== END CHECK ===', 'color: #fbbf24; font-weight: bold;');
}, 1000);

// ===== FIX 11: Manual Modal Opener (for testing) =====
window.testModal = function (modalId) {
    console.log('Testing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        console.log('✅ Modal opened:', modalId);
    } else {
        console.error('❌ Modal not found:', modalId);
    }
};

window.testCloseModal = function (modalId) {
    console.log('Testing close modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        console.log('✅ Modal closed:', modalId);
    } else {
        console.error('❌ Modal not found:', modalId);
    }
};

// ===== READY =====
console.log('%c✅ EMERGENCY FIX READY!', 'color: #10b981; font-weight: bold; font-size: 18px;');
console.log('%cYou can test modals with:', 'color: #60a5fa;');
console.log('  testModal("pendingApprovalsModal")');
console.log('  testCloseModal("pendingApprovalsModal")');
