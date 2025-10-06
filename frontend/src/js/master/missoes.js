import { apiRequest } from '../utils/auth.js';
import { showError, showSuccess } from '../utils/toast.js';

export let originalMissions = [];
export let originalSubmissions = [];

// Função para verificar se há filtros ativos
export function checkActiveFilters(type) {
  if (type === 'submission') {
    const statusFilter = document.getElementById('filter-submission-status')?.value;
    const turmaFilter = document.getElementById('filter-submission-turma')?.value;
    const classFilter = document.getElementById('filter-submission-class')?.value;
    const studentFilter = document.getElementById('filter-submission-student')?.value;
    const missionFilter = document.getElementById('filter-submission-mission')?.value;
    return statusFilter !== 'all' || turmaFilter !== 'all' || classFilter !== 'all' ||
      (studentFilter && studentFilter.trim() !== '') || (missionFilter && missionFilter.trim() !== '');
  }
  if (type === 'mission') {
    const turmaFilter = document.getElementById('filter-mission-turma')?.value;
    const classFilter = document.getElementById('filter-mission-class')?.value;
    const xpFilter = document.getElementById('filter-mission-xp')?.value;
    return turmaFilter !== 'all' || classFilter !== 'all' || (xpFilter && xpFilter !== '');
  }
  return false;
}

// Abrir arquivo de forma segura (fallbacks)
export function openFileSecurely(fileUrl) {
  try {
    const newWindow = window.open(fileUrl, '_blank', 'noopener,noreferrer');
    if (newWindow) {
    } else {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Erro ao abrir arquivo:', error);
    showError('Erro ao abrir arquivo: ' + (error.message || error));
  }
}

export async function loadSubmissions() {
  try {
    const container = document.getElementById('submissions-list');
    if (container) container.innerHTML = '<p class="text-gray-500 py-4">Carregando submissões...</p>';

    const data = await apiRequest('/submissoes');
    originalSubmissions = data || [];

    const hasActiveFilters = checkActiveFilters('submission');
    if (hasActiveFilters) {
      applySubmissionFilters();
    } else {
      renderSubmissions(originalSubmissions);
    }
  } catch (err) {
    console.error('Erro ao carregar submissões:', err);
    const container = document.getElementById('submissions-list');
    if (container) container.innerHTML = `<p class="text-red-500 py-4">Erro: ${err.message || err}</p>`;
    showError(err.message || err);
  }
}

export async function loadMissions() {
  try {
    const container = document.getElementById('missions-list');
    if (container) container.innerHTML = '<p class="text-gray-500 py-4">Carregando missões...</p>';

    const data = await apiRequest('/missoes');
    originalMissions = data || [];

    const hasActiveFilters = checkActiveFilters('mission');
    if (hasActiveFilters) {
      applyMissionFilters();
    } else {
      renderMissions(originalMissions);
    }
  } catch (err) {
    console.error('Erro ao carregar missões:', err);
    const container = document.getElementById('missions-list');
    if (container) container.innerHTML = `<p class="text-red-500 py-4">Erro: ${err.message || err}</p>`;
    showError(err.message || err);
  }
}

export function renderSubmissions(submissions) {
  const container = document.getElementById('submissions-list');
  if (!container) return;

  if (!submissions || submissions.length === 0) {
    container.innerHTML = '<p class="text-gray-500 py-4">Nenhuma submissão encontrada.</p>';
    return;
  }

  const sortedSubmissions = submissions.sort((a, b) => {
    const dateA = new Date(a.submittedAt || 0);
    const dateB = new Date(b.submittedAt || 0);
    return dateB - dateA;
  });

  container.innerHTML = sortedSubmissions.map(submission => createSubmissionCard(submission)).join('');

  // Conectar eventos de ação (aprovar/rejeitar) — uso de delegation simples
  container.querySelectorAll('.approve-submission-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.submissionId;
      try {
        if (window.apiRequest) {
          await apiRequest(`/submissoes/${id}/aprovar`, { method: 'PUT' });
          showSuccess('Submissão aprovada');
        } else {
          showSuccess('Submissão aprovada (simulado)');
        }
      } catch (err) {
        console.error('Erro ao aprovar submissão:', err);
        showError('Erro ao aprovar submissão: ' + (err.message || err));
      } finally {
        await loadSubmissions();
      }
    };
  });

  container.querySelectorAll('.reject-submission-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.submissionId;
      try {
        if (window.apiRequest) {
          await apiRequest(`/submissoes/${id}/rejeitar`, { method: 'PUT' });
          showSuccess('Submissão rejeitada');
        } else {
          showSuccess('Submissão rejeitada (simulado)');
        }
      } catch (err) {
        console.error('Erro ao rejeitar submissão:', err);
        showError('Erro ao rejeitar submissão: ' + (err.message || err));
      } finally {
        await loadSubmissions();
      }
    };
  });
}

// Função para criar card de submissão
function createSubmissionCard(submission) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const statusText = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado'
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Data não informada';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  return `
    <div class="card bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <h3 class="font-bold mb-2">${submission.missionTitle || 'Missão não informada'}</h3>
      <p class="text-gray-600 mb-2">${submission.description || 'Sem descrição'}</p>
      <p class="text-sm text-gray-500 mb-2">Aluno: ${submission.studentName || 'Não informado'}</p>
      <p class="text-sm text-gray-500 mb-2">Enviado em: ${formatDate(submission.submittedAt)}</p>
      
      <div class="mb-3">
        <span class="inline-block ${statusColors[submission.status] || statusColors.pending} text-xs px-2 py-1 rounded">
          ${statusText[submission.status] || 'Pendente'}
        </span>
      </div>

      ${submission.fileUrl ? `
        <div class="mb-3">
          <button onclick="openFileSecurely('${submission.fileUrl}')" 
                  class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
            <i class="fas fa-download mr-1"></i>Ver Arquivo
          </button>
        </div>
      ` : ''}

      ${submission.status === 'pending' ? `
        <div class="flex gap-2">
          <button class="approve-submission-btn bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  data-submission-id="${submission.id}">
            <i class="fas fa-check mr-1"></i>Aprovar
          </button>
          <button class="reject-submission-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  data-submission-id="${submission.id}">
            <i class="fas fa-times mr-1"></i>Rejeitar
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderMissions(missions) {
  const container = document.getElementById('missions-list');
  if (!container) return;

  if (!missions || missions.length === 0) {
    container.innerHTML = '<p class="text-gray-500 py-4">Nenhuma missão encontrada.</p>';
    return;
  }

  container.innerHTML = missions.map(mission => createMissionCard(mission)).join('');

  // ligar botões Editar / Deletar
  container.querySelectorAll('.edit-mission-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.missionId;
      // chamar exportado editMission
      try { editMission(id); } catch (e) { console.warn('editMission não disponível:', e); }
    };
  });

  container.querySelectorAll('.delete-mission-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.missionId;
      if (!confirm('Deletar missão?')) return;
      try {
        if (window.apiRequest) {
          await apiRequest(`/missoes/${id}`, { method: 'DELETE' });
          showSuccess('Missão deletada');
        } else {
          showSuccess('Missão deletada (simulado)');
        }
      } catch (err) {
        console.error('Erro ao deletar missão:', err);
        showError('Erro ao deletar missão: ' + (err.message || err));
      } finally {
        await loadMissions();
      }
    };
  });
}

// Função para criar card de missão
function createMissionCard(mission) {
  const difficultyColors = {
    facil: 'bg-green-100 text-green-800',
    medio: 'bg-yellow-100 text-yellow-800',
    dificil: 'bg-red-100 text-red-800'
  };

  const difficultyText = {
    facil: 'Fácil',
    medio: 'Médio',
    dificil: 'Difícil'
  };

  // Determinar dificuldade baseado no XP
  let difficulty = 'facil';
  if (mission.xp >= 100) difficulty = 'dificil';
  else if (mission.xp >= 50) difficulty = 'medio';

  const formatClass = (targetClass) => {
    if (!targetClass || targetClass === 'geral') return 'Geral';
    return targetClass;
  };

  const formatTurma = (turma) => {
    if (!turma || turma === '' || turma === null || turma === undefined) {
      return 'Todas as turmas';
    }
    return turma;
  };

  return `
    <div class="card bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <h3 class="font-bold mb-2">${mission.titulo || mission.title || 'Missão sem título'}</h3>
      <p class="text-gray-600 mb-3">${mission.descricao || mission.description || 'Sem descrição'}</p>
      
      <div class="mb-3 flex flex-wrap gap-2">
        <span class="inline-block ${difficultyColors[difficulty]} text-xs px-2 py-1 rounded">
          ${difficultyText[difficulty]}
        </span>
        <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          ${mission.xp || 0} XP
        </span>
        <span class="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
          ${formatClass(mission.targetClass)}
        </span>
        <span class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
          ${formatTurma(mission.turma)}
        </span>
      </div>

      <div class="flex gap-2">
        <button class="edit-mission-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                data-mission-id="${mission.id}">
          <i class="fas fa-edit mr-1"></i>Editar
        </button>
        <button class="delete-mission-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                data-mission-id="${mission.id}">
          <i class="fas fa-trash mr-1"></i>Excluir
        </button>
      </div>
    </div>
  `;
}

// ====== AÇÕES / FILTROS / CRIAÇÃO DE MISSÕES (CONSOLIDADAS) ======

// ação genérica em missões
export async function missionAction(missionId, action, successMessage) {
  try {
    if (action === 'DELETE') {
      await apiRequest(`/missoes/${missionId}`, { method: 'DELETE' });
      showSuccess(successMessage);
      loadMissions();
    } else {
      showError('Ação não reconhecida');
    }
  } catch (err) {
    console.error('Erro na ação da missão:', err);
    showError(`Erro: ${err.message}`);
  }
}

// filtros de submissões
export function applySubmissionFilters() {
  const statusFilter = document.getElementById('filter-submission-status')?.value || 'all';
  const missionFilter = document.getElementById('filter-submission-mission')?.value?.trim() || '';
  const turmaFilter = document.getElementById('filter-submission-turma')?.value || 'all';
  const classFilter = document.getElementById('filter-submission-class')?.value || 'all';
  const studentFilter = document.getElementById('filter-submission-student')?.value?.trim().toLowerCase() || '';

  let filtered = originalSubmissions || [];

  if (statusFilter !== 'all') filtered = filtered.filter(s => s.status === statusFilter);

  if (missionFilter) {
    filtered = filtered.filter(s => {
      const missionTitle = (s.missionTitle || '').toLowerCase();
      return missionTitle.includes(missionFilter.toLowerCase());
    });
  }

  if (turmaFilter !== 'all') filtered = filtered.filter(s => s.studentTurma === turmaFilter);
  if (classFilter !== 'all') filtered = filtered.filter(s => s.studentClass === classFilter);

  if (studentFilter) {
    filtered = filtered.filter(s => {
      const studentName = (s.studentUsername || s.studentName || '').toLowerCase();
      return studentName.includes(studentFilter);
    });
  }

  renderSubmissions(filtered);
}

// filtros de missões (usa turma + classe + xp)
export function applyMissionFilters() {
  const turmaFilter = document.getElementById('filter-mission-turma')?.value || 'all';
  const classFilter = document.getElementById('filter-mission-class')?.value || 'all';
  const xpFilter = document.getElementById('filter-mission-xp')?.value || '';

  let filtered = originalMissions || [];

  if (turmaFilter !== 'all') {
    filtered = filtered.filter(m => String(m.turmaId || m.turma || m.turmaName || m.classroom || '') == String(turmaFilter));
  }

  if (classFilter !== 'all') {
    filtered = filtered.filter(m => String(m.targetClass || 'geral') == classFilter);
  }

  if (xpFilter) {
    if (xpFilter === '0-49') {
      filtered = filtered.filter(m => (m.xp || 0) >= 0 && (m.xp || 0) < 50);
    } else if (xpFilter === '50-99') {
      filtered = filtered.filter(m => (m.xp || 0) >= 50 && (m.xp || 0) < 100);
    } else if (xpFilter === '100+') {
      filtered = filtered.filter(m => (m.xp || 0) >= 100);
    }
  }

  renderMissions(filtered);
}

export function setupMissionFilters() {
  const turmaFilter = document.getElementById('filter-mission-turma');
  const classFilter = document.getElementById('filter-mission-class');
  const xpFilter = document.getElementById('filter-mission-xp');
  const applyBtn = document.getElementById('apply-mission-filters');

  if (turmaFilter) turmaFilter.addEventListener('change', applyMissionFilters);
  if (classFilter) classFilter.addEventListener('change', applyMissionFilters);
  if (xpFilter) xpFilter.addEventListener('change', applyMissionFilters);
  if (applyBtn) applyBtn.addEventListener('click', applyMissionFilters);
}

export function setupSubmissionFilters() {
  const statusFilter = document.getElementById('filter-submission-status');
  const missionFilter = document.getElementById('filter-submission-mission');
  const turmaFilter = document.getElementById('filter-submission-turma');
  const classFilter = document.getElementById('filter-submission-class');
  const studentFilter = document.getElementById('filter-submission-student');
  const applyBtn = document.getElementById('apply-submission-filters');

  [statusFilter, missionFilter, turmaFilter, classFilter].forEach(filter => {
    if (filter) filter.addEventListener('change', applySubmissionFilters);
  });

  // Adicionar evento ao campo de texto do aluno ao pressionar Enter
  if (studentFilter) {
    studentFilter.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applySubmissionFilters();
      }
    });
  }

  if (applyBtn) applyBtn.addEventListener('click', applySubmissionFilters);
}

export function setupMissionCreation() {
  const createBtn = document.getElementById('create-mission-btn');
  if (createBtn) {
    createBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await handleMissionSubmit();
    });
  }
}

// Função para editar missão - popula o formulário com os dados da missão
export function editMission(missionId) {
  try {
    const mission = originalMissions.find(m => m.id == missionId);
    if (!mission) {
      showError('Missão não encontrada');
      return;
    }

    // Popular campos do formulário
    const titleEl = document.getElementById('mission-title');
    const descriptionEl = document.getElementById('mission-description');
    const xpEl = document.getElementById('mission-xp');
    const turmaEl = document.getElementById('mission-turma');
    const classEl = document.getElementById('mission-class');

    if (titleEl) titleEl.value = mission.titulo || mission.title || '';
    if (descriptionEl) descriptionEl.value = mission.descricao || mission.description || '';
    if (xpEl) xpEl.value = mission.xp || '';
    if (turmaEl) turmaEl.value = mission.turma || '';
    if (classEl) classEl.value = mission.targetClass || 'geral';

    // Alterar botão para modo edição
    const createBtn = document.getElementById('create-mission-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    if (createBtn) {
      createBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Alterações';
      createBtn.className = 'flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition font-medium';
      createBtn.dataset.editingId = missionId;
    }

    if (cancelBtn) {
      cancelBtn.style.display = 'block';
    }

    // Scroll para o formulário
    const formSection = document.querySelector('#missions-content .bg-white.p-6');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showSuccess('Missão carregada para edição');
  } catch (err) {
    console.error('Erro ao editar missão:', err);
    showError('Erro ao carregar missão para edição');
  }
}

// único handle de submissão (criação/edição)
async function handleMissionSubmit() {
  try {
    const titleEl = document.getElementById('mission-title');
    const descriptionEl = document.getElementById('mission-description');
    const xpEl = document.getElementById('mission-xp');
    const turmaEl = document.getElementById('mission-turma');
    const classEl = document.getElementById('mission-class');

    if (!titleEl || !descriptionEl || !xpEl || !turmaEl || !classEl) {
      showError('Formulário de missão não encontrado. Recarregue a página.');
      console.error('Elementos do formulário não encontrados');
      return;
    }

    const title = titleEl.value.trim();
    const description = descriptionEl.value.trim();
    const xpReward = parseInt(xpEl.value);
    const turma = turmaEl.value || null;
    const missionClass = classEl.value;

    const createBtn = document.getElementById('create-mission-btn');
    const isEditing = createBtn && createBtn.dataset.editingId;
    const missionId = isEditing ? parseInt(createBtn.dataset.editingId) : null;

    if (!title) { showError('Título da missão é obrigatório'); return; }
    if (!description) { showError('Descrição da missão é obrigatória'); return; }
    if (!xpReward || xpReward <= 0) { showError('XP da missão deve ser um número positivo'); return; }

    const missionData = {
      titulo: title,
      descricao: description,
      xp: xpReward,
      turma: turma || null,
      targetClass: missionClass || 'geral'
    };

    let response;
    let successMessage;

    if (isEditing) {
      response = await apiRequest(`/missoes/${missionId}`, {
        method: 'PUT',
        body: JSON.stringify(missionData)
      });
      successMessage = 'Missão atualizada com sucesso!';
    } else {
      missionData.status = 'ativa';
      response = await apiRequest('/missoes', {
        method: 'POST',
        body: JSON.stringify(missionData)
      });
      successMessage = 'Missão criada com sucesso!';
    }

    showSuccess(successMessage);
    cancelEdit();
    loadMissions();

  } catch (err) {
    console.error('Erro ao processar missão:', err);
    const action = (document.getElementById('create-mission-btn')?.dataset.editingId) ? 'atualizar' : 'criar';
    showError(`Erro ao ${action} missão: ${err.message}`);
  }
}

// único cancelEdit consolidado
export function cancelEdit() {
  try {
    const titleEl = document.getElementById('mission-title');
    const descriptionEl = document.getElementById('mission-description');
    const xpEl = document.getElementById('mission-xp');
    const turmaEl = document.getElementById('mission-turma');
    const classEl = document.getElementById('mission-class');

    if (titleEl) titleEl.value = '';
    if (descriptionEl) descriptionEl.value = '';
    if (xpEl) xpEl.value = '';
    if (turmaEl) turmaEl.value = '';
    if (classEl) classEl.value = 'geral';

    const createBtn = document.getElementById('create-mission-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');

    if (createBtn) {
      createBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Criar Missão';
      createBtn.className = 'flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition font-medium';
      delete createBtn.dataset.editingId;
    }

    if (cancelBtn) cancelBtn.style.display = 'none';

    showSuccess('Edição cancelada');
  } catch (err) {
    console.error('Erro ao cancelar edição:', err);
    showError('Erro ao cancelar edição');
  }
}

// ====== ÁREAS / CLASSES e POPULADORES ======
// mapa de áreas/classes
export const areasClasses = {
  beleza: { name: "👒 Beleza", classes: { "Estilista das Sombras": {}, "Feiticeira das Unhas": {}, "Encantador de Cores": {}, "Artista das Luzes": {}, "Cortes Fantasma": {}, "Guardiã das Flores": {}, "Alquimista do Perfume": {}, "Mestre do Reflexo": {} } },
  gastronomia: { name: "👨‍🍳 Gastronomia", classes: { "Cozinheiro Arcano": {}, "Alquimista dos Sabores": {}, "Guardiã do Forno": {}, "Mestre das Caldeiradas": {}, "Confeiteiro Místico": {}, "Senhor dos Temperos": {}, "Sommelier Sagrado": {}, "Druida da Nutrição": {} } },
  gestao: { name: "👩‍🎓 Gestão", classes: { "Senhor dos Números": {}, "Administrador da Ordem": {}, "Analista Visionário": {}, "Estrategista de Elite": {}, "Protetor do Equilíbrio": {}, "Mediador das Alianças": {}, "Juiz da Justiça": {}, "Cronista do Progresso": {} } },
  oftalmo: { name: "👁️ Oftalmologia", classes: { "Vidente da Visão": {}, "Guardiã do Olhar": {}, "Caçador de Detalhes": {}, "Mestre da Clareza": {}, "Sentinela Invisível": {}, "Oráculo das Lentes": {}, "Defensor da Retina": {}, "Ilusionista da Percepção": {} } },
  tecnologia: { name: "🖥️ Tecnologia", classes: { "Arqueiro do JavaScript": {}, "Cafeicultor do Java": {}, "Mago do CSS": {}, "Paladino do HTML": {}, "Bárbaro do Back-end": {}, "Domador de Dados": {}, "Elfo do Front-end": {}, "Caçador de Bugs": {} } },
  idiomas: { name: "🌐 Idiomas", classes: { "Orador das Runas": {}, "Tradutor das Sombras": {}, "Bardo Poliglota": {}, "Sábio dos Dialetos": {}, "Emissário Universal": {}, "Guardião da Palavra": {}, "Feiticeiro da Pronúncia": {}, "Lexicógrafo Arcano": {} } }
};

// normalizar várias formas de área
function normalizeAreaKey(raw) {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  if (s.includes('tec') || s.includes('tech') || s.includes('inform') || s.includes('ti')) return 'tecnologia';
  if (s.includes('beleza')) return 'beleza';
  if (s.includes('gastr') || s.includes('cozinh')) return 'gastronomia';
  if (s.includes('gest') || s.includes('admin') || s.includes('management')) return 'gestao';
  if (s.includes('oftal') || s.includes('olho')) return 'oftalmo';
  if (s.includes('idiom') || s.includes('lingu') || s.includes('idiomas')) return 'idiomas';
  return null;
}

// Mapear classes de master para áreas
const masterClassToArea = {
  // Tecnologia
  "Guardião da Lógica": "tecnologia",
  "Mestre Fullstack": "tecnologia",
  // Gastronomia  
  "Grand Maître Cuisinier": "gastronomia",
  // Gestão
  "Chanceler Supremo": "gestao",
  // Oftalmologia
  "Oráculo da Visão": "oftalmo",
  // Beleza
  "Artista Supremo da Forma": "beleza",
  // Idiomas
  "Orador Supremo": "idiomas"
};

// tenta detectar a área do master (dataset, DOM, meta, API)
async function detectMasterArea() {
  try {
    // 1) body dataset
    const bodyArea = document.body?.dataset?.masterArea;
    if (bodyArea) {
      const norm = normalizeAreaKey(bodyArea);
      if (norm) return norm;
    }

    // 2) elemento com id 'master-area' ou classe '.master-area'
    const el = document.getElementById('master-area') || document.querySelector('[data-master-area]') || document.querySelector('.master-area');
    if (el) {
      const v = el.dataset?.masterArea || el.textContent;
      const norm = normalizeAreaKey(v);
      if (norm) return norm;
    }

    // 3) meta tag <meta name="master-area" content="tecnologia">
    const meta = document.querySelector('meta[name="master-area"]');
    if (meta && meta.content) {
      const norm = normalizeAreaKey(meta.content);
      if (norm) return norm;
    }

    // 4) tentar API para obter perfil do master e detectar área pela classe
    // Cache para evitar múltiplas requisições falhas
    if (!detectMasterArea._cache) {
      try {
        // Tentar apenas endpoints que provavelmente existem
        const candidates = ['/usuarios/me', '/perfil'];
        for (const path of candidates) {
          try {
            const res = await apiRequest(path);
            if (!res) continue;

            // Primeiro tentar propriedades diretas de área
            const possibleArea = res.area || res.areaKey || res.areaSlug || res.allowedArea || res.classArea || res.area_name || res.roleArea || res.areaName;
            const norm = normalizeAreaKey(possibleArea);
            if (norm) {
              detectMasterArea._cache = norm;
              return norm;
            }

            // Se não encontrou área direta, tentar detectar pela classe do master
            const masterClass = res.class || res.classe || res.className;
            if (masterClass && masterClassToArea[masterClass]) {
              detectMasterArea._cache = masterClassToArea[masterClass];
              return masterClassToArea[masterClass];
            }
          } catch (e) {
            // ignora e tenta próximo
          }
        }
        detectMasterArea._cache = null; // Marca como tentado
      } catch (e) { /* ignore */ }
    }

    // Retorna do cache se já tentou antes
    return detectMasterArea._cache || null;
  } catch (err) {
    console.warn('detectMasterArea erro:', err);
    return null;
  }
}

// popula select de classes (formulário e filtro) reconstruindo optgroups com base na área detectada
export async function populateMissionClassSelect() {
  try {
    const areaKey = await detectMasterArea();
    const formSelect = document.getElementById('mission-class');
    const filterSelect = document.getElementById('filter-mission-class');

    // util: criar option
    const makeOption = (value, text) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = text;
      return opt;
    };

    // limpar e reconstruir formulário
    if (formSelect) {
      formSelect.innerHTML = '';
      // adicionar 'geral' sempre
      formSelect.appendChild(makeOption('geral', 'Geral (todas as classes)'));

      if (areaKey && areasClasses[areaKey]) {
        // adicionar optgroup com classes da área
        const og = document.createElement('optgroup');
        og.label = areasClasses[areaKey].name || areaKey;
        Object.keys(areasClasses[areaKey].classes).forEach(cn => og.appendChild(makeOption(cn, cn)));
        formSelect.appendChild(og);
      } else {
        // sem área detectada: criar optgroups para todas as áreas (fallback)
        Object.entries(areasClasses).forEach(([k, info]) => {
          const og = document.createElement('optgroup');
          og.label = info.name || k;
          Object.keys(info.classes).forEach(cn => og.appendChild(makeOption(cn, cn)));
          formSelect.appendChild(og);
        });
      }
    }

    // filtrar no select de filtro: permitimos "Todas" + apenas classes da área (ou todas se sem área)
    if (filterSelect) {
      filterSelect.innerHTML = '';
      filterSelect.appendChild(makeOption('all', 'Todas as classes'));
      if (areaKey && areasClasses[areaKey]) {
        Object.keys(areasClasses[areaKey].classes).forEach(cn => filterSelect.appendChild(makeOption(cn, cn)));
      } else {
        Object.values(areasClasses).forEach(info => {
          Object.keys(info.classes).forEach(cn => filterSelect.appendChild(makeOption(cn, cn)));
        });
      }
    }
  } catch (err) {
    console.warn('populateMissionClassSelect erro:', err);
  }
}

// popula turmas a partir da aba "Pendentes" (#lista-turmas) ou via API (fallback)
// tenta re-tentar se #lista-turmas ainda não estiver renderizado
export async function populateTurmasFromPending(retry = 0) {
  try {
    const MAX_RETRY = 6; // total ~6 * 300ms = 1.8s
    const RETRY_DELAY = 300;
    const listEl = document.getElementById('lista-turmas');
    const filterSelect = document.getElementById('filter-mission-turma');
    const formSelect = document.getElementById('mission-turma');
    const turmas = [];

    // se lista existe e tem filhos, extrair das turmas renderizadas
    if (listEl && listEl.children.length) {
      // Buscar pelos cards de turma dentro do grid
      const gridContainer = listEl.querySelector('.grid') || listEl;
      const turmaCards = gridContainer.querySelectorAll('.turma-card, [data-turma]');

      turmaCards.forEach(card => {
        const turmaName = card.dataset?.turma || card.querySelector?.('h3')?.textContent?.trim() || card.textContent?.trim();
        if (turmaName) {
          turmas.push({ id: turmaName, name: turmaName });
        }
      });
    }

    // Tentar também obter turmas do módulo pendentes se disponível
    if (turmas.length === 0 && window.Pendentes?.getTurmas) {
      try {
        const turmasFromPendentes = window.Pendentes.getTurmas();
        if (Array.isArray(turmasFromPendentes)) {
          turmasFromPendentes.forEach(turma => {
            turmas.push({ id: turma, name: turma });
          });
        }
      } catch (e) {
        console.warn('Erro ao obter turmas do módulo pendentes:', e);
      }
    }

    // se vazio e ainda podemos tentar, aguardar e re-tentar
    if (turmas.length === 0 && retry < MAX_RETRY) {
      await new Promise(r => setTimeout(r, RETRY_DELAY));
      return populateTurmasFromPending(retry + 1);
    }

    // fallback API se ainda vazio
    if (turmas.length === 0) {
      try {
        const res = await apiRequest('/turmas/me').catch(() => apiRequest('/turmas'));
        if (Array.isArray(res)) {
          res.forEach(t => {
            const id = t.id ?? t._id ?? t.turmaId ?? t.nome ?? t.name;
            const name = t.nome || t.name || String(id);
            if (id) turmas.push({ id: String(id), name });
          });
        }
      } catch (e) {
        console.warn('Fallback API para turmas falhou:', e);
      }
    }


    // popular selects
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="all">Todas as turmas</option>' +
        turmas.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }

    if (formSelect) {
      const placeholder = formSelect.querySelector('option[value=""]')?.textContent || 'Turma (opcional - para atribuir a uma turma específica)';
      formSelect.innerHTML = `<option value="">${placeholder}</option>` +
        turmas.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }

    // Disparar evento customizado para notificar que as turmas foram atualizadas
    window.dispatchEvent(new CustomEvent('turmasUpdated', { detail: { turmas } }));

    return turmas;
  } catch (err) {
    console.warn('populateTurmasFromPending erro:', err);
    return [];
  }
}

// observar mudanças na lista de turmas para repopular automaticamente
function installTurmasObserver() {
  try {
    const listEl = document.getElementById('lista-turmas');
    if (!listEl || !window.MutationObserver) return;

    const obs = new MutationObserver(muts => {
      let changed = false;
      for (const m of muts) {
        if (m.type === 'childList' || m.type === 'attributes') {
          changed = true;
          break;
        }
      }
      if (changed) {
        populateTurmasFromPending().catch(e => console.warn('Erro ao repopular turmas via observer:', e));
        populateMissionClassSelect().catch(e => console.warn('Erro ao repopular classes via observer:', e));
        populateSubmissionFilters().catch(e => console.warn('Erro ao repopular filtros de submissões via observer:', e));
      }
    });

    obs.observe(listEl, { childList: true, subtree: true, attributes: true });
  } catch (e) {
    console.warn('installTurmasObserver erro:', e);
  }
}

// Função principal de inicialização do módulo de missões
export async function initMissoes() {
  try {

    // 1. Configurar filtros
    setupMissionFilters();
    setupSubmissionFilters();

    // 2. Configurar criação de missões
    setupMissionCreation();

    // 3. Configurar dados iniciais
    await setupInitialData();

    // 4. Instalar observadores
    installTurmasObserver();

    // 5. Configurar botão de aplicar filtros para missões
    const applyMissionFiltersBtn = document.getElementById('apply-mission-filters');
    if (applyMissionFiltersBtn) {
      applyMissionFiltersBtn.addEventListener('click', applyMissionFilters);
    }

    // 6. Configurar botão de aplicar filtros para submissões
    const applySubmissionFiltersBtn = document.getElementById('apply-submission-filters');
    if (applySubmissionFiltersBtn) {
      applySubmissionFiltersBtn.addEventListener('click', applySubmissionFilters);
    }

    // 7. Configurar botão de cancelar edição
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', cancelEdit);
    }

  } catch (err) {
    console.error('[MISSOES] Erro na inicialização:', err);
  }
}

// Função para popular filtros de submissões com turmas de pendentes e classes do master
export async function populateSubmissionFilters() {
  try {
    const turmaFilter = document.getElementById('filter-submission-turma');
    const classFilter = document.getElementById('filter-submission-class');

    // Popular turmas usando a mesma função que popula as missões (vem de pendentes)
    if (turmaFilter) {
      const listEl = document.getElementById('lista-turmas');
      const turmas = [];

      // Extrair turmas da aba pendentes (mesmo método usado para missões)
      if (listEl && listEl.children.length) {
        const gridContainer = listEl.querySelector('.grid') || listEl;
        const turmaCards = gridContainer.querySelectorAll('.turma-card, [data-turma]');

        turmaCards.forEach(card => {
          const turmaName = card.dataset?.turma || card.querySelector?.('h3')?.textContent?.trim() || card.textContent?.trim();
          if (turmaName) {
            turmas.push(turmaName);
          }
        });
      }

      // Tentar também obter turmas do módulo pendentes se disponível
      if (turmas.length === 0 && window.Pendentes?.getTurmas) {
        try {
          const turmasFromPendentes = window.Pendentes.getTurmas();
          if (Array.isArray(turmasFromPendentes)) {
            turmas.push(...turmasFromPendentes);
          }
        } catch (e) {
          console.warn('Erro ao obter turmas do módulo pendentes:', e);
        }
      }

      // Popular select de turmas
      turmaFilter.innerHTML = '<option value="all">Todas as turmas</option>' +
        [...new Set(turmas)].sort().map(turma => `<option value="${turma}">${turma}</option>`).join('');
    }

    // Popular classes usando as classes específicas da área do master
    if (classFilter) {
      const areaKey = await detectMasterArea();
      const classes = [];

      if (areaKey && areasClasses[areaKey]) {
        // Usar classes específicas da área do master
        classes.push(...Object.keys(areasClasses[areaKey].classes));
      } else {
        // Fallback: usar todas as classes se não conseguir detectar a área
        Object.values(areasClasses).forEach(info => {
          classes.push(...Object.keys(info.classes));
        });
      }

      // Popular select de classes
      classFilter.innerHTML = '<option value="all">Todas as classes</option>' +
        [...new Set(classes)].sort().map(classe => `<option value="${classe}">${classe}</option>`).join('');
    }

  } catch (err) {
    console.warn('Erro ao popular filtros de submissões:', err);
  }
}

// Função para inicializar populadores quando a página estiver pronta
export async function setupInitialData() {
  try {

    // Aguardar um pouco para garantir que DOM esteja pronto
    await new Promise(resolve => setTimeout(resolve, 100));

    // Popular classes baseado na área do master
    await populateMissionClassSelect();

    // Popular turmas (tentar algumas vezes se necessário)
    await populateTurmasFromPending();

    // Popular filtros de submissões com turmas de pendentes e classes do master
    await populateSubmissionFilters();
  } catch (err) {
    console.warn('[MISSOES] Erro ao configurar dados iniciais:', err);
  }
}