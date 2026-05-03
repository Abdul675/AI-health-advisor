export function renderHeartRiskAnalysis(app, data) {
    // Record history
    app.addHistoryEntry(
        'Heart Risk Predictor',
        `${data.riskLevel} Risk Profile`,
        `Risk calculated based on user vitals.`,
        'fas fa-heartbeat',
        '#ef4444',
        data
    );

    const container = document.createElement('div');
    container.className = 'card max-w-3xl mx-auto';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';
    
    let riskColor = 'var(--success-color)';
    let riskIcon = 'fa-check-circle';
    let recommendations = [];
    
    if (data.riskLevel === 'Moderate') {
        riskColor = 'var(--warning-color)';
        riskIcon = 'fa-exclamation-circle';
    } else if (data.riskLevel === 'High') {
        riskColor = 'var(--danger-color)';
        riskIcon = 'fa-exclamation-triangle';
    }
    
    // Dynamic recommendations based on metrics
    if (data.metrics.bp > 120) {
        recommendations.push("Your blood pressure is elevated. Consider reducing sodium intake and managing stress.");
    }
    if (data.metrics.chol > 200) {
        recommendations.push("Your cholesterol is above optimal levels. Focus on a diet low in saturated fats and high in fiber.");
    }
    if (data.metrics.smoker === 'current') {
        recommendations.push("Smoking significantly increases heart disease risk. We strongly advise seeking resources to quit smoking.");
    } else if (data.metrics.smoker === 'former') {
        recommendations.push("Great job quitting smoking! Continue maintaining a smoke-free lifestyle.");
    }
    if (data.metrics.diabetes === 'yes') {
        recommendations.push("Managing your diabetes is crucial for heart health. Keep your blood sugar well-controlled.");
    }
    
    if (recommendations.length === 0) {
        recommendations = [
            "Your metrics look excellent! Keep up the balanced diet.",
            "Maintain your current physical activity regimen (aim for 150 mins/week).",
            "Continue periodic health screenings."
        ];
    } else if (data.riskLevel === 'High') {
        recommendations.unshift("URGENT: Schedule an appointment with a cardiologist as soon as possible.");
    }
    
    const recsHTML = recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('');

    container.innerHTML = `
        <div class="text-center mb-6">
            <div style="font-size: 4rem; color: ${riskColor}; margin-bottom: 1rem;">
                <i class="fas ${riskIcon}"></i>
            </div>
            <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${data.riskLevel} Risk Profile</h2>
            <p class="text-muted">Based on our AI analysis of your reported cardiovascular metrics.</p>
        </div>
        
        <div class="responsive-stats-grid">
            <div>
                <span class="text-muted" style="font-size: 0.85rem; display: block;">Blood Pressure</span>
                <strong>${data.metrics.bp} mmHg</strong>
            </div>
            <div>
                <span class="text-muted" style="font-size: 0.85rem; display: block;">Total Cholesterol</span>
                <strong>${data.metrics.chol} mg/dL</strong>
            </div>
            <div>
                <span class="text-muted" style="font-size: 0.85rem; display: block;">Smoking Status</span>
                <strong style="text-transform: capitalize;">${data.metrics.smoker}</strong>
            </div>
            <div>
                <span class="text-muted" style="font-size: 0.85rem; display: block;">Diabetic</span>
                <strong style="text-transform: capitalize;">${data.metrics.diabetes}</strong>
            </div>
        </div>

        <div class="mb-6">
            <h3 class="mb-4">Action Plan</h3>
            <ul style="padding-left: 1.5rem; color: var(--text-main);">
                ${recsHTML}
            </ul>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
            <button class="btn btn-outline" id="btn-recalculate">
                <i class="fas fa-redo"></i> Recalculate
            </button>
            <button class="btn btn-primary" id="btn-find-doctor" style="background: var(--danger-color); border-color: var(--danger-color);">
                <i class="fas fa-user-md"></i> Find a Cardiologist
            </button>
        </div>
    `;
    
    container.querySelector('#btn-recalculate').addEventListener('click', () => {
        app.navigate('HeartPredictor');
    });
    
    container.querySelector('#btn-find-doctor').addEventListener('click', () => {
        app.navigate('DoctorFinder', { specialty: 'Cardiologist' });
    });

    return container;
}
