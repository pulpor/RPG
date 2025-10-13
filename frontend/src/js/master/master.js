// Orquestrador mínimo do painel master

// Importar módulos utilitários 
import { validateAuthentication, apiRequest } from '../utils/auth.js';
import { setupLogout } from '../utils/interface.js';
import { showPenaltyRewardModal, showStudentHistoryModal } from '../utils/modals.js';
import { setupAllButtonEvents } from '../utils/buttons.js';

// módulos especializados (devem conter toda a lógica específica)
import * as Pendentes from './pendentes.js';
import * as Alunos from './alunos.js';
import * as Missoes from './missoes.js';

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

	// Expor apiRequest globalmente antes de carregar dados
	window.apiRequest = apiRequest;

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
});
