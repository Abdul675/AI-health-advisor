export function renderDashboard(app) {
    const container = document.createElement('div');
    container.className = 'screen bg-light fade-in';
    
    container.innerHTML = `
        <style>
            .dashboard-header {
                background: white;
                padding: 1.5rem 0;
                box-shadow: var(--shadow-sm);
                position: sticky;
                top: 0;
                z-index: 10;
            }
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .user-profile {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--primary-color);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 1.2rem;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .avatar:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
            }
            .profile-dropdown {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                border: 1px solid var(--border-color);
                width: 240px;
                padding: 1rem;
                z-index: 100;
                opacity: 0;
                transform: translateY(-10px) scale(0.95);
                pointer-events: none;
                transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                transform-origin: top right;
            }
            .profile-dropdown.active {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }
            .dropdown-header {
                display: flex;
                flex-direction: column;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
                margin-bottom: 0.5rem;
            }
            .grid-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 1.5rem;
                padding: 2rem 0;
            }
            .feature-card {
                background: white;
                border-radius: var(--border-radius);
                padding: 1.5rem;
                box-shadow: var(--shadow-md);
                transition: var(--transition);
                cursor: pointer;
                border: 1px solid var(--border-color);
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            .feature-card:hover {
                transform: translateY(-5px);
                box-shadow: var(--shadow-lg);
                border-color: var(--primary-color);
            }
            .feature-icon {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                margin-bottom: 1rem;
            }
            .feature-title {
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: var(--text-main);
            }
            .feature-desc {
                color: var(--text-muted);
                font-size: 0.9rem;
                flex-grow: 1;
            }
            .icon-blue   { background: #eff6ff; color: #3b82f6; }
            .icon-red    { background: #fef2f2; color: #ef4444; }
            .icon-orange { background: #fff7ed; color: #f97316; }
            .icon-green  { background: #f0fdf4; color: #10b981; }
            .icon-purple { background: #faf5ff; color: #a855f7; }
            .icon-teal   { background: #f0fdfa; color: #14b8a6; }
            .icon-pink   { background: #fdf2f8; color: #ec4899; }
            .logout-btn {
                background: white;
                color: var(--text-muted);
                border: 1px solid var(--border-color);
                padding: 0.35rem 0.8rem;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                margin-top: 0.5rem;
                width: 100%;
                justify-content: center;
            }
            .logout-btn:hover {
                background: #fef2f2;
                color: var(--danger-color);
                border-color: #fecaca;
                transform: translateY(-2px);
                box-shadow: 0 4px 6px rgba(239, 68, 68, 0.1);
            }
        </style>
        
        <header class="dashboard-header">
            <div class="container header-content">
                <div style="display:flex; align-items:center; gap:0.5rem; font-weight:bold; font-size:1.2rem; color:var(--primary-color);">
                    <i class="fas fa-heartbeat"></i> AI Health Adviser
                </div>
                <div class="user-profile" style="position:relative;">
                    <div class="avatar" id="avatar-btn">${(app.state.currentUser?.name || 'U').charAt(0)}</div>
                    <div class="profile-dropdown" id="profile-dropdown">
                        <div class="dropdown-header">
                            <span style="font-weight:600; font-size:1.1rem; color:var(--text-main);">${app.state.currentUser?.name || 'User'}</span>
                            <span style="font-size:0.85rem; color:var(--text-muted);">${app.state.currentUser?.email || 'user@example.com'}</span>
                        </div>
                        <button class="logout-btn" id="logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <main class="container" style="flex:1;">
            <div style="margin-top:2rem;">
                <h1 style="font-size:1.8rem;">Good Morning, ${app.state.currentUser?.name?.split(' ')[0] || 'User'} 👋</h1>
                <p style="color:var(--text-muted); margin-top:0.5rem;">How can we help you with your health today?</p>
            </div>
            <div class="grid-container" id="features-grid"></div>
        </main>
    `;

    // ── Features — History removed ──────────────────────────
    const features = [
        { id: 'SymptomChecker',    title: 'Symptom Checker',     desc: 'Describe your symptoms for an instant AI analysis.',          icon: 'fa-stethoscope',    colorClass: 'icon-blue'   },
        { id: 'HeartPredictor',    title: 'Heart Risk Predictor', desc: 'Assess your cardiovascular health and risks.',                icon: 'fa-heartbeat',      colorClass: 'icon-red'    },
        { id: 'DiabetesPredictor', title: 'Diabetes Predictor',   desc: 'Check your probability for diabetes early on.',              icon: 'fa-tint',           colorClass: 'icon-orange' },
        { id: 'ReportExplainer',   title: 'Report Explainer',     desc: 'Upload lab reports to get them explained simply.',           icon: 'fa-file-medical-alt',colorClass: 'icon-green'  },
        { id: 'PersonalizedPlan',  title: 'Personalized Plan',    desc: 'Get a custom diet and exercise plan tailored for you.',      icon: 'fa-clipboard-list', colorClass: 'icon-purple' },
        { id: 'DoctorFinder',      title: 'Find a Doctor',        desc: 'Locate specialists and book appointments nearby.',           icon: 'fa-user-md',        colorClass: 'icon-teal'   },
        { id: 'AIChat',            title: 'AI Health Assistant',  desc: 'Chat directly with our AI for quick health queries.',        icon: 'fa-robot',          colorClass: 'icon-pink'   },
    ];

    const grid = container.querySelector('#features-grid');
    features.forEach(feature => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.innerHTML = `
            <div class="feature-icon ${feature.colorClass}">
                <i class="fas ${feature.icon}"></i>
            </div>
            <h3 class="feature-title">${feature.title}</h3>
            <p class="feature-desc">${feature.desc}</p>
        `;
        card.addEventListener('click', () => app.navigate(feature.id));
        grid.appendChild(card);
    });

    // ── Logout ───────────────────────────────────────────────
    container.querySelector('#logout-btn').addEventListener('click', () => app.logout());

    // ── Avatar dropdown ──────────────────────────────────────
    const avatarBtn        = container.querySelector('#avatar-btn');
    const profileDropdown  = container.querySelector('#profile-dropdown');

    avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target) && e.target !== avatarBtn) {
            profileDropdown.classList.remove('active');
        }
    });

    return container;
}