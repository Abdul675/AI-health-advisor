import { renderSplashScreen } from './SplashScreen.js';
import { renderLogin } from './Login.js';
import { renderSignup } from './Signup.js';
import { renderDashboard } from './Dashboard.js';

class App {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.state = {
            currentUser: null,
            currentView: 'splash', // splash, login, signup, dashboard
            history: [] // Array to hold history action objects
        };
        
        this.init();
    }

    init() {
        this.navigate('splash');
        
        // Simulate loading process then go to login
        setTimeout(() => {
            if (this.state.currentView === 'splash') {
                this.navigate('login');
            }
        }, 2000);
    }

    navigate(view, data = null) {
        this.state.currentView = view;
        this.appContainer.innerHTML = ''; // Clear current contents

        switch (view) {
            case 'splash':
                this.appContainer.appendChild(renderSplashScreen());
                break;
            case 'login':
                this.appContainer.appendChild(renderLogin(this));
                break;
            case 'signup':
                this.appContainer.appendChild(renderSignup(this));
                break;
            case 'dashboard':
                this.appContainer.appendChild(renderDashboard(this));
                break;
            default:
                // Attempt to load as a feature module dynamically
                const featureModules = ['SymptomChecker', 'HeartPredictor', 'DiabetesPredictor', 'ReportExplainer', 'PersonalizedPlan', 'DoctorFinder', 'History', 'AIChat'];
                if (featureModules.includes(view)) {
                    // Show a generic loader while fetching the module
                    this.appContainer.innerHTML = '<div class="screen center-screen p-4"><span class="loader" style="border-bottom-color: var(--primary-color);"></span><p class="mt-4">Loading module...</p></div>';
                    
                    import(`./cards/${view}/${view}.js`)
                        .then(module => {
                            this.appContainer.innerHTML = ''; // clear loader
                            // Expecting the feature module to export a default function `render(app)` or named `render${View}`
                            const renderFunc = module[`render${view}`] || module.default;
                            if (renderFunc) {
                                this.appContainer.appendChild(renderFunc(this, data));
                            } else {
                                throw new Error('No render function found in module.');
                            }
                        })
                        .catch(err => {
                            console.error('Failed to load module:', err);
                            this.appContainer.innerHTML = `<div class="screen center-screen p-4">
                                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                                <h2>Module not found</h2>
                                <p class="text-muted">${err.message}</p>
                                <button class="btn btn-primary mt-4" onclick="window.HealthApp.navigate('dashboard')">Go Back to Dashboard</button>
                            </div>`;
                        });
                } else {
                    console.error(`Unknown view: ${view}`);
                    this.appContainer.innerHTML = `<div class="screen center-screen p-4"><h2>Page Not Found</h2><button class="btn btn-primary mt-4" onclick="window.HealthApp.navigate('dashboard')">Go Back</button></div>`;
                }
        }
    }

    login(user) {
        this.state.currentUser = user;
        this.navigate('dashboard');
    }

    logout() {
        this.state.currentUser = null;
        this.state.history = []; // Clear history on logout
        this.navigate('login');
    }

    addHistoryEntry(type, title, description, iconClass, colorClass, data = null) {
        const dateStr = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
        const entry = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            type,
            title,
            description,
            iconClass: iconClass || 'fas fa-info-circle',
            colorClass: colorClass || '#3b82f6',
            date: dateStr,
            data
        };
        this.state.history.unshift(entry); // Add to the beginning
    }
}

// Initializing the app globally when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.HealthApp = new App();
});
