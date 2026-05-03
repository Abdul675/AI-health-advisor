export function renderDiabetesRiskAnalysis(app, data) {
    // Record history
    app.addHistoryEntry(
        'Diabetes Predictor',
        `${data.riskLevel} Risk Profile`,
        `Risk calculated based on user vitals.`,
        'fas fa-tint',
        '#f97316',
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
    if (data.metrics.bmi > 25) {
        recommendations.push("Your BMI indicates you are overweight. Consider dietary changes and a structured weight-loss plan to lower diabetes risk.");
    }
    if (data.metrics.glucose > 100) {
        recommendations.push("Your fasting glucose is elevated. Aim to eliminate sugary drinks and processed carbohydrates from your diet.");
    }
    if (data.metrics.hba1c > 5.7) {
        recommendations.push("An HbA1c over 5.7% is considered prediabetic. This is a critical time to implement comprehensive lifestyle changes.");
    }
    if (data.metrics.family === 'yes') {
        recommendations.push("Given your family history of diabetes, regular screening and preventative lifestyle measures are especially important.");
    }
    if (data.metrics.activity === 'low') {
        recommendations.push("Low physical activity increases insulin resistance. Try to incorporate at least 30 minutes of moderate exercise daily.");
    }
    
    if (recommendations.length === 0) {
        recommendations = [
            "Your metrics look great. Keep up the balanced diet.",
            "Maintain your current physical activity regimen.",
            "Continue periodic health screenings."
        ];
    } else if (data.riskLevel === 'High') {
        recommendations.unshift("URGENT: Schedule an appointment with an endocrinologist or primary care physician immediately.");
    }
    
    const recsHTML = recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('');

    container.innerHTML = `
        <div class="text-center mb-6">
            <div style="font-size: 4rem; color: ${riskColor}; margin-bottom: 1rem;">
                <i class="fas ${riskIcon}"></i>
            </div>
            <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${data.riskLevel} Risk Profile</h2>
            <p class="text-muted">Based on our AI analysis of your reported diabetes indicators.</p>
        </div>
        
        <div class="responsive-stats-grid">
            <div>
                <span class="text-muted" style="font-size: 0.85rem; display: block;">Fasting Glucose</span>
                <strong>${data.metrics.glucose} mg/dL</strong>
            </div>
            <div>
                <span class="text-muted" style="font-size: 0.85rem; display: block;">HbA1c</span>
                <strong>${data.metrics.hba1c}%</strong>
            </div>
            <div>
                <span class="text-muted" style="font-size: 0.85rem; display: block;">BMI</span>
                <strong>${data.metrics.bmi}</strong>
            </div>
            <div>
                <span class="text-muted" style="font-size: 0.85rem; display: block;">Activity Level</span>
                <strong style="text-transform: capitalize;">${data.metrics.activity}</strong>
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
            <button class="btn btn-primary" id="btn-find-doctor" style="background: #f97316; border-color: #f97316;">
                <i class="fas fa-user-md"></i> Find an Endocrinologist
            </button>
        </div>
    `;
    
    container.querySelector('#btn-recalculate').addEventListener('click', () => {
        app.navigate('DiabetesPredictor');
    });
    
    container.querySelector('#btn-find-doctor').addEventListener('click', () => {
        app.navigate('DoctorFinder', { specialty: 'Endocrinologist' });
    });

    return container;
}
