export function renderReportAnalysis(app, data) {
    app.addHistoryEntry(
        'Report Explainer',
        'Analyzed Medical Report',
        'AI extracted and explained key metrics from your lab report.',
        'fas fa-file-medical-alt',
        '#10b981',
        data
    );

    const container = document.createElement('div');
    container.className = 'fade-in max-w-3xl mx-auto';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';

    // ── Pull analysis from real LLM response ──
    const analysis  = data.analysis || {};
    const readings  = analysis.readings || [];
    const summary   = analysis.summary  || 'Analysis complete.';
    const urgent    = analysis.urgent   || false;
    const urgentMsg = analysis.urgent_message || '';

    const numLow      = readings.filter(r => r.status === 'low').length;
    const numHigh     = readings.filter(r => r.status === 'high').length;
    const numCritical = readings.filter(r => r.status === 'critical').length;
    const numNormal   = readings.filter(r => r.status === 'normal').length;

    // ── Urgent alert banner ────────────────────
    const urgentBanner = urgent ? `
        <div style="background:#fef2f2; border:1px solid #fca5a5; border-left:4px solid #ef4444;
                    border-radius:10px; padding:1rem 1.25rem; margin-bottom:1.5rem;
                    display:flex; gap:0.75rem; align-items:flex-start;">
            <i class="fas fa-exclamation-triangle" style="color:#ef4444; font-size:1.3rem; margin-top:0.1rem; flex-shrink:0;"></i>
            <div>
                <strong style="color:#dc2626; font-size:1rem;">Urgent — Please See a Doctor Soon</strong>
                <p style="margin:0.3rem 0 0; color:#7f1d1d; font-size:0.9rem;">${urgentMsg}</p>
            </div>
        </div>
    ` : '';

    // ── Reading cards ──────────────────────────
    const statusConfig = {
        normal:   { badge: 'badge-normal',   card: 'card-normal',   label: 'Normal',   icon: 'fa-check-circle',      color: '#10b981' },
        low:      { badge: 'badge-low',      card: 'card-low',      label: 'Low',      icon: 'fa-arrow-circle-down', color: '#ef4444' },
        high:     { badge: 'badge-high',     card: 'card-high',     label: 'High',     icon: 'fa-arrow-circle-up',   color: '#f59e0b' },
        critical: { badge: 'badge-critical', card: 'card-critical', label: 'Critical', icon: 'fa-exclamation-circle',color: '#dc2626' },
    };

    const readingCards = readings.length > 0
        ? readings.map(r => {
            const cfg = statusConfig[r.status] || statusConfig.normal;
            return `
            <div class="reading-card ${cfg.card}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <h4 style="font-size:1rem; margin:0; display:flex; align-items:center; gap:0.5rem;">
                        <i class="fas ${cfg.icon}" style="color:${cfg.color};"></i>
                        ${r.name}
                    </h4>
                    <span class="status-badge ${cfg.badge}">${cfg.label}</span>
                </div>
                <div style="font-size:0.88rem; color:var(--text-muted); margin-bottom:0.75rem;">
                    Your Value: <strong style="color:var(--text-main);">${r.value}</strong>
                    &nbsp;|&nbsp; Normal Range: ${r.range}
                </div>
                <div style="font-size:0.9rem; margin-bottom:0.5rem;">
                    <strong>What this means:</strong> ${r.explanation}
                </div>
                ${r.advice ? `
                <div style="font-size:0.88rem; background:#f8fafc; border-radius:6px;
                             padding:0.6rem 0.85rem; margin-top:0.5rem; color:#475569;">
                    <i class="fas fa-lightbulb" style="color:#f59e0b; margin-right:0.4rem;"></i>
                    <strong>Advice:</strong> ${r.advice}
                </div>` : ''}
            </div>`;
        }).join('')
        : `<div style="text-align:center; padding:2rem; color:var(--text-muted);">
               <i class="fas fa-search" style="font-size:2rem; display:block; margin-bottom:0.75rem;"></i>
               No individual lab values could be extracted. Please check the report text and try again.
           </div>`;

    container.innerHTML = `
        <style>
            .reading-card {
                background: white;
                border-radius: 12px;
                padding: 1.25rem 1.5rem;
                margin-bottom: 1rem;
                border: 1px solid var(--border-color);
                border-left: 4px solid var(--border-color);
            }
            .card-normal   { border-left-color: #10b981; }
            .card-low      { border-left-color: #ef4444; }
            .card-high     { border-left-color: #f59e0b; }
            .card-critical { border-left-color: #dc2626; background: #fff5f5; }

            .status-badge {
                padding: 0.2rem 0.7rem;
                border-radius: 50px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.03em;
            }
            .badge-normal   { background:#f0fdf4; color:#10b981; }
            .badge-low      { background:#fef2f2; color:#ef4444; }
            .badge-high     { background:#fffbeb; color:#f59e0b; }
            .badge-critical { background:#fef2f2; color:#dc2626; }

            .stat-pill {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0.75rem 1.25rem;
                border-radius: 10px;
                min-width: 70px;
            }
            .stat-number { font-size: 1.6rem; font-weight: 700; line-height: 1; }
            .stat-label  { font-size: 0.75rem; text-transform: uppercase; margin-top: 0.2rem; }
        </style>

        ${urgentBanner}

        <!-- Summary card -->
        <div class="card mb-6" style="background: linear-gradient(to right, #f0fdf4, #ffffff);">
            <div style="display:flex; gap:1rem; align-items:flex-start;">
                <div style="font-size:2rem; color:#10b981; flex-shrink:0;">
                    <i class="fas fa-clipboard-check"></i>
                </div>
                <div style="flex:1;">
                    <h2 class="mb-2">Report Summary</h2>
                    <p class="text-muted" style="line-height:1.6;">${summary}</p>

                    <!-- Stats row -->
                    <div style="display:flex; gap:0.75rem; margin-top:1.25rem; flex-wrap:wrap;">
                        <div class="stat-pill" style="background:#f0fdf4;">
                            <span class="stat-number" style="color:#10b981;">${numNormal}</span>
                            <span class="stat-label" style="color:#10b981;">Normal</span>
                        </div>
                        <div class="stat-pill" style="background:#fef2f2;">
                            <span class="stat-number" style="color:#ef4444;">${numLow}</span>
                            <span class="stat-label" style="color:#ef4444;">Low</span>
                        </div>
                        <div class="stat-pill" style="background:#fffbeb;">
                            <span class="stat-number" style="color:#f59e0b;">${numHigh}</span>
                            <span class="stat-label" style="color:#f59e0b;">High</span>
                        </div>
                        ${numCritical > 0 ? `
                        <div class="stat-pill" style="background:#fef2f2;">
                            <span class="stat-number" style="color:#dc2626;">${numCritical}</span>
                            <span class="stat-label" style="color:#dc2626;">Critical</span>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        </div>

        <h3 class="mb-4">Detailed Breakdown</h3>
        ${readingCards}

        <!-- Action buttons -->
        <div style="display:flex; gap:1rem; justify-content:center; margin-top:2rem; flex-wrap:wrap;">
            <button class="btn btn-outline" id="btn-upload-new">
                <i class="fas fa-upload"></i> Analyze Another
            </button>
            <button class="btn btn-primary" id="btn-find-doctor"
                style="background:var(--primary-color); border-color:var(--primary-color);">
                <i class="fas fa-user-md"></i> Find a Doctor
            </button>
        </div>
    `;

    container.querySelector('#btn-upload-new').addEventListener('click', () => {
        app.navigate('ReportExplainer');
    });
    container.querySelector('#btn-find-doctor').addEventListener('click', () => {
        app.navigate('DoctorFinder');
    });

    return container;
}