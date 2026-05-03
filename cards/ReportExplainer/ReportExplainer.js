import { renderReportInput } from './ReportInput.js';
import { renderReportAnalysis } from './ReportAnalysis.js';

export default function renderReportExplainer(app, prefilledData = null) {
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
                    <div class="avatar" style="background:#f0fdf4; color:#10b981;"><i class="fas fa-file-medical-alt"></i></div>
                    Report Explainer
                </h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem; max-width: 600px;">
                    Upload a lab report or medical document. Our AI will break down complex medical jargon into easy-to-understand terms.
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
        contentArea.appendChild(renderReportAnalysis(app, prefilledData));
    } else {
        contentArea.appendChild(renderReportInput(app));
    }

    return container;
}
