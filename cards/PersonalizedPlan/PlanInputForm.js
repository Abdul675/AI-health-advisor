const API_BASE = "http://127.0.0.1:8000";

export function renderPlanInputForm(app) {
    const container = document.createElement('div');
    container.className = 'card max-w-3xl mx-auto';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';

    container.innerHTML = `
        <h3 class="mb-4">Tell us about your goals</h3>
        <form id="plan-form">
            <div class="responsive-grid-2">

                <div class="form-group" style="grid-column: span 2;">
                    <label class="form-label" for="primary-goal">Primary Goal</label>
                    <select id="primary-goal" class="form-control" required style="cursor:pointer;">
                        <option value="" disabled selected>Select an objective</option>
                        <option value="weight_loss">Weight Loss</option>
                        <option value="muscle_gain">Muscle Gain</option>
                        <option value="maintenance">General Health & Maintenance</option>
                        <option value="heart_health">Heart Health / Low Sodium</option>
                        <option value="diabetes_management">Blood Sugar Management</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="dietary-pref">Dietary Preference</label>
                    <select id="dietary-pref" class="form-control" style="cursor:pointer;">
                        <option value="none">No specific preference</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="keto">Keto</option>
                        <option value="paleo">Paleo</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="allergies">Allergies / Exclusions</label>
                    <input type="text" id="allergies" class="form-control"
                        placeholder="E.g. Peanuts, Dairy, Gluten (Optional)">
                </div>

                <div class="form-group">
                    <label class="form-label" for="exercise-level">Current Exercise Level</label>
                    <select id="exercise-level" class="form-control" required style="cursor:pointer;">
                        <option value="" disabled selected>Select level</option>
                        <option value="beginner">Beginner (Rarely exercise)</option>
                        <option value="intermediate">Intermediate (1-3 times/week)</option>
                        <option value="advanced">Advanced (4+ times/week)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="time-commitment">Daily Time for Exercise</label>
                    <select id="time-commitment" class="form-control" required style="cursor:pointer;">
                        <option value="" disabled selected>Select time</option>
                        <option value="15">15-20 mins</option>
                        <option value="30">30-45 mins</option>
                        <option value="60">60+ mins</option>
                    </select>
                </div>
            </div>

            <!-- Error -->
            <div id="plan-error" style="display:none; color:#ef4444; font-size:0.88rem;
                 margin-bottom:1rem; padding:0.75rem 1rem; background:#fef2f2;
                 border:1px solid #fca5a5; border-radius:8px;">
                <i class="fas fa-exclamation-circle"></i>
                <span id="plan-error-text"></span>
            </div>

            <div class="form-group mt-4 text-center">
                <button type="submit" id="submit-btn" class="btn btn-primary"
                    style="padding:1rem 3rem; font-size:1.1rem;
                           background-color:#a855f7; border-color:#a855f7;">
                    <i class="fas fa-magic" style="margin-right:0.5rem;"></i>
                    <span id="submit-btn-text">Generate My Plan</span>
                </button>
            </div>
        </form>
    `;

    const submitBtn  = container.querySelector('#submit-btn');
    const submitText = container.querySelector('#submit-btn-text');
    const errorDiv   = container.querySelector('#plan-error');
    const errorText  = container.querySelector('#plan-error-text');

    submitBtn.addEventListener('mouseenter', () => submitBtn.style.backgroundColor = '#9333ea');
    submitBtn.addEventListener('mouseleave', () => submitBtn.style.backgroundColor = '#a855f7');

    const form = container.querySelector('#plan-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';

        const goalEl   = container.querySelector('#primary-goal');
        const goal     = goalEl.value;
        const goalText = goalEl.options[goalEl.selectedIndex].text;
        const diet     = container.querySelector('#dietary-pref').value;
        const allergies = container.querySelector('#allergies').value || 'None';
        const level    = container.querySelector('#exercise-level').value;
        const time     = parseInt(container.querySelector('#time-commitment').value);

        // Loading state
        submitBtn.disabled   = true;
        submitBtn.innerHTML  = `<i class="fas fa-spinner fa-spin" style="margin-right:0.5rem;"></i> Generating your plan...`;

        try {
            const response = await fetch(`${API_BASE}/plan/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goal,
                    goal_text: goalText,
                    diet,
                    allergies,
                    level,
                    time
                })
            });

            if (!response.ok) {
                const err = await response.json();
                errorText.textContent = err.detail || 'Something went wrong. Please try again.';
                errorDiv.style.display = 'block';
                return;
            }

            const result = await response.json();

            app.navigate('PersonalizedPlan', {
                showPlan: true,
                prefs:    result.prefs,
                plan:     result.plan        // full AI-generated plan
            });

        } catch (err) {
            errorText.textContent = 'Cannot connect to server. Make sure the backend is running.';
            errorDiv.style.display = 'block';
        } finally {
            submitBtn.disabled  = false;
            submitBtn.innerHTML = `<i class="fas fa-magic" style="margin-right:0.5rem;"></i><span>Generate My Plan</span>`;
        }
    });

    return container;
}