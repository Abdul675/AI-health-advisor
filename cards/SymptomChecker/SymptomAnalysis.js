export function renderSymptomAnalysis(app, data) {
    app.addHistoryEntry(
        'Symptom AI Check',
        data.symptoms
            ? (data.symptoms.substring(0, 40) + (data.symptoms.length > 40 ? '...' : ''))
            : 'General Check',
        'AI analyzed symptoms for potential conditions.',
        'fas fa-stethoscope',
        '#3b82f6',
        data
    );

    const container = document.createElement('div');
    const analysis  = data.analysis  || {};
    const duration  = data.duration  || 'recently';

    // ── Urgency config ────────────────────────────────────────
    const urgencyConfig = {
        low:      { color: '#10b981', bg: '#f0fdf4', icon: 'fa-check-circle',       label: 'Low Urgency'      },
        moderate: { color: '#f59e0b', bg: '#fffbeb', icon: 'fa-exclamation-circle',  label: 'Moderate Urgency' },
        high:     { color: '#ef4444', bg: '#fef2f2', icon: 'fa-exclamation-triangle', label: 'High Urgency'    },
    };
    const urgency = urgencyConfig[analysis.urgency] || urgencyConfig.moderate;

    // ── Likelihood config ─────────────────────────────────────
    const likelihoodConfig = {
        High:   { color: '#ef4444', bg: '#fef2f2' },
        Medium: { color: '#f59e0b', bg: '#fffbeb' },
        Low:    { color: '#10b981', bg: '#f0fdf4' },
    };

    // ── Conditions HTML ───────────────────────────────────────
    const conditions = analysis.conditions || [];
    const conditionsHTML = conditions.map(cond => {
        const lc  = likelihoodConfig[cond.likelihood] || likelihoodConfig.Low;
        const bar = cond.likelihood_score || 0;
        return `
        <div class="condition-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <h4 style="margin:0; font-size:1rem;">${cond.name}</h4>
                <span style="font-size:0.78rem; font-weight:700; padding:0.2rem 0.65rem;
                             border-radius:20px; background:${lc.bg}; color:${lc.color};">
                    ${cond.likelihood} Match
                </span>
            </div>

            <!-- Likelihood bar -->
            <div style="height:5px; background:#f1f5f9; border-radius:99px; margin-bottom:0.85rem; overflow:hidden;">
                <div style="height:100%; width:${bar}%; background:${lc.color};
                             border-radius:99px; transition:width 0.6s ease;"></div>
            </div>

            <p class="text-muted" style="font-size:0.88rem; margin-bottom:0.75rem;">
                ${cond.explanation}
            </p>
            <div style="font-size:0.85rem; background:#f8fafc; border-radius:8px;
                        padding:0.65rem 0.9rem;">
                <i class="fas fa-lightbulb" style="color:#f59e0b; margin-right:0.4rem;"></i>
                <strong>Recommendation:</strong> ${cond.recommendation}
            </div>
        </div>`;
    }).join('');

    // ── Immediate steps HTML ──────────────────────────────────
    const steps = analysis.immediate_steps || [];
    const stepsHTML = steps.map((step, i) => `
        <div style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0;
                    border-bottom:1px solid #f1f5f9;">
            <div style="width:26px; height:26px; border-radius:50%; background:#eff6ff;
                        color:#3b82f6; display:flex; align-items:center; justify-content:center;
                        font-size:0.78rem; font-weight:700; flex-shrink:0;">${i + 1}</div>
            <span style="font-size:0.88rem;">${step}</span>
        </div>
    `).join('');

    // ── See doctor if HTML ────────────────────────────────────
    const warnings = analysis.see_doctor_if || [];
    const warningsHTML = warnings.map(w => `
        <div style="display:flex; align-items:flex-start; gap:0.5rem;
                    font-size:0.85rem; margin-bottom:0.4rem;">
            <i class="fas fa-angle-right" style="color:#ef4444; margin-top:0.2rem; flex-shrink:0;"></i>
            <span>${w}</span>
        </div>
    `).join('');

    const durationLabel = {
        today:    'Just started today',
        few_days: 'For a few days',
        weeks:    'More than a week',
        months:   'Several months',
    }[duration] || duration;

    container.innerHTML = `
        <style>
            .analysis-result {
                background: white;
                border-radius: var(--border-radius);
                padding: 2rem;
                box-shadow: var(--shadow-lg);
                border-top: 5px solid #3b82f6;
            }
            .condition-card {
                padding: 1.25rem;
                border: 1px solid var(--border-color);
                border-radius: 12px;
                margin-bottom: 1rem;
                background: var(--bg-color);
            }
        </style>

        <div class="analysis-result fade-in">

            <!-- Header -->
            <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;
                        border-bottom:1px solid var(--border-color); padding-bottom:1rem;">
                <div style="width:50px; height:50px; background:#eff6ff; color:#3b82f6;
                            border-radius:50%; display:flex; align-items:center;
                            justify-content:center; font-size:1.5rem; flex-shrink:0;">
                    <i class="fas fa-robot"></i>
                </div>
                <div>
                    <h2 style="margin-bottom:0.2rem;">AI Symptom Analysis</h2>
                    <p class="text-muted" style="font-size:0.88rem; margin:0;">
                        Duration: <strong>${durationLabel}</strong>
                    </p>
                </div>
            </div>

            <!-- Urgency banner -->
            <div style="background:${urgency.bg}; border-radius:10px; padding:0.85rem 1.1rem;
                        margin-bottom:1.5rem; display:flex; gap:0.75rem; align-items:flex-start;">
                <i class="fas ${urgency.icon}" style="color:${urgency.color}; font-size:1.2rem; flex-shrink:0;"></i>
                <div>
                    <strong style="color:${urgency.color};">${urgency.label}</strong>
                    <p style="margin:0.2rem 0 0; font-size:0.87rem; color:#374151;">
                        ${analysis.urgency_message || ''}
                    </p>
                </div>
            </div>

            <!-- AI Summary -->
            <div style="background:#f8fafc; border-radius:10px; padding:1rem 1.25rem;
                        margin-bottom:1.5rem; font-size:0.92rem; line-height:1.7; color:#1e293b;">
                <i class="fas fa-brain" style="color:#3b82f6; margin-right:0.5rem;"></i>
                ${analysis.summary || ''}
            </div>

            <!-- Conditions -->
            <h3 style="margin-bottom:1rem;">Possible Conditions</h3>
            ${conditionsHTML}

            <!-- Immediate steps -->
            ${steps.length ? `
            <div style="margin-top:1.5rem;">
                <h3 style="margin-bottom:0.75rem;">
                    <i class="fas fa-list-ol" style="color:#3b82f6; margin-right:0.5rem;"></i>
                    Immediate Steps
                </h3>
                <div style="background:#f8fafc; border-radius:10px; padding:0.5rem 1rem;">
                    ${stepsHTML}
                </div>
            </div>` : ''}

            <!-- See doctor if -->
            ${warnings.length ? `
            <div style="margin-top:1.5rem; padding:1rem 1.25rem; background:#fef2f2;
                        border:1px solid #fecaca; border-radius:10px;">
                <h4 style="color:#dc2626; margin-bottom:0.75rem;">
                    <i class="fas fa-hospital" style="margin-right:0.5rem;"></i>
                    See a Doctor Immediately If:
                </h4>
                ${warningsHTML}
            </div>` : ''}

            <!-- Disclaimer -->
            <div style="margin-top:1.5rem; padding:1rem 1.25rem; background:#fff1f2;
                        border:1px solid #fecdd3; border-radius:10px;">
                <h4 style="color:#be123c; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
                    <i class="fas fa-exclamation-triangle"></i> Medical Disclaimer
                </h4>
                <p style="font-size:0.85rem; color:#881337; margin:0 0 1rem;">
                    ${analysis.disclaimer || 'This AI analysis is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.'}
                </p>
                <button class="btn btn-primary" id="btn-find-doctor"
                    style="background:#dc2626; border-color:#dc2626; box-shadow:none;">
                    <i class="fas fa-user-md" style="margin-right:0.5rem;"></i>
                    Consult a Doctor
                </button>
            </div>

            <!-- Recheck -->
            <div class="text-center" style="margin-top:1.5rem;">
                <button class="btn btn-outline" id="btn-recheck">
                    <i class="fas fa-redo" style="margin-right:0.5rem;"></i>
                    Check New Symptoms
                </button>
            </div>
        </div>
    `;

    container.querySelector('#btn-find-doctor').addEventListener('click', () => {
        app.navigate('DoctorFinder');
    });
    container.querySelector('#btn-recheck').addEventListener('click', () => {
        app.navigate('SymptomChecker');
    });

    return container;
}