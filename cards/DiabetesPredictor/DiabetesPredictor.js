import { renderDiabetesInputForm } from './DiabetesInputForm.js';
import { renderDiabetesRiskAnalysis } from './DiabetesRiskAnalysis.js';

export default function renderDiabetesPredictor(app, prefilledData = null) {
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
                    <div class="avatar" style="background:#fff7ed; color:#f97316;"><i class="fas fa-tint"></i></div>
                    Diabetes Predictor
                </h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem; max-width: 600px;">
                    Enter your health metrics to assess your likelihood of developing diabetes, leveraging AI predictive models for early detection.
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
        contentArea.appendChild(renderDiabetesRiskAnalysis(app, prefilledData));
    } else {
        contentArea.appendChild(renderDiabetesInputForm(app));
    }

    return container;
}
