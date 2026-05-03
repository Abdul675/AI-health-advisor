export function renderSignup(app) {
    const container = document.createElement('div');
    container.className = 'screen center-screen';
    container.style.background = 'url("https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80") center/cover fixed';
    
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
                    <i class="fas fa-user-plus"></i>
                </div>
                <h2>Create Account</h2>
                <p>Join AI Health Adviser today</p>
            </div>
            
            <form id="signup-form">
                <div class="form-group">
                    <label class="form-label" for="name">Full Name</label>
                    <div style="position: relative;">
                        <i class="fas fa-user" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                        <input type="text" id="name" class="form-control" style="padding-left: 2.5rem;" placeholder="John Doe" required>
                    </div>
                </div>
                
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
                    Sign Up <i class="fas fa-arrow-right ml-2"></i>
                </button>
                
                <div class="text-center" style="font-size: 0.9rem;">
                    <p>Already have an account? <a href="#" id="link-login" style="color: var(--primary-color); font-weight: 500; text-decoration: none;">Sign In</a></p>
                </div>
            </form>
        </div>
    `;

    // Add event listeners
    const form = container.querySelector('#signup-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = container.querySelector('#name').value;
        const email = container.querySelector('#email').value;
        // Mock authentication
        app.login({ name: name, email: email });
    });

    const loginLink = container.querySelector('#link-login');
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        app.navigate('login');
    });

    return container;
}
