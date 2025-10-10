const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');

// Carregar dotenv se necessário
try {
    if (!process.env.GEMINI_API_KEY) {
        require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
    }
} catch (e) {
    console.warn('[GEMINI] Falha ao carregar dotenv:', e?.message);
}

// Importar SDK do Google Generative AI
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializar cliente do Gemini 2.5-Flash
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

const GEMINI_MODEL = "gemini-2.5-flash";

console.log('[GEMINI] Configuração carregada:');
console.log(`   Modelo: ${GEMINI_MODEL}`);
console.log(`   API Key configurada: ${genAI ? 'SIM ✅' : 'NÃO ❌'}`);

/**
 * Endpoint para análise de código com Gemini 2.5-Flash
 * POST /gemini/analyze
 */
router.post('/analyze', autenticar, async (req, res) => {
    console.log('\n==========================================');
    console.log(`🤖 [${GEMINI_MODEL}] Análise de código iniciada`);
    console.log('   User:', req.user?.username);
    console.log('   Files recebidos:', req.body?.files?.length || 0);
    console.log('==========================================\n');

    try {
        const { files, missionContext } = req.body;

        // Validar entrada
        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Arquivos são obrigatórios para análise'
            });
        }

        // Verificar se a API key está configurada
        if (!genAI) {
            console.log('⚠️ API Key não configurada, usando modo demonstração');
            return res.json({
                success: true,
                feedback: generateDemoFeedback(files, missionContext),
                model: 'demo',
                timestamp: new Date().toISOString()
            });
        }

        try {
            console.log(`🚀 Usando modelo: ${GEMINI_MODEL}`);

            // Obter o modelo Gemini 2.5-Flash
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

            // Construir prompt detalhado
            const prompt = buildAnalysisPrompt(files, missionContext);

            console.log('📤 Enviando requisição para Gemini 2.5-Flash...');

            // Gerar conteúdo
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const feedback = response.text();

            console.log('✅ Feedback gerado com sucesso pela IA!');
            console.log(`   Tamanho: ${feedback.length} caracteres\n`);

            return res.json({
                success: true,
                feedback: feedback,
                model: GEMINI_MODEL,
                timestamp: new Date().toISOString()
            });

        } catch (apiError) {
            console.error('❌ Erro na API do Gemini:', apiError.message);

            // Fallback para modo demonstração
            console.log('🔄 Usando modo demonstração como fallback');
            return res.json({
                success: true,
                feedback: generateDemoFeedback(files, missionContext),
                model: 'demo-fallback',
                timestamp: new Date().toISOString(),
                error: apiError.message
            });
        }

    } catch (err) {
        console.error('❌ Erro ao processar submissão:', err);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: err.message
        });
    }
});

/**
 * Rota de teste para verificar conexão com Gemini 2.5-Flash
 * GET /gemini/test
 */
router.get('/test', async (req, res) => {
    try {
        if (!genAI) {
            return res.json({
                success: false,
                error: 'API Key não configurada',
                message: 'Configure GEMINI_API_KEY no arquivo .env'
            });
        }

        console.log(`🧪 Testando conexão com ${GEMINI_MODEL}...`);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContent("Diga 'Olá, estou funcionando!' em português.");
        const response = await result.response;
        const text = response.text();

        console.log('✅ Teste bem-sucedido!');

        return res.json({
            success: true,
            message: `API do ${GEMINI_MODEL} está funcionando!`,
            model: GEMINI_MODEL,
            response: text
        });

    } catch (error) {
        console.error('❌ Erro ao testar:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Erro ao testar API do Gemini'
        });
    }
});

/**
 * Constrói o prompt para análise do Gemini
 */
function buildAnalysisPrompt(files, missionContext) {
    const mission = missionContext?.title || 'Missão não especificada';
    const description = missionContext?.description || '';

    let prompt = `# Análise de Submissão de Código - Sistema Educacional RPG

## Contexto da Missão
**Título:** ${mission}
**Descrição:** ${description}

## Arquivos Submetidos
`;

    files.forEach((file, index) => {
        prompt += `
### Arquivo ${index + 1}: ${file.name}
**Tipo:** ${file.type || 'text'}

\`\`\`${file.type || 'javascript'}
${file.content || '[Conteúdo não disponível]'}
\`\`\`
`;
    });

    prompt += `

## Tarefa de Análise

Por favor, analise os arquivos submetidos e forneça um feedback educacional detalhado seguindo esta estrutura:

### 📊 **Pontuação Geral**: [0-100]

### ✅ **Pontos Positivos**
- Liste pelo menos 3 aspectos bons do código
- Seja específico e encoraje o aluno

### 🔍 **Áreas de Melhoria**
- Identifique problemas ou oportunidades de melhoria
- Explique POR QUÊ cada melhoria é importante
- Seja construtivo e educativo

### 💡 **Sugestões de Código**
- Se aplicável, mostre exemplos de como melhorar partes específicas
- Use blocos de código formatados

### 🎯 **Próximos Passos**
- Sugira 2-3 próximos desafios ou conceitos para o aluno aprender
- Relacione com a progressão natural do aprendizado

**IMPORTANTE:**
- Seja encorajador e positivo
- Use linguagem clara e acessível
- Formate usando Markdown
- Foque no aprendizado, não apenas em apontar erros
- Use emojis para tornar o feedback mais visual e engajante
`;

    return prompt;
}

/**
 * Gera um feedback de demonstração educativo quando a API não está disponível
 */
function generateDemoFeedback(files, missionContext) {
    const missionTitle = missionContext?.title || 'sua missão';
    const fileNames = files.map(f => f.name || 'arquivo.js').join(', ');

    let totalLines = 0;
    files.forEach(file => {
        if (file.content) {
            totalLines += file.content.split('\n').length;
        }
    });

    return `# 🎯 Análise Automática do Código

## 📊 Resumo da Submissão
Recebi e analisei seu código para **${missionTitle}**.

**Arquivos analisados:** ${fileNames}
**Total de linhas:** ${totalLines}
**Status:** ✅ Código recebido com sucesso

---

## 📊 **Pontuação Geral: 75/100**

---

## ✅ **Pontos Positivos**

### 🏆 Estrutura e Organização
- ✅ Código bem organizado e fácil de entender
- ✅ Uso apropriado de comentários explicativos
- ✅ Nomenclatura clara de variáveis e funções

### 💪 Implementação
- ✅ Lógica implementada corretamente
- ✅ Tratamento básico de casos de uso
- ✅ Interface funcional e intuitiva

---

## 🔍 **Áreas de Melhoria**

### 📚 Boas Práticas
1. **Validação de Entrada**
   - Adicione verificações para entradas inválidas
   - Trate casos especiais (divisão por zero, valores negativos, etc.)

2. **Tratamento de Erros**
   \`\`\`javascript
   try {
       // seu código aqui
   } catch (error) {
       console.error('Erro:', error.message);
   }
   \`\`\`

3. **Melhorias de UX**
   - Adicione feedback visual para o usuário
   - Considere adicionar animações suaves

---

## 💡 **Sugestões de Código**

### Exemplo de validação melhorada:
\`\`\`javascript
function calcular(operacao, num1, num2) {
    // Validar entradas
    if (typeof num1 !== 'number' || typeof num2 !== 'number') {
        throw new Error('Números inválidos');
    }
    
    // Validar divisão por zero
    if (operacao === 'dividir' && num2 === 0) {
        throw new Error('Não é possível dividir por zero');
    }
    
    // Realizar operação
    switch(operacao) {
        case 'somar': return num1 + num2;
        case 'subtrair': return num1 - num2;
        case 'multiplicar': return num1 * num2;
        case 'dividir': return num1 / num2;
        default: throw new Error('Operação inválida');
    }
}
\`\`\`

---

## 🎯 **Próximos Passos**

1. **Implementar as melhorias sugeridas** - Comece pelas validações básicas
2. **Testar diferentes cenários** - Tente quebrar seu código para encontrar bugs
3. **Adicionar funcionalidades extras** - Pense em recursos que agregam valor
4. **Refatorar se necessário** - Código limpo é código feliz! 😊

---

## 🎓 **Conclusão**

Parabéns pela submissão! 🎉 Você demonstrou boa compreensão dos conceitos básicos. Continue praticando e implementando as melhorias sugeridas para evoluir ainda mais.

**Nota:** Este é um feedback de demonstração. Configure a API do Gemini 2.5-Flash para receber análises personalizadas por IA!

---

**Dica final:** A prática leva à perfeição. Continue codificando! 💻✨
`;
}

module.exports = router;
