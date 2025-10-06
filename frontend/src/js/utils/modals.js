// ===== MODAIS =====
export async function showPenaltyRewardModal(type, studentName) {
  return new Promise((resolve) => {
    const isReward = type === 'reward';
    const title = isReward ? 'Aplicar Recompensa' : 'Aplicar Penalidade';
    const icon = isReward ? 'fas fa-gift' : 'fas fa-exclamation-triangle';
    const iconBg = isReward ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-red-400 to-rose-600';
    const accentColor = isReward ? 'emerald' : 'red';
    const actionText = isReward ? 'adicionar' : 'remover';
    const description = isReward
      ? 'Reconheça o excelente trabalho do aluno com XP extra'
      : 'Aplique uma correção educativa removendo XP';

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transform transition-all animate-modal-enter">
        <!-- Header com gradiente -->
        <div class="${isReward ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'} px-6 py-4 text-white">
          <div class="flex items-center space-x-3">
            <div class="${iconBg} p-3 rounded-full shadow-lg">
              <i class="${icon} text-xl text-white"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold">${title}</h3>
              <p class="text-white text-opacity-90 text-sm">${description}</p>
            </div>
          </div>
        </div>
        
        <!-- Conteúdo -->
        <div class="p-6">
          <!-- Informações do aluno -->
          <div class="bg-gray-50 rounded-xl p-4 mb-6">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <i class="fas fa-user-graduate text-white"></i>
              </div>
              <div>
                <p class="text-sm text-gray-600">Aplicar para:</p>
                <p class="font-semibold text-gray-800">${studentName}</p>
              </div>
            </div>
          </div>
          
          <!-- Formulário -->
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <i class="fas fa-star text-yellow-500 mr-2"></i>
                XP a ${actionText}
                <span class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <input 
                  type="number" 
                  id="xp-amount" 
                  class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-${accentColor}-500 focus:border-${accentColor}-500 transition-all duration-200 text-lg font-semibold" 
                  placeholder="Digite a quantidade de XP"
                  min="1" max="1000" step="1"
                />
                <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                  XP
                </div>
              </div>
              <div class="mt-2 flex justify-between text-xs text-gray-500">
                <span>Mínimo: 1 XP</span>
                <span>Máximo: 1000 XP</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <i class="fas fa-comment-alt text-blue-500 mr-2"></i>
                Motivo da ${isReward ? 'recompensa' : 'penalidade'}
                <span class="text-red-500 ml-1">*</span>
              </label>
              <textarea 
                id="reason-text" 
                class="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-${accentColor}-500 focus:border-${accentColor}-500 transition-all duration-200 resize-none" 
                placeholder="${isReward ? 'Ex: Excelente criatividade na solução apresentada...' : 'Ex: Código não seguiu as especificações solicitadas...'}"
                rows="4" maxlength="200"
              ></textarea>
              <div class="flex justify-between items-center mt-2">
                <span class="text-xs text-gray-500">Mínimo 3 caracteres</span>
                <div class="text-xs font-medium" id="char-count">0/200</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer com botões -->
        <div class="bg-gray-50 px-6 py-4">
          <div class="flex space-x-3">
            <button id="cancel-btn" class="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium">
              <i class="fas fa-times mr-2"></i>Cancelar
            </button>
            <button id="confirm-btn" class="flex-1 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed font-medium transition-all duration-200" disabled>
              <i class="${isReward ? 'fas fa-gift' : 'fas fa-exclamation-triangle'} mr-2"></i>
              ${isReward ? 'Aplicar Recompensa' : 'Aplicar Penalidade'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Adicionar animação CSS
    const style = document.createElement('style');
    style.textContent = `
          @keyframes modal-enter {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .animate-modal-enter {
            animation: modal-enter 0.3s ease-out;
          }
        `;
    document.head.appendChild(style);

    document.body.appendChild(modal);

    const amountInput = modal.querySelector('#xp-amount');
    const reasonInput = modal.querySelector('#reason-text');
    const charCount = modal.querySelector('#char-count');
    const confirmBtn = modal.querySelector('#confirm-btn');
    const cancelBtn = modal.querySelector('#cancel-btn');

    // Detectar tema atual e aplicar estilos apropriados para dark mode
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDarkMode && cancelBtn) {
      // Aplicar estilos específicos para o botão cancelar em dark mode
      cancelBtn.style.backgroundColor = 'rgba(55, 65, 81, 0.9)';
      cancelBtn.style.borderColor = 'rgba(156, 163, 175, 0.5)';
      cancelBtn.style.color = '#f3f4f6';

      // Estilo hover para botão cancelar
      cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.backgroundColor = 'rgba(75, 85, 99, 0.9)';
        cancelBtn.style.borderColor = 'rgba(156, 163, 175, 0.7)';
        cancelBtn.style.color = '#ffffff';
      });

      cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.backgroundColor = 'rgba(55, 65, 81, 0.9)';
        cancelBtn.style.borderColor = 'rgba(156, 163, 175, 0.5)';
        cancelBtn.style.color = '#f3f4f6';
      });
    }

    amountInput.focus();

    // Validação em tempo real melhorada
    const validateForm = () => {
      const amount = amountInput.value.trim();
      const reason = reasonInput.value.trim();
      const isAmountValid = amount && !isNaN(amount) && parseInt(amount) > 0 && parseInt(amount) <= 1000;
      const isReasonValid = reason.length >= 3;
      const isValid = isAmountValid && isReasonValid;

      // Atualizar visual do input de XP
      if (amount && !isAmountValid) {
        amountInput.className = amountInput.className.replace('border-gray-200', 'border-red-300');
        amountInput.className = amountInput.className.replace(`border-${accentColor}-500`, 'border-red-500');
      } else {
        amountInput.className = amountInput.className.replace('border-red-300', 'border-gray-200');
        amountInput.className = amountInput.className.replace('border-red-500', `border-${accentColor}-500`);
      }

      // Atualizar visual do textarea
      if (reason && !isReasonValid) {
        reasonInput.className = reasonInput.className.replace('border-gray-200', 'border-red-300');
        reasonInput.className = reasonInput.className.replace(`border-${accentColor}-500`, 'border-red-500');
      } else {
        reasonInput.className = reasonInput.className.replace('border-red-300', 'border-gray-200');
        reasonInput.className = reasonInput.className.replace('border-red-500', `border-${accentColor}-500`);
      }

      // Atualizar botão
      confirmBtn.disabled = !isValid;
      if (isValid) {
        confirmBtn.className = `flex-1 px-6 py-3 ${isReward ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'} text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`;
      } else {
        confirmBtn.className = 'flex-1 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl cursor-not-allowed font-medium transition-all duration-200';

        // Aplicar estilos específicos para dark mode no botão desabilitado
        if (isDarkMode) {
          confirmBtn.style.backgroundColor = 'rgba(75, 85, 99, 0.6)';
          confirmBtn.style.color = 'rgba(156, 163, 175, 0.8)';
          confirmBtn.style.border = '1px solid rgba(156, 163, 175, 0.3)';
        }
      }
    };

    // Event listeners melhorados
    reasonInput.addEventListener('input', () => {
      const length = reasonInput.value.length;
      charCount.textContent = `${length}/200`;
      if (length > 190) {
        charCount.className = 'text-xs font-medium text-red-500';
      } else if (length >= 3) {
        charCount.className = `text-xs font-medium text-${accentColor}-600`;
      } else {
        charCount.className = 'text-xs font-medium text-gray-500';
      }
      validateForm();
    });

    amountInput.addEventListener('input', validateForm);

    modal.querySelector('#cancel-btn').addEventListener('click', () => {
      modal.style.animation = 'modal-enter 0.2s ease-in reverse';
      setTimeout(() => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
        resolve(null);
      }, 200);
    });

    modal.querySelector('#confirm-btn').addEventListener('click', () => {
      const amount = amountInput.value.trim();
      const reason = reasonInput.value.trim();

      if (confirmBtn.disabled) return;

      modal.style.animation = 'modal-enter 0.2s ease-in reverse';
      setTimeout(() => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
        resolve({ amount: parseInt(amount), reason: reason.trim() });
      }, 200);
    });

    // Escape e click fora com animação
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.querySelector('#cancel-btn').click();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.querySelector('#cancel-btn').click();
    });
  });
}

export async function showStudentHistoryModal(studentId, studentName) {
  try {
    const historyData = await window.apiRequest(`/usuarios/student-history/${studentId}`);

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '9999';

    const historyHTML = historyData.history.length > 0
      ? historyData.history.map(entry => {
        const date = new Date(entry.appliedAt).toLocaleString('pt-BR');

        let icon, cardBg, borderColor, iconBg, xpBadge, action, xpChange, extraInfo;

        if (entry.type === 'reward') {
          icon = 'fas fa-gift';
          cardBg = 'bg-gradient-to-r from-green-50 to-emerald-50';
          borderColor = 'border-green-200';
          iconBg = 'bg-gradient-to-br from-green-400 to-emerald-600';
          xpBadge = 'bg-green-100 text-green-800';
          action = 'Recompensa';
          xpChange = `+${entry.amount} XP`;
          extraInfo = `
            <div class="text-sm text-gray-600 mb-2">
              <i class="fas fa-chart-line mr-1"></i>
              XP: <span class="font-mono">${entry.oldXp} → ${entry.newXp}</span>
            </div>
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Motivo:</strong> ${entry.reason}
            </div>`;
        } else if (entry.type === 'penalty') {
          icon = 'fas fa-exclamation-triangle';
          cardBg = 'bg-gradient-to-r from-red-50 to-rose-50';
          borderColor = 'border-red-200';
          iconBg = 'bg-gradient-to-br from-red-400 to-rose-600';
          xpBadge = 'bg-red-100 text-red-800';
          action = 'Penalidade';
          xpChange = `-${entry.amount} XP`;
          extraInfo = `
            <div class="text-sm text-gray-600 mb-2">
              <i class="fas fa-chart-line mr-1"></i>
              XP: <span class="font-mono">${entry.oldXp} → ${entry.newXp}</span>
            </div>
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Motivo:</strong> ${entry.reason}
            </div>`;
        } else if (entry.type === 'mission_approved') {
          icon = 'fas fa-check-circle';
          cardBg = 'bg-gradient-to-r from-blue-50 to-cyan-50';
          borderColor = 'border-blue-200';
          iconBg = 'bg-gradient-to-br from-blue-400 to-cyan-600';
          xpBadge = 'bg-blue-100 text-blue-800';
          action = 'Missão Aprovada';
          xpChange = `+${entry.xpGained} XP`;
          extraInfo = `
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-tasks mr-1"></i>
              <strong>Missão:</strong> ${entry.missionTitle}
            </div>
            ${entry.feedback ? `<div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Feedback:</strong> ${entry.feedback}
            </div>` : ''}`;
        } else if (entry.type === 'mission_rejected') {
          icon = 'fas fa-times-circle';
          cardBg = 'bg-gradient-to-r from-orange-50 to-red-50';
          borderColor = 'border-orange-200';
          iconBg = 'bg-gradient-to-br from-orange-400 to-red-600';
          xpBadge = 'bg-orange-100 text-orange-800';
          action = 'Missão Rejeitada';
          xpChange = '0 XP';
          extraInfo = `
            <div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-tasks mr-1"></i>
              <strong>Missão:</strong> ${entry.missionTitle}
            </div>
            ${entry.feedback ? `<div class="text-sm text-gray-700 mb-2">
              <i class="fas fa-comment-dots mr-1"></i>
              <strong>Feedback:</strong> ${entry.feedback}
            </div>` : ''}`;
        }

        return `
            <div class="${cardBg} border-2 ${borderColor} rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
              <div class="flex items-start space-x-4">
                <div class="${iconBg} p-2 rounded-full shadow-lg flex-shrink-0">
                  <i class="${icon} text-white"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <span class="font-bold text-gray-800">${action}</span>
                      <span class="${xpBadge} px-2 py-1 rounded-full text-sm font-semibold">${xpChange}</span>
                    </div>
                    <div class="text-xs text-gray-500">
                      ${date}
                    </div>
                  </div>
                  ${extraInfo}
                  <div class="text-xs text-gray-500">
                    <i class="fas fa-user-tie mr-1"></i>
                    Aplicado por: <span class="font-medium">${entry.appliedByName}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
      }).join('')
      : `<div class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-history text-gray-400 text-2xl"></i>
                </div>
                <p class="text-gray-500 text-lg">Nenhuma ação registrada</p>
                <p class="text-gray-400 text-sm mt-1">O histórico aparecerá aqui conforme as ações forem aplicadas</p>
              </div>`;

    // Adicionar animação CSS se não existir
    if (!document.getElementById('modal-animations')) {
      const style = document.createElement('style');
      style.id = 'modal-animations';
      style.textContent = `
              @keyframes modal-enter {
                from {
                  opacity: 0;
                  transform: scale(0.9) translateY(-20px);
                }
                to {
                  opacity: 1;
                  transform: scale(1) translateY(0);
                }
              }
              .animate-modal-enter {
                animation: modal-enter 0.3s ease-out;
              }
            `;
      document.head.appendChild(style);
    }

    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden transform transition-all animate-modal-enter">
        <!-- Header moderno -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="bg-white bg-opacity-20 p-3 rounded-full">
                <i class="fas fa-history text-xl"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold">Histórico Completo</h3>
                <p class="text-white text-opacity-90 text-sm">${studentName}</p>
              </div>
            </div>
            <button id="close-btn" class="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        
        <!-- Estatísticas -->
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b">
          <div class="grid grid-cols-4 gap-4">
            <div class="text-center">
              <div class="bg-white rounded-xl p-3 shadow-sm">
                <div class="text-2xl font-bold text-blue-600">${historyData.student.currentXp}</div>
                <div class="text-sm text-gray-600 font-medium">XP Atual</div>
              </div>
            </div>
            <div class="text-center">
              <div class="bg-white rounded-xl p-3 shadow-sm">
                <div class="text-2xl font-bold text-purple-600">${historyData.student.level}</div>
                <div class="text-sm text-gray-600 font-medium">Nível</div>
              </div>
            </div>
            <div class="text-center">
              <div class="bg-white rounded-xl p-3 shadow-sm">
                <div class="text-2xl font-bold text-indigo-600">${historyData.totalEntries}</div>
                <div class="text-sm text-gray-600 font-medium">Registros</div>
              </div>
            </div>
            <div class="text-center">
              <div class="bg-white rounded-xl p-3 shadow-sm">
                <div class="text-2xl font-bold text-green-600">${historyData.history.filter(h => h.type === 'reward').length}</div>
                <div class="text-sm text-gray-600 font-medium">Recompensas</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Conteúdo principal -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-lg font-bold text-gray-800 flex items-center">
                <i class="fas fa-timeline mr-2 text-blue-500"></i>
                Timeline de Ações
              </h4>
              ${historyData.history.length > 0 ? `
                <div class="text-sm text-gray-500">
                  ${historyData.history.length} registro${historyData.history.length !== 1 ? 's' : ''} encontrado${historyData.history.length !== 1 ? 's' : ''}
                </div>
              ` : ''}
            </div>
            <div class="space-y-4 history-container">
              ${historyHTML}
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t">
          <button id="close-modal-btn" class="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
            <i class="fas fa-times mr-2"></i>Fechar Histórico
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => document.body.removeChild(modal);

    modal.querySelector('#close-btn').addEventListener('click', closeModal);
    modal.querySelector('#close-modal-btn').addEventListener('click', closeModal);

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

  } catch (err) {
    alert(`Erro ao carregar histórico: ${err.message}`);
  }
}
