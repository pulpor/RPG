// Orquestrador mínimo do painel master
import { API_URL } from '../config.js';

// Importar módulos utilitários 
import { validateAuthentication, apiRequest } from '../utils/auth.js';
import { setupLogout } from '../utils/interface.js';
import { showPenaltyRewardModal, showStudentHistoryModal } from '../utils/modals.js';
import { setupAllButtonEvents } from '../utils/buttons.js';

// módulos especializados (devem conter toda a lógica específica)
import * as Pendentes from './pendentes.js';
import * as Alunos from './alunos.js';
import * as Missoes from './missoes.js';

// ====================================
// SISTEMA DE TOAST NOTIFICATIONS
// ====================================
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

// Função global para verificar filtros ativos de qualquer módulo
window.checkActiveFilters = function (type) {
	if (type === 'student') return Alunos.checkActiveFilters?.(type) || false;
	if (type === 'submission' || type === 'mission') return Missoes.checkActiveFilters?.(type) || false;
	return false;
};

// Aplicar tema
(function () {
	const t = localStorage.getItem("theme") || "light";
	document.documentElement.setAttribute("data-theme", t);
})();

// Nova attachTabLoaders: garante ativação da aba (fallback) e depois chama loader
function attachTabLoaders() {
	try {
		const tabButtons = document.querySelectorAll('.tab-button');
		const tabContents = document.querySelectorAll('.tab-content');
		const filtersMap = {
			students: "students-filters",
			submissions: "submissions-filters",
			missions: "missions-filters",
		};

		// Guardas simples para evitar chamadas redundantes
		const inProgress = { students: false, submissions: false, missions: false, pending: false };
		const lastCalled = { students: 0, submissions: 0, missions: 0, pending: 0 };
		const MIN_INTERVAL = 500;

		const keyFromContent = (el) => {
			if (!el) return null;
			const id = (el.id || '').toLowerCase();
			if (id.includes('student')) return 'students';
			if (id.includes('submission')) return 'submissions';
			if (id.includes('mission')) return 'missions';
			if (id.includes('pending')) return 'pending';
			return null;
		};

		const callLoader = async (key) => {
			if (!key) return;
			const now = Date.now();
			if (inProgress[key]) {
				return;
			}
			if (now - (lastCalled[key] || 0) < MIN_INTERVAL) {
				return;
			}
			inProgress[key] = true;
			lastCalled[key] = now;
			try {
				showLoadingForTab(key);
				if (key === 'students') await Alunos.loadApprovedStudents?.();
				else if (key === 'submissions') await Missoes.loadSubmissions?.();
				else if (key === 'missions') await Missoes.loadMissions?.();
				else if (key === 'pending') await Pendentes.loadPendingUsers?.();
			} catch (err) {
				console.error('[MASTER] erro ao carregar aba', key, err);
				const map = { students: 'students-list', submissions: 'submissions-list', missions: 'missions-list', pending: 'pending-users' };
				const container = document.getElementById(map[key]);
				if (container) container.innerHTML = `<p class="text-red-500 py-4">Erro ao carregar: ${err?.message || err}</p>`;
			} finally {
				inProgress[key] = false;
				lastCalled[key] = Date.now();
			}
		};

		// Aplicar ativação visual da aba (fallback) - semelhante ao initTabs
		const ensureTabActivated = (btn) => {
			if (!btn) return null;

			// remover active dos botões e contents
			tabButtons.forEach(b => {
				b.classList.remove('active', 'border-purple-500', 'text-purple-600');
				b.classList.add('text-gray-500');
			});
			tabContents.forEach(c => c.classList.remove('active', 'has-active-filters'));

			// ativar botão clicado
			btn.classList.add('active', 'border-purple-500', 'text-purple-600');
			btn.classList.remove('text-gray-500');

			// mostrar content correspondente
			const tabName = btn.id.replace(/^tab-/, '');
			const targetId = `${tabName}-content`;
			const target = document.getElementById(targetId);
			if (target) target.classList.add('active');

			// mostrar filtros correspondentes
			Object.values(filtersMap).forEach(fid => {
				const fe = document.getElementById(fid);
				if (fe) fe.style.display = 'none';
			});
			const fk = filtersMap[tabName];
			if (fk) {
				const fe = document.getElementById(fk);
				if (fe) fe.style.display = 'block';
			}

			// retornar chave para loader
			if (tabName === 'students') return 'students';
			if (tabName === 'submissions') return 'submissions';
			if (tabName === 'missions') return 'missions';
			if (tabName === 'pending') return 'pending';
			return null;
		};

		// Listener de clique: garantir ativação e então chamar loader
		tabButtons.forEach(btn => {
			btn.addEventListener('click', (e) => {
				const key = ensureTabActivated(btn);
				// dar pequeno delay para permitir repaint/transition e então chamar loader
				setTimeout(() => {
					if (key) callLoader(key);
				}, 40);
			}, { passive: true });
		});

		// MutationObserver: observa mudanças de classe em tab-contents (se outro script manipular)
		if (tabContents && tabContents.length) {
			const observer = new MutationObserver(mutations => {
				for (const m of mutations) {
					if (m.type === 'attributes' && m.attributeName === 'class') {
						const el = m.target;
						if (el.classList && el.classList.contains('active')) {
							const key = keyFromContent(el);
							if (key) callLoader(key);
						}
					}
				}
			});
			tabContents.forEach(tc => observer.observe(tc, { attributes: true, attributeFilter: ['class'] }));
		}

		// inicial: disparar loader para aba já ativa IMEDIATAMENTE
		const active = document.querySelector('.tab-content.active') ||
			Array.from(document.querySelectorAll('.tab-content')).find(el => el.offsetParent !== null);
		const key = keyFromContent(active);
		if (key) {
			callLoader(key);
		}

	} catch (e) {
		console.warn('attachTabLoaders falhou:', e);
	}
}

// Mostrar placeholder de loading para a aba ativa
function showLoadingForTab(key) {
	try {
		if (key === 'students') {
			const c = document.getElementById('students-list');
			if (c) c.innerHTML = '<p class="text-gray-500 py-4">Carregando alunos...</p>';
		} else if (key === 'submissions') {
			const c = document.getElementById('submissions-list');
			if (c) c.innerHTML = '<p class="text-gray-500 py-4">Carregando submissões...</p>';
		} else if (key === 'missions') {
			const c = document.getElementById('missions-list');
			if (c) c.innerHTML = '<p class="text-gray-500 py-4">Carregando missões...</p>';
		} else if (key === 'pending') {
			const c = document.getElementById('pending-users');
			if (c) c.innerHTML = '<p class="text-gray-500 py-4">Carregando pendentes...</p>';
		}
	} catch (e) {
		console.warn('showLoadingForTab falhou:', e);
	}
}

// ====== INICIALIZAÇÃO ======
document.addEventListener('DOMContentLoaded', async () => {
	if (!validateAuthentication()) return;

	// Configurar UI (NÃO chamar setupTabs - usar apenas attachTabLoaders)
	setupLogout();
	setupAllButtonEvents();

	// Expor apiRequest e Toast globalmente antes de carregar dados
	window.apiRequest = apiRequest;
	window.Toast = Toast;

	// Inicializar módulos (cada módulo implementa sua própria lógica)
	try {
		await Pendentes.setupTurmas?.();        // configura turmas / modal / listeners / carrega cache de turmas
	} catch (e) {
		console.warn('Erro ao setup de turmas:', e);
	}

	// Setup de filtros
	Alunos.setupStudentFilters?.();      // conectar filtros de alunos

	// Inicializar módulo de missões com nova função
	try {
		await Missoes.initMissoes?.();
	} catch (e) {
		console.warn('Erro na inicialização do módulo de missões:', e);
		// Fallback para métodos antigos
		Missoes.setupMissionCreation?.();    // configura formulário de criação/edição de missões
		Missoes.setupMissionFilters?.();
		Missoes.setupSubmissionFilters?.();
	}

	// garantir que clique nas abas acione carregamento dos módulos
	// IMPORTANTE: attachTabLoaders substitui setupTabs() e gerencia tudo
	attachTabLoaders();

	// Expor apenas o que é necessário globalmente para compatibilidade com handlers de UI
	window.loadPendingUsers = Pendentes.loadPendingUsers;
	window.loadApprovedStudents = Alunos.loadApprovedStudents;
	window.loadMissions = Missoes.loadMissions;
	window.loadSubmissions = Missoes.loadSubmissions;
	window.editMission = Missoes.editMission;
	window.missionAction = Missoes.missionAction;
	window.cancelEdit = Missoes.cancelEdit;
	window.openFileSecurely = Missoes.openFileSecurely;
	window.openFileWithPreview = Missoes.openFileWithPreview;
	window.downloadFileSecurely = Missoes.downloadFileSecurely;
	window.renderTurmas = Pendentes.renderTurmas;
	window.showPenaltyRewardModal = showPenaltyRewardModal;
	window.showStudentHistoryModal = showStudentHistoryModal;

	// Inicializar sistema de bug report
	console.log('[MASTER] Inicializando bug report system...');
	initBugReportSystem();

	// Inicializar theme toggle
	console.log('[MASTER] Inicializando theme toggle...');
	initThemeToggle();

	// Debug: testar se o botão existe após carregamento
	setTimeout(() => {
		const testBtn = document.getElementById('bug-report-btn');
		console.log('[MASTER] Botão de bug report após timeout:', testBtn);
		if (testBtn) {
			console.log('[MASTER] Adicionando listener de teste...');
			testBtn.addEventListener('click', () => {
				console.log('[MASTER] CLICK DETECTADO NO TESTE!');
			});
		}
	}, 1000);
});

// ====================================
// SISTEMA DE BUG REPORT
// ====================================

function initBugReportSystem() {
	console.log('[BUG REPORT] Inicializando sistema...');

	const bugReportBtn = document.getElementById('bug-report-btn');
	const bugReportModal = document.getElementById('bug-report-modal');
	const closeBugModal = document.getElementById('close-bug-modal');
	const cancelBugReport = document.getElementById('cancel-bug-report');
	const bugReportForm = document.getElementById('bug-report-form');

	console.log('[BUG REPORT] Elementos:', {
		btn: !!bugReportBtn,
		modal: !!bugReportModal,
		close: !!closeBugModal,
		cancel: !!cancelBugReport,
		form: !!bugReportForm
	});

	if (!bugReportBtn || !bugReportModal) {
		console.error('[BUG REPORT] Elementos não encontrados!');
		return;
	}

	// Abrir modal
	bugReportBtn.addEventListener('click', () => {
		console.log('[BUG REPORT] Botão clicado!');
		bugReportModal.classList.remove('hidden');
		document.body.style.overflow = 'hidden';
	});

	// Fechar modal
	function closeBugReportModal() {
		bugReportModal.classList.add('hidden');
		document.body.style.overflow = 'auto';
		if (bugReportForm) bugReportForm.reset();
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
		const userName = localStorage.getItem('username') || 'Mestre Desconhecido';
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
		const response = await fetch(`${API_URL}/api/bug-report`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify(bugReportData)
		});

		const result = await response.json();

		console.log('[BUG REPORT] Resposta:', result);

		if (response.ok && result.success) {
			Toast.show('✅ Bug reportado com sucesso! 📧 Email enviado', 'success');

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

// ====================================
// THEME TOGGLE (DARK MODE)
// ====================================

function initThemeToggle() {
	const themeToggle = document.getElementById('theme-toggle');
	const themeIcon = document.getElementById('theme-icon');

	if (!themeToggle || !themeIcon) {
		console.warn('[THEME] Elementos não encontrados');
		return;
	}

	// Carregar tema salvo
	const currentTheme = localStorage.getItem('theme') || 'light';
	applyTheme(currentTheme);

	// Toggle ao clicar
	themeToggle.addEventListener('click', () => {
		const currentTheme = localStorage.getItem('theme') || 'light';
		const newTheme = currentTheme === 'light' ? 'dark' : 'light';
		applyTheme(newTheme);
		localStorage.setItem('theme', newTheme);
	});
}

function applyTheme(theme) {
	const html = document.documentElement;
	const body = document.body;
	const themeIcon = document.getElementById('theme-icon');

	console.log('[THEME] Aplicando tema:', theme);

	if (theme === 'dark') {
		html.classList.add('dark');
		body.classList.add('dark');
		html.setAttribute('data-theme', 'dark');
		if (themeIcon) {
			themeIcon.classList.remove('fa-moon');
			themeIcon.classList.add('fa-sun');
		}
		console.log('[THEME] Dark mode ativado');
	} else {
		html.classList.remove('dark');
		body.classList.remove('dark');
		html.setAttribute('data-theme', 'light');
		if (themeIcon) {
			themeIcon.classList.remove('fa-sun');
			themeIcon.classList.add('fa-moon');
		}
		console.log('[THEME] Light mode ativado');
	}
}
