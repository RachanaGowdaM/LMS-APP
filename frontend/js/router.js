/**
 * Basic Client-Side Router
 * Enables Single Page Application (SPA) feel
 */
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;

        // Listen to navigation events
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });

        // Intercept link clicks
        document.body.addEventListener('click', e => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('href'));
            }
        });
    }

    addRoute(path, renderFunction, requireAuth = false) {
        this.routes[path] = { renderFunction, requireAuth };
    }

    navigate(path) {
        window.history.pushState(null, '', path);
        this.handleRoute(path);
    }

    handleRoute(path) {
        // Simple routing matching
        let matchedRoute = null;
        let routeParams = {};

        // Find route matching path exactly, or handle dynamic segments later
        for (const [routePath, routeDef] of Object.entries(this.routes)) {
            // Handle dynamic paths like /course/:id
            if (routePath.includes(':')) {
                const routeRegex = new RegExp('^' + routePath.replace(/:[a-zA-Z0-9_]+/g, '([a-zA-Z0-9_]+)') + '$');
                const match = path.match(routeRegex);
                if (match) {
                    matchedRoute = routeDef;

                    // Extract param values
                    const paramNames = routePath.match(/:[a-zA-Z0-9_]+/g).map(p => p.substring(1));
                    paramNames.forEach((name, i) => {
                        routeParams[name] = match[i + 1];
                    });
                    break;
                }
            } else if (routePath === path) {
                matchedRoute = routeDef;
                break;
            }
        }

        if (!matchedRoute) {
            // Default check Home or 404
            matchedRoute = this.routes['/'];
            if (!matchedRoute) {
                app.showToast('Page not found', 'error');
                return;
            }
        }

        // Check authentication requirement
        if (matchedRoute.requireAuth && !auth.isAuthenticated()) {
            app.showToast('Please login to access this page', 'error');
            this.navigate('/login');
            return;
        }

        // Render target View
        const contentArea = document.getElementById('main-content');
        contentArea.innerHTML = '<div style="text-align: center; margin-top: 5rem;">Loading...</div>'; // simple loader

        setTimeout(() => {
            matchedRoute.renderFunction(contentArea, routeParams);
            lucide.createIcons(); // refresh icons after render
        }, 50);

        this.currentRoute = path;
    }
}

const router = new Router();
