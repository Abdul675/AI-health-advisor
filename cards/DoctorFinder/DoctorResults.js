export function renderDoctorResults(app, data) {
    const container = document.createElement('div');
    container.className = 'fade-in';

    const doctors  = data.doctors || [];
    const message  = data.message || '';
    const isExact  = data.matched_on && data.matched_on === 'specialty, city, availability, fee';

    const doctorCardsHTML = doctors.map(doc => `
        <div class="doctor-card">
            <div class="doc-avatar">
                <i class="fas fa-user-md"></i>
            </div>
            <div class="doc-info">
                <div class="doc-name">${doc.name}</div>
                <div class="doc-details">
                    <span>
                        <i class="fas fa-id-badge"></i>
                        ${doc.designation || 'Consultant'}
                    </span>
                    <span>
                        <i class="fas fa-map-marker-alt"></i>
                        ${doc.location || 'N/A'}
                    </span>
                    <span>
                        <i class="fas fa-money-bill-wave"></i>
                        PKR ${doc.fee || 'N/A'}
                    </span>
                </div>
                <div class="doc-availability">
                    Available: <span class="availability-value">${doc.availability}</span>
                </div>
            </div>
        </div>
    `).join('');

    const emptyState = `
        <div style="text-align:center; padding: 3rem; color: var(--text-muted);">
            <i class="fas fa-user-md" style="font-size: 3rem; margin-bottom: 1rem; display:block;"></i>
            <p>No doctors found matching your criteria.</p>
            <button class="btn btn-primary" id="btn-retry"
                style="margin-top:1rem; background:#14b8a6; border-color:#14b8a6;">
                Try Again
            </button>
        </div>
    `;

    const messageBanner = (!isExact && message) ? `
        <div class="fallback-banner">
            <i class="fas fa-info-circle"></i>
            ${message}
        </div>
    ` : '';

    container.innerHTML = `
        <style>
            .doctor-card {
                background: white;
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1.25rem 1.5rem;
                display: flex;
                gap: 1.25rem;
                margin-bottom: 1rem;
                transition: var(--transition);
                align-items: center;
            }
            .doctor-card:hover {
                box-shadow: var(--shadow-md);
                border-color: #14b8a6;
            }
            .doc-avatar {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: #f0fdfa;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                color: #14b8a6;
                flex-shrink: 0;
            }
            .doc-info { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
            .doc-name { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
            .doc-details {
                display: flex; flex-wrap: wrap; gap: 1rem;
                font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;
            }
            .doc-details span { display: flex; align-items: center; gap: 0.35rem; }
            .doc-details i { color: #14b8a6; font-size: 0.85rem; width: 14px; text-align: center; }
            .doc-availability { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); margin-top: 0.2rem; }
            .availability-value { color: #14b8a6; }
            .fallback-banner {
                background: #fffbeb;
                border: 1px solid #fbbf24;
                border-radius: var(--border-radius);
                padding: 0.85rem 1.1rem;
                margin-bottom: 1.25rem;
                font-size: 0.88rem;
                color: #92400e;
                display: flex;
                align-items: flex-start;
                gap: 0.6rem;
                line-height: 1.5;
            }
            .fallback-banner i { color: #f59e0b; margin-top: 0.1rem; flex-shrink: 0; }
        </style>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.5rem;">
                Results for "<strong>${data.search.specialty}</strong>"
            </h2>
            <button class="btn btn-outline" id="btn-edit-search"
                style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                <i class="fas fa-search"></i> Modify Search
            </button>
        </div>

        <p class="text-muted mb-4">
            Showing top ${doctors.length} doctor(s) near
            <strong>${data.search.location}</strong> — sorted by fee.
        </p>

        ${messageBanner}

        <div id="doctor-list">
            ${doctors.length > 0 ? doctorCardsHTML : emptyState}
        </div>
    `;

    container.querySelector('#btn-edit-search').addEventListener('click', () => {
        app.navigate('DoctorFinder', { specialty: data.search.specialty });
    });

    const retryBtn = container.querySelector('#btn-retry');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => app.navigate('DoctorFinder'));
    }

    return container;
}