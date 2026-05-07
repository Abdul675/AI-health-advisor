const API_BASE = "";

export function renderAIChat(app) {
    const container = document.createElement('div');
    container.className = 'screen bg-light fade-in';
    container.style.height = '100vh';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    container.innerHTML = `
        <header class="dashboard-header" style="flex-shrink: 0; box-shadow: none; border-bottom: 1px solid var(--border-color);">
            <div class="container header-content">
                <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: bold; font-size: 1.2rem; cursor: pointer;" id="back-btn">
                    <i class="fas fa-arrow-left"></i> Dashboard
                </div>
                <div style="font-weight: 600; color: #ec4899; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-robot text-pink-500"></i> AI Health Assistant
                </div>
                <div style="width: 100px;"></div>
            </div>
        </header>

        <main style="flex: 1; overflow-y: auto; padding: 2rem 0; background: var(--bg-color);" id="chat-window">
            <div class="container max-w-3xl mx-auto" style="max-width: 800px; padding: 0 1.5rem;" id="message-list">
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: #fdf2f8; color: #ec4899; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.2rem;">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div style="background: white; padding: 1rem 1.5rem; border-radius: 20px; border-top-left-radius: 4px; border: 1px solid var(--border-color); max-width: 85%;">
                        <p style="margin: 0; color: var(--text-main);">Hi ${app.state.currentUser?.name?.split(' ')[0] || 'there'}! I'm your AI health companion. How can I help you today?</p>
                    </div>
                </div>
            </div>
        </main>

        <footer style="flex-shrink: 0; background: white; border-top: 1px solid var(--border-color); padding: 1.5rem 0;">
            <div class="container max-w-3xl mx-auto" style="max-width: 800px; padding: 0 1.5rem;">
                <div id="chat-form" style="display: flex; gap: 0.75rem; position: relative;">
                    <input type="text" id="chat-input" class="form-control" placeholder="Ask anything..." style="padding: 1rem 1.5rem; border-radius: 30px; padding-right: 4rem;" autocomplete="off">
                    <button type="button" id="send-btn" style="position: absolute; right: 0.5rem; top: 0.5rem; bottom: 0.5rem; width: 40px; border-radius: 50%; border: none; background: #ec4899; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
                    Warning: AI is not a substitute for professional medical advice.
                </div>
            </div>
        </footer>
    `;

    // ── Navigation ────────────────────────────────────────────────────────────
    container.querySelector('#back-btn').addEventListener('click', () => app.navigate('dashboard'));

    const chatInput   = container.querySelector('#chat-input');
    const messageList = container.querySelector('#message-list');
    const chatWindow  = container.querySelector('#chat-window');
    const sendBtn     = container.querySelector('#send-btn');

    // ── Helper: convert markdown to HTML ─────────────────────────────────────
    // Converts the structured markdown returned by the RAG chain into
    // proper HTML block elements so headings, bullets, and warnings
    // render correctly instead of appearing as raw characters.
    function parseMarkdown(text) {
        return text
            // ### Heading 3
            .replace(/^### (.+)$/gm, '<h4 style="margin: 1rem 0 0.4rem; font-size: 0.95rem; font-weight: 700; color: #be185d;">$1</h4>')
            // ## Heading 2
            .replace(/^## (.+)$/gm, '<h3 style="margin: 1rem 0 0.4rem; font-size: 1rem; font-weight: 700; color: #9d174d;">$1</h3>')
            // **bold**
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // • bullet or - bullet lines → <li>
            .replace(/^[•\-] (.+)$/gm, '<li style="margin: 0.25rem 0; padding-left: 0.25rem;">$1</li>')
            // wrap consecutive <li> blocks in <ul>
            .replace(/((<li[^>]*>[\s\S]*?<\/li>\n?)+)/g, '<ul style="margin: 0.4rem 0 0.4rem 1rem; padding: 0; list-style: disc;">$1</ul>')
            // ⚠️ warning lines
            .replace(/^(⚠️.+)$/gm, '<p style="margin: 0.75rem 0 0; color: #b45309; font-weight: 600;">$1</p>')
            // blank lines → paragraph spacing
            .replace(/\n{2,}/g, '<br><br>')
            // remaining single newlines
            .replace(/\n/g, '<br>')
            // remove <br> immediately after block-level closing tags
            .replace(/(<\/h[34]>)<br>/g, '$1')
            .replace(/(<\/ul>)<br>/g, '$1')
            .replace(/(<\/p>)<br>/g, '$1');
    }

    // ── Helper: add a message bubble ──────────────────────────────────────────
    function addMessage(html, isUser = false) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `display: flex; gap: 1rem; margin-bottom: 1.5rem; ${isUser ? 'flex-direction: row-reverse;' : ''}`;

        const avatar = isUser
            ? `<div style="width:40px;height:40px;border-radius:50%;background:var(--primary-color);color:white;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:bold;">
                   ${(app.state.currentUser?.name || 'U').charAt(0).toUpperCase()}
               </div>`
            : `<div style="width:40px;height:40px;border-radius:50%;background:#fdf2f8;color:#ec4899;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.2rem;">
                   <i class="fas fa-robot"></i>
               </div>`;

        const bubble = isUser
            ? `<div style="background:var(--primary-color);color:white;padding:1rem 1.5rem;border-radius:20px;border-top-right-radius:4px;max-width:85%;">${html}</div>`
            : `<div style="background:white;padding:1rem 1.5rem;border-radius:20px;border-top-left-radius:4px;border:1px solid var(--border-color);max-width:85%;color:var(--text-main);line-height:1.6;">${html}</div>`;

        wrapper.innerHTML = avatar + bubble;
        messageList.appendChild(wrapper);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return wrapper;
    }

    // ── Helper: typing indicator ──────────────────────────────────────────────
    function showTyping() {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display: flex; gap: 1rem; margin-bottom: 1.5rem;';
        wrapper.innerHTML = `
            <div style="width:40px;height:40px;border-radius:50%;background:#fdf2f8;color:#ec4899;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.2rem;">
                <i class="fas fa-robot"></i>
            </div>
            <div style="background:white;padding:1rem 1.5rem;border-radius:20px;border-top-left-radius:4px;border:1px solid var(--border-color);display:flex;align-items:center;gap:0.3rem;">
                <span style="display:inline-block;width:6px;height:6px;background:#ec4899;border-radius:50%;animation:pulse 1s infinite alternate;"></span>
                <span style="display:inline-block;width:6px;height:6px;background:#ec4899;border-radius:50%;animation:pulse 1s infinite alternate 0.2s;"></span>
                <span style="display:inline-block;width:6px;height:6px;background:#ec4899;border-radius:50%;animation:pulse 1s infinite alternate 0.4s;"></span>
            </div>
        `;
        messageList.appendChild(wrapper);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return wrapper;
    }

    // ── Core send function ────────────────────────────────────────────────────
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Render user message as plain text (no markdown needed)
        addMessage(`<p style="margin:0;">${text}</p>`, true);
        chatInput.value = '';

        // Disable controls while waiting for response
        sendBtn.disabled = true;
        chatInput.disabled = true;
        sendBtn.style.background = '#f9a8d4';

        const typingEl = showTyping();

        // AbortController gives us a 60-second timeout
        // LLM calls can take 10-30 seconds — without this the browser
        // eventually cancels the request silently and the page appears frozen
        const controller = new AbortController();
        const timeoutId  = setTimeout(() => controller.abort(), 60000);

        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({ message: text }),
                signal : controller.signal,
            });

            clearTimeout(timeoutId);
            typingEl.remove();

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                addMessage(`<p style="margin:0;color:#ef4444;">⚠️ ${err.detail || 'Something went wrong. Please try again.'}</p>`);
                return;
            }

            const data = await res.json();

            // ✅ Parse markdown → HTML so headings, bullets, warnings render correctly
            addMessage(parseMarkdown(data.response));

        } catch (err) {
            clearTimeout(timeoutId);
            typingEl.remove();

            // AbortError means our 60s timeout fired
            if (err.name === 'AbortError') {
                addMessage(`<p style="margin:0;color:#ef4444;">⚠️ The request timed out (60s). The server may be busy — please try again.</p>`);
            } else {
                addMessage(`<p style="margin:0;color:#ef4444;">⚠️ Could not reach the server. Please try again later.</p>`);
            }
            console.error('Chat API error:', err);

        } finally {
            sendBtn.disabled = false;
            chatInput.disabled = false;
            sendBtn.style.background = '#ec4899';
            chatInput.focus();
        }
    }

    // ── Send on button click ──────────────────────────────────────────────────
    sendBtn.addEventListener('click', sendMessage);

    // ── Send on Enter key (Shift+Enter = newline, Enter alone = send) ─────────
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            sendMessage();
        }
    });

    return container;
}