// Theme Management
const ThemeManager = {
    init: function () {
        // Check saved theme or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initialTheme = savedTheme || systemPref;

        this.applyTheme(initialTheme);

        // Listen for system changes if no override
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    toggle: function () {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    },

    applyTheme: function (theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            document.body.classList.add('dark-mode');
            this.updateIcon(true);
        } else {
            document.documentElement.classList.remove('dark-mode');
            document.body.classList.remove('dark-mode');
            this.updateIcon(false);
        }
    },

    updateIcon: function (isDark) {
        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => ThemeManager.init());

// Expose global toggle
window.toggleTheme = () => ThemeManager.toggle();
