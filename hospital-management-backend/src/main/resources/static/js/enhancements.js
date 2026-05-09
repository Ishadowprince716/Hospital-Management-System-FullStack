/**
 * Initialize UI Enhancements
 */
document.addEventListener('DOMContentLoaded', () => {
    initRipples();
    initFloatingLabels();
    initAnimations();
});

/**
 * Ripple Effect for buttons
 */
function initRipples() {
    const buttons = document.querySelectorAll('.btn-login, .role-btn, .social-btn, .btn-primary, .btn-secondary');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

/**
 * Floating Labels & Input Focus
 */
function initFloatingLabels() {
    const inputs = document.querySelectorAll('.form-group input');
    
    inputs.forEach(input => {
        // Initial state
        if (input.value) {
            input.classList.add('has-value');
        }

        input.addEventListener('blur', () => {
            if (input.value) {
                input.classList.add('has-value');
            } else {
                input.classList.remove('has-value');
            }
        });

        // Add placeholder to help with :placeholder-shown CSS selector
        if (!input.getAttribute('placeholder')) {
            input.setAttribute('placeholder', ' ');
        }
    });

    // Auto-focus first input
    if (inputs.length > 0) {
        inputs[0].focus();
    }
}

/**
 * Entry Animations
 */
function initAnimations() {
    const elements = document.querySelectorAll('.branding-section > *, .form-container > *, .feature-item');
    
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.transitionDelay = `${index * 0.1}s`;
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100);
    });
}

/**
 * Export table data to CSV
 */
function exportToCSV(data, filename = 'export.csv') {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header =>
            JSON.stringify(row[header] || '')
        ).join(','))
    ].join('\n');

    downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export to Excel using SheetJS (if available)
 */
async function exportToExcel(data, filename = 'export.xlsx') {
    if (typeof XLSX === 'undefined') {
        showToast('Excel export library not loaded', 'error');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    XLSX.writeFile(workbook, filename);
    showToast('Excel file downloaded successfully', 'success');
}

/**
 * Print current view
 */
function printView() {
    window.print();
}

/**
 * Download file helper
 */
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast(`${filename} downloaded successfully`, 'success');
}

/**
 * Enhanced loading indicator
 */
function showLoadingIndicator(container, message = 'Loading...') {
    const loadingHTML = `
        <div class="loading-container fade-in-up">
            <div class="spinner"></div>
            <p style="margin-top: 1rem; color: var(--gray-600);">${message}</p>
        </div>
    `;

    if (typeof container === 'string') {
        document.getElementById(container).innerHTML = loadingHTML;
    } else {
        container.innerHTML = loadingHTML;
    }
}

/**
 * Enhanced empty state
 */
function showEmptyState(container, config = {}) {
    const {
        icon = 'fa-inbox',
        title = 'No Data Available',
        message = 'There is no data to display at this time.',
        actionText = 'Add New',
        actionCallback = null
    } = config;

    const emptyStateHTML = `
        <div class="empty-state fade-in-up">
            <i class="fas ${icon}"></i>
            <h3>${title}</h3>
            <p>${message}</p>
            ${actionCallback ? `
                <button class="btn-primary" onclick="${actionCallback}">
                    <i class="fas fa-plus"></i> ${actionText}
                </button>
            ` : ''}
        </div>
    `;

    if (typeof container === 'string') {
        document.getElementById(container).innerHTML = emptyStateHTML;
    } else {
        container.innerHTML = emptyStateHTML;
    }
}

/**
 * Animate number counting
 */
function animateNumber(element, targetNumber, duration = 1000) {
    const start = 0;
    const increment = targetNumber / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= targetNumber) {
            element.textContent = targetNumber.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

/**
 * Show success animation
 */
function showSuccessAnimation(callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: modalFadeIn 0.3s ease;
    `;

    overlay.innerHTML = `
        <div style="background: white; padding: 3rem; border-radius: 1rem; text-align: center;">
            <svg style="width: 100px; height: 100px;" viewBox="0 0 52 52">
                <circle style="stroke: #10b981; fill: none; stroke-width: 4;" cx="26" cy="26" r="24"/>
                <path class="success-checkmark" style="fill: none; stroke: #10b981; stroke-width: 4; stroke-dasharray: 50; stroke-dashoffset: 50;" d="M14 27l8 8 16-16"/>
            </svg>
            <h3 style="margin-top: 1rem; color: var(--accent-success);">Success!</h3>
        </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.animation = 'modalFadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(overlay);
            if (callback) callback();
        }, 300);
    }, 1500);
}

/**
 * Enhanced toast with action button
 */
function showActionToast(message, actionText, actionCallback) {
    const toast = document.createElement('div');
    toast.className = 'toast info';
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        </div>
        <button class="btn-sm" onclick="this.parentElement.remove(); (${actionCallback})()" style="margin-left: 1rem;">
            ${actionText}
        </button>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

/**
 * Advanced date range filter
 */
class DateRangeFilter {
    constructor(containerId, onChange) {
        this.container = document.getElementById(containerId);
        this.onChange = onChange;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="date-range-filter" style="display: flex; gap: 1rem; align-items: center;">
                <div class="form-group" style="margin-bottom: 0;">
                    <label>From:</label>
                    <input type="date" id="dateFrom" class="form-control">
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label>To:</label>
                    <input type="date" id="dateTo" class="form-control">
                </div>
                <button class="btn-primary" onclick="this.parentElement.querySelector('input').dispatchEvent(new Event('change'))">
                    <i class="fas fa-filter"></i> Apply
                </button>
                <button class="btn-secondary" onclick="document.getElementById('dateFrom').value=''; document.getElementById('dateTo').value='';">
                    <i class="fas fa-times"></i> Clear
                </button>
            </div>
        `;

        const fromInput = this.container.querySelector('#dateFrom');
        const toInput = this.container.querySelector('#dateTo');

        [fromInput, toInput].forEach(input => {
            input.addEventListener('change', () => {
                if (this.onChange) {
                    this.onChange({
                        from: fromInput.value,
                        to: toInput.value
                    });
                }
            });
        });
    }
}

/**
 * Debounce function for search inputs
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Add fade-in animation to elements
 */
function fadeInElements(selector) {
    document.querySelectorAll(selector).forEach((el, index) => {
        el.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s both`;
    });
}

// Auto-apply fade-in to cards on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        fadeInElements('.card, .stat-card');
    }, 100);
});
