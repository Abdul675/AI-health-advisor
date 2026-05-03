export function renderPlanGenerator(app, data) {
    app.addHistoryEntry(
        'Personalized Plan',
        'Diet & Exercise Plan Created',
        `Custom 7-day plan optimized for ${data.prefs.goal_text}.`,
        'fas fa-clipboard-list',
        '#a855f7',
        data
    );

    const container = document.createElement('div');
    container.className = 'fade-in';

    const plan   = data.plan   || {};
    const prefs  = data.prefs  || {};
    const nutrition = plan.nutrition || {};
    const exercise  = plan.exercise  || {};
    const meals     = nutrition.meals || [];
    const schedule  = exercise.weekly_schedule || [];
    const workout   = exercise.sample_workout  || [];

    // ── Meal icons ───────────────────────────────────────────
    const mealIcons = {
        'Breakfast':          'fa-sun',
        'Mid-Morning Snack':  'fa-apple-alt',
        'Lunch':              'fa-utensils',
        'Evening Snack':      'fa-cookie-bite',
        'Dinner':             'fa-moon',
    };

    // ── Day type colors ──────────────────────────────────────
    const dayColors = {
        strength:    { bg: '#eff6ff', color: '#3b82f6', icon: 'fa-dumbbell' },
        cardio:      { bg: '#f0fdf4', color: '#10b981', icon: 'fa-running'  },
        flexibility: { bg: '#faf5ff', color: '#a855f7', icon: 'fa-child'    },
        rest:        { bg: '#f9fafb', color: '#9ca3af', icon: 'fa-bed'      },
    };

    // ── Build meals HTML ─────────────────────────────────────
    const mealsHTML = meals.map(meal => `
        <div class="meal-item">
            <div class="meal-time">
                <i class="fas ${mealIcons[meal.time] || 'fa-circle'}"
                   style="color:#a855f7; margin-right:0.4rem;"></i>
                ${meal.time}
            </div>
            <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4 style="margin:0 0 0.25rem;">${meal.name}</h4>
                    <span style="font-size:0.8rem; color:#a855f7; font-weight:600;
                                 background:#faf5ff; padding:0.2rem 0.6rem;
                                 border-radius:20px;">${meal.calories}</span>
                </div>
                <p class="text-muted" style="margin:0; font-size:0.88rem;">${meal.description}</p>
            </div>
        </div>
    `).join('');

    // ── Build weekly schedule HTML ───────────────────────────
    const scheduleHTML = schedule.map(day => {
        const cfg = dayColors[day.type] || dayColors.rest;
        return `
        <div style="background:${cfg.bg}; border-radius:10px; padding:0.85rem 1rem;
                    display:flex; align-items:center; gap:0.75rem;">
            <div style="width:36px; height:36px; border-radius:50%;
                        background:white; display:flex; align-items:center;
                        justify-content:center; flex-shrink:0;">
                <i class="fas ${cfg.icon}" style="color:${cfg.color};"></i>
            </div>
            <div style="flex:1;">
                <div style="font-weight:700; font-size:0.88rem; color:${cfg.color};">${day.day}</div>
                <div style="font-size:0.85rem; color:var(--text-muted);">${day.focus}</div>
            </div>
            <div style="font-size:0.8rem; color:${cfg.color}; font-weight:600;">${day.duration}</div>
        </div>`;
    }).join('');

    // ── Build sample workout HTML ────────────────────────────
    const workoutHTML = workout.map(phase => `
        <div class="workout-item">
            <div style="font-size:1.3rem; color:var(--text-muted); width:36px; text-align:center; flex-shrink:0;">
                <i class="fas ${phase.phase === 'Warm-up' ? 'fa-fire' :
                                 phase.phase === 'Cool Down' ? 'fa-child' : 'fa-dumbbell'}"></i>
            </div>
            <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
                    <h4 style="margin:0;">${phase.phase}</h4>
                    <span style="font-size:0.8rem; color:var(--text-muted);">${phase.duration}</span>
                </div>
                <ul style="margin:0; padding-left:1.25rem; font-size:0.88rem; color:var(--text-muted);">
                    ${phase.exercises.map(ex => `<li>${ex}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');

    // ── Build tips HTML ──────────────────────────────────────
    const buildTips = (tips = []) => tips.map(t => `
        <div style="display:flex; gap:0.5rem; align-items:flex-start;
                    font-size:0.88rem; margin-bottom:0.5rem;">
            <i class="fas fa-check-circle" style="color:#10b981; margin-top:0.15rem; flex-shrink:0;"></i>
            <span>${t}</span>
        </div>
    `).join('');

    container.innerHTML = `
        <style>
            .plan-section {
                background: white;
                border-radius: var(--border-radius);
                padding: 1.75rem;
                box-shadow: var(--shadow-sm);
                margin-bottom: 1.5rem;
                border: 1px solid var(--border-color);
            }
            .plan-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 1.25rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
            }
            .meal-item {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                padding: 0.85rem 1rem;
                background: var(--bg-color);
                border-radius: 8px;
                margin-bottom: 0.75rem;
            }
            .meal-time {
                font-weight: 600;
                font-size: 0.82rem;
                color: var(--text-muted);
                width: 130px;
                flex-shrink: 0;
                padding-top: 0.1rem;
            }
            .workout-item {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                padding: 0.85rem 1rem;
                background: var(--bg-color);
                border-radius: 8px;
                margin-bottom: 0.75rem;
            }
            .macro-pill {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0.75rem 1.25rem;
                border-radius: 10px;
                min-width: 90px;
            }
        </style>

        <!-- Header -->
        <div class="text-center mb-6">
            <h2 style="font-size:2rem; margin-bottom:0.5rem; color:#a855f7;">
                Your 7-Day Personalized Plan
            </h2>
            <p class="text-muted">
                Optimized for <strong>${prefs.goal_text}</strong> —
                ${prefs.diet !== 'none' ? prefs.diet : 'Balanced'} diet,
                ${prefs.level} level, ${prefs.time} mins/day
            </p>
        </div>

        <!-- AI Summary -->
        <div class="plan-section" style="background:linear-gradient(to right,#faf5ff,#ffffff);
             border-left:4px solid #a855f7;">
            <p style="margin:0; line-height:1.7; color:var(--text-main);">
                <i class="fas fa-robot" style="color:#a855f7; margin-right:0.5rem;"></i>
                ${plan.summary || ''}
            </p>
        </div>

        <!-- Nutrition -->
        <div class="plan-section">
            <div class="plan-header">
                <div style="font-size:1.5rem; color:#10b981;">
                    <i class="fas fa-apple-alt"></i>
                </div>
                <h3 style="margin:0;">Nutrition Plan</h3>
            </div>

            <!-- Macros -->
            <div style="display:flex; gap:0.75rem; margin-bottom:1.25rem; flex-wrap:wrap;">
                <div class="macro-pill" style="background:#f0fdf4;">
                    <span style="font-size:1.3rem; font-weight:700; color:#10b981;">
                        ${nutrition.macros?.protein || '--'}
                    </span>
                    <span style="font-size:0.75rem; color:#10b981;">Protein</span>
                </div>
                <div class="macro-pill" style="background:#eff6ff;">
                    <span style="font-size:1.3rem; font-weight:700; color:#3b82f6;">
                        ${nutrition.macros?.carbs || '--'}
                    </span>
                    <span style="font-size:0.75rem; color:#3b82f6;">Carbs</span>
                </div>
                <div class="macro-pill" style="background:#fffbeb;">
                    <span style="font-size:1.3rem; font-weight:700; color:#f59e0b;">
                        ${nutrition.macros?.fats || '--'}
                    </span>
                    <span style="font-size:0.75rem; color:#f59e0b;">Fats</span>
                </div>
                <div class="macro-pill" style="background:#faf5ff;">
                    <span style="font-size:1.1rem; font-weight:700; color:#a855f7;">
                        ${nutrition.daily_calories || '--'}
                    </span>
                    <span style="font-size:0.75rem; color:#a855f7;">Daily Target</span>
                </div>
            </div>

            <!-- Meals -->
            <h4 style="margin-bottom:0.75rem;">Sample Day Meals</h4>
            ${mealsHTML}

            <!-- Avoid -->
            ${nutrition.avoid ? `
            <div style="margin-top:1rem; padding:0.85rem 1rem; background:#fef2f2;
                        border-radius:8px; border-left:4px solid #ef4444;
                        font-size:0.88rem;">
                <i class="fas fa-ban" style="color:#ef4444; margin-right:0.4rem;"></i>
                <strong>Avoid:</strong> ${nutrition.avoid}
            </div>` : ''}

            <!-- Nutrition tips -->
            ${nutrition.tips?.length ? `
            <div style="margin-top:1.25rem;">
                <h4 style="margin-bottom:0.75rem;">Nutrition Tips</h4>
                ${buildTips(nutrition.tips)}
            </div>` : ''}
        </div>

        <!-- Exercise -->
        <div class="plan-section">
            <div class="plan-header">
                <div style="font-size:1.5rem; color:#3b82f6;">
                    <i class="fas fa-dumbbell"></i>
                </div>
                <h3 style="margin:0;">Exercise Plan (${prefs.time} mins/day)</h3>
            </div>

            <!-- Weekly schedule -->
            <h4 style="margin-bottom:0.75rem;">Weekly Schedule</h4>
            <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
                        gap:0.6rem; margin-bottom:1.5rem;">
                ${scheduleHTML}
            </div>

            <!-- Sample workout -->
            <h4 style="margin-bottom:0.75rem;">Sample Workout Session</h4>
            ${workoutHTML}

            <!-- Exercise tips -->
            ${exercise.tips?.length ? `
            <div style="margin-top:1.25rem;">
                <h4 style="margin-bottom:0.75rem;">Exercise Tips</h4>
                ${buildTips(exercise.tips)}
            </div>` : ''}
        </div>

        <!-- Hydration & Sleep -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
            <div class="plan-section" style="margin-bottom:0;">
                <div style="font-size:1.5rem; color:#3b82f6; margin-bottom:0.5rem;">
                    <i class="fas fa-tint"></i>
                </div>
                <h4 style="margin-bottom:0.5rem;">Hydration</h4>
                <p class="text-muted" style="margin:0; font-size:0.88rem;">${plan.hydration || ''}</p>
            </div>
            <div class="plan-section" style="margin-bottom:0;">
                <div style="font-size:1.5rem; color:#a855f7; margin-bottom:0.5rem;">
                    <i class="fas fa-moon"></i>
                </div>
                <h4 style="margin-bottom:0.5rem;">Sleep</h4>
                <p class="text-muted" style="margin:0; font-size:0.88rem;">${plan.sleep || ''}</p>
            </div>
        </div>

        <!-- Disclaimer -->
        ${plan.warning ? `
        <div style="background:#fffbeb; border:1px solid #fbbf24; border-radius:10px;
                    padding:0.85rem 1.1rem; margin-bottom:1.5rem; font-size:0.85rem;
                    color:#92400e; display:flex; gap:0.6rem; align-items:flex-start;">
            <i class="fas fa-exclamation-triangle" style="color:#f59e0b; flex-shrink:0; margin-top:0.1rem;"></i>
            <span>${plan.warning}</span>
        </div>` : ''}

        <!-- Action buttons -->
        <div style="display:flex; gap:1rem; justify-content:center; margin-top:1.5rem; flex-wrap:wrap;">
            <button class="btn btn-outline" id="btn-edit-prefs">
                <i class="fas fa-edit"></i> Edit Preferences
            </button>
            <button class="btn btn-primary" id="btn-find-doctor"
                style="background:#a855f7; border-color:#a855f7;">
                <i class="fas fa-user-md"></i> Find a Specialist
            </button>
        </div>
    `;

    container.querySelector('#btn-edit-prefs').addEventListener('click', () => {
        app.navigate('PersonalizedPlan');
    });
    container.querySelector('#btn-find-doctor').addEventListener('click', () => {
        app.navigate('DoctorFinder');
    });

    return container;
}