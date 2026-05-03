import { renderHeartInputForm } from './HeartInputForm.js';
import { renderHeartRiskAnalysis } from './HeartRiskAnalysis.js';

export default function renderHeartPredictor(app, prefilledData = null) {
    const container = document.createElement('div');
    container.className = 'screen bg-light fade-in';
    
    const isShowingAnalysis = prefilledData && prefilledData.showAnalysis;
    
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
                    <div class="avatar" style="background:#fef2f2; color:#ef4444;"><i class="fas fa-heartbeat"></i></div>
                    Heart Risk Predictor
                </h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem; max-width: 600px;">
                    Enter your health metrics to assess your cardiovascular health and calculate your risk profile using our AI models.
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
    
    if (isShowingAnalysis) {
        contentArea.appendChild(renderHeartRiskAnalysis(app, prefilledData));
    } else {
        contentArea.appendChild(renderHeartInputForm(app));
    }

    return container;
}
