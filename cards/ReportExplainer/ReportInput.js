const API_BASE = "http://127.0.0.1:8000";

export function renderReportInput(app) {
    const container = document.createElement('div');
    container.className = 'card max-w-3xl mx-auto';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';

    container.innerHTML = `
        <h3 class="mb-4">Upload or Paste Your Report</h3>

        <div style="border: 2px dashed var(--border-color); border-radius: 12px; padding: 3rem 2rem;
                    text-align: center; background: var(--bg-color); margin-bottom: 2rem;
                    cursor: pointer; transition: all 0.3s;" id="upload-zone">
            <div style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;">
                <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <h4 style="margin-bottom: 0.5rem;">Click to browse or drag and drop</h4>
            <p class="text-muted" style="font-size: 0.9rem;">Supports PDF, JPG, PNG (Max 10MB)</p>
            <input type="file" id="file-input" style="display: none;" accept=".pdf,image/*">
        </div>

        <!-- Selected file badge -->
        <div id="file-badge" style="display:none; background:#f0fdf4; border:1px solid #10b981;
             border-radius:8px; padding:0.6rem 1rem; margin-bottom:1.5rem;
             display:none; align-items:center; gap:0.75rem; font-size:0.9rem;">
            <i class="fas fa-file-check" style="color:#10b981;"></i>
            <span id="file-name" style="flex:1; font-weight:600;"></span>
            <span id="file-remove" style="cursor:pointer; color:#ef4444; font-size:0.8rem;">✕ Remove</span>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
            <div style="flex: 1; height: 1px; background: var(--border-color);"></div>
            <div class="text-muted" style="font-size: 0.9rem; text-transform: uppercase;">or</div>
            <div style="flex: 1; height: 1px; background: var(--border-color);"></div>
        </div>

        <div class="form-group">
            <label class="form-label" for="report-text">Paste Report Text</label>
            <textarea id="report-text" class="form-control" rows="8"
                placeholder="E.g., Hemoglobin 11.2 g/dL (Low), WBC Count 12,000 /uL (High)..."></textarea>
        </div>

        <!-- Error message -->
        <div id="report-error" style="display:none; color:#ef4444; font-size:0.88rem;
             margin-bottom:1rem; padding:0.75rem 1rem; background:#fef2f2;
             border:1px solid #fca5a5; border-radius:8px;">
            <i class="fas fa-exclamation-circle"></i>
            <span id="report-error-text"></span>
        </div>

        <button id="submit-btn" class="btn btn-primary"
            style="width: 100%; background-color: #10b981; border-color: #10b981; padding:0.9rem; font-size:1rem;">
            <i class="fas fa-magic" style="margin-right:0.5rem;"></i>
            <span id="submit-btn-text">Explain Report</span>
        </button>

        <style>
            #upload-zone:hover {
                border-color: #10b981;
                background: #f0fdf4;
            }
        </style>
    `;

    const uploadZone  = container.querySelector('#upload-zone');
    const fileInput   = container.querySelector('#file-input');
    const fileBadge   = container.querySelector('#file-badge');
    const fileName    = container.querySelector('#file-name');
    const fileRemove  = container.querySelector('#file-remove');
    const textarea    = container.querySelector('#report-text');
    const submitBtn   = container.querySelector('#submit-btn');
    const submitText  = container.querySelector('#submit-btn-text');
    const errorDiv    = container.querySelector('#report-error');
    const errorText   = container.querySelector('#report-error-text');

    let selectedFile = null;

    // ── Upload zone click ──────────────────────────────────
    uploadZone.addEventListener('click', () => fileInput.click());

    // ── Drag & drop ────────────────────────────────────────
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '#10b981';
        uploadZone.style.background  = '#f0fdf4';
    });
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = 'var(--border-color)';
        uploadZone.style.background  = 'var(--bg-color)';
    });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--border-color)';
        uploadZone.style.background  = 'var(--bg-color)';
        if (e.dataTransfer.files.length > 0) setFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) setFile(e.target.files[0]);
    });

    function setFile(file) {
        // Validate size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('File is too large. Maximum size is 10MB.');
            return;
        }
        selectedFile = file;
        fileName.textContent = file.name;
        fileBadge.style.display = 'flex';
        uploadZone.style.opacity = '0.6';
    }

    fileRemove.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        fileBadge.style.display = 'none';
        uploadZone.style.opacity = '1';
    });

    function showError(msg) {
        errorText.textContent = msg;
        errorDiv.style.display = 'block';
    }
    function hideError() {
        errorDiv.style.display = 'none';
    }

    // ── Submit ─────────────────────────────────────────────
    submitBtn.addEventListener('click', async () => {
        hideError();
        const pastedText = textarea.value.trim();

        if (!selectedFile && !pastedText) {
            showError('Please upload a file or paste your report text first.');
            return;
        }

        // Build multipart form data
        const formData = new FormData();
        if (selectedFile) formData.append('file', selectedFile);
        if (pastedText)   formData.append('text', pastedText);

        // Loading state
        submitBtn.disabled   = true;
        submitText.textContent = 'Analyzing...';
        submitBtn.innerHTML  = `<i class="fas fa-spinner fa-spin" style="margin-right:0.5rem;"></i> Analyzing your report...`;

        try {
            const response = await fetch(`${API_BASE}/report/explain`, {
                method: 'POST',
                body: formData
                // ⚠️ Do NOT set Content-Type — browser sets it with boundary automatically
            });

            if (!response.ok) {
                const err = await response.json();
                showError(err.detail || 'Something went wrong. Please try again.');
                return;
            }

            const result = await response.json();

            // Navigate to analysis view with real LLM data
            app.navigate('ReportExplainer', {
                showAnalysis:   true,
                reportText:     result.extracted_text,
                analysis:       result.analysis       // { summary, urgent, urgent_message, readings[] }
            });

        } catch (err) {
            showError('Cannot connect to server. Make sure the backend is running.');
        } finally {
            submitBtn.disabled  = false;
            submitBtn.innerHTML = `<i class="fas fa-magic" style="margin-right:0.5rem;"></i><span id="submit-btn-text">Explain Report</span>`;
        }
    });

    return container;
}