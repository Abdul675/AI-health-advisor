import { renderPlanInputForm } from './PlanInputForm.js';
import { renderPlanGenerator } from './PlanGenerator.js';

export default function renderPersonalizedPlan(app, prefilledData = null) {
    const container = document.createElement('div');
    container.className = 'screen bg-light fade-in';
    
    const isShowingPlan = prefilledData && prefilledData.showPlan;
    
    container.innerHTML = `
        <header class="dashboard-header">
            <div class="container header-content">
                <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: bold; font-size: 1.2rem; cursor: pointer;" id="back-btn">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </div>
            </div>
        </header>

        <main class="container" style="flex: 1; padding-top: 2rem; padding-bottom: 2rem;">
            <div class="mb-6">
                <h1 style="font-size: 2rem; display: flex; align-items: center; gap: 0.75rem;">
                    <div class="avatar" style="background:#faf5ff; color:#a855f7;"><i class="fas fa-clipboard-list"></i></div>
                    Personalized Health Plan
                </h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem; max-width: 600px;">
                    Tell us your goals and dietary preferences. Our AI will craft a custom diet and exercise plan tailored just for you.
                </p>
            </div>
            
            <div id="module-content">
                <!-- Content injected here -->
            </div>
        </main>
    `;

    const backBtn = container.querySelector('#back-btn');
    backBtn.addEventListener('click', () => app.navigate('dashboard'));
    
    const contentArea = container.querySelector('#module-content');
    
    if (isShowingPlan) {
        contentArea.appendChild(renderPlanGenerator(app, prefilledData));
    } else {
        contentArea.appendChild(renderPlanInputForm(app));
    }

    return container;
}
