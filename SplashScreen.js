export function renderSplashScreen() {
    const container = document.createElement('div');
    container.className = 'screen center-screen bg-gradient-primary';
    
    // Add specific splash styling to a style tag if needed
    container.innerHTML = `
        <style>
            .bg-gradient-primary {
                background: linear-gradient(135deg, var(--primary-color), #4f46e5);
                color: white;
            }
            .splash-logo {
                font-size: 4rem;
                margin-bottom: 1rem;
                animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: .7; transform: scale(1.05); }
            }
            .loader {
                width: 48px;
                height: 48px;
                border: 5px solid rgba(255,255,255,0.3);
                border-bottom-color: white;
                border-radius: 50%;
                display: inline-block;
                box-sizing: border-box;
                animation: rotation 1s linear infinite;
                margin-top: 2rem;
            }
            @keyframes rotation {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
        <div class="text-center fade-in">
            <div class="splash-logo">
                <i class="fas fa-heartbeat"></i>
            </div>
            <h1 class="mb-2" style="color: white; font-size: 2.5rem;">AI Health Adviser</h1>
            <p style="color: rgba(255,255,255,0.8); font-size: 1.1rem;">Your personal healthcare companion</p>
            <span class="loader"></span>
        </div>
    `;
    
    return container;
}
