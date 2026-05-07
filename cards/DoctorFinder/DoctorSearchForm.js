const API_BASE = "";

export function renderDoctorSearchForm(app, prefilledData = null) {
    const container = document.createElement('div');
    container.className = 'card max-w-3xl mx-auto';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';

    const defaultSpecialty = prefilledData?.specialty || '';

    container.innerHTML = `
        <h3 class="mb-4">Search Criteria</h3>
        <form id="doctor-search-form">
            <div class="responsive-grid-2">
                <div class="form-group">
                    <label class="form-label" for="specialty">Specialty</label>
                    <div style="position: relative;">
                        <i class="fas fa-stethoscope" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                        <input type="text" id="specialty" class="form-control" style="padding-left: 2.5rem;"
                            placeholder="E.g. Cardiologist, Dermatologist" value="${defaultSpecialty}" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="location">City / Area</label>
                    <div style="position: relative;">
                        <i class="fas fa-map-marker-alt" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                        <input type="text" id="location" class="form-control" style="padding-left: 2.5rem;"
                            placeholder="E.g. Rawalpindi, Saddar" required>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="fee">Consultation Fee (PKR)</label>
                    <select id="fee" class="form-control" style="cursor: pointer;">
                        <option value="any">Any Price</option>
                        <option value="0-1000">Below 1,000</option>
                        <option value="1000-2000">1,000 – 2,000</option>
                        <option value="2000-3000">2,000 – 3,000</option>
                        <option value="3000-4000">3,000 – 4,000</option>
                        <option value="4000+">Above 4,000</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="availability">Availability</label>
                    <select id="availability" class="form-control" style="cursor: pointer;">
                        <option value="anytime">Anytime</option>
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                    </select>
                </div>
            </div>

            <div id="search-error" style="display:none; color: #ef4444; margin-top: 0.75rem; font-size: 0.9rem;">
                <i class="fas fa-exclamation-circle"></i> <span id="search-error-text"></span>
            </div>

            <div class="form-group mt-4 text-center">
                <button type="submit" id="search-btn" class="btn btn-primary"
                    style="padding: 1rem 3rem; font-size: 1.1rem; background-color: #14b8a6; border-color: #14b8a6;">
                    <i class="fas fa-search" style="margin-right: 0.5rem;"></i>
                    <span id="search-btn-text">Search Doctors</span>
                </button>
            </div>
        </form>

        <div class="mt-6">
            <h4 class="mb-4 text-muted" style="font-size: 0.9rem; text-transform: uppercase;">Popular Specialties</h4>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <span class="pill-btn">Cardiologist</span>
                <span class="pill-btn">Dentist</span>
                <span class="pill-btn">Gynecologist</span>
                <span class="pill-btn">Dermatologist</span>
                <span class="pill-btn">Psychiatrist</span>
                <span class="pill-btn">Eye Specialist</span>
            </div>
        </div>

        <style>
            .pill-btn {
                padding: 0.4rem 0.8rem;
                background: #f0fdfa;
                border: 1px solid #14b8a6;
                color: #0f766e;
                border-radius: 20px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            .pill-btn:hover { background: #14b8a6; color: white; }
        </style>
    `;

    container.querySelectorAll('.pill-btn').forEach(pill => {
        pill.addEventListener('click', () => {
            container.querySelector('#specialty').value = pill.textContent.trim();
        });
    });

    const submitBtn  = container.querySelector('#search-btn');
    submitBtn.addEventListener('mouseenter', () => submitBtn.style.backgroundColor = '#0d9488');
    submitBtn.addEventListener('mouseleave', () => submitBtn.style.backgroundColor = '#14b8a6');

    const form = container.querySelector('#doctor-search-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const specialty    = container.querySelector('#specialty').value.trim();
        const city         = container.querySelector('#location').value.trim();
        const fee          = container.querySelector('#fee').value;
        const availability = container.querySelector('#availability').value;

        const btnText   = container.querySelector('#search-btn-text');
        const errorDiv  = container.querySelector('#search-error');
        const errorText = container.querySelector('#search-error-text');

        submitBtn.disabled = true;
        btnText.textContent = 'Searching...';
        errorDiv.style.display = 'none';

        try {
            const params = new URLSearchParams();
            if (specialty)                               params.append('specialty', specialty);
            if (city)                                    params.append('city', city);
            if (availability && availability !== 'anytime') params.append('availability', availability);
            if (fee && fee !== 'any')                    params.append('fee', fee);

            const response = await fetch(`${API_BASE}/doctors/search?${params.toString()}`);

            // 404 → no doctors at all
            if (response.status === 404) {
                const err = await response.json();
                errorText.textContent = err.detail || 'No doctors found. Try adjusting your filters.';
                errorDiv.style.display = 'block';
                return;
            }

            if (!response.ok) {
                errorText.textContent = 'Something went wrong. Please try again.';
                errorDiv.style.display = 'block';
                return;
            }

            // Backend now returns { doctors, message, matched_on }
            const result = await response.json();

            app.navigate('DoctorFinder', {
                showResults: true,
                search: { specialty, location: city, fee, availability },
                doctors:    result.doctors,
                message:    result.message,
                matched_on: result.matched_on,
            });

        } catch (err) {
            errorText.textContent = 'Cannot connect to server. Make sure the backend is running.';
            errorDiv.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            btnText.textContent = 'Search Doctors';
        }
    });

    return container;
}