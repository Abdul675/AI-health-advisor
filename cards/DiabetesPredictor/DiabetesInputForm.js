export function renderDiabetesInputForm(app) {
    const container = document.createElement('div');
    container.className = 'card max-w-3xl mx-auto';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';
    
    container.innerHTML = `
        <h3 class="mb-4">Health Metrics</h3>
        <form id="diabetes-form">
            <div class="responsive-grid-2">
                <div class="form-group">
                    <label class="form-label" for="age">Age</label>
                    <input type="number" id="age" class="form-control" placeholder="e.g. 45" required min="1" max="120">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="bmi">BMI (Body Mass Index)</label>
                    <input type="number" id="bmi" class="form-control" placeholder="e.g. 24.5" required min="10" max="60" step="0.1">
                </div>

                <div class="form-group">
                    <label class="form-label" for="blood-glucose">Fasting Blood Glucose (mg/dL)</label>
                    <input type="number" id="blood-glucose" class="form-control" placeholder="e.g. 95" required min="50" max="400">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="hbA1c">HbA1c Level (%)</label>
                    <input type="number" id="hbA1c" class="form-control" placeholder="e.g. 5.7" required min="3" max="15" step="0.1">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="family-history">Family History of Diabetes</label>
                    <select id="family-history" class="form-control" required>
                        <option value="" disabled selected>Select option</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="physical-activity">Physical Activity Level</label>
                    <select id="physical-activity" class="form-control" required>
                        <option value="" disabled selected>Select level</option>
                        <option value="low">Low (Sedentary)</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High (Active)</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group mt-4 text-center">
                <button type="submit" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.1rem; background-color: #f97316; border-color: #f97316;">
                    <i class="fas fa-tint"></i> Predict Risk
                </button>
            </div>
        </form>
    `;

    // Add hover effect specifically to button colors
    const submitBtn = container.querySelector('button[type="submit"]');
    submitBtn.addEventListener('mouseenter', () => submitBtn.style.backgroundColor = '#ea580c');
    submitBtn.addEventListener('mouseleave', () => submitBtn.style.backgroundColor = '#f97316');

    const form = container.querySelector('#diabetes-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Collect data
        const data = {
            age: parseFloat(container.querySelector('#age').value),
            bmi: parseFloat(container.querySelector('#bmi').value),
            glucose: parseFloat(container.querySelector('#blood-glucose').value),
            hba1c: parseFloat(container.querySelector('#hbA1c').value),
            family: container.querySelector('#family-history').value,
            activity: container.querySelector('#physical-activity').value
        };
        
        // Mock prediction logic
        let riskScore = 0;
        if (data.age > 45) riskScore += 1;
        if (data.bmi > 25) riskScore += 2;
        if (data.glucose > 100) riskScore += 3;
        if (data.hba1c > 5.7) riskScore += 3;
        if (data.family === 'yes') riskScore += 2;
        if (data.activity === 'low') riskScore += 1;
        
        let riskLevel = 'Low';
        if (riskScore > 3 && riskScore <= 6) riskLevel = 'Moderate';
        if (riskScore > 6) riskLevel = 'High';
        
        app.navigate('DiabetesPredictor', { 
            showAnalysis: true, 
            metrics: data,
            riskLevel: riskLevel
        });
    });
    
    return container;
}
