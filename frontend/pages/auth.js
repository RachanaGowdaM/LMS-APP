pages.login = function (container) {
    container.innerHTML = `
        <div class="auth-container" style="max-width: 400px; margin: 4rem auto;">
            <div class="glass-card" style="padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to continue learning</p>
                </div>
                
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" class="form-control" required placeholder="you@example.com">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" class="form-control" required placeholder="••••••••">
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 1rem;">
                        Login <i data-lucide="arrow-right"></i>
                    </button>
                    
                    <div style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                        Don't have an account? <a href="/signup" data-link style="color: var(--primary); font-weight: 500;">Sign up</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = e.target.querySelector('button');

        try {
            btn.innerHTML = 'Connecting...';
            btn.disabled = true;

            const response = await api.login(email, password);
            auth.setSession(response.token, response.user);
            app.showToast('Login successful!');
            router.navigate('/dashboard');

        } catch (error) {
            app.showToast(error.message, 'error');
            btn.innerHTML = 'Login <i data-lucide="arrow-right"></i>';
            btn.disabled = false;
            lucide.createIcons();
        }
    });
};

pages.signup = function (container) {
    container.innerHTML = `
        <div class="auth-container" style="max-width: 400px; margin: 4rem auto;">
            <div class="glass-card" style="padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h2>Join Kodnest</h2>
                    <p>Start your learning journey today</p>
                </div>
                
                <form id="signup-form">
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" class="form-control" required placeholder="John Doe">
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" class="form-control" required placeholder="you@example.com">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" class="form-control" required placeholder="••••••••">
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 1rem;">
                        Create Account <i data-lucide="user-plus"></i>
                    </button>
                    
                    <div style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                        Already have an account? <a href="/login" data-link style="color: var(--primary); font-weight: 500;">Log in</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = e.target.querySelector('button');

        try {
            btn.innerHTML = 'Creating...';
            btn.disabled = true;

            await api.signup(name, email, password);
            app.showToast('Account created! Please log in.');
            router.navigate('/login');

        } catch (error) {
            app.showToast(error.message, 'error');
            btn.innerHTML = 'Create Account <i data-lucide="user-plus"></i>';
            btn.disabled = false;
            lucide.createIcons();
        }
    });
};
