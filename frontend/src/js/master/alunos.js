import { apiRequest } from '../utils/auth.js';
import { showError, showSuccess } from '../utils/toast.js';
import { showPenaltyRewardModal, showStudentHistoryModal } from '../utils/modals.js';

// Armazenamento local dos alunos aprovados
export let originalStudents = [];

// Carregar alunos aprovados do backend e filtrar pelo mestre logado
export async function loadApprovedStudents() {
  try {
    const container = document.getElementById('students-list');
    if (container) container.innerHTML = '<p class="text-gray-500 py-4">Carregando alunos...</p>';

    const masterUsername = localStorage.getItem('username');
    const data = await apiRequest('/usuarios/approved-students');
    if (!Array.isArray(data)) {
      console.warn('[ALUNOS] resposta inesperada de approved-students:', data);
    }
    const filtered = (data || []).filter(student => student.masterUsername === masterUsername);
    originalStudents = filtered;
    // manter referência global para módulos que esperam window.originalStudents
    window.originalStudents = originalStudents;

    // Carregar turmas no filtro
    await populateStudentTurmaFilter();

    // renderizar turmas caso já exista função disponível
    if (window.renderTurmas) window.renderTurmas();

    const hasActiveFilters = checkActiveFilters('student');
    if (hasActiveFilters) {
      applyStudentFilters();
    } else {
      renderStudents(filtered);
    }
  } catch (err) {
    console.error('[ALUNOS] Erro ao carregar alunos:', err);
    const container = document.getElementById('students-list');
    if (container) {
      container.innerHTML = `<p class="text-red-500 py-4">Erro ao carregar alunos: ${err.message || err}</p>`;
    }
    showError('Erro ao carregar alunos: ' + (err.message || err));
  }
}

export function renderStudents(students) {
  const container = document.getElementById('students-list');
  if (!container) {
    console.error('[ERROR] Container students-list não encontrado!');
    return;
  }

  if (!students || students.length === 0) {
    container.innerHTML = '<p class="text-gray-500 py-4">Nenhum aluno encontrado.</p>';
    return;
  }

  container.innerHTML = students.map(student => createStudentCard(student)).join('');
}

export function createStudentCard(student) {
  // Mostrar turma ao invés de ano
  const turmaDisplay = student.turma || student.assignedTurma || 'Turma não definida';

  const level = student.level || 1;
  const xp = student.xp || 0;
  let levelColorClass = 'bg-gray-500';
  let levelIcon = 'fas fa-seedling';

  if (level >= 10) {
    levelColorClass = 'bg-gradient-to-r from-purple-500 to-pink-500';
    levelIcon = 'fas fa-crown';
  } else if (level >= 7) {
    levelColorClass = 'bg-gradient-to-r from-yellow-400 to-orange-500';
    levelIcon = 'fas fa-star';
  } else if (level >= 4) {
    levelColorClass = 'bg-gradient-to-r from-blue-400 to-blue-600';
    levelIcon = 'fas fa-rocket';
  } else if (level >= 2) {
    levelColorClass = 'bg-gradient-to-r from-green-400 to-green-600';
    levelIcon = 'fas fa-leaf';
  }

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

  const classIcon = classIcons[student.class] || 'fas fa-user';

  let progressDisplay = '';
  if (student.levelInfo && !student.levelInfo.isMaxLevel) {
    const info = student.levelInfo;
    progressDisplay = `
      <div class="mt-3">
        <div class="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progresso do Nível</span>
          <span>${info.xpProgressInCurrentLevel}/${info.xpNeededForCurrentLevel} XP</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300" 
               style="width: ${info.progressPercentage}%"></div>
        </div>
        <div class="text-xs text-center text-gray-500 mt-1">${info.progressPercentage}% concluído</div>
      </div>
    `;
  } else if (student.levelInfo?.isMaxLevel) {
    progressDisplay = `
      <div class="mt-3 text-center">
        <div class="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          <i class="fas fa-trophy mr-1"></i> NÍVEL MÁXIMO
        </div>
      </div>
    `;
  }

  return `
    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <!-- Header do Card -->
      <div class="bg-gradient-to-r from-purple-500 to-blue-600 p-4 text-white relative">
        <div class="absolute top-2 right-2">
          <div class="${levelColorClass} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
            <i class="${levelIcon} mr-1"></i>
            Nível ${level}
          </div>
        </div>
        <div class="flex items-center">
          <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
            <i class="${classIcon} text-2xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-lg">${student.username}</h3>
            <p class="text-blue-100 text-sm">${turmaDisplay}</p>
          </div>
        </div>
      </div>

      <!-- Conteúdo do Card -->
      <div class="p-4">
        <!-- Informações Principais -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">${xp}</div>
            <div class="text-xs text-gray-500">XP Total</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">${level}</div>
            <div class="text-xs text-gray-500">Nível Atual</div>
          </div>
        </div>

        <!-- Classe do Estudante -->
        <div class="bg-gray-50 rounded-lg p-3 mb-4">
          <div class="flex items-center">
            <i class="${classIcon} text-lg text-gray-600 mr-2"></i>
            <span class="text-sm font-medium text-gray-700">${student.class || 'Classe não definida'}</span>
          </div>
        </div>

        <!-- Barra de Progresso -->
        ${progressDisplay}

        <!-- Botões de Ação Modernos -->
        <div class="mt-6 space-y-3">
          <!-- Primeira linha de botões -->
          <div class="grid grid-cols-2 gap-3">
            <button data-student-id="${student.id}" data-student-name="${student.username}" 
                    class="penalty-btn bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1">
              <i class="fas fa-minus-circle mr-2 text-base"></i>
              <span class="hidden sm:inline">Penalidade</span>
              <span class="sm:hidden">-XP</span>
            </button>
            <button data-student-id="${student.id}" data-student-name="${student.username}" 
                    class="reward-btn bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1">
              <i class="fas fa-plus-circle mr-2 text-base"></i>
              <span class="hidden sm:inline">Recompensa</span>
              <span class="sm:hidden">+XP</span>
            </button>
          </div>
          
          <!-- Segunda linha de botões -->
          <div class="grid grid-cols-2 gap-3">
            <button data-student-id="${student.id}" data-student-name="${student.username}" 
                    class="history-btn bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1">
              <i class="fas fa-history mr-2 text-base"></i>
              <span class="hidden sm:inline">Histórico</span>
              <span class="sm:hidden">Log</span>
            </button>
            <button data-student-id="${student.id}" data-student-name="${student.username}" 
                    class="expel-btn bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1">
              <i class="fas fa-user-times mr-2 text-base"></i>
              <span class="hidden sm:inline">Expulsar</span>
              <span class="sm:hidden">Del</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer com estatísticas adicionais -->
      <div class="bg-gray-50 px-4 py-2 border-t">
        <div class="flex justify-between text-xs text-gray-500">
          <span><i class="fas fa-calendar-alt mr-1"></i>Membro desde ${new Date().getFullYear()}</span>
          <span><i class="fas fa-clock mr-1"></i>Ativo</span>
        </div>
      </div>
    </div>
  `;
}

// ====== FILTROS ======
// Função exportada para verificar filtros ativos
export function checkActiveFilters(type) {
  if (type === 'student') {
    const turmaFilter = document.getElementById('student-year-filter')?.value;
    const classFilter = document.getElementById('student-class-filter')?.value;
    const levelFilter = document.getElementById('student-level-filter')?.value;
    return turmaFilter !== 'all' || classFilter !== 'all' || levelFilter !== 'all';
  }
  return false;
}

export function applyStudentFilters() {
  const turmaFilter = document.getElementById('student-year-filter')?.value || 'all';
  const classFilter = document.getElementById('student-class-filter')?.value || 'all';
  const levelFilter = document.getElementById('student-level-filter')?.value || 'all';

  let filtered = originalStudents || [];

  if (turmaFilter !== 'all') {
    filtered = filtered.filter(student => {
      const studentTurma = student.turma || student.assignedTurma;
      return studentTurma === turmaFilter;
    });
  }

  if (classFilter !== 'all') {
    filtered = filtered.filter(student => student.class === classFilter);
  }

  if (levelFilter !== 'all') {
    filtered = filtered.filter(student => (student.level || 1) >= parseInt(levelFilter));
  }

  console.log('[FILTROS] Aplicando filtros:', { turmaFilter, classFilter, levelFilter, resultados: filtered.length });
  renderStudents(filtered);
}

// Função para carregar turmas nos selects de filtro
export async function populateStudentTurmaFilter() {
  try {
    const response = await apiRequest('/turmas');
    if (response && response.turmas) {
      const select = document.getElementById('student-year-filter');
      if (select) {
        // Manter a opção "Todas as turmas"
        const currentValue = select.value;
        select.innerHTML = '<option value="all">Todas as turmas</option>';

        response.turmas.forEach(turma => {
          const option = document.createElement('option');
          option.value = turma;
          option.textContent = turma;
          select.appendChild(option);
        });

        // Restaurar valor anterior se ainda existir
        if (currentValue && currentValue !== 'all') {
          select.value = currentValue;
        }
      }
    }
  } catch (err) {
    console.error('[FILTROS] Erro ao carregar turmas:', err);
  }
}

export function setupStudentFilters() {
  const yearFilter = document.getElementById('student-year-filter');
  const classFilter = document.getElementById('student-class-filter');
  const levelFilter = document.getElementById('student-level-filter');
  const applyBtn = document.getElementById('apply-student-filters');

  [yearFilter, classFilter, levelFilter].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', applyStudentFilters);
    }
  });

  if (applyBtn) {
    applyBtn.addEventListener('click', applyStudentFilters);
  }
}