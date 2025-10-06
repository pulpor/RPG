// Modal de Feedback Automático com Gemini AI
// Arquivo: feedback-modal.js

export class FeedbackModal {
    constructor() {
        this.modal = null;
        this.isOpen = false;
    }

    /**
     * Exibe o modal de feedback automático
     * @param {Object} feedbackData - Dados do feedback gerado pelo Gemini
     * @param {Object} submissionInfo - Informações da submissão
     */
    show(feedbackData, submissionInfo = {}) {
        this.create(feedbackData, submissionInfo);
        this.open();
    }

    /**
     * Cria o modal de feedback
     * @param {Object} feedbackData - Dados do feedback
     * @param {Object} submissionInfo - Informações da submissão
     */
    create(feedbackData, submissionInfo) {
        // Remover modal existente se houver
        this.destroy();

        // Criar overlay
        this.modal = document.createElement('div');
        this.modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50';
        this.modal.onclick = (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        };

        // Criar conteúdo do modal
        const modalContent = document.createElement('div');
        modalContent.className = `
            bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] 
            overflow-hidden flex flex-col transform transition-all duration-300 scale-95 opacity-0
        `;

        modalContent.innerHTML = this.buildModalHTML(feedbackData, submissionInfo);
        this.modal.appendChild(modalContent);

        // Adicionar event listeners
        this.addEventListeners();

        // Adicionar ao DOM
        document.body.appendChild(this.modal);

        // Animar entrada
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    }

    /**
     * Constrói o HTML do modal
     * @param {Object} feedbackData - Dados do feedback
     * @param {Object} submissionInfo - Informações da submissão
     * @returns {string} - HTML do modal
     */
    buildModalHTML(feedbackData, submissionInfo) {
        const mission = submissionInfo.missionTitle || 'Missão';
        const files = submissionInfo.files || [];
        const timestamp = new Date(feedbackData.timestamp || Date.now()).toLocaleString('pt-BR');

        let feedbackContent = '';
        
        if (feedbackData.success) {
            feedbackContent = this.formatFeedback(feedbackData.feedback);
        } else {
            feedbackContent = `
                <div class="p-6 text-center">
                    <div class="mb-4">
                        <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Erro ao Gerar Feedback
                    </h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">
                        Não foi possível gerar o feedback automático neste momento.
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-500">
                        Erro: ${feedbackData.error || 'Erro desconhecido'}
                    </p>
                </div>
            `;
        }

        return `
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <i class="fas fa-robot text-lg"></i>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold">🤖 Feedback Automático IA</h2>
                            <p class="text-blue-100 text-sm">Análise inteligente da sua submissão</p>
                        </div>
                    </div>
                    <button 
                        id="close-feedback-modal" 
                        class="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors"
                        title="Fechar"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Informações da Submissão -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span class="font-medium text-gray-600 dark:text-gray-300">Missão:</span>
                        <p class="text-gray-800 dark:text-gray-200 font-semibold">${mission}</p>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600 dark:text-gray-300">Arquivos:</span>
                        <p class="text-gray-800 dark:text-gray-200">${files.length} arquivo(s)</p>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600 dark:text-gray-300">Analisado em:</span>
                        <p class="text-gray-800 dark:text-gray-200">${timestamp}</p>
                    </div>
                </div>
                
                ${files.length > 0 ? `
                    <div class="mt-3">
                        <span class="font-medium text-gray-600 dark:text-gray-300">Arquivos analisados:</span>
                        <div class="flex flex-wrap gap-2 mt-1">
                            ${files.map(file => `
                                <span class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                                    <i class="fas fa-file-code mr-1"></i>${file.name || file}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- Conteúdo do Feedback -->
            <div class="flex-1 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                ${feedbackContent}
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                        <i class="fas fa-lightbulb text-yellow-500 mr-1"></i>
                        ${feedbackData.isDemoFeedback ? 
                            'Este é um feedback de demonstração. Configure a API do Gemini para análise personalizada.' : 
                            'Este feedback foi gerado automaticamente pela IA e pode conter sugestões para melhoria.'
                        }
                    </div>
                    <div class="flex space-x-2">
                        <button 
                            id="copy-feedback-btn" 
                            class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
                        >
                            <i class="fas fa-copy mr-1"></i>Copiar
                        </button>
                        <button 
                            id="close-feedback-btn" 
                            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                            <i class="fas fa-check mr-1"></i>Entendi
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Formata o feedback do Gemini para exibição
     * @param {string} feedback - Feedback bruto do Gemini
     * @returns {string} - Feedback formatado em HTML
     */
    formatFeedback(feedback) {
        // Converter markdown simples para HTML
        let formattedFeedback = feedback
            // Headers
            .replace(/### (.*)/g, '<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6 flex items-center"><span class="mr-2">$1</span></h3>')
            .replace(/## (.*)/g, '<h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 mt-6">$1</h2>')
            .replace(/# (.*)/g, '<h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800 dark:text-gray-200">$1</strong>')
            // Lists
            .replace(/^- (.*)/gm, '<li class="ml-4 mb-2 text-gray-700 dark:text-gray-300">• $1</li>')
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm text-gray-800 dark:text-gray-200">$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm text-gray-800 dark:text-gray-200">$1</code>')
            // Line breaks
            .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 dark:text-gray-300">')
            .replace(/\n/g, '<br>');

        // Envolver em parágrafo se não começar com tag HTML
        if (!formattedFeedback.startsWith('<')) {
            formattedFeedback = '<p class="mb-4 text-gray-700 dark:text-gray-300">' + formattedFeedback + '</p>';
        }

        return `<div class="p-6 prose prose-sm max-w-none dark:prose-invert">${formattedFeedback}</div>`;
    }

    /**
     * Adiciona event listeners do modal
     */
    addEventListeners() {
        // Botão fechar (X)
        const closeBtn = this.modal.querySelector('#close-feedback-modal');
        if (closeBtn) {
            closeBtn.onclick = () => this.close();
        }

        // Botão fechar (Entendi)
        const closeFooterBtn = this.modal.querySelector('#close-feedback-btn');
        if (closeFooterBtn) {
            closeFooterBtn.onclick = () => this.close();
        }

        // Botão copiar feedback
        const copyBtn = this.modal.querySelector('#copy-feedback-btn');
        if (copyBtn) {
            copyBtn.onclick = () => this.copyFeedback();
        }

        // ESC para fechar
        this.handleEscape = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };
        document.addEventListener('keydown', this.handleEscape);
    }

    /**
     * Copia o feedback para a área de transferência
     */
    async copyFeedback() {
        try {
            const feedbackContent = this.modal.querySelector('.prose');
            if (feedbackContent) {
                const text = feedbackContent.textContent || feedbackContent.innerText;
                await navigator.clipboard.writeText(text);
                
                const copyBtn = this.modal.querySelector('#copy-feedback-btn');
                if (copyBtn) {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check mr-1"></i>Copiado!';
                    copyBtn.classList.add('bg-green-600', 'text-white');
                    copyBtn.classList.remove('bg-gray-200', 'dark:bg-gray-600', 'text-gray-700', 'dark:text-gray-300');
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.classList.remove('bg-green-600', 'text-white');
                        copyBtn.classList.add('bg-gray-200', 'dark:bg-gray-600', 'text-gray-700', 'dark:text-gray-300');
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Erro ao copiar feedback:', error);
        }
    }

    /**
     * Abre o modal
     */
    open() {
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    /**
     * Fecha o modal
     */
    close() {
        if (!this.modal) return;

        const modalContent = this.modal.querySelector('div');
        if (modalContent) {
            modalContent.classList.add('scale-95', 'opacity-0');
            modalContent.classList.remove('scale-100', 'opacity-100');
        }

        setTimeout(() => {
            this.destroy();
        }, 300);
    }

    /**
     * Destrói o modal
     */
    destroy() {
        if (this.modal) {
            document.body.removeChild(this.modal);
            this.modal = null;
        }
        
        if (this.handleEscape) {
            document.removeEventListener('keydown', this.handleEscape);
        }
        
        this.isOpen = false;
        document.body.style.overflow = '';
    }
}

// Instância singleton para uso global
export const feedbackModal = new FeedbackModal();
