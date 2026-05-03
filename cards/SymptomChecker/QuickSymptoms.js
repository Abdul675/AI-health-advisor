export function renderQuickSymptoms(app) {
    const container = document.createElement('div');
    container.className = 'card';
    container.style.background = 'linear-gradient(135deg, #eff6ff, #dbeafe)';
    container.style.border = 'none';

    container.innerHTML = `
        <h3 class="mb-2" style="color:var(--primary-color);">Common Symptoms</h3>
        <p class="mb-4 text-muted" style="font-size:0.88rem;">
            Click any symptom to add it to your description
        </p>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem;" id="quick-pills"></div>

        <div style="margin-top:1.5rem; padding:1rem; background:white;
                    border-radius:10px; font-size:0.82rem; color:#64748b; line-height:1.6;">
            <i class="fas fa-info-circle" style="color:#3b82f6; margin-right:0.4rem;"></i>
            You can combine multiple symptoms for a more accurate AI analysis.
        </div>
    `;

    const symptoms = [
        "Headache", "Fever", "Cough", "Sore Throat",
        "Fatigue", "Nausea", "Stomach Ache", "Dizziness",
        "Shortness of Breath", "Muscle Ache", "Chest Pain",
        "Back Pain", "Joint Pain", "Vomiting", "Diarrhea",
        "Loss of Appetite", "Runny Nose", "Skin Rash"
    ];

    const pillsContainer = container.querySelector('#quick-pills');

    symptoms.forEach(sym => {
        const pill = document.createElement('span');
        pill.textContent = sym;
        pill.style.cssText = `
            display: inline-block;
            padding: 0.35rem 0.75rem;
            background: white;
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
            border-radius: 20px;
            font-size: 0.82rem;
            cursor: pointer;
            transition: all 0.2s;
            user-select: none;
        `;

        pill.addEventListener('mouseenter', () => {
            pill.style.background = 'var(--primary-color)';
            pill.style.color = 'white';
        });
        pill.addEventListener('mouseleave', () => {
            if (!pill.dataset.selected) {
                pill.style.background = 'white';
                pill.style.color = 'var(--primary-color)';
            }
        });

        // Click → append to textarea
        pill.addEventListener('click', () => {
            const textarea = document.getElementById('symptom-text');
            if (!textarea) return;

            const current = textarea.value.trim();
            if (current === '') {
                textarea.value = `I am experiencing ${sym.toLowerCase()}`;
            } else {
                textarea.value = current + `, ${sym.toLowerCase()}`;
            }

            // Visual feedback — briefly highlight pill
            pill.style.background = '#1d4ed8';
            pill.style.color = 'white';
            setTimeout(() => {
                pill.style.background = 'var(--primary-color)';
                pill.style.color = 'white';
                setTimeout(() => {
                    pill.style.background = 'white';
                    pill.style.color = 'var(--primary-color)';
                }, 300);
            }, 200);

            // Focus textarea so user can continue typing
            textarea.focus();
        });

        pillsContainer.appendChild(pill);
    });

    return container;
}