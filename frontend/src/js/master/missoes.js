import { apiRequest } from '../utils/auth.js';
import { showError, showSuccess } from '../utils/toast.js';

export let originalMissions = [];
export let originalSubmissions = [];

/**
 * Converte Firestore Timestamp ou string para JavaScript Date
 * @param {*} timestamp - Pode ser Firestore Timestamp, string ISO, ou Date
 * @returns {Date|null} - JavaScript Date ou null se inválido
 */
function parseFirestoreDate(timestamp) {
  if (!timestamp) return null;

  // Se já é um Date válido
  if (timestamp instanceof Date && !isNaN(timestamp.getTime())) {
    return timestamp;
  }

  // Se é um Firestore Timestamp (objeto com seconds e nanoseconds)
  if (typeof timestamp === 'object' && timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000);
  }

  // Se é uma string ou número, tentar converter
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? null : date;
}

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

// Abrir arquivo com preview adequado ao tipo
export function openFileWithPreview(fileUrl, fileName = 'arquivo') {
  try {
    console.log('🔗 Abrindo arquivo:', { fileUrl, fileName });

    // Validar se a URL é válida
    if (!fileUrl || fileUrl === '[object Object]') {
      console.error('❌ URL inválida ou objeto:', fileUrl);
      showError('URL do arquivo é inválida');
      return;
    }

    // Se for URL do Firebase Storage, usar nosso backend como proxy
    if (fileUrl.includes('firebasestorage.googleapis.com')) {
      // Obter token de autenticação
      const token = localStorage.getItem('token');

      // Criar URL do proxy com token na URL (para evitar problemas de CORS com headers)
      const proxyUrl = `http://localhost:3000/files/proxy?url=${encodeURIComponent(fileUrl)}&token=${token}`;

      // Usar o proxy que criamos no backend (contorna CORS)
      console.log('📡 Usando proxy para arquivo Firebase:', proxyUrl);

      // Fazer fetch do conteúdo e criar blob URL
      try {
        showSuccess('Carregando arquivo...');

        // Abrir em nova aba com método temporário
        const link = document.createElement('a');
        link.href = proxyUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return; // Interromper execução após abrir o link
      } catch (fetchError) {
        console.error('❌ Erro ao buscar arquivo via proxy:', fetchError);
        // Continuar com o método padrão em caso de erro
      }

      fileUrl = proxyUrl;
    }

    // Detectar extensão do arquivo
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    console.log('📄 Extensão detectada:', extension);

    // Tipos de arquivo que o navegador renderiza nativamente
    const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'];
    const codeTypes = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml', 'md', 'txt', 'py', 'java', 'c', 'cpp', 'h'];
    const pdfTypes = ['pdf'];
    const videoTypes = ['mp4', 'webm', 'ogg'];
    const audioTypes = ['mp3', 'wav', 'ogg'];

    // Para imagens, PDFs e vídeos: abrir diretamente (navegador renderiza)
    if (imageTypes.includes(extension) || pdfTypes.includes(extension) || videoTypes.includes(extension) || audioTypes.includes(extension)) {
      console.log('✅ Tipo renderizável pelo navegador, abrindo diretamente');
      // Usar método de abrir que força navegação completa em vez de popup
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Para código e texto: criar preview com syntax highlighting
    if (codeTypes.includes(extension)) {
      console.log('📝 Arquivo de código, criando preview');
      openCodePreview(fileUrl, fileName, extension);
      return;
    }

    // Para outros tipos: usar mesmo método de navegação completa
    console.log('⚠️ Tipo desconhecido, tentando abrir no navegador');
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Abrindo arquivo no navegador...');
  } catch (error) {
    console.error('❌ Erro ao abrir arquivo:', error);
    showError('Erro ao abrir arquivo: ' + (error.message || error));
  }
}

// Criar preview de código com syntax highlighting
function openCodePreview(fileUrl, fileName, extension) {
  try {
    console.log('📥 Criando preview para arquivo:', fileName);

    // Verificar se é URL do Firebase Storage e usar proxy se necessário
    if (fileUrl.includes('firebasestorage.googleapis.com')) {
      // Obter token de autenticação
      const token = localStorage.getItem('token');

      // Criar URL do proxy com token na URL
      const proxyUrl = `http://localhost:3000/files/proxy?url=${encodeURIComponent(fileUrl)}&token=${token}`;
      console.log('📡 Usando proxy para arquivo Firebase no preview:', proxyUrl);
      fileUrl = proxyUrl;
    }

    // Abrir uma nova aba com navegação direta - usar método que força navegação completa
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Link de visualização aberto:', fileUrl);
    showSuccess('Abrindo arquivo para visualização...');
  } catch (error) {
    console.error('❌ Erro ao criar preview:', error);
    showError('Não foi possível carregar o preview. Baixando arquivo...');
    downloadFile(fileUrl, fileName);
  }
}

// Função auxiliar para escapar HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Função para escapar strings em atributos HTML (evita quebra de onclick)
function escapeAttribute(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes primeiro
    .replace(/'/g, "\\'")     // Escape aspas simples
    .replace(/"/g, '\\"')     // Escape aspas duplas
    .replace(/\n/g, '\\n')    // Escape quebras de linha
    .replace(/\r/g, '\\r');   // Escape retorno de carro
}

// Função para download seguro de arquivo (exportada para uso global)
export async function downloadFileSecurely(fileUrl, fileName) {
  try {
    console.log('⬇️ Download iniciado:', { fileUrl, fileName });

    // Se for URL do Firebase Storage, usar nossa API backend para proxy
    if (fileUrl.includes('firebasestorage.googleapis.com')) {
      // Obter token de autenticação
      const token = localStorage.getItem('token');

      // Notificar o usuário
      showSuccess('Preparando download...');

      // Usar fetch com o token para buscar o arquivo via proxy
      const response = await fetch(`http://localhost:3000/files/proxy?url=${encodeURIComponent(fileUrl)}&token=${token}`);

      if (!response.ok) {
        throw new Error(`Erro ao baixar arquivo: ${response.status} ${response.statusText}`);
      }

      // Obter o blob do arquivo
      const blob = await response.blob();

      // Criar URL local para o blob
      const blobUrl = URL.createObjectURL(blob);

      // Criar link e forçar download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.target = '_self'; // Evitar abrir nova aba
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL do blob após o download
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

      showSuccess('Download iniciado!');
      console.log('✅ Download via proxy iniciado:', fileName);
      return;
    }

    // Para outros tipos de URL, usar método direto
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('❌ Erro ao iniciar download:', error);
    showError('Erro ao baixar arquivo: ' + (error.message || error));
  }
}

// Função interna para download (usada no preview de código)
function downloadFile(fileUrl, fileName) {
  downloadFileSecurely(fileUrl, fileName);
}

// Função para abrir arquivo de forma segura
export function openFileSecurely(fileUrl) {
  // Extrair nome do arquivo da URL (para melhorar UX)
  const fileName = fileUrl.split('/').pop()?.split('?')[0] || 'arquivo';
  openFileWithPreview(fileUrl, fileName);
}

export async function loadSubmissions() {
  try {
    const container = document.getElementById('submissions-list');
    if (container) container.innerHTML = '<p class="text-gray-500 py-4">Carregando submissões...</p>';

    const data = await apiRequest('/submissoes');
    originalSubmissions = data || [];

    // Popular filtros dinamicamente
    await populateFilterTurmas();
    if (window.originalStudents) {
      populateFilterClasses(window.originalStudents);
    }

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

    // Popular filtros dinamicamente
    await populateFilterTurmas();
    if (window.originalStudents) {
      populateFilterClasses(window.originalStudents);
    }

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
      console.log('[MISSOES] Aprovando submissão:', id);
      try {
        const response = await apiRequest(`/submissoes/${id}/approve`, {
          method: 'POST',
          body: JSON.stringify({ feedback: '' })
        });
        console.log('[MISSOES] Resposta da aprovação:', response);
        showSuccess('Submissão aprovada com sucesso!');
        await loadSubmissions();
      } catch (err) {
        console.error('[MISSOES] Erro ao aprovar submissão:', err);
        showError('Erro ao aprovar submissão: ' + (err.message || err));
      }
    };
  });

  container.querySelectorAll('.reject-submission-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.submissionId;
      console.log('[MISSOES] Rejeitando submissão:', id);
      try {
        const response = await apiRequest(`/submissoes/${id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ feedback: '' })
        });
        console.log('[MISSOES] Resposta da rejeição:', response);
        showSuccess('Submissão rejeitada com sucesso!');
        await loadSubmissions();
      } catch (err) {
        console.error('[MISSOES] Erro ao rejeitar submissão:', err);
        showError('Erro ao rejeitar submissão: ' + (err.message || err));
      }
    };
  });
}

// Função para criar card de submissão
function createSubmissionCard(submission) {
  // Debug: verificar a data que está chegando
  console.log('📅 Debug submissão:', {
    id: submission.id,
    submittedAt: submission.submittedAt,
    typeOf: typeof submission.submittedAt
  });

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300'
  };

  const statusIcons = {
    pending: 'fa-clock',
    approved: 'fa-check-circle',
    rejected: 'fa-times-circle'
  };

  const statusText = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado'
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Data não informada';

    try {
      const date = parseFirestoreDate(dateValue);

      if (!date) {
        console.error('❌ Data inválida recebida:', dateValue);
        return 'Data inválida';
      }

      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', dateStr, error);
      return 'Data inválida';
    }
  };

  // Processar arquivos - Debug
  console.log('📎 Arquivos da submissão:', {
    id: submission.id,
    hasFilePaths: !!submission.filePaths,
    filePathsLength: submission.filePaths?.length,
    filePathsType: Array.isArray(submission.filePaths) ? 'array' : typeof submission.filePaths,
    hasFileUrls: !!submission.fileUrls,
    fileUrlsLength: submission.fileUrls?.length,
    fileUrlsType: Array.isArray(submission.fileUrls) ? 'array' : typeof submission.fileUrls,
    hasFileUrl: !!submission.fileUrl,
    fileUrlType: typeof submission.fileUrl,
    filePaths: submission.filePaths,
    fileUrls: submission.fileUrls,
    fileUrl: submission.fileUrl,
    // Tipos de cada elemento em fileUrls se for array
    fileUrlsElementTypes: Array.isArray(submission.fileUrls) ? submission.fileUrls.map(u => typeof u) : null
  });

  let filesHtml = '';

  // Prioridade 1: fileUrls (array) - Firebase Storage
  if (submission.fileUrls && submission.fileUrls.length > 0) {
    filesHtml = `
      <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <i class="fas fa-paperclip mr-2"></i>
          Arquivos enviados (${submission.fileUrls.length})
        </h4>
        <div class="space-y-2">
          ${submission.fileUrls.map((fileUrl, index) => {
      // Validar se fileUrl é uma string ou objeto {url, name, path}
      let actualUrl = fileUrl;
      let fileName = `arquivo${index + 1}`;

      if (!fileUrl) {
        console.warn('⚠️ fileUrl ausente no índice', index);
        return '';
      }

      // Se fileUrl é um objeto (formato antigo do Firebase Storage)
      if (typeof fileUrl === 'object' && fileUrl.url) {
        console.log('📦 fileUrl é objeto, extraindo URL:', fileUrl);
        actualUrl = fileUrl.url;
        fileName = fileUrl.name || fileName;
      }
      // Se fileUrl é uma string (formato correto)
      else if (typeof fileUrl === 'string') {
        actualUrl = fileUrl;
        fileName = fileUrl.split('/').pop()?.split('?')[0] || fileName;
      }
      // Tipo inválido
      else {
        console.error('❌ fileUrl com tipo inválido:', typeof fileUrl, fileUrl);
        return '';
      }

      const decodedFileName = decodeURIComponent(fileName);
      const escapedUrl = escapeAttribute(actualUrl);
      const escapedName = escapeAttribute(decodedFileName);

      return `
              <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                  <i class="fas fa-file-code text-blue-600 mr-2"></i>${decodedFileName}
                </span>
                <div class="flex gap-2 ml-2">
                  <button onclick="window.downloadFileSecurely('${escapedUrl}', '${escapedName}')"
                     class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
                    <i class="fas fa-download mr-1"></i>Baixar
                  </button>
                  <button onclick="window.openFileWithPreview('${escapedUrl}', '${escapedName}')" 
                          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
                    <i class="fas fa-eye mr-1"></i>Ver
                  </button>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }
  // Prioridade 2: filePaths com fileUrls correspondentes
  else if (submission.filePaths && submission.filePaths.length > 0) {
    filesHtml = `
      <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <i class="fas fa-paperclip mr-2"></i>
          Arquivos enviados (${submission.filePaths.length})
        </h4>
        <div class="space-y-2">
          ${submission.filePaths.map((filePath, index) => {
      const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || `arquivo${index + 1}`;
      const fileUrl = submission.fileUrls?.[index] || filePath;
      const escapedUrl = escapeAttribute(fileUrl);
      const escapedName = escapeAttribute(fileName);

      return `
              <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                  <i class="fas fa-file-code text-blue-600 mr-2"></i>${fileName}
                </span>
                <div class="flex gap-2 ml-2">
                  <button onclick="window.downloadFileSecurely('${escapedUrl}', '${escapedName}')"
                     class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
                    <i class="fas fa-download mr-1"></i>Baixar
                  </button>
                  <button onclick="window.openFileWithPreview('${escapedUrl}', '${escapedName}')" 
                          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
                    <i class="fas fa-eye mr-1"></i>Ver
                  </button>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }
  // Prioridade 3: fileUrl singular
  else if (submission.fileUrl && typeof submission.fileUrl === 'string') {
    const fileName = submission.fileUrl.split('/').pop()?.split('?')[0] || 'arquivo';
    const decodedFileName = decodeURIComponent(fileName);
    const escapedUrl = escapeAttribute(submission.fileUrl);
    const escapedName = escapeAttribute(decodedFileName);

    filesHtml = `
      <div class="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <i class="fas fa-paperclip mr-2"></i>
          Arquivo enviado
        </h4>
        <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
          <span class="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
            <i class="fas fa-file-code text-blue-600 mr-2"></i>${decodedFileName}
          </span>
          <div class="flex gap-2 ml-2">
            <button onclick="window.downloadFileSecurely('${escapedUrl}', '${escapedName}')"
               class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
              <i class="fas fa-download mr-1"></i>Baixar
            </button>
            <button onclick="window.openFileWithPreview('${escapedUrl}', '${escapedName}')" 
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs whitespace-nowrap inline-flex items-center">
              <i class="fas fa-eye mr-1"></i>Ver
            </button>
          </div>
        </div>
      </div>
    `;
  }
  // Caso não tenha nenhum arquivo
  else {
    filesHtml = `
      <div class="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p class="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Nenhum arquivo foi enviado com esta submissão
        </p>
      </div>
    `;
  }

  return `
    <div class="card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${submission.status === 'pending' ? 'border-yellow-400' : submission.status === 'approved' ? 'border-green-400' : 'border-red-400'}">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-1">
            ${submission.missionTitle || 'Missão não informada'}
          </h3>
          ${submission.missionDescription ? `
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              ${submission.missionDescription}
            </p>
          ` : ''}
        </div>
        <span class="inline-flex items-center ${statusColors[submission.status] || statusColors.pending} text-xs font-semibold px-3 py-1 rounded-full border">
          <i class="fas ${statusIcons[submission.status] || statusIcons.pending} mr-1"></i>
          ${statusText[submission.status] || 'Pendente'}
        </span>
      </div>

      <!-- Informações do Aluno -->
      <div class="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-750 rounded-lg">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Aluno</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              <i class="fas fa-user text-blue-600 mr-2"></i>${submission.username || 'Não informado'}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Turma</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              <i class="fas fa-users text-purple-600 mr-2"></i>${submission.userTurma || submission.turma || 'Sem turma'}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Classe</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              <i class="fas fa-shield-alt text-green-600 mr-2"></i>${submission.userClass || 'Não informada'}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Data de Envio</p>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              <i class="fas fa-calendar-alt text-orange-600 mr-2"></i>${formatDate(submission.submittedAt)}
            </p>
          </div>
        </div>
      </div>

      <!-- Arquivos -->
      ${filesHtml}

      <!-- Feedback (se houver) -->
      ${submission.feedback ? `
        <div class="mb-4 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-400">
          <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
            <i class="fas fa-comment-alt mr-2"></i>Feedback
          </h4>
          <p class="text-sm text-blue-800 dark:text-blue-200">${submission.feedback}</p>
        </div>
      ` : ''}

      <!-- Ações -->
      ${submission.status === 'pending' ? `
        <div class="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button class="approve-submission-btn flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center"
                  data-submission-id="${submission.id}">
            <i class="fas fa-check mr-2"></i>Aprovar
          </button>
          <button class="reject-submission-btn flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center"
                  data-submission-id="${submission.id}">
            <i class="fas fa-times mr-2"></i>Rejeitar
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

  // Helpers para manipular datas vindas em diferentes formatos (ISO, ms, s, Firestore Timestamp)
  const toDateSafe = (value) => {
    try {
      if (!value) return null;
      if (typeof value?.toDate === 'function') return value.toDate();
      if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
      if (typeof value === 'number') return new Date(value > 1e12 ? value : value * 1000);
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };
  const getCreatedAtDate = (m) =>
    toDateSafe(
      (m && (m.createdAt ?? m.created_at ?? m.created ?? m.createdOn ?? m.created_time ?? m.createdTimestamp)) || null
    );

  // Ordenar missões: mais recente primeiro (robusto para vários formatos de data)
  const sortedMissions = [...missions].sort((a, b) => {
    const ta = (getCreatedAtDate(a) || new Date(0)).getTime();
    const tb = (getCreatedAtDate(b) || new Date(0)).getTime();
    return tb - ta; // Ordem decrescente (mais recente primeiro)
  });

  container.innerHTML = sortedMissions.map(mission => createMissionCard(mission)).join('');

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
        await apiRequest(`/missoes/${id}`, { method: 'DELETE' });
        showSuccess('Missão deletada com sucesso!');
        await loadMissions();
      } catch (err) {
        console.error('Erro ao deletar missão:', err);
        showError('Erro ao deletar missão: ' + (err.message || err));
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

  // Datas seguras (vários formatos)
  const toDateSafe = (value) => {
    try {
      if (!value) return null;
      if (typeof value?.toDate === 'function') return value.toDate();
      if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
      if (typeof value === 'number') return new Date(value > 1e12 ? value : value * 1000);
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };
  const getCreatedAtDate = (m) =>
    toDateSafe(
      (m && (m.createdAt ?? m.created_at ?? m.created ?? m.createdOn ?? m.created_time ?? m.createdTimestamp)) || null
    );
  const createdDate = getCreatedAtDate(mission);
  const createdLabel = createdDate
    ? createdDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    : 'Data não disponível';

  return `
    <div class="card bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-bold">${mission.titulo || mission.title || 'Missão sem título'}</h3>
        <span class="text-xs text-gray-500" title="Data de criação">
          <i class="far fa-calendar-alt mr-1"></i>${createdLabel}
        </span>
      </div>
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

  if (turmaFilter !== 'all') filtered = filtered.filter(s => (s.userTurma || s.studentTurma) === turmaFilter);
  if (classFilter !== 'all') filtered = filtered.filter(s => (s.userClass || s.studentClass) === classFilter);

  if (studentFilter) {
    filtered = filtered.filter(s => {
      const studentName = (s.username || s.studentUsername || s.studentName || '').toLowerCase();
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

// Função para popular dinamicamente os selects de turma nos filtros
export async function populateFilterTurmas() {
  try {
    const response = await apiRequest('/turmas');
    if (response && response.turmas) {
      // Atualizar select de filtro de submissões
      const submissionTurmaSelect = document.getElementById('filter-submission-turma');
      if (submissionTurmaSelect) {
        const currentValue = submissionTurmaSelect.value;
        submissionTurmaSelect.innerHTML = '<option value="all">Todas as turmas</option>';

        response.turmas.forEach(turma => {
          const option = document.createElement('option');
          option.value = turma;
          option.textContent = turma;
          submissionTurmaSelect.appendChild(option);
        });

        if (currentValue && currentValue !== 'all') {
          submissionTurmaSelect.value = currentValue;
        }
      }

      // Atualizar select de filtro de missões
      const missionTurmaSelect = document.getElementById('filter-mission-turma');
      if (missionTurmaSelect) {
        const currentValue = missionTurmaSelect.value;
        missionTurmaSelect.innerHTML = '<option value="all">Todas as turmas</option>';

        response.turmas.forEach(turma => {
          const option = document.createElement('option');
          option.value = turma;
          option.textContent = turma;
          missionTurmaSelect.appendChild(option);
        });

        if (currentValue && currentValue !== 'all') {
          missionTurmaSelect.value = currentValue;
        }
      }

      console.log('[FILTROS] Turmas carregadas nos selects:', response.turmas.length);
    }
  } catch (err) {
    console.error('[FILTROS] Erro ao carregar turmas:', err);
  }
}

// Função para popular dinamicamente as classes nos filtros
export function populateFilterClasses(students) {
  try {
    // Extrair classes únicas dos alunos
    const uniqueClasses = [...new Set(students.map(s => s.class).filter(Boolean))];

    // Atualizar select de filtro de submissões
    const submissionClassSelect = document.getElementById('filter-submission-class');
    if (submissionClassSelect) {
      const currentValue = submissionClassSelect.value;
      submissionClassSelect.innerHTML = '<option value="all">Todas as classes</option>';

      uniqueClasses.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        submissionClassSelect.appendChild(option);
      });

      if (currentValue && currentValue !== 'all') {
        submissionClassSelect.value = currentValue;
      }
    }

    // Atualizar select de filtro de missões
    const missionClassSelect = document.getElementById('filter-mission-class');
    if (missionClassSelect) {
      const currentValue = missionClassSelect.value;
      missionClassSelect.innerHTML = '<option value="all">Todas as classes</option>';

      uniqueClasses.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        missionClassSelect.appendChild(option);
      });

      if (currentValue && currentValue !== 'all') {
        missionClassSelect.value = currentValue;
      }
    }

    console.log('[FILTROS] Classes carregadas nos selects:', uniqueClasses.length);
  } catch (err) {
    console.error('[FILTROS] Erro ao popular classes:', err);
  }
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