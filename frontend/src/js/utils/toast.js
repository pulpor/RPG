// Módulo para gerenciar toast notifications (versão customizada sem dependências)

// Estilos CSS inline para os toasts
const toastStyles = `
.custom-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    font-family: Inter, system-ui, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: white;
    z-index: 10000;
    animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    word-wrap: break-word;
}

.custom-toast.success {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.custom-toast.error {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.custom-toast.warning {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.custom-toast.info {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}
`;

// Injetar estilos no documento (uma vez)
if (typeof document !== 'undefined' && !document.getElementById('custom-toast-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'custom-toast-styles';
    styleElement.textContent = toastStyles;
    document.head.appendChild(styleElement);
}

// Função base para criar toast
function createToast(message, type = 'info', duration = 3000) {
    if (typeof document === 'undefined') return;

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remover após duração + tempo de animação
    setTimeout(() => {
        toast.remove();
    }, duration + 300);
    
    return toast;
}

// Toast de sucesso
export function showSuccess(message, options = {}) {
    const duration = options.duration || 3000;
    return createToast(message, 'success', duration);
}

// Toast de erro
export function showError(message, options = {}) {
    const duration = options.duration || 5000; // Erros ficam mais tempo
    return createToast(message, 'error', duration);
}

// Toast de aviso
export function showWarning(message, options = {}) {
    const duration = options.duration || 3000;
    return createToast(message, 'warning', duration);
}

// Toast de informação
export function showInfo(message, options = {}) {
    const duration = options.duration || 3000;
    return createToast(message, 'info', duration);
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
    const iconText = `${icon} ${message}`;
    return showToast(iconText, type, options);
}

// Toast de loading (para operações assíncronas)
export function showLoading(message = "Carregando...", options = {}) {
    const duration = options.duration || -1; // Não remove automaticamente por padrão
    return createToast(`⏳ ${message}`, 'info', duration === -1 ? 10000 : duration);
}

// Função para substituir alerts simples
export function confirmAction(message, onConfirm, onCancel = null) {
    // Implementação simplificada usando confirm nativo
    // Em produção, você pode melhorar isso com um modal customizado
    const result = confirm(message);
    if (result && onConfirm) {
        onConfirm();
    } else if (!result && onCancel) {
        onCancel();
    }
    return result;
}
