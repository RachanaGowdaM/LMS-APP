/**
 * Main App Controller
 * Orchestrates navigation, global UI states (auth/toasts)
 */
const app = {
    init: function () {
        // Check initial auth state
        auth.init();

        // Define routes
        router.addRoute('/', pages.home);
        router.addRoute('/login', pages.login);
        router.addRoute('/signup', pages.signup);
        router.addRoute('/course/:id', pages.courseDetails);
        router.addRoute('/learn/:courseId', pages.learningArea, true); // Protected
        router.addRoute('/dashboard', pages.dashboard, true);         // Protected

        // Start routing based on current URL
        router.handleRoute(window.location.pathname);
    },

    showToast: function (message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'success' ? 'check-circle' : 'alert-circle';

        toast.innerHTML = `
            <i data-lucide="${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        lucide.createIcons();

        // Auto remove after 3s
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    updateNavbar: function () {
        const navLinks = document.getElementById('nav-auth-links');

        if (auth.isAuthenticated()) {
            navLinks.innerHTML = `
                <a href="/dashboard" data-link class="btn btn-secondary" style="border: none; background: transparent;">Dashboard</a>
                <button onclick="auth.logout()" class="btn btn-secondary">Logout</button>
            `;
        } else {
            navLinks.innerHTML = `
                <a href="/login" data-link class="btn btn-secondary" style="border: none; background: transparent;">Login</a>
                <a href="/signup" data-link class="btn btn-primary">Sign Up</a>
            `;
        }
        lucide.createIcons();
    }
};

/**
 * Authentication Context Manager
 */
const auth = {
    user: null,

    init: function () {
        const token = localStorage.getItem('lms_token');
        const userData = localStorage.getItem('lms_user');

        if (token && userData) {
            try {
                this.user = JSON.parse(userData);
            } catch (e) {
                this.logout(false);
            }
        }
        app.updateNavbar();
    },

    isAuthenticated: function () {
        return !!localStorage.getItem('lms_token');
    },

    setSession: function (token, user) {
        localStorage.setItem('lms_token', token);
        localStorage.setItem('lms_user', JSON.stringify(user));
        this.user = user;
        app.updateNavbar();
    },

    logout: function (redirect = true) {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        this.user = null;
        app.updateNavbar();

        if (redirect) {
            app.showToast('Logged out successfully');
            router.navigate('/');
        }
    }
};

// Expose pages object for page scripts to hook onto
const pages = {};
