const API_BASE = "http://127.0.0.1:8000";

export function renderSymptomInput(app) {
    const container = document.createElement('div');
    container.className = 'card';

    container.innerHTML = `
        <h3 class="mb-4">Describe your symptoms</h3>
        <div class="form-group">
            <label class="form-label" for="symptom-text">How are you feeling?</label>
            <textarea id="symptom-text" class="form-control" rows="6"
                placeholder="E.g., I have had a severe headache since morning, feeling nauseous and sensitive to light...">
            </textarea>
        </div>

        <div class="form-group">
            <label class="form-label">Duration</label>
            <select id="symptom-duration" class="form-control" style="cursor:pointer;">
                <option value="" disabled selected>Select duration</option>
                <option value="today">Just started today</option>
                <option value="few_days">For a few days</option>
                <option value="weeks">More than a week</option>
                <option value="months">Several months</option>
            </select>
        </div>

        <!-- Error -->
        <div id="symptom-error" style="display:none; color:#ef4444; font-size:0.88rem;
             margin-bottom:1rem; padding:0.75rem 1rem; background:#fef2f2;
             border:1px solid #fca5a5; border-radius:8px;">
            <i class="fas fa-exclamation-circle"></i>
            <span id="symptom-error-text"></span>
        </div>

        <button id="analyze-btn" class="btn btn-primary" style="width:100%;">
            <i class="fas fa-magic" style="margin-right:0.5rem;"></i>
            <span id="analyze-btn-text">Analyze Symptoms</span>
        </button>
    `;

    const analyzeBtn  = container.querySelector('#analyze-btn');
    const btnText     = container.querySelector('#analyze-btn-text');
    const errorDiv    = container.querySelector('#symptom-error');
    const errorText   = container.querySelector('#symptom-error-text');

    analyzeBtn.addEventListener('click', async () => {
        const symptoms = container.querySelector('#symptom-text').value.trim();
        const duration = container.querySelector('#symptom-duration').value;

        // Validate
        errorDiv.style.display = 'none';
        if (!symptoms) {
            errorText.textContent = 'Please describe your symptoms first.';
            errorDiv.style.display = 'block';
            return;
        }
        if (!duration) {
            errorText.textContent = 'Please select how long you have had these symptoms.';
            errorDiv.style.display = 'block';
            return;
        }

        // Loading
        analyzeBtn.disabled  = true;
        analyzeBtn.innerHTML = `<i class="fas fa-spinner fa-spin" style="margin-right:0.5rem;"></i> Analyzing...`;

        try {
            const response = await fetch(`${API_BASE}/symptoms/analyze`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ symptoms, duration })
            });

            if (!response.ok) {
                const err = await response.json();
                errorText.textContent = err.detail || 'Something went wrong. Please try again.';
                errorDiv.style.display = 'block';
                return;
            }

            const result = await response.json();

            app.navigate('SymptomChecker', {
                showAnalysis: true,
                symptoms:     result.symptoms,
                duration:     result.duration,
                analysis:     result.analysis
            });

        } catch (err) {
            errorText.textContent = 'Cannot connect to server. Make sure the backend is running.';
            errorDiv.style.display = 'block';
        } finally {
            analyzeBtn.disabled  = false;
            analyzeBtn.innerHTML = `<i class="fas fa-magic" style="margin-right:0.5rem;"></i><span>Analyze Symptoms</span>`;
        }
    });

    return container;
}