// Módulo para gerenciar toast notifications
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

// Configurações padrão para os toasts
const defaultConfig = {
    duration: 3000,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
        borderRadius: "8px",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "14px",
        fontWeight: "500",
    }
};

// Toast de sucesso
export function showSuccess(message, options = {}) {
    return Toastify({
        text: message,
        ...defaultConfig,
        style: {
            ...defaultConfig.style,
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
            ...options.style
        },
        ...options
    }).showToast();
}

// Toast de erro
export function showError(message, options = {}) {
    return Toastify({
        text: message,
        ...defaultConfig,
        duration: 5000, // Erros ficam mais tempo
        style: {
            ...defaultConfig.style,
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            ...options.style
        },
        ...options
    }).showToast();
}

// Toast de aviso
export function showWarning(message, options = {}) {
    return Toastify({
        text: message,
        ...defaultConfig,
        style: {
            ...defaultConfig.style,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
            ...options.style
        },
        ...options
    }).showToast();
}

// Toast de informação
export function showInfo(message, options = {}) {
    return Toastify({
        text: message,
        ...defaultConfig,
        style: {
            ...defaultConfig.style,
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            ...options.style
        },
        ...options
    }).showToast();
}

// Toast personalizado
export function showToast(message, type = 'info', options = {}) {
    switch (type) {
        case 'success':
            return showSuccess(message, options);
        case 'error':
            return showError(message, options);
        case 'warning':
            return showWarning(message, options);
        case 'info':
        default:
            return showInfo(message, options);
    }
}

// Toast com ícone personalizado
export function showToastWithIcon(message, icon, type = 'info', options = {}) {
    const iconHtml = `<i class="fas fa-${icon} mr-2"></i>${message}`;
    return showToast(iconHtml, type, {
        escapeMarkup: false,
        ...options
    });
}

// Toast de loading (para operações assíncronas)
export function showLoading(message = "Carregando...", options = {}) {
    return Toastify({
        text: `<i class="fas fa-spinner fa-spin mr-2"></i>${message}`,
        ...defaultConfig,
        duration: -1, // Não remove automaticamente
        escapeMarkup: false,
        style: {
            ...defaultConfig.style,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            ...options.style
        },
        ...options
    }).showToast();
}

// Função para substituir alerts simples
export function confirmAction(message, onConfirm, onCancel = null) {
    const confirmToast = Toastify({
        text: `
      <div class="toast-confirm">
        <div class="mb-2">${message}</div>
        <div class="flex space-x-2 justify-end">
          <button id="toast-confirm-yes" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
            <i class="fas fa-check mr-1"></i> Sim
          </button>
          <button id="toast-confirm-no" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
            <i class="fas fa-times mr-1"></i> Não
          </button>
        </div>
      </div>
    `,
        duration: -1,
        gravity: "center",
        position: "center",
        escapeMarkup: false,
        style: {
            background: "#ffffff",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            minWidth: "300px",
            padding: "16px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        },
        onClick: function () {
            // Não fechar ao clicar no toast
            return false;
        }
    }).showToast();

    // Adicionar event listeners após o toast aparecer
    setTimeout(() => {
        const yesBtn = document.getElementById('toast-confirm-yes');
        const noBtn = document.getElementById('toast-confirm-no');

        if (yesBtn) {
            yesBtn.addEventListener('click', () => {
                confirmToast.hideToast();
                if (onConfirm) onConfirm();
            });
        }

        if (noBtn) {
            noBtn.addEventListener('click', () => {
                confirmToast.hideToast();
                if (onCancel) onCancel();
            });
        }
    }, 100);

    return confirmToast;
}
