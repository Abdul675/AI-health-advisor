import { renderSymptomInput } from './SymptomInput.js';
import { renderQuickSymptoms } from './QuickSymptoms.js';
import { renderSymptomAnalysis } from './SymptomAnalysis.js';

export default function renderSymptomChecker(app, prefilledData = null) {
    const container = document.createElement('div');
    container.className = 'screen bg-light fade-in';
    
    // Check if we show analysis or input
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
                    <div class="avatar" style="background:#eff6ff; color:#3b82f6;"><i class="fas fa-stethoscope"></i></div>
                    Symptom Checker
                </h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem; max-width: 600px;">
                    Describe what you're feeling right now. Our AI will analyze your symptoms and suggest potential causes and next steps.
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
        contentArea.appendChild(renderSymptomAnalysis(app, prefilledData));
    } else {
        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '1fr 300px';
        row.style.gap = '2rem';
        row.style.alignItems = 'start';
        
        // Mobile responsive
        if (window.innerWidth < 768) {
            row.style.gridTemplateColumns = '1fr';
        }

        row.appendChild(renderSymptomInput(app));
        row.appendChild(renderQuickSymptoms(app));
        
        contentArea.appendChild(row);
    }

    return container;
}
