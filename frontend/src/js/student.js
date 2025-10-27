// Sistema de Painel do Estudante
// Arquivo: student.js

import { API } from './utils/api.js';
import { gemini } from './utils/gemini.js';
import { feedbackModal } from './utils/feedback-modal.js';

(function () {
    const t = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", t);
})();

// Estado global da aplicação
const AppState = {
    data: {},
    set(key, value) {
        this.data[key] = value;
    },
    get(key) {
        return this.data[key];
    }
};

// Funções de utilidade para a interface

// Converter Timestamp do Firestore para Date válida
function parseFirebaseDate(timestamp) {
    if (!timestamp) return new Date();

    // Se já é uma data válida
    if (timestamp instanceof Date) return timestamp;

    // Se é string ISO
    if (typeof timestamp === 'string') return new Date(timestamp);

    // Se é Timestamp do Firestore (tem seconds e nanoseconds)
    if (timestamp.seconds !== undefined) {
        return new Date(timestamp.seconds * 1000);
    }

    // Se é objeto com _seconds (formato alternativo do Firestore)
    if (timestamp._seconds !== undefined) {
        return new Date(timestamp._seconds * 1000);
    }

    // Fallback: tentar converter diretamente
    return new Date(timestamp);
}

// Sistema de notificações Toast
const Toast = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "toast-container";
            this.container.className = "fixed top-4 right-4 z-50 space-y-2";
            document.body.appendChild(this.container);
        }
    },

    show(message, type = "info") {
        this.init();

        const types = {
            error: { class: "bg-red-500", icon: "exclamation-triangle" },
            success: { class: "bg-green-500", icon: "check-circle" },
            warning: { class: "bg-yellow-500", icon: "exclamation-circle" },
            info: { class: "bg-blue-500", icon: "info-circle" }
        };

        const config = types[type] || types.info;
        const toast = document.createElement("div");
        toast.className = `${config.class} text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
        toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-${config.icon} mr-2"></i>
        <span>${message}</span>
      </div>
    `;

        this.container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove("translate-x-full", "opacity-0");
        });

        setTimeout(() => {
            toast.classList.add("translate-x-full", "opacity-0");
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
};

// Configuração da API
const API_URL = 'http://localhost:3000'; // Altere isso para a URL correta do seu backend

// Função auxiliar para fazer requisições à API
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        throw new Error('Token não encontrado');
    }

    const url = API_URL + endpoint;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/';
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }
            const errorText = await response.text();
            throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// Sistema de XP e Níveis (sincronizado com backend)
const LevelSystem = {
    XP_LEVELS: [
        { level: 1, minXP: 0 },
        { level: 2, minXP: 100 },
        { level: 3, minXP: 250 },
        { level: 4, minXP: 450 },
        { level: 5, minXP: 700 },
        { level: 6, minXP: 1000 },
        { level: 7, minXP: 1400 },
        { level: 8, minXP: 2000 },
        { level: 9, minXP: 3000 },
        { level: 10, minXP: 5000 }
    ],

    calculateLevel(currentXP) {
        // Encontrar o nível atual
        let currentLevel = 1;
        for (let i = this.XP_LEVELS.length - 1; i >= 0; i--) {
            if (currentXP >= this.XP_LEVELS[i].minXP) {
                currentLevel = this.XP_LEVELS[i].level;
                break;
            }
        }

        // Calcular XP para o próximo nível
        const nextLevelData = this.XP_LEVELS.find(level => level.level === currentLevel + 1);
        const currentLevelData = this.XP_LEVELS.find(level => level.level === currentLevel);

        let xpForNextLevel = null;
        let xpProgressInCurrentLevel = 0;
        let xpNeededForCurrentLevel = 0;

        if (nextLevelData) {
            xpForNextLevel = nextLevelData.minXP;
            xpNeededForCurrentLevel = nextLevelData.minXP - currentLevelData.minXP;
            xpProgressInCurrentLevel = currentXP - currentLevelData.minXP;
        } else {
            // Nível máximo atingido
            xpProgressInCurrentLevel = currentXP - currentLevelData.minXP;
            xpNeededForCurrentLevel = 0;
        }

        return {
            currentLevel: currentLevel,  // Nível atual (1-10)
            totalXP: currentXP,          // XP total acumulado
            currentXP: xpProgressInCurrentLevel,  // XP atual dentro do nível
            nextLevelXP: xpNeededForCurrentLevel, // Total de XP necessário para o próximo nível
            xpForNextLevel,              // XP absoluto necessário para o próximo nível
            progressPercentage: xpNeededForCurrentLevel > 0 ?
                Math.round((xpProgressInCurrentLevel / xpNeededForCurrentLevel) * 100) : 100,
            isMaxLevel: currentLevel === 10,
            // Atalhos para compatibilidade
            level: currentLevel,
            xpProgressInCurrentLevel,
            xpNeededForCurrentLevel
        };
    }
};

// Mapear rank a partir do nível
function getRankByLevel(level) {
    if (level >= 8) return 'Senior';
    if (level >= 4) return 'Pleno';
    return 'Junior';
}

// Funções de inicialização e carregamento
async function initializeApp() {
    console.log('🔵 [DEBUG] ========== INICIANDO APLICAÇÃO ==========');

    // Configurar logout
    setupLogout();

    // Verificar autenticação
    if (!validateAuthentication()) {
        return;
    }

    showLoadingStates();

    try {
        const [userData, missionsData, submissionsData, completedMissionsData] = await Promise.all([
            loadUserProfile(),
            loadMissions(),
            loadSubmissions(),
            loadCompletedMissions()
        ]);

        console.log('🔵 [DEBUG] Dados carregados:', {
            userData,
            missionsCount: missionsData?.length,
            submissionsCount: submissionsData?.length,
            completedMissionsCount: completedMissionsData?.length
        });

        AppState.set('user', userData);
        AppState.set('missions', missionsData);
        AppState.set('submissions', submissionsData);
        AppState.set('completedMissions', completedMissionsData);

        updateUserInterface(userData);
        updateMissionsInterface(missionsData, completedMissionsData, submissionsData);
        updateSubmissionsInterface(submissionsData);
        setupMissionSubmission();
        setupTabs();

        hideLoadingStates();
    } catch (error) {
        Toast.show('Erro ao carregar os dados. Por favor, recarregue a página.', 'error');
        hideLoadingStates();
    }
}

// Configurar sistema de abas
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = button.id.replace('tab-', '') + '-tab';

            // Remove active de todos os botões
            tabButtons.forEach(btn => {
                btn.classList.remove('active', 'text-blue-600', 'border-blue-600');
                btn.classList.add('text-gray-500', 'border-transparent');
            });

            // Adiciona active ao botão clicado
            button.classList.add('active', 'text-blue-600', 'border-blue-600');
            button.classList.remove('text-gray-500', 'border-transparent');

            // Esconde todos os conteúdos
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            // Mostra o conteúdo da aba clicada
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');

                // Se for a aba de histórico, recarregar as submissões
                if (targetId === 'history-tab') {
                    loadAndUpdateSubmissions();
                }
            }
        });
    });
}

// Função para carregar e atualizar submissões
async function loadAndUpdateSubmissions() {
    try {
        const submissions = await loadSubmissions();
        updateSubmissionsInterface(submissions);
    } catch (error) {
        Toast.show('Erro ao carregar histórico de submissões', 'error');
    }
}

function validateAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return false;
    }
    return true;
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            Toast.show('Logout realizado com sucesso!', 'success');
            
            // Detectar base path para redirecionamento correto
            const basePath = window.location.hostname.includes('github.io') ? '/RPG' : '';
            
            setTimeout(() => {
                window.location.href = `${basePath}/`;
            }, 1000);
        });
    }
}

function showLoadingStates() {
    // Não fazer nada - os valores padrão no HTML já mostram "-" como placeholder
}

function hideLoadingStates() {
    // Não fazer nada - os valores já serão substituídos pela atualização da interface
}

async function loadUserProfile() {
    try {
        return await apiRequest('/usuarios/me');
    } catch (error) {
        Toast.show('Erro ao carregar seu perfil: ' + error.message, 'error');
        throw error;
    }
}

async function loadMissions() {
    try {
        return await apiRequest('/missoes');
    } catch (error) {
        Toast.show('Erro ao carregar missões: ' + error.message, 'error');
        throw error;
    }
}

async function loadSubmissions() {
    try {
        const [submissions, penaltiesRewards] = await Promise.all([
            apiRequest('/submissoes/my-submissions'),
            apiRequest('/usuarios/my-penalties-rewards').catch(() => []) // Fallback se rota não existir
        ]);

        // Combinar submissões com penalidades/recompensas
        const allItems = [...submissions];

        // Adicionar penalidades e recompensas como itens do histórico
        if (penaltiesRewards && penaltiesRewards.length > 0) {
            penaltiesRewards.forEach(item => {
                allItems.push({
                    ...item,
                    isPenaltyReward: true,
                    submittedAt: item.createdAt || item.date,
                    missionTitle: item.type === 'penalty' ? 'Penalidade Aplicada' : 'Recompensa Concedida'
                });
            });
        }

        // Ordenar por data (mais recentes primeiro)
        allItems.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        return allItems;
    } catch (error) {
        Toast.show('Erro ao carregar submissões: ' + error.message, 'error');
        throw error;
    }
}

async function loadCompletedMissions() {
    try {
        // Carregar todas as missões
        const allMissions = await apiRequest('/missoes/all'); // Nova rota para todas as missões

        // Carregar submissões aprovadas
        const submissions = await apiRequest('/submissoes/my-submissions');
        const approvedSubmissions = submissions.filter(sub => sub.status === 'approved');

        // Mapear submissões aprovadas com dados das missões
        const completedMissions = approvedSubmissions.map(submission => {
            const mission = allMissions.find(m => m.id === submission.missionId);
            return {
                ...mission,
                ...submission,
                completedAt: submission.submittedAt,
                earnedXP: submission.xp || mission?.xp || 0
            };
        });

        return completedMissions;
    } catch (error) {
        return [];
    }
}

function updateUserInterface(userData) {
    console.log('🔵 [DEBUG] updateUserInterface chamada com:', userData);

    // Usar levelInfo do backend se disponível, senão calcular localmente
    let xpInfo, rank;

    if (userData.levelInfo) {
        // Backend já enviou as informações calculadas
        xpInfo = userData.levelInfo;
        rank = userData.rank || getRankByLevel(xpInfo.currentLevel);
        console.log('🔵 [DEBUG] Usando levelInfo do backend');
    } else {
        // Fallback: calcular localmente
        xpInfo = LevelSystem.calculateLevel(userData.xp || 0);
        rank = getRankByLevel(xpInfo.level || xpInfo.currentLevel);
        console.log('🔵 [DEBUG] Calculando levelInfo localmente');
    }

    console.log('🔵 [DEBUG] XP Info:', xpInfo);
    console.log('🔵 [DEBUG] Rank:', rank);

    // Mapeamento dos ícones das classes
    const classIcons = {
        'Arqueiro do JavaScript': 'fab fa-js-square',
        'Cafeicultor do Java': 'fab fa-java',
        'Mago do CSS': 'fab fa-css3-alt',
        'Paladino do HTML': 'fab fa-html5',
        'Bárbaro do Back-end': 'fas fa-server',
        'Domador de Dados': 'fas fa-chart-bar',
        'Elfo do Front-end': 'fas fa-paint-brush',
        'Caçador de Bugs': 'fas fa-bug'
    };

    // Mapeamento das cores dos círculos das classes
    const classColors = {
        'Arqueiro do JavaScript': 'bg-yellow-100 text-yellow-600',
        'Cafeicultor do Java': 'bg-orange-100 text-orange-600',
        'Mago do CSS': 'bg-blue-100 text-blue-600',
        'Paladino do HTML': 'bg-red-100 text-red-600',
        'Bárbaro do Back-end': 'bg-gray-100 text-gray-600',
        'Domador de Dados': 'bg-green-100 text-green-600',
        'Elfo do Front-end': 'bg-purple-100 text-purple-600',
        'Caçador de Bugs': 'bg-pink-100 text-pink-600'
    };

    // Atualizar nome do estudante na header
    const studentNameHeader = document.getElementById('student-name');
    if (studentNameHeader) {
        studentNameHeader.textContent = userData.username || 'Aluno';
    }

    // Atualizar ícone da classe no header
    const studentClassIcon = document.getElementById('student-class-icon');
    const studentClassCircle = document.getElementById('student-class-circle');

    if (studentClassIcon && userData.class) {
        const iconClass = classIcons[userData.class] || 'fas fa-user';
        const colorClass = classColors[userData.class] || 'bg-gray-200 text-gray-600';

        studentClassIcon.className = `${iconClass}`;
        if (studentClassCircle) {
            studentClassCircle.className = `w-8 h-8 ${colorClass} rounded-full flex items-center justify-center transition-all duration-300`;
        }
    }

    // Atualizar elementos da interface
    // Compatibilidade: suportar ambos formatos (level/currentLevel)
    const level = xpInfo.level || xpInfo.currentLevel;
    const xpRemaining = xpInfo.isMaxLevel ? 0 : (xpInfo.nextLevelXP - xpInfo.currentXP);

    const elements = {
        'student-level': `Nível ${level} — ${rank}`,
        'student-class': userData.class || 'Não definida',
        'total-xp': xpInfo.totalXP,
        'current-xp': xpInfo.currentXP,
        'remaining-for-next': xpRemaining,
        'student-year': `${userData.year || 1}º ano`,
        'remaining-xp': xpRemaining
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        console.log(`🔵 [DEBUG] Atualizando elemento ${id}:`, { element: !!element, value });
        if (element) {
            element.textContent = value;
            // Adicionar animação de fade-in suave
            element.classList.add('value-loaded');
        }
    });

    // Atualizar barra de progresso
    const progress = xpInfo.progressPercentage;
    const progressBar = document.getElementById('xp-bar');
    const progressPercentage = document.getElementById('progress-percentage');

    console.log('🔵 [DEBUG] Atualizando barra de progresso:', {
        progress,
        progressBar: !!progressBar,
        progressPercentage: !!progressPercentage
    });

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    if (progressPercentage) {
        progressPercentage.textContent = `${progress}%`;
        progressPercentage.classList.add('value-loaded');
    }
}

function updateMissionsInterface(missions, completedMissions = [], submissions = []) {
    const missionsList = document.getElementById('missions');
    if (!missionsList) {
        return;
    }

    missionsList.innerHTML = '';

    // PASSO 1: Obter IDs de todas as submissões (pending e approved)
    // Missões com estas IDs não devem aparecer na lista de disponíveis
    const submittedMissionIds = new Set();
    submissions.forEach(s => {
        // Se não for penalidade/recompensa e for pendente ou aprovada, adiciona à lista de IDs submetidas
        if (!s.isPenaltyReward && (s.status === 'pending' || s.status === 'approved')) {
            submittedMissionIds.add(s.missionId);
        }
    });

    console.log('IDs de missões submetidas:', Array.from(submittedMissionIds));

    // PASSO 2: Obter IDs específicas para pendentes
    const pendingMissionIds = new Set();
    submissions.forEach(s => {
        // Se não for penalidade/recompensa e for pendente, adiciona à lista de pendentes
        if (!s.isPenaltyReward && s.status === 'pending') {
            pendingMissionIds.add(s.missionId);
        }
    });

    console.log('IDs de missões pendentes:', Array.from(pendingMissionIds));

    // PASSO 3: Obter IDs específicas para aprovadas/concluídas
    const completedMissionIds = new Set();
    submissions.forEach(s => {
        // Se não for penalidade/recompensa e for aprovada, adiciona à lista de concluídas
        if (!s.isPenaltyReward && s.status === 'approved') {
            completedMissionIds.add(s.missionId);
        }
    });

    console.log('IDs de missões concluídas:', Array.from(completedMissionIds));

    // PASSO 4: Garantir que as missões apareçam apenas em uma categoria
    // Uma missão está disponível somente se não estiver em nenhuma outra categoria
    const availableMissions = missions.filter(mission => !submittedMissionIds.has(mission.id));

    // Ordenar missões disponíveis por data de criação (mais recentes primeiro)
    availableMissions.sort((a, b) => {
        const dateA = parseFirebaseDate(a.createdAt);
        const dateB = parseFirebaseDate(b.createdAt);
        return dateB - dateA; // DESC (mais recente primeiro)
    });

    // Buscar as missões com submissões pendentes para mostrar na seção de pendentes
    // IMPORTANTE: Combinamos as informações de missões com suas submissões correspondentes
    const pendingMissions = missions.filter(mission => pendingMissionIds.has(mission.id));

    // Adicionar detalhes das submissões pendentes às missões pendentes
    pendingMissions.forEach(mission => {
        // Encontrar a submissão correspondente
        const submission = submissions.find(s => s.missionId === mission.id && s.status === 'pending');
        if (submission) {
            mission.submission = submission; // Anexar a submissão à missão para fácil acesso
        }
    });

    // Ordenar missões pendentes por data de submissão (mais recentes primeiro)
    pendingMissions.sort((a, b) => {
        const dateA = a.submission ? parseFirebaseDate(a.submission.submittedAt) : new Date(0);
        const dateB = b.submission ? parseFirebaseDate(b.submission.submittedAt) : new Date(0);
        return dateB - dateA; // DESC
    });

    console.log('Missões disponíveis:', availableMissions.length);
    console.log('Missões pendentes:', pendingMissions.length);
    console.log('Missões concluídas:', completedMissions.length);

    // Contadores para atualizar os números na interface
    const totalMissions = missions.length;
    const completedCount = completedMissions.length;
    const pendingCount = pendingMissions.length;

    // Atualizar contadores nos botões de filtro que já existem no HTML
    const availableCountEl = document.getElementById('available-count');
    const pendingCountEl = document.getElementById('pending-count');
    const completedCountEl = document.getElementById('completed-count');

    if (availableCountEl) availableCountEl.textContent = availableMissions.length;
    if (pendingCountEl) pendingCountEl.textContent = pendingMissions.length;
    if (completedCountEl) completedCountEl.textContent = completedMissions.length;

    // Container para todas as seções de missões (inicialmente só mostra disponíveis)
    const missionsContainer = document.createElement('div');
    missionsContainer.className = 'missions-container';
    missionsList.appendChild(missionsContainer);

    // Adicionar seção de missões pendentes (inicialmente oculta)
    const pendingSection = document.createElement('div');
    pendingSection.id = 'pending-missions-section';
    pendingSection.className = 'missions-section hidden';
    pendingSection.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <h3 class="text-2xl font-bold text-yellow-700 dark:text-yellow-400 flex items-center">
                <div class="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                    <i class="fas fa-clock text-white"></i>
                </div>
                Missões Pendentes de Avaliação
            </h3>
            <span class="bg-yellow-500 dark:bg-yellow-900 text-white dark:text-yellow-200 px-4 py-2 rounded-full font-bold text-sm">
                ${pendingMissions.length}
            </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="pending-missions-list"></div>
    `;
    missionsContainer.appendChild(pendingSection);

    // Preencher a seção de pendentes com as missões
    if (pendingMissions.length > 0) {
        const pendingList = document.getElementById('pending-missions-list');
        pendingMissions.forEach(mission => {
            // Encontrar a submissão correspondente a esta missão
            const submission = submissions.find(s => s.missionId === mission.id && s.status === 'pending');

            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-l-4 border-yellow-500';
            card.innerHTML = `
                <div class="p-6">
                    <!-- Header com título e XP -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1 pr-2">
                            <h4 class="mission-card-title text-lg font-bold mb-1 line-clamp-2">
                                ${mission.titulo || mission.title || 'Missão sem título'}
                            </h4>
                            <span class="inline-flex items-center text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                                <i class="fas fa-hourglass-half mr-1"></i>
                                Aguardando avaliação
                            </span>
                        </div>
                        <div class="flex-shrink-0">
                            <div class="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md flex items-center">
                                <i class="fas fa-star mr-1"></i>
                                ${mission.xp || 0}
                            </div>
                        </div>
                    </div>

                    <!-- Submissão -->
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        <i class="fas fa-paper-plane mr-1"></i>
                        Enviado em: ${parseFirebaseDate(submission?.submittedAt).toLocaleString('pt-BR')}
                    </p>
                    
                    <!-- Arquivos enviados -->
                    ${submission?.fileUrls && submission.fileUrls.length ? `
                        <div class="mt-3">
                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Arquivos enviados:</p>
                            <div class="space-y-1">
                                ${submission.fileUrls.map(file => `
                                    <div class="flex items-center text-xs text-gray-700 dark:text-gray-300">
                                        <i class="fas fa-file-code mr-2"></i>
                                        <span class="truncate max-w-[200px]">${file.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Divisor -->
                    <div class="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                    <!-- Status -->
                    <div class="flex justify-between items-center">
                        <span class="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                            <i class="fas fa-clock mr-1"></i>
                            Aguardando mestre
                        </span>
                    </div>
                </div>
            `;
            pendingList.appendChild(card);
        });
    }

    // Seção de missões concluídas
    if (completedMissions.length > 0) {
        const completedSection = document.createElement('div');
        completedSection.id = 'completed-missions-section';
        completedSection.className = 'missions-section hidden mb-8 col-span-full';
        completedSection.innerHTML = `
            <div class="mb-6 flex items-center justify-between">
                <h3 class="text-2xl font-bold text-green-700 dark:text-green-400 flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                        <i class="fas fa-trophy text-white"></i>
                    </div>
                    Missões Concluídas
                </h3>
                <span class="bg-green-600 dark:bg-green-900 text-white dark:text-green-200 px-4 py-2 rounded-full font-bold text-sm">
                    ${completedMissions.length}
                </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="completed-missions-list"></div>
        `;
        missionsList.appendChild(completedSection);

        // Ordenar missões concluídas por data de conclusão (mais recentes primeiro)
        completedMissions.sort((a, b) => {
            const dateA = parseFirebaseDate(a.completedAt || a.submittedAt);
            const dateB = parseFirebaseDate(b.completedAt || b.submittedAt);
            return dateB - dateA; // DESC
        });

        const completedList = document.getElementById('completed-missions-list');
        completedMissions.forEach(mission => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-green-500 transform hover:-translate-y-1';
            card.innerHTML = `
                <div class="p-6">
                    <!-- Header com título e XP -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1 pr-2">
                            <h4 class="mission-card-title text-lg font-bold mb-1 line-clamp-2">
                                ${mission.titulo || mission.title || 'Missão sem título'}
                            </h4>
                            <span class="inline-flex items-center text-xs text-green-600 dark:text-green-400 font-semibold">
                                <i class="fas fa-check-circle mr-1"></i>
                                Concluída
                            </span>
                        </div>
                        <div class="flex-shrink-0">
                            <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md flex items-center">
                                <i class="fas fa-star mr-1"></i>
                                +${mission.earnedXP || mission.xp}
                            </div>
                        </div>
                    </div>

                    <!-- Descrição -->
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        ${mission.descricao || mission.description || 'Sem descrição'}
                    </p>

                    <!-- Divisor -->
                    <div class="border-t border-gray-200 dark:border-gray-700 mb-4"></div>

                    <!-- Metadados -->
                    <div class="flex justify-between items-center text-xs">
                        <div class="flex items-center text-gray-500 dark:text-gray-400">
                            <i class="fas fa-calendar-alt mr-2"></i>
                            <span>${new Date(mission.completedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <span class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full font-medium">
                                <i class="fas fa-users mr-1"></i>
                                ${mission.targetClass || 'Geral'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Barra de progresso decorativa -->
                <div class="h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"></div>
            `;
            completedList.appendChild(card);
        });
    }

    // Seção de missões disponíveis
    if (availableMissions.length > 0) {
        const availableSection = document.createElement('div');
        availableSection.id = 'available-missions-section';
        availableSection.className = 'missions-section col-span-full'; // Inicialmente visível
        availableSection.innerHTML = `
            <div class="mb-6 flex items-center justify-between">
                <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-400 flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                        <i class="fas fa-scroll text-white"></i>
                    </div>
                    Missões Disponíveis
                </h2>
                <span class="bg-blue-500 dark:bg-blue-900 text-white dark:text-blue-200 px-4 py-2 rounded-full font-bold text-sm">
                    ${availableMissions.length}
                </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="available-missions-list"></div>
        `;
        missionsList.appendChild(availableSection);

        const availableList = document.getElementById('available-missions-list');
        availableMissions.forEach(mission => {
            const card = document.createElement('div');
            card.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-blue-500 transform hover:-translate-y-1 cursor-pointer';
            card.dataset.missionId = mission.id;
            card.addEventListener('click', function () {
                // Preencher o select de missão no formulário de submissão
                const missionSelect = document.getElementById('mission-select');
                if (missionSelect) {
                    missionSelect.value = mission.id;
                    // Disparar o evento change para atualizar os detalhes da missão
                    missionSelect.dispatchEvent(new Event('change'));
                }

                // Rolar até o formulário de submissão
                document.querySelector('#submit-code-btn').scrollIntoView({ behavior: 'smooth' });

                // Destacar o formulário por um momento
                const submitSection = document.querySelector('#submit-code-btn').closest('.bg-white');
                submitSection.classList.add('highlight-pulse');
                setTimeout(() => {
                    submitSection.classList.remove('highlight-pulse');
                }, 2000);
            });
            card.innerHTML = `
                <div class="p-6">
                    <!-- Header com título e XP -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1 pr-2">
                            <h4 class="mission-card-title text-lg font-bold mb-2 line-clamp-2">
                                ${mission.titulo || mission.title || 'Missão sem título'}
                            </h4>
                            <span class="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                <i class="fas fa-bolt mr-1"></i>
                                Disponível
                            </span>
                        </div>
                        <div class="flex-shrink-0">
                            <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-md flex items-center">
                                <i class="fas fa-star mr-1"></i>
                                ${mission.xp || 0}
                            </div>
                        </div>
                    </div>

                    <!-- Descrição -->
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        ${mission.descricao || mission.description || 'Sem descrição'}
                    </p>

                    <!-- Divisor -->
                    <div class="border-t border-gray-200 dark:border-gray-700 mb-4"></div>

                    <!-- Metadados -->
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-2">
                            <span class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                                <i class="fas fa-users mr-1"></i>
                                ${mission.targetClass || 'Geral'}
                            </span>
                            ${mission.turma ? `
                                <span class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
                                    <i class="fas fa-graduation-cap mr-1"></i>
                                    ${mission.turma}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>

            `;
            availableList.appendChild(card);
        });
    } else if (completedMissions.length === 0) {
        missionsList.innerHTML = `
            <div class="text-center py-16 px-4">
                <div class="inline-flex items-center justify-center w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                    <i class="fas fa-scroll text-gray-400 dark:text-gray-600 text-5xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Nenhuma missão disponível
                </h3>
                <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Aguarde! Seu mestre em breve publicará novas missões para você conquistar.
                </p>
            </div>
        `;
    }

    // Adicionar função para mostrar apenas uma seção de missão por vez
    function showMissionSection(sectionId) {
        // Ocultar todas as seções
        document.querySelectorAll('.missions-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Mostrar apenas a seção selecionada
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.classList.remove('hidden');
        }

        // Atualizar estilos dos botões (remover classe 'active' de todos)
        document.querySelectorAll('.section-button').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.remove('ring-2', 'ring-offset-2');
        });

        // Adicionar classe 'active' ao botão selecionado
        let buttonId;
        switch (sectionId) {
            case 'available-missions-section':
                buttonId = 'show-available-missions';
                break;
            case 'pending-missions-section':
                buttonId = 'show-pending-missions';
                break;
            case 'completed-missions-section':
                buttonId = 'show-completed-missions';
                break;
        }

        const selectedButton = document.getElementById(buttonId);
        if (selectedButton) {
            selectedButton.classList.add('active');
            selectedButton.classList.add('ring-2', 'ring-offset-2');
        }
    }

    // Adicionar manipuladores para os botões de filtro
    const filterAvailableBtn = document.getElementById('filter-available');
    const filterPendingBtn = document.getElementById('filter-pending');
    const filterCompletedBtn = document.getElementById('filter-completed');

    if (filterAvailableBtn) {
        filterAvailableBtn.addEventListener('click', () => {
            // Remover classe active de todos os botões
            document.querySelectorAll('.mission-filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            // Adicionar classe active ao botão clicado
            filterAvailableBtn.classList.add('active');
            showMissionSection('available-missions-section');
        });
    }

    if (filterPendingBtn) {
        filterPendingBtn.addEventListener('click', () => {
            document.querySelectorAll('.mission-filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            filterPendingBtn.classList.add('active');
            showMissionSection('pending-missions-section');
        });
    }

    if (filterCompletedBtn) {
        filterCompletedBtn.addEventListener('click', () => {
            document.querySelectorAll('.mission-filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            filterCompletedBtn.classList.add('active');
            showMissionSection('completed-missions-section');
        });
    }

    // Inicialmente, mostrar a seção de missões disponíveis
    showMissionSection('available-missions-section');

    updateMissionSelect(availableMissions);
}

function setupMissionSubmission() {
    const missionSelect = document.getElementById('mission-select');
    const codeUpload = document.getElementById('code-upload');
    const submitButton = document.getElementById('submit-code-btn');

    if (!missionSelect || !codeUpload || !submitButton) {
        return;
    }

    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();

        if (!missionSelect.value) {
            Toast.show('Selecione uma missão para enviar', 'warning');
            return;
        }

        if (!codeUpload.files || codeUpload.files.length === 0) {
            Toast.show('Selecione pelo menos um arquivo para enviar', 'warning');
            return;
        }

        // Capturar informações da missão selecionada
        const selectedMissionId = missionSelect.value;
        const selectedMissionText = missionSelect.options[missionSelect.selectedIndex].text;
        const uploadedFiles = Array.from(codeUpload.files);

        const formData = new FormData();
        formData.append('missionId', selectedMissionId);

        // Para diagnóstico: enviar apenas o primeiro arquivo
        if (uploadedFiles.length > 0) {
            console.log('🔄 Enviando arquivo para diagnóstico:', uploadedFiles[0].name);
            console.log('📊 Detalhes do arquivo:', {
                name: uploadedFiles[0].name,
                size: uploadedFiles[0].size,
                type: uploadedFiles[0].type
            });
            formData.append('code', uploadedFiles[0]);
        } else {
            console.log('⚠️ Nenhum arquivo para enviar');
            return Toast.show('❌ Selecione um arquivo antes de enviar', 'error');
        }

        // Validar FormData criada
        console.log('📋 FormData preparada com campos:', Array.from(formData.keys()));

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';

        try {
            console.log('🔄 Iniciando upload de arquivo(s)...');
            console.log('🔄 Número de arquivos:', uploadedFiles.length);
            console.log('🔄 Missão ID:', selectedMissionId);

            // 1. Enviar submissão para o backend
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Token não encontrado. Faça login novamente.');
            }

            // Mostrar progresso ao usuário
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando (0%)...';

            console.log('📤 Iniciando requisição POST para /submissoes/submit');

            const response = await fetch(`http://localhost:3000/submissoes/submit`, {
                method: 'POST',
                body: formData, // FormData já é tratado corretamente pelo navegador
                headers: {
                    'Authorization': `Bearer ${token}`
                    // NÃO incluir Content-Type - o navegador define automaticamente
                }
            });

            console.log('✅ Resposta recebida do servidor:', response.status);

            if (!response.ok) {
                let errorMessage = 'Erro desconhecido no servidor';
                try {
                    const error = await response.json();
                    console.error('❌ Erro na resposta:', error);
                    errorMessage = error.error || error.details || error.message || 'Falha no servidor';
                    throw new Error(errorMessage);
                } catch (parseError) {
                    console.error('❌ Erro ao processar resposta de erro:', parseError);
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }
            }

            let result;
            try {
                result = await response.json();
                console.log('✅ Upload concluído com sucesso:', result);
            } catch (jsonError) {
                console.error('❌ Erro ao processar resposta JSON:', jsonError);
                // Continuar mesmo com erro de parsing, provavelmente funcionou
            }

            Toast.show('Missão enviada com sucesso! Status: Pendente - aguardando aprovação do mestre.', 'success');

            // 1.5. Adicionar submissão pendente temporariamente à lista local para feedback imediato
            const tempSubmission = {
                id: 'temp-' + Date.now(),
                missionTitle: selectedMissionText,
                status: 'pending',
                submittedAt: new Date().toISOString(),
                filePaths: uploadedFiles.map(f => f.name),
                xp: null,
                feedback: null
            };

            // Adicionar à lista atual de submissões do estado global
            const currentSubmissions = AppState.get('submissions') || [];
            currentSubmissions.unshift(tempSubmission);
            AppState.set('submissions', currentSubmissions);
            updateSubmissionsInterface(currentSubmissions);

            // 2. Gerar feedback automático com Gemini AI
            await generateAutomaticFeedback(uploadedFiles, {
                id: selectedMissionId,
                title: selectedMissionText,
                description: `Submissão para a missão: ${selectedMissionText}`
            });

            // 3. Limpar o formulário
            missionSelect.value = '';
            codeUpload.value = '';

            // 4. Recarregar submissões e missões (dados reais do servidor)
            const submissions = await loadSubmissions();

            // Atualizar estado global com dados reais
            AppState.set('submissions', submissions);
            updateSubmissionsInterface(submissions);

            // Recarregar missões para atualizar a lista
            const missions = await API.request('/missoes', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Recarregar também as missões concluídas para manter as estatísticas corretas
            const completedMissions = await loadCompletedMissions();

            // Atualizar estado global e interface com todas as informações
            AppState.set('submissions', submissions);
            AppState.set('missions', missions);
            AppState.set('completedMissions', completedMissions);

            // Importante: atualizar a interface após uma submissão
            updateMissionsInterface(missions, completedMissions, submissions);

            // Mostrar a seção de missões pendentes após uma submissão
            setTimeout(() => {
                const pendingButton = document.getElementById('show-pending-missions');
                if (pendingButton) {
                    pendingButton.click(); // Ativa automaticamente a visualização de missões pendentes
                }

                // Mostrar toast sobre onde encontrar a submissão pendente
                Toast.show('📋 Sua submissão está pendente! Agora você pode vê-la na seção "Missões Pendentes".', 'info');
            }, 1000);
        } catch (error) {
            console.error('❌ Erro durante o processo de submissão:', error);
            let mensagem = error.message || 'Erro desconhecido';

            // Fornecer mensagens mais descritivas para erros comuns
            if (mensagem.includes('NetworkError') || mensagem.includes('Failed to fetch')) {
                mensagem = 'Erro de conexão com o servidor. Verifique se o servidor está rodando.';
            } else if (mensagem.includes('413') || mensagem.includes('too large')) {
                mensagem = 'O arquivo é muito grande. Limite máximo: 50MB.';
            }

            Toast.show('Erro ao enviar missão: ' + mensagem, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Enviar Código';
        }
    });
}

function updateMissionSelect(missions) {
    const missionSelect = document.getElementById('mission-select');
    if (!missionSelect) return;

    missionSelect.innerHTML = '<option value="">Selecione uma missão para enviar</option>';
    missions.forEach(mission => {
        const title = mission.titulo || mission.title || 'Missão sem título';
        const xp = mission.xp || 0;
        missionSelect.innerHTML += `
            <option value="${mission.id}">${title} (${xp} XP)</option>
        `;
    });
}

function updateSubmissionsInterface(submissions) {
    const submissionsList = document.getElementById('submission-history');
    if (!submissionsList) return;

    submissionsList.innerHTML = '';

    if (submissions.length === 0) {
        submissionsList.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-history text-gray-400 text-4xl mb-4"></i>
                <p class="text-gray-500">Nenhuma submissão encontrada.</p>
                <p class="text-sm text-gray-400 mt-2">Suas submissões aparecerão aqui após enviar uma missão.</p>
            </div>
        `;
        return;
    }

    submissions.forEach(submission => {
        // Se for penalidade/recompensa, usar cores e ícones específicos
        if (submission.isPenaltyReward) {
            renderPenaltyRewardCard(submission, submissionsList);
        } else {
            renderSubmissionCard(submission, submissionsList);
        }
    });

    // Adicionar informação sobre submissões pendentes se houver alguma
    const pendingCount = submissions.filter(s => !s.isPenaltyReward && s.status === 'pending').length;
    if (pendingCount > 0) {
        // Adicionar aviso no topo
        const pendingNotice = document.createElement('div');
        pendingNotice.className = 'bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6';
        pendingNotice.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <i class="fas fa-clock text-yellow-600 text-xl"></i>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-yellow-800">
                        Você tem ${pendingCount} submissão${pendingCount > 1 ? 'ões' : ''} pendente${pendingCount > 1 ? 's' : ''}
                    </h3>
                    <p class="text-sm text-yellow-700 mt-1">
                        Suas submissões estão aguardando revisão do mestre. Você será notificado quando forem aprovadas ou rejeitadas.
                    </p>
                </div>
            </div>
        `;
        submissionsList.insertBefore(pendingNotice, submissionsList.firstChild);
    }
}

function renderPenaltyRewardCard(item, container) {
    const isPenalty = item.type === 'penalty';
    const card = document.createElement('div');
    card.className = `bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border-l-4 ${isPenalty ? 'border-red-500' : 'border-green-500'}`;

    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold ${isPenalty ? 'text-red-800' : 'text-green-800'} flex items-center">
                    <i class="fas ${isPenalty ? 'fa-exclamation-triangle' : 'fa-gift'} mr-2"></i>
                    ${item.missionTitle}
                </h3>
                <p class="text-sm text-gray-500">
                    <i class="fas fa-calendar-alt mr-1"></i>
                    ${new Date(item.submittedAt).toLocaleString()}
                </p>
                <p class="text-sm ${isPenalty ? 'text-red-600' : 'text-green-600'} mt-1 font-semibold">
                    <i class="fas fa-star mr-1"></i>
                    ${isPenalty ? '-' : '+'}${Math.abs(item.xp || 0)} XP
                </p>
            </div>
            <span class="${isPenalty ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <i class="fas ${isPenalty ? 'fa-minus-circle' : 'fa-plus-circle'} mr-1"></i>
                ${isPenalty ? 'Penalidade' : 'Recompensa'}
            </span>
        </div>
        ${item.reason ? `
            <div class="mt-4 p-4 ${isPenalty ? 'bg-red-50' : 'bg-green-50'} rounded-lg">
                <h4 class="text-sm font-semibold ${isPenalty ? 'text-red-700' : 'text-green-700'} mb-2 flex items-center">
                    <i class="fas fa-comment-alt mr-2"></i>
                    Motivo:
                </h4>
                <p class="${isPenalty ? 'text-red-600' : 'text-green-600'}">${item.reason}</p>
            </div>
        ` : ''}
    `;
    container.appendChild(card);
}

function renderSubmissionCard(submission, container) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        approved: 'bg-green-100 text-green-800 border-green-300',
        rejected: 'bg-red-100 text-red-800 border-red-300'
    };

    const statusText = {
        pending: 'Pendente - Aguardando Aprovação',
        approved: 'Aprovada',
        rejected: 'Rejeitada'
    };

    const statusIcon = {
        pending: 'fas fa-clock',
        approved: 'fas fa-check-circle',
        rejected: 'fas fa-times-circle'
    };

    const isPending = submission.status === 'pending';
    const isRecent = new Date() - new Date(submission.submittedAt) < 60000; // Últimos 60 segundos
    const card = document.createElement('div');

    // Adicionar uma borda especial para submissões pendentes
    let cardClasses = 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300';

    if (isPending) {
        cardClasses += ' border-l-4 border-yellow-400';
        if (isRecent) {
            cardClasses += ' ring-2 ring-yellow-300 ring-opacity-50';
        }
    }

    card.className = cardClasses;
    card.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-lg font-semibold text-gray-800">${submission.missionTitle}</h3>
                    ${isRecent && isPending ? '<span class="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">NOVA</span>' : ''}
                </div>
                <p class="text-sm text-gray-500">
                    <i class="fas fa-calendar-alt mr-1"></i>
                    Enviado em ${new Date(submission.submittedAt).toLocaleString()}
                </p>
                ${submission.xp ? `
                    <p class="text-sm text-blue-600 mt-1">
                        <i class="fas fa-star mr-1"></i>
                        ${submission.xp} XP
                    </p>
                ` : ''}
            </div>
            <span class="${statusColors[submission.status || 'pending']} px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <i class="${statusIcon[submission.status || 'pending']} mr-1"></i>
                ${statusText[submission.status || 'pending']}
            </span>
        </div>
        ${submission.feedback ? `
            <div class="mt-4 p-4 ${submission.status === 'rejected' ? 'bg-red-50 border-l-4 border-red-400' : 'bg-blue-50 border-l-4 border-blue-400'} rounded-r-lg">
                <h4 class="text-sm font-semibold ${submission.status === 'rejected' ? 'text-red-700' : 'text-blue-700'} mb-2 flex items-center">
                    <i class="fas fa-comment-alt mr-2"></i>
                    Feedback do Mestre:
                </h4>
                <p class="${submission.status === 'rejected' ? 'text-red-600' : 'text-blue-600'}">${submission.feedback}</p>
            </div>
        ` : ''}
        ${submission.filePaths && submission.filePaths.length > 0 ? `
            <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <i class="fas fa-paperclip mr-2"></i>
                    Arquivos enviados:
                </h4>
                <div class="space-y-1">
                    ${submission.filePaths.map(filePath => {
        const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
        return `<span class="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">${fileName}</span>`;
    }).join(' ')}
                </div>
                
                <!-- Botão para Feedback Automático -->
                <div class="mt-3 pt-3 border-t border-gray-200">
                    <button 
                        onclick="requestFeedbackForSubmission(${submission.id}, '${submission.missionTitle}', ${JSON.stringify(submission.filePaths).replace(/"/g, '&quot;')})"
                        class="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
                        title="Gerar feedback automático com IA"
                    >
                        <i class="fas fa-robot mr-2"></i>
                        Solicitar Feedback IA
                    </button>
                    <span class="ml-2 text-xs text-gray-500">
                        Análise automática do seu código
                    </span>
                </div>
            </div>
        ` : ''}
    `;
    container.appendChild(card);
}

/**
 * Gera feedback automático usando Gemini AI
 * @param {Array} files - Arquivos enviados
 * @param {Object} missionContext - Contexto da missão
 */
async function generateAutomaticFeedback(files, missionContext) {
    try {
        console.log('🔄 Gerando feedback automático...');
        console.log('   - Arquivos:', files);
        console.log('   - Contexto da missão:', missionContext);

        // Mostrar toast informativo
        Toast.show('🤖 Gerando feedback automático com IA...', 'info');

        // Gerar feedback com Gemini
        const feedbackData = await gemini.analyzeSubmission(files, missionContext);

        console.log('✅ Feedback recebido:', feedbackData);

        // Preparar informações da submissão para o modal
        const submissionInfo = {
            missionTitle: missionContext.title,
            files: files.map(file => ({ name: file.name, size: file.size })),
            timestamp: new Date().toISOString()
        };

        console.log('📋 Informações da submissão:', submissionInfo);

        // Exibir modal com o feedback
        feedbackModal.show(feedbackData, submissionInfo);

        if (feedbackData.success) {
            if (feedbackData.isDemoFeedback) {
                Toast.show('📚 Feedback de demonstração gerado! Configure Gemini para IA personalizada.', 'info');
            } else {
                Toast.show('✨ Feedback automático gerado com sucesso!', 'success');
            }
        } else {
            Toast.show('⚠️ Erro ao gerar feedback automático', 'warning');
        }

    } catch (error) {
        console.error('❌ Erro ao gerar feedback:', error);
        Toast.show('Erro ao gerar feedback automático. Tente novamente.', 'error');
    }
}

/**
 * Solicita feedback automático para uma submissão existente
 * @param {number} submissionId - ID da submissão
 * @param {string} missionTitle - Título da missão
 * @param {Array} filePaths - Caminhos dos arquivos
 */
async function requestFeedbackForSubmission(submissionId, missionTitle, filePaths) {
    try {
        Toast.show('🤖 Preparando análise automática...', 'info');

        // Como não temos acesso aos arquivos originais no frontend,
        // vamos criar um feedback baseado nas informações disponíveis
        const mockFiles = filePaths.map(path => {
            const fileName = path.split('/').pop() || path.split('\\').pop();
            return {
                name: fileName,
                type: 'text',
                size: 0,
                content: `// Arquivo: ${fileName}\n// Esta é uma análise baseada no histórico de submissão.\n// Para uma análise mais detalhada, reenvie o arquivo.`
            };
        });

        const missionContext = {
            id: submissionId,
            title: missionTitle,
            description: `Análise de submissão histórica para: ${missionTitle}`
        };

        // Gerar feedback com Gemini
        const feedbackData = await gemini.analyzeSubmission(mockFiles, missionContext);

        // Preparar informações da submissão para o modal
        const submissionInfo = {
            missionTitle: missionTitle,
            files: filePaths.map(path => ({
                name: path.split('/').pop() || path.split('\\').pop(),
                size: 'N/A'
            })),
            timestamp: new Date().toISOString(),
            isHistorical: true
        };

        // Exibir modal com o feedback
        feedbackModal.show(feedbackData, submissionInfo);

        if (feedbackData.success) {
            Toast.show('✨ Análise automática concluída!', 'success');
        } else {
            Toast.show('⚠️ Erro ao gerar análise automática', 'warning');
        }

    } catch (error) {
        Toast.show('Erro ao gerar análise. Tente novamente.', 'error');
    }
}

// Fazer a função disponível globalmente
window.requestFeedbackForSubmission = requestFeedbackForSubmission;

document.addEventListener('DOMContentLoaded', initializeApp);

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        const themeToggleBackup = document.getElementById("theme-toggle");

        if (themeToggleBackup && !themeToggleBackup.hasAttribute("data-backup-configured")) {
            themeToggleBackup.setAttribute("data-backup-configured", "true");

            themeToggleBackup.addEventListener("click", function (e) {
                e.preventDefault();

                const html = document.documentElement;
                const icon = document.getElementById("theme-icon");
                const currentTheme = html.getAttribute("data-theme") || "light";

                if (currentTheme === "dark") {
                    html.setAttribute("data-theme", "light");
                    icon.className = "fas fa-moon theme-icon-moon";
                    localStorage.setItem("theme", "light");
                } else {
                    html.setAttribute("data-theme", "dark");
                    icon.className = "fas fa-sun theme-icon-sun";
                    localStorage.setItem("theme", "dark");
                }
            });
        }

        // Inicializar ícone do tema corretamente
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

        document.documentElement.setAttribute("data-theme", initialTheme);

        const themeIcon = document.getElementById("theme-icon");
        if (themeIcon) {
            if (initialTheme === "dark") {
                themeIcon.className = "fas fa-sun theme-icon-sun";
            } else {
                themeIcon.className = "fas fa-moon theme-icon-moon";
            }
        }

        // Inicializar sistema de bug report
        initBugReportSystem();
    }, 100);
});

// ====================================
// SISTEMA DE BUG REPORT
// ====================================

function initBugReportSystem() {
    const bugReportBtn = document.getElementById('bug-report-btn');
    const bugReportModal = document.getElementById('bug-report-modal');
    const closeBugModal = document.getElementById('close-bug-modal');
    const cancelBugReport = document.getElementById('cancel-bug-report');
    const bugReportForm = document.getElementById('bug-report-form');

    // Abrir modal
    if (bugReportBtn) {
        bugReportBtn.addEventListener('click', () => {
            bugReportModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
    }

    // Fechar modal
    function closeBugReportModal() {
        bugReportModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        bugReportForm.reset();
    }

    if (closeBugModal) {
        closeBugModal.addEventListener('click', closeBugReportModal);
    }

    if (cancelBugReport) {
        cancelBugReport.addEventListener('click', closeBugReportModal);
    }

    // Fechar modal clicando fora
    bugReportModal.addEventListener('click', (e) => {
        if (e.target === bugReportModal) {
            closeBugReportModal();
        }
    });

    // Enviar bug report
    if (bugReportForm) {
        bugReportForm.addEventListener('submit', handleBugReportSubmit);
    }
}

async function handleBugReportSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-bug-report');
    const originalText = submitBtn.innerHTML;

    try {
        // Mostrar loading
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
        submitBtn.disabled = true;

        const formData = new FormData(e.target);

        // Adicionar informações do usuário
        const userName = localStorage.getItem('username') || 'Usuário Desconhecido';
        const userEmail = localStorage.getItem('email') || 'email@desconhecido.com';

        const title = formData.get('title');
        const description = formData.get('description');
        const screenshot = formData.get('screenshot');

        // Converter e COMPRIMIR screenshot para Base64
        let screenshotBase64 = '';
        if (screenshot && screenshot.size > 0) {
            console.log('[BUG REPORT] Tamanho original:', (screenshot.size / 1024).toFixed(2), 'KB');

            // Comprimir imagem antes de converter para Base64
            screenshotBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        // Criar canvas para redimensionar
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Redimensionar mantendo proporção (máx 1200px de largura)
                        let width = img.width;
                        let height = img.height;
                        const maxWidth = 1200;

                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);

                        // Converter para Base64 com qualidade reduzida (0.7 = 70%)
                        const compressed = canvas.toDataURL('image/jpeg', 0.7);
                        console.log('[BUG REPORT] Comprimida para:', (compressed.length / 1024).toFixed(2), 'KB');
                        resolve(compressed);
                    };
                    img.onerror = reject;
                    img.src = e.target.result;
                };
                reader.onerror = reject;
                reader.readAsDataURL(screenshot);
            });
        }

        // Preparar dados para enviar ao backend
        const bugReportData = {
            title,
            description,
            userName,
            userEmail,
            url: window.location.href,
            screenshot: screenshotBase64 || null
        };

        console.log('[BUG REPORT] Enviando para o backend...');

        // Enviar para o backend próprio
        const response = await fetch('http://localhost:3000/api/bug-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(bugReportData)
        });

        const result = await response.json();

        console.log('[BUG REPORT] Resposta:', result); if (response.ok && result.success) {
            Toast.show('✅ Bug reportado com sucesso! 📧 Email enviado para pulppor@gmail.com', 'success');

            // Fechar modal
            document.getElementById('bug-report-modal').classList.add('hidden');
            document.body.style.overflow = 'auto';
            e.target.reset();
        } else {
            throw new Error(result.message || 'Erro ao enviar bug report');
        }

    } catch (error) {
        console.error('[BUG REPORT] Erro:', error);
        Toast.show('❌ Erro ao enviar bug report. Tente novamente.', 'error');
    } finally {
        // Restaurar botão
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}