// ===== EVENTOS E INTERFACE =====
const eventHandlers = new Map();

export function setupEventListeners(selector, handler) {
    if (eventHandlers.has(selector)) {
        document.removeEventListener('click', eventHandlers.get(selector));
    }

    const globalHandler = (e) => {
        const target = e.target.closest(selector);
        if (target) handler(e);
    };

    eventHandlers.set(selector, globalHandler);
    document.addEventListener('click', globalHandler);
}

export function setupTabs() {
    const tabs = [
        { id: 'tab-pending', content: 'pending-content', action: () => window.loadPendingUsers() },
        { id: 'tab-students', content: 'students-content', action: () => window.loadApprovedStudents() },
        { id: 'tab-submissions', content: 'submissions-content', action: () => window.loadSubmissions() },
        { id: 'tab-missions', content: 'missions-content', action: () => window.loadMissions() }
    ];

    tabs.forEach(({ id, content, action }) => {
        const tab = document.getElementById(id);
        if (tab) {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveTab(id, content);
                action();
            });
        }
    });
}

function setActiveTab(activeId, activeContent) {
    // Remove active de todas as abas
    ['tab-pending', 'tab-students', 'tab-submissions', 'tab-missions'].forEach(id => {
        const tab = document.getElementById(id);
        if (tab) {
            tab.classList.remove('active', 'border-b-2', 'border-purple-500', 'text-purple-600');
            tab.classList.add('text-gray-500');
        }
    });

    // Esconde todo conteúdo
    ['pending-content', 'students-content', 'submissions-content', 'missions-content'].forEach(id => {
        const content = document.getElementById(id);
        if (content) content.classList.add('hidden');
    });

    // Ativa aba e conteúdo selecionados
    const activeTab = document.getElementById(activeId);
    const activeContentEl = document.getElementById(activeContent);

    if (activeTab) {
        activeTab.classList.remove('text-gray-500');
        activeTab.classList.add('active', 'border-b-2', 'border-purple-500', 'text-purple-600');
    }
    if (activeContentEl) activeContentEl.classList.remove('hidden');
}

export function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Remover apenas dados de sessão para não apagar turmas criadas pelo mestre
            localStorage.removeItem('token');
            localStorage.removeItem('isMaster');
            localStorage.removeItem('username');
            // manter outras chaves, como turmas_<username>, para persistir as turmas
            window.location.href = '/';
        });
    }
}
