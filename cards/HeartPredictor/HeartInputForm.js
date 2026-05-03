export function renderHeartInputForm(app) {
    const container = document.createElement('div');
    container.className = 'card max-w-3xl mx-auto';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';
    
    container.innerHTML = `
        <h3 class="mb-4">Health Metrics</h3>
        <form id="heart-form">
            <div class="responsive-grid-2">
                <div class="form-group">
                    <label class="form-label" for="age">Age</label>
                    <input type="number" id="age" class="form-control" placeholder="e.g. 45" required min="1" max="120">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="gender">Gender</label>
                    <select id="gender" class="form-control" required>
                        <option value="" disabled selected>Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="blood-pressure">Systolic Blood Pressure (mmHg)</label>
                    <input type="number" id="blood-pressure" class="form-control" placeholder="e.g. 120" required min="70" max="250">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="cholesterol">Total Cholesterol (mg/dL)</label>
                    <input type="number" id="cholesterol" class="form-control" placeholder="e.g. 190" required min="100" max="400">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="smoking">Smoking History</label>
                    <select id="smoking" class="form-control" required>
                        <option value="" disabled selected>Select history</option>
                        <option value="never">Never Smoked</option>
                        <option value="former">Former Smoker</option>
                        <option value="current">Current Smoker</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="diabetes">Diabetes</label>
                    <select id="diabetes" class="form-control" required>
                        <option value="" disabled selected>Select status</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group mt-4 text-center">
                <button type="submit" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.1rem; background-color: #ef4444; border-color: #ef4444;">
                    <i class="fas fa-heart-pulse"></i> Predict Risk
                </button>
            </div>
        </form>
    `;
    
    // Add hover effect specifically to button colors
    const submitBtn = container.querySelector('button[type="submit"]');
    submitBtn.addEventListener('mouseenter', () => submitBtn.style.backgroundColor = '#dc2626');
    submitBtn.addEventListener('mouseleave', () => submitBtn.style.backgroundColor = '#ef4444');

    const form = container.querySelector('#heart-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Collect data
        const data = {
            age: container.querySelector('#age').value,
            gender: container.querySelector('#gender').value,
            bp: container.querySelector('#blood-pressure').value,
            chol: container.querySelector('#cholesterol').value,
            smoker: container.querySelector('#smoking').value,
            diabetes: container.querySelector('#diabetes').value
        };
        
        // Mock prediction based on dummy logic
        let riskScore = 0;
        if (data.age > 50) riskScore += 2;
        if (data.bp > 130) riskScore += 2;
        if (data.chol > 200) riskScore += 2;
        if (data.smoker === 'current') riskScore += 3;
        if (data.diabetes === 'yes') riskScore += 2;
        
        let riskLevel = 'Low';
        if (riskScore > 3 && riskScore <= 6) riskLevel = 'Moderate';
        if (riskScore > 6) riskLevel = 'High';
        
        app.navigate('HeartPredictor', { 
            showAnalysis: true, 
            metrics: data,
            riskLevel: riskLevel
        });
    });
    
    return container;
}
