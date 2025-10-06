// Sistema de Feedback Automático com Gemini AI
// Arquivo: gemini.js

export class GeminiAPI {
    constructor() {
        this.baseUrl = 'http://localhost:3000/gemini';
    }

    /**
     * Analisa arquivos de código e gera feedback automático
     * @param {Array} files - Array de arquivos para analisar
     * @param {Object} missionContext - Contexto da missão (título, descrição, objetivos)
     * @returns {Promise<Object>} - Feedback gerado pelo Gemini
     */
    async analyzeSubmission(files, missionContext = {}) {
        try {
            // Preparar o conteúdo dos arquivos
            const filesContent = await this.prepareFilesContent(files);

            // Fazer a requisição para o backend
            const response = await this.callBackendAPI(filesContent, missionContext);

            return response;
        } catch (error) {
            console.error('Erro ao analisar submissão com Gemini:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Prepara o conteúdo dos arquivos para análise
     * @param {Array} files - Array de arquivos (File objects ou objetos mockFiles)
     * @returns {Promise<Array>} - Conteúdo dos arquivos formatado
     */
    async prepareFilesContent(files) {
        const filesContent = [];

        for (const file of files) {
            try {
                // Se o arquivo já tem conteúdo (mockFile), usar diretamente
                if (file.content) {
                    filesContent.push({
                        name: file.name,
                        type: file.type || this.getFileType(file.name),
                        size: file.size,
                        content: file.content
                    });
                } else {
                    // Se é um File object real, ler o conteúdo
                    const content = await this.readFileContent(file);
                    filesContent.push({
                        name: file.name,
                        type: this.getFileType(file.name),
                        size: file.size,
                        content: content
                    });
                }
            } catch (error) {
                console.warn(`Erro ao ler arquivo ${file.name}:`, error);
                filesContent.push({
                    name: file.name,
                    type: file.type || this.getFileType(file.name),
                    size: file.size || 0,
                    content: '[Erro ao ler arquivo]',
                    error: error.message
                });
            }
        }

        return filesContent;
    }

    /**
     * Lê o conteúdo de um arquivo
     * @param {File} file - Arquivo para ler
     * @returns {Promise<string>} - Conteúdo do arquivo
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                resolve(e.target.result);
            };

            reader.onerror = (e) => {
                reject(new Error('Erro ao ler arquivo'));
            };

            // Verificar se é um arquivo de texto
            if (this.isTextFile(file.name)) {
                reader.readAsText(file);
            } else {
                // Para arquivos binários, retornar informações básicas
                resolve(`[Arquivo binário: ${file.name}, Tamanho: ${file.size} bytes]`);
            }
        });
    }

    /**
     * Faz a chamada para o backend que se comunica com o Gemini API
     * @param {Array} filesContent - Conteúdo dos arquivos
     * @param {Object} missionContext - Contexto da missão
     * @returns {Promise<Object>} - Resposta do backend
     */
    async callBackendAPI(filesContent, missionContext) {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${this.baseUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    files: filesContent,
                    missionContext: missionContext
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Se a API Key não está configurada (503) ou backend não disponível (404/500), usar fallback
                if (errorData.useFallback || errorData.error === 'API_KEY_NOT_CONFIGURED' ||
                    response.status === 404 || response.status === 500 || response.status === 503) {
                    console.warn('⚠️ API Gemini não disponível, usando feedback de demonstração');
                    return this.generateFallbackFeedback(filesContent, missionContext);
                }

                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            // Se não conseguir conectar ao backend, usar fallback
            if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
                console.warn('Backend não disponível, usando feedback de demonstração');
                return this.generateFallbackFeedback(filesContent, missionContext);
            }
            throw error;
        }
    }

    /**
     * Gera feedback de demonstração quando o backend não está disponível
     * @param {Array} filesContent - Conteúdo dos arquivos
     * @param {Object} missionContext - Contexto da missão
     * @returns {Object} - Feedback de demonstração
     */
    generateFallbackFeedback(filesContent, missionContext) {
        const mission = missionContext.title || 'Missão';
        const fileCount = filesContent.length;

        return {
            success: true,
            feedback: `
# 📊 **Pontuação Geral**: 85/100

## ✅ **Pontos Positivos**
- Código bem estruturado e organizado
- Bom uso de comentários para explicar a lógica
- Implementação funcional das funcionalidades principais
- ${fileCount > 1 ? 'Boa separação de responsabilidades entre arquivos' : 'Código concentrado e focado'}

## ⚠️ **Áreas de Melhoria**
- Considere adicionar validação de entrada mais robusta
- Algumas funções poderiam ser quebradas em partes menores
- Adicione tratamento de erros mais específico
- Considere usar const/let em vez de var quando aplicável

## 💡 **Sugestões Detalhadas**
- **Validação**: Implemente verificações para entradas inválidas
- **Modularização**: Divida funções grandes em funções menores e mais específicas
- **Documentação**: Adicione JSDoc para funções principais
- **Testes**: Considere escrever testes unitários para suas funções

## 🎯 **Cumprimento dos Objetivos**
Sua submissão para "${mission}" demonstra compreensão sólida dos conceitos fundamentais. Os objetivos principais foram alcançados com implementação funcional.

## 📚 **Recursos Recomendados**
- [MDN Web Docs](https://developer.mozilla.org/) - Documentação completa sobre JavaScript
- [JavaScript.info](https://javascript.info/) - Tutorial interativo de JavaScript
- [Clean Code Principles](https://blog.cleancoder.com/) - Boas práticas de programação

---

## � **Como ativar análise com IA personalizada:**

**Este é um feedback de demonstração.** Para análise inteligente e personalizada com Google Gemini AI:

1. **Obtenha uma API Key gratuita:** https://makersuite.google.com/app/apikey
2. **Configure no backend:** Edite o arquivo \`backend/.env\`
3. **Adicione sua chave:** \`GEMINI_API_KEY=SUA_CHAVE_AQUI\`
4. **Reinicie o servidor:** \`cd backend && node server.js\`

📖 **Guia completo:** Leia o arquivo \`GEMINI_SETUP.md\` na raiz do projeto

Após configurar, você terá análises inteligentes e específicas para cada código! 🚀
            `,
            timestamp: new Date().toISOString(),
            isDemoFeedback: true
        };
    }

    /**
     * Determina o tipo de arquivo baseado na extensão
     * @param {string} filename - Nome do arquivo
     * @returns {string} - Tipo do arquivo
     */
    getFileType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const types = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'sass': 'sass',
            'json': 'json',
            'xml': 'xml',
            'md': 'markdown',
            'txt': 'text',
            'sql': 'sql'
        };
        return types[extension] || 'text';
    }

    /**
     * Verifica se um arquivo é de texto (pode ser lido como string)
     * @param {string} filename - Nome do arquivo
     * @returns {boolean} - True se for arquivo de texto
     */
    isTextFile(filename) {
        const textExtensions = [
            'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs',
            'html', 'css', 'scss', 'sass', 'json', 'xml', 'md', 'txt', 'sql', 'yml', 'yaml',
            'ini', 'conf', 'config', 'log', 'csv', 'sh', 'bat', 'ps1'
        ];
        const extension = filename.split('.').pop().toLowerCase();
        return textExtensions.includes(extension);
    }
}

// Instância singleton para uso global
export const gemini = new GeminiAPI();
