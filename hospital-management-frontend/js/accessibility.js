/**
 * Phase 12: Accessibility Enhancements (WCAG 2.1 AA Compliance)
 * Keyboard navigation, ARIA labels, focus management
 */

// ===== KEYBOARD NAVIGATION =====

/**
 * Enable keyboard shortcuts
 */
document.addEventListener('DOMContentLoaded', () => {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + N: New appointment/record
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            const addBtn = document.querySelector('[data-action="add"], .btn-primary');
            if (addBtn) addBtn.click();
        }

        // Alt + S: Search/Focus search input
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
            if (searchInput) searchInput.focus();
        }

        // Escape: Close modal
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal[style*="flex"]');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        }

        // Ctrl/Cmd + P: Print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
    });

    // Add keyboard navigation to tables
    setupTableKeyboardNav();

    // Setup skip links
    setupSkipLinks();

    // Enhance focus indicators
    enhanceFocusIndicators();

    // Add ARIA labels to unlabeled elements
    addMissingAriaLabels();
});

/**
 * Keyboard navigation for tables
 */
function setupTableKeyboardNav() {
    document.querySelectorAll('table tbody tr').forEach((row, index) => {
        row.setAttribute('tabindex', '0');
        row.setAttribute('role', 'button');
        row.setAttribute('aria-label', `Row ${index + 1}`);

        row.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                row.click();
            }

            // Arrow navigation
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextRow = row.nextElementSibling;
                if (nextRow) nextRow.focus();
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevRow = row.previousElementSibling;
                if (prevRow) prevRow.focus();
            }
        });
    });
}

/**
 * Skip to main content links
 */
function setupSkipLinks() {
    // Check if skip link already exists
    if (document.getElementById('skip-to-main')) return;

    const skipLink = document.createElement('a');
    skipLink.id = 'skip-to-main';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary-color);
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        z-index: 10000;
    `;

    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Ensure main content has ID
    const mainContent = document.querySelector('main, .main-content, .dashboard-content');
    if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
    }
}

/**
 * Enhance focus indicators for better visibility
 */
function enhanceFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
        *:focus {
            outline: 3px solid var(--primary-color);
            outline-offset: 2px;
        }

        button:focus,
        a:focus,
        input:focus,
        select:focus,
        textarea:focus {
            outline: 3px solid var(--primary-color);
            outline-offset: 2px;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
        }

        .skip-link:focus {
            outline: 3px solid white;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Add missing ARIA labels
 */
function addMissingAriaLabels() {
    // Buttons without aria-label
    document.querySelectorAll('button:not([aria-label])').forEach(btn => {
        const icon = btn.querySelector('i');
        const text = btn.textContent.trim() || btn.title;

        if (icon && !text) {
            const iconClass = icon.className;
            let label = 'Button';

            if (iconClass.includes('fa-edit')) label = 'Edit';
            if (iconClass.includes('fa-trash')) label = 'Delete';
            if (iconClass.includes('fa-eye')) label = 'View';
            if (iconClass.includes('fa-download')) label = 'Download';
            if (iconClass.includes('fa-print')) label = 'Print';
            if (iconClass.includes('fa-plus')) label = 'Add';
            if (iconClass.includes('fa-sync')) label = 'Refresh';

            btn.setAttribute('aria-label', label);
        } else if (text) {
            btn.setAttribute('aria-label', text);
        }
    });

    // Input fields without labels
    document.querySelectorAll('input:not([aria-label]):not([id])').forEach(input => {
        const placeholder = input.getAttribute('placeholder');
        if (placeholder) {
            input.setAttribute('aria-label', placeholder);
        }
    });

    // Icons that convey meaning
    document.querySelectorAll('i.fa, i.fas, i.far').forEach(icon => {
        if (!icon.getAttribute('aria-hidden')) {
            icon.setAttribute('aria-hidden', 'true');
        }
    });

    // Tables
    document.querySelectorAll('table:not([role])').forEach(table => {
        table.setAttribute('role', 'table');
    });

    document.querySelectorAll('table thead').forEach(thead => {
        thead.setAttribute('role', 'rowgroup');
    });

    document.querySelectorAll('table tbody').forEach(tbody => {
        tbody.setAttribute('role', 'rowgroup');
    });
}

/**
 * Announce to screen readers
 */
function announceToScreenReader(message, priority = 'polite') {
    let announcer = document.getElementById('screen-reader-announcer');

    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'screen-reader-announcer';
        announcer.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
        announcer.setAttribute('aria-live', priority);
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(announcer);
    }

    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
        announcer.textContent = '';
    }, 1000);
}

/**
 * Focus trap for modals
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });

    // Focus first element
    firstFocusable?.focus();
}

// Apply focus trap to all modals
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList?.contains('modal')) {
                    trapFocus(node);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Export functions
window.announceToScreenReader = announceToScreenReader;
window.trapFocus = trapFocus;
