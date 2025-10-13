import { showError, showSuccess } from '../utils/toast.js';

export let pendingUsersCache = [];

// ================================
// DADOS COM PERSISTÊNCIA E API
// ================================
const STORAGE_KEY = 'master_alunos_data';

function salvarDados() {
  const user = localStorage.getItem('username');
  if (!user) return;

  const dados = {
    alunos: DADOS_MASTER.alunos,
    turmas: DADOS_MASTER.turmas,
    timestamp: Date.now()
  };

  localStorage.setItem(`${STORAGE_KEY}_${user}`, JSON.stringify(dados));
}

function carregarDados() {
  const user = localStorage.getItem('username');
  if (!user) return false;

  const dadosSalvos = localStorage.getItem(`${STORAGE_KEY}_${user}`);
  if (dadosSalvos) {
    try {
      const dados = JSON.parse(dadosSalvos);
      DADOS_MASTER.alunos = dados.alunos || [];
      DADOS_MASTER.turmas = dados.turmas || [];
      return true;
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    }
  }
  return false;
}

// Dados específicos do master (não mais fixos)
const DADOS_MASTER = {
  turmas: [],
  alunos: []
};

// ================================
// FUNÇÕES PRINCIPAIS
// ================================
export function getTurmas() {
  return DADOS_MASTER.turmas;
}

export function getUsersForTurma(turma) {
  return DADOS_MASTER.alunos.filter(a => a.turma === turma);
}

// Função para carregar turmas da API
async function loadTurmasFromAPI() {
  try {
    const response = await window.apiRequest('/turmas');
    if (response && response.turmas) {
      DADOS_MASTER.turmas = response.turmas;
      salvarDados();
    }
  } catch (err) {
    console.error('Erro ao carregar turmas da API:', err);
    throw err;
  }
}

// Função para carregar alunos aprovados do master
async function loadAlunosAprovados() {
  try {
    const alunos = await window.apiRequest('/usuarios/approved-students');
    if (Array.isArray(alunos)) {
      DADOS_MASTER.alunos = alunos.map(aluno => ({
        id: aluno.id,
        fullname: aluno.fullname || aluno.username,
        turma: aluno.turma || aluno.assignedTurma || 'Sem turma',
        username: aluno.username,
        class: aluno.class,
        curso: aluno.curso,
        xp: aluno.xp || 0,
        level: aluno.level || 1
      }));
      salvarDados();
    }
  } catch (err) {
    console.error('Erro ao carregar alunos aprovados:', err);
    throw err;
  }
}

export async function setupTurmas() {

  // Tentar carregar turmas da API primeiro
  try {
    await loadTurmasFromAPI();
  } catch (err) {
    console.warn('Erro ao carregar turmas da API:', err);
    // Fallback para dados do localStorage
    const dadosCarregados = carregarDados();
    if (dadosCarregados) {
    } else {
    }
  }

  // Carregar alunos aprovados
  try {
    await loadAlunosAprovados();
  } catch (err) {
    console.warn('Erro ao carregar alunos aprovados:', err);
  }

  // Garantir que window.originalStudents existe
  window.originalStudents = [...DADOS_MASTER.alunos];

  // Expor funções globalmente para acesso por outros módulos
  window.Pendentes = {
    getTurmas,
    getUsersForTurma,
    renderTurmas: () => renderTurmas(),
    addTurma: async (nome) => {
      if (nome && !DADOS_MASTER.turmas.includes(nome)) {
        try {
          // Adicionar via API
          await window.apiRequest('/turmas', {
            method: 'POST',
            body: JSON.stringify({ nome })
          });
          DADOS_MASTER.turmas.push(nome);
          salvarDados();
          renderTurmas();
          // Disparar evento para notificar outros módulos
          window.dispatchEvent(new CustomEvent('turmasUpdated', {
            detail: { turmas: DADOS_MASTER.turmas, action: 'add', turma: nome }
          }));
          return true;
        } catch (err) {
          console.error('Erro ao adicionar turma via API:', err);
          return false;
        }
      }
      return false;
    }
  };

  // Renderizar
  setTimeout(() => renderTurmas(), 100);

  // Form handler
  const form = document.getElementById('form-criar-turma');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const input = document.getElementById('nome-turma');
      if (input?.value.trim()) {
        const novaTurma = input.value.trim();
        try {
          // Adicionar via API
          await window.apiRequest('/turmas', {
            method: 'POST',
            body: JSON.stringify({ nome: novaTurma })
          });
          DADOS_MASTER.turmas.push(novaTurma);
          input.value = '';
          salvarDados();
          renderTurmas();
          showSuccess('Turma criada!');

          // Disparar evento para notificar outros módulos
          window.dispatchEvent(new CustomEvent('turmasUpdated', {
            detail: { turmas: DADOS_MASTER.turmas, action: 'add', turma: novaTurma }
          }));
        } catch (err) {
          console.error('Erro ao criar turma:', err);
          showError('Erro ao criar turma: ' + (err.message || err));
        }
      }
    };
  }
}

export function renderTurmas() {
  const lista = document.getElementById('lista-turmas');
  if (!lista) return;

  // Contar alunos por turma
  const contador = {};
  DADOS_MASTER.alunos.forEach(a => {
    contador[a.turma] = (contador[a.turma] || 0) + 1;
  });


  const cards = DADOS_MASTER.turmas.map(turma => {
    const count = contador[turma] || 0;
    return `
      <div class="turma-card bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg" data-turma="${turma}">
        <h3 class="font-bold text-lg">${turma}</h3>
        <p class="text-gray-600">${count} aluno${count !== 1 ? 's' : ''}</p>
      </div>
    `;
  }).join('');

  lista.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${cards}</div>`;

  // Adicionar event listeners APÓS inserir o HTML
  setTimeout(() => {
    lista.querySelectorAll('.turma-card').forEach(card => {
      card.onclick = (e) => {
        e.preventDefault();
        const turma = card.dataset.turma;
        openTurmaModal(turma);
      };
    });
  }, 10);
}

export function openTurmaModal(turma) {

  const modal = document.getElementById('turma-modal');
  const title = document.getElementById('turma-modal-title');
  const list = document.getElementById('turma-modal-list');

  if (!modal || !title || !list) {
    return;
  }

  const alunos = DADOS_MASTER.alunos.filter(a => a.turma === turma);

  title.innerHTML = `<i class="fas fa-users text-purple-600"></i><span class="font-extrabold text-white text-lg">${turma}</span>`;

  if (alunos.length === 0) {
    list.innerHTML = '<div class="p-4 text-gray-500">Nenhum aluno</div>';
  } else {
    list.innerHTML = alunos.map(a => `
      <li class="py-3 border-b border-gray-100 flex items-center gap-3">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-base border-2 border-white shadow-md">
            ${a.fullname.charAt(0)}
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-medium text-gray-800">${a.fullname}</div>
            <div class="text-xs text-gray-500">ID: ${a.id} | ${a.class || 'Sem classe'}</div>
          </div>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <button class="trocar-btn bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg flex items-center gap-2 transition font-medium" data-user-id="${a.id}" data-turma="${turma}">
            <i class="fas fa-exchange-alt"></i>
            <span class="hidden sm:inline">Trocar</span>
          </button>
        </div>
      </li>
    `).join('');

    // Event listeners para botões de troca
    setTimeout(() => {
      list.querySelectorAll('.trocar-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const userId = btn.dataset.userId;
          const turmaAtual = btn.dataset.turma;
          trocarAlunoModal(userId, turmaAtual);
        };
      });
    }, 10);
  }

  modal.classList.remove('hidden');

  // Event listeners para fechar modal
  setupModalEvents(modal);
}

function setupModalEvents(modal) {
  // Event handler para ESC (definir antes de usar)
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.classList.add('hidden');
      document.removeEventListener('keydown', handleEscape);
    }
  };

  // Limpar eventos anteriores
  modal.onclick = null;

  // Fechar com ESC
  document.addEventListener('keydown', handleEscape);

  // Fechar clicando no backdrop
  modal.onclick = (e) => {
    if (e.target.id === 'turma-modal-backdrop' || e.target === modal) {
      modal.classList.add('hidden');
      document.removeEventListener('keydown', handleEscape);
    }
  };

  // Botões de fechar
  const closeBtn = modal.querySelector('#turma-modal-close');
  const closeBtnFooter = modal.querySelector('#turma-modal-close-btn');

  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.preventDefault();
      modal.classList.add('hidden');
      document.removeEventListener('keydown', handleEscape);
    };
  }

  if (closeBtnFooter) {
    closeBtnFooter.onclick = (e) => {
      e.preventDefault();
      modal.classList.add('hidden');
      document.removeEventListener('keydown', handleEscape);
    };
  }
}

function trocarAlunoModal(userId, turmaAtual) {
  // Usar dados dinâmicos do master ao invés de DADOS_FIXOS
  const novasTurmas = DADOS_MASTER.turmas.filter(t => t !== turmaAtual);
  const aluno = DADOS_MASTER.alunos.find(a => a.id == userId);

  if (!aluno || novasTurmas.length === 0) {
    showError('Não há outras turmas disponíveis');
    return;
  }

  const modalHtml = `
    <div id="modal-trocar-turma" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-xl w-96 shadow-2xl">
        <h3 class="font-bold text-lg mb-4">Trocar ${aluno.fullname} de turma</h3>
        <p class="mb-2">De: <strong>${turmaAtual}</strong></p>
        <select id="nova-turma-select" class="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500">
          <option value="">Selecione nova turma</option>
          ${novasTurmas.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
        <div class="flex gap-3">
          <button id="confirmar-troca" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition">
            Confirmar
          </button>
          <button id="cancelar-troca" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `;

  // Remover modal anterior se existir
  const existingModal = document.getElementById('modal-trocar-turma');
  if (existingModal) existingModal.remove();

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById('modal-trocar-turma');
  const select = document.getElementById('nova-turma-select');
  const confirmarBtn = document.getElementById('confirmar-troca');
  const cancelarBtn = document.getElementById('cancelar-troca');

  confirmarBtn.onclick = async () => {
    const novaTurma = select.value;
    if (!novaTurma) {
      showError('Selecione uma turma');
      select.focus();
      return;
    }

    try {
      // ✅ USAR API PARA TROCAR TURMA

      // Desabilitar botão durante a requisição
      confirmarBtn.disabled = true;
      confirmarBtn.textContent = 'Transferindo...';

      await window.apiRequest(`/usuarios/${userId}/change-turma`, {
        method: 'POST',
        body: JSON.stringify({ novaTurma })
      });

      showSuccess(`${aluno.fullname} transferido para ${novaTurma}`);

      // Fechar modais
      modal.remove();
      document.getElementById('turma-modal').classList.add('hidden');

      // Recarregar dados atualizados da API
      await loadAlunosAprovados();
      renderTurmas();

      // Abrir modal da nova turma após um delay
      setTimeout(() => openTurmaModal(novaTurma), 500);


    } catch (err) {
      console.error('Erro ao trocar aluno de turma:', err);
      showError('Erro ao trocar aluno de turma: ' + (err.message || err));

      // Reabilitar botão em caso de erro
      confirmarBtn.disabled = false;
      confirmarBtn.textContent = 'Confirmar';
    }
  };

  cancelarBtn.onclick = () => modal.remove();

  // Fechar clicando fora
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  // Focus no select
  setTimeout(() => select.focus(), 100);
}

export function hideTurmaModal() {
  const modal = document.getElementById('turma-modal');
  if (modal) {
    modal.classList.add('hidden');
    // Remover todos os event listeners de ESC
    document.removeEventListener('keydown', handleModalEscape);
  }
}

// Event handler global para ESC (definir fora das funções)
function handleModalEscape(e) {
  if (e.key === 'Escape') {
    hideTurmaModal();
  }
}


export async function loadPendingUsers() {
  try {

    // Verificar se apiRequest está disponível
    if (!window.apiRequest) {
      console.error('❌ [FRONTEND] window.apiRequest não está disponível');
      throw new Error('API request function not available');
    }

    const users = await window.apiRequest('/usuarios/pending-users');


    pendingUsersCache = Array.isArray(users) ? users : [];

    renderPendingUsers(pendingUsersCache);
  } catch (err) {
    console.error('❌ [FRONTEND] Erro ao carregar usuários pendentes:', err);
    console.error('Stack trace:', err.stack);
    pendingUsersCache = [];
    renderPendingUsers([]);
  }
  renderTurmas();
}

export function renderPendingUsers(users) {
  const container = document.getElementById('pending-users');
  if (!container) return;

  if (!users || users.length === 0) {
    container.innerHTML = '<div class="text-center py-6 text-gray-500">Nenhum usuário pendente para sua área</div>';
    return;
  }

  const cards = users.map(user => `
    <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition border-l-4 border-yellow-400">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold">
            ${(user.fullname || user.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 class="font-semibold text-gray-800">${user.fullname || user.username}</h4>
            <p class="text-sm text-gray-500">@${user.username}</p>
          </div>
        </div>
        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pendente</span>
      </div>
      
      <div class="space-y-1 mb-4">
        <p class="text-sm"><span class="font-medium">Curso:</span> ${user.curso || 'Não informado'}</p>
        <p class="text-sm"><span class="font-medium">Classe:</span> ${user.class || 'Não informada'}</p>
        ${user.email ? `<p class="text-sm"><span class="font-medium">Email:</span> ${user.email}</p>` : ''}
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Atribuir à turma:</label>
        <select class="assign-turma-select w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" data-user-id="${user.id}">
          <option value="">Selecione uma turma</option>
          ${DADOS_MASTER.turmas.map(turma => `<option value="${turma}">${turma}</option>`).join('')}
        </select>
        
        <div class="flex gap-2 mt-3">
          <button class="approve-btn flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition" 
                  data-user-id="${user.id}">
            <i class="fas fa-check mr-2"></i>Aprovar
          </button>
          <button class="reject-btn bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition" 
                  data-user-id="${user.id}">
            <i class="fas fa-times mr-2"></i>Rejeitar
          </button>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = cards;

  // Adicionar event listeners
  setTimeout(() => {
    container.querySelectorAll('.approve-btn').forEach(btn => {
      btn.onclick = async () => {
        const userId = btn.dataset.userId;
        const select = container.querySelector(`select[data-user-id="${userId}"]`);
        const turma = select?.value;

        // Validação robusta: verificar se turma foi selecionada e é válida
        if (!turma || turma.trim() === '' || turma === 'Selecione uma turma') {
          showError('Por favor, selecione uma turma antes de aprovar o usuário.');
          // Destacar o select para chamar atenção
          if (select) {
            select.style.borderColor = '#ef4444';
            select.focus();
            setTimeout(() => {
              select.style.borderColor = '';
            }, 3000);
          }
          return;
        }

        await approveUser(userId, turma);
      };
    });

    container.querySelectorAll('.reject-btn').forEach(btn => {
      btn.onclick = async () => {
        const userId = btn.dataset.userId;
        await rejectUser(userId);
      };
    });
  }, 10);
}

export function getPendingUsersForMaster() { return pendingUsersCache; }

export async function approveUser(userId, turma) {
  try {


    console.log('✅ Aprovando usuário:', userId, 'para turma:', turma);
    await window.apiRequest(`/usuarios/${userId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ turma })
    });

    showSuccess(`Usuário aprovado com sucesso e atribuído à turma "${turma}"!`);

    // Recarregar dados
    await loadPendingUsers();
    await loadAlunosAprovados();
    renderTurmas();
  } catch (err) {
    console.error('Erro ao aprovar usuário:', err);
    showError('Erro ao aprovar usuário: ' + (err.message || err));
  }
}

export async function rejectUser(userId) {
  if (!confirm('Tem certeza que deseja rejeitar este usuário?')) {
    return;
  }

  try {
    console.log('❌ Rejeitando usuário:', userId);
    await window.apiRequest(`/usuarios/${userId}/reject`, {
      method: 'POST'
    });

    showSuccess('Usuário rejeitado');

    // Recarregar dados
    await loadPendingUsers();
  } catch (err) {
    console.error('Erro ao rejeitar usuário:', err);
    showError('Erro ao rejeitar usuário: ' + (err.message || err));
  }
}
export function addTurma() { }
export const renderPendingUsersSpecifique = renderPendingUsers;

// ================================
// AUTO-INIT COM PERSISTÊNCIA
// ================================
setTimeout(() => {
  if (localStorage.getItem('username') === 'tecno') {
    setupTurmas();
  }
}, 500);

// DEBUG MELHORADO
if (typeof window !== 'undefined') {
  window.debugTurmas = () => {
    console.log('=== DEBUG TURMAS ===');
    console.log('Turmas:', DADOS_FIXOS.turmas);
    console.log('Alunos:', DADOS_FIXOS.alunos);
    console.log('localStorage:', localStorage.getItem(`${STORAGE_KEY}_${localStorage.getItem('username')}`));
    renderTurmas();
  };

  window.forcarSalvar = () => {
    salvarDados();
    console.log('💾 Dados salvos manualmente');
  };

  window.limparDados = () => {
    const user = localStorage.getItem('username');
    localStorage.removeItem(`${STORAGE_KEY}_${user}`);
    console.log('🗑️ Dados limpos - recarregue a página');
  };
}