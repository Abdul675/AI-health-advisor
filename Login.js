export function renderLogin(app) {
    const container = document.createElement('div');
    container.className = 'screen center-screen';
    container.style.background = 'url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80") center/cover fixed';
    
    container.innerHTML = `
        <style>
            .auth-overlay {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(4px);
                z-index: 0;
            }
            .auth-card {
                position: relative;
                z-index: 1;
                width: 100%;
                max-width: 420px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 2.5rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            .auth-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            .auth-icon {
                width: 60px;
                height: 60px;
                background: var(--primary-color);
                color: white;
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                margin: 0 auto 1rem;
                box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
            }
        </style>
        
        <div class="auth-overlay"></div>
        <div class="auth-card fade-in">
            <div class="auth-header">
                <div class="auth-icon">
                    <i class="fas fa-heartbeat"></i>
                </div>
                <h2>Welcome Back</h2>
                <p>Sign in to your health portal</p>
            </div>
            
            <form id="login-form">
                <div class="form-group">
                    <label class="form-label" for="email">Email Address</label>
                    <div style="position: relative;">
                        <i class="fas fa-envelope" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                        <input type="email" id="email" class="form-control" style="padding-left: 2.5rem;" placeholder="john@example.com" required>
                    </div>
                </div>
                
                <div class="form-group mb-6">
                    <label class="form-label" for="password">Password</label>
                    <div style="position: relative;">
                        <i class="fas fa-lock" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                        <input type="password" id="password" class="form-control" style="padding-left: 2.5rem;" placeholder="••••••••" required>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block mb-4">
                    Sign In <i class="fas fa-arrow-right ml-2"></i>
                </button>
                
                <div class="text-center" style="font-size: 0.9rem;">
                    <p>Don't have an account? <a href="#" id="link-signup" style="color: var(--primary-color); font-weight: 500; text-decoration: none;">Sign Up</a></p>
                </div>
            </form>
        </div>
    `;

    // Add event listeners
    const form = container.querySelector('#login-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = container.querySelector('#email').value;
        // Mock authentication
        app.login({ name: 'User', email: email });
    });

    const signupLink = container.querySelector('#link-signup');
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        app.navigate('signup');
    });

    return container;
}
