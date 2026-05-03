import { renderDoctorSearchForm } from './DoctorSearchForm.js';
import { renderDoctorResults } from './DoctorResults.js';

export default function renderDoctorFinder(app, prefilledData = null) {
    const container = document.createElement('div');
    container.className = 'screen bg-light fade-in';
    
    // Check if we are showing search results
    const isShowingResults = prefilledData && prefilledData.showResults;
    
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
                    <div class="avatar" style="background:#f0fdfa; color:#14b8a6;"><i class="fas fa-user-md"></i></div>
                    Find a Doctor
                </h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem; max-width: 600px;">
                    Search for top-rated specialists and healthcare professionals in your area. Book appointments directly through our platform.
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
    
    if (isShowingResults) {
        contentArea.appendChild(renderDoctorResults(app, prefilledData));
    } else {
        // We might have a prefilled specialty from another tool
        contentArea.appendChild(renderDoctorSearchForm(app, prefilledData));
    }

    return container;
}
