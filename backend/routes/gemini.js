const express = require('express');
const fetch = require('node-fetch');
// Fallback: garantir que .env seja carregado caso o servidor tenha sido iniciado sem carregar dotenv
try {
    if (!process.env.GEMINI_API_KEY) {
        require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
        console.log('[GEMINI ROUTE] dotenv carregado localmente. Chave presente agora?', process.env.GEMINI_API_KEY ? 'SIM' : 'NÃO');
    }
} catch (e) {
    console.warn('[GEMINI ROUTE] Falha ao carregar dotenv localmente:', e?.message);
}
const router = express.Router();
const { autenticar } = require('../middleware/auth');

// Endpoint para análise de código com Gemini AI
router.post('/analyze', autenticar, async (req, res) => {
    console.log('\n==========================================');
    console.log('🤖 [GEMINI] Rota /analyze foi CHAMADA!');
    console.log('🤖 [GEMINI] User:', req.user?.username);
    console.log('🤖 [GEMINI] Body keys:', Object.keys(req.body));
    console.log('🤖 [GEMINI] Files recebidos:', req.body?.files?.length || 0);
    console.log('==========================================')

    try {
        const { files, missionContext } = req.body;

        if (!files || !Array.isArray(files)) {
            console.log('❌ [GEMINI] Files inválidos:', files);
            return res.status(400).json({
                success: false,
                error: 'Arquivos são obrigatórios para análise'
            });
        }

        // Verificar se a API key está configurada
        const geminiApiKey = process.env.GEMINI_API_KEY;
        console.log('\n🔍 Verificando API Key do Gemini...');
        console.log('   - API Key presente:', geminiApiKey ? '✅ SIM' : '❌ NÃO');
        console.log('   - Tamanho da chave:', geminiApiKey ? geminiApiKey.length : 0);
        console.log('   - Primeiros 15 caracteres:', geminiApiKey ? geminiApiKey.substring(0, 15) + '...' : 'N/A');
        console.log('   - Últimos 10 caracteres:', geminiApiKey ? '...' + geminiApiKey.substring(geminiApiKey.length - 10) : 'N/A');

        if (!geminiApiKey || geminiApiKey.trim() === '') {
            console.log('⚠️ AVISO: API Key do Gemini não configurada. Usando feedback de demonstração.');
            // Retornar indicação de que deve usar fallback ao invés de erro
            return res.status(503).json({
                success: false,
                error: 'API_KEY_NOT_CONFIGURED',
                message: 'Chave da API Gemini não configurada. Configure em backend/.env para usar análise com IA.',
                useFallback: true
            });
        }

        console.log('✅ API Key configurada! Fazendo chamada ao Gemini...');

        // Construir o prompt para análise
        const prompt = buildAnalysisPrompt(files, missionContext);

        // Tentar múltiplos modelos compatíveis com a API v1, na ordem de preferência
        // Modelos mais recentes primeiro (Gemini 2.x), depois fallback para 1.5
        const modelCandidates = [
            'gemini-2.5-flash',      // Mais rápido e eficiente (2025)
            'gemini-2.0-flash',      // Alternativa rápida
            'gemini-2.5-pro',        // Mais avançado
            'gemini-1.5-flash',      // Fallback para contas antigas
            'gemini-1.5-pro',        // Fallback para contas antigas
            'gemini-pro'             // Fallback final
        ];

        let lastErrText = '';
        let tried404 = false;
        console.log('\n📋 Tentando modelos:', modelCandidates.join(', '));

        for (const model of modelCandidates) {
            const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiApiKey}`;
            console.log(`\n🚀 [TENTATIVA] Modelo: ${model}`);
            console.log(`   URL: ${url.replace(geminiApiKey, 'API_KEY_OCULTA')}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            });

            console.log(`📡 [RESPOSTA] Status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                lastErrText = errorText;
                console.error(`\n❌ [ERRO] Modelo ${model} falhou:`);
                console.error(`   Status: ${response.status}`);
                console.error(`   Resposta: ${safeTruncate(errorText, 500)}`);
                // Se for 404 (modelo não encontrado/não habilitado), tenta o próximo
                if (response.status === 404) {
                    console.warn(`   ⚠️ Modelo ${model} não disponível (404), tentando próximo...`);
                    tried404 = true;
                    continue;
                }
                // Para outros erros (quota, auth, etc), devolve erro imediatamente
                return res.status(response.status).json({
                    success: false,
                    error: 'GEMINI_API_ERROR',
                    status: response.status,
                    statusText: response.statusText,
                    details: safeTruncate(errorText),
                    timestamp: new Date().toISOString()
                });
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0]) {
                console.error(`❌ Resposta inválida para ${model}:`, JSON.stringify(data).slice(0, 500));
                continue;
            }

            const feedback = extractFeedbackText(data);
            console.log(`\n📝 [SUCESSO] Texto extraído do modelo ${model}:`);
            console.log(`   Tamanho: ${feedback ? feedback.length : 0} caracteres`);
            console.log(`   Preview: ${feedback ? feedback.substring(0, 100) + '...' : 'vazio'}`);

            if (!feedback) {
                console.error(`❌ Conteúdo vazio em ${model}:`, JSON.stringify(data).slice(0, 500));
                continue;
            }

            console.log('✅ [GEMINI] Análise concluída com sucesso!');
            console.log('==========================================\n');
            return res.json({
                success: true,
                model,
                feedback,
                timestamp: new Date().toISOString()
            });
        }

        // Se ambos retornaram 404, vamos consultar a lista de modelos disponíveis e tentar um suportado
        if (tried404) {
            console.log('🔎 Consultando modelos disponíveis via ListModels...');
            const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${geminiApiKey}`;
            try {
                const listResp = await fetch(listUrl, { method: 'GET' });
                if (!listResp.ok) {
                    const t = await listResp.text();
                    console.error('❌ Falha ao listar modelos:', t);
                } else {
                    const list = await listResp.json();
                    const models = Array.isArray(list.models) ? list.models : [];
                    console.log(`📋 Modelos retornados (${models.length}):`, models.slice(0, 5).map(m => ({ name: m.name, supported: m.supportedGenerationMethods })).slice(0, 5));

                    // Escolher um modelo que suporte generateContent
                    const preferredOrder = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro'];
                    // m.name vem como 'models/gemini-1.5-flash'
                    const normalize = (n) => n?.replace(/^models\//, '');
                    const findCandidate = () => {
                        for (const pref of preferredOrder) {
                            const hit = models.find(m => normalize(m.name) === pref && m.supportedGenerationMethods?.includes('generateContent'));
                            if (hit) return normalize(hit.name);
                        }
                        // fallback: qualquer um que suporte generateContent
                        const any = models.find(m => m.supportedGenerationMethods?.includes('generateContent'));
                        return any ? normalize(any.name) : null;
                    };

                    const dynamicModel = findCandidate();
                    if (dynamicModel) {
                        console.log(`🧭 Tentando modelo dinâmico: ${dynamicModel}`);
                        const dynUrl = `https://generativelanguage.googleapis.com/v1/models/${dynamicModel}:generateContent?key=${geminiApiKey}`;
                        const dynResp = await fetch(dynUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                                generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 }
                            })
                        });
                        console.log('📡 Resposta do Gemini (dinâmico):', dynResp.status, dynResp.statusText, `(${dynamicModel})`);
                        if (dynResp.ok) {
                            const data = await dynResp.json();
                            const feedback = extractFeedbackText(data);
                            console.log(`📝 Texto extraído (dinâmico ${dynamicModel}):`, feedback ? `${feedback.length} chars` : 'vazio');
                            if (feedback) {
                                return res.json({ success: true, model: dynamicModel, feedback, timestamp: new Date().toISOString() });
                            }
                        } else {
                            const t = await dynResp.text();
                            lastErrText = t;
                            console.error('❌ Modelo dinâmico falhou:', t);
                        }
                    } else {
                        console.warn('⚠️ Nenhum modelo com generateContent encontrado na conta.');
                    }
                }
            } catch (e) {
                console.error('❌ Erro ao consultar modelos:', e);
            }
        }

        // Se chegou aqui, nenhum modelo funcionou -> habilita fallback no frontend
        return res.status(503).json({
            success: false,
            error: 'MODEL_NOT_AVAILABLE',
            message: 'Nenhum modelo Gemini compatível encontrado para esta chave. Verifique permissões/limites da conta no Google AI Studio.',
            lastErrText: safeTruncate(lastErrText),
            useFallback: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao analisar código com Gemini:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Constrói o prompt para análise do Gemini
 */
function buildAnalysisPrompt(files, missionContext) {
    const mission = missionContext?.title || 'Missão não especificada';
    const description = missionContext?.description || '';

    let prompt = `
# Análise de Submissão de Código - Sistema Educacional RPG

## Contexto da Missão
**Título:** ${mission}
**Descrição:** ${description}

## Arquivos Submetidos
`;

    files.forEach((file, index) => {
        prompt += `
### Arquivo ${index + 1}: ${file.name}
**Tipo:** ${file.type || 'text'}
**Tamanho:** ${file.size || 0} bytes

\`\`\`${file.type || 'text'}
${file.content || '[Conteúdo não disponível]'}
\`\`\`

`;
    });

    prompt += `
## Tarefa de Análise

Por favor, analise os arquivos submetidos e forneça um feedback educacional detalhado seguindo esta estrutura:

### 📊 **Pontuação Geral**: [0-100]

### ✅ **Pontos Positivos**
- Liste os aspectos bem implementados
- Destaque boas práticas de programação
- Reconheça soluções criativas

### ⚠️ **Áreas de Melhoria**
- Identifique problemas no código
- Sugira melhorias específicas
- Aponte erros de sintaxe ou lógica

### 💡 **Sugestões Detalhadas**
- Forneça dicas práticas para melhorar
- Sugira recursos de aprendizado
- Indique próximos passos

### 🎯 **Cumprimento dos Objetivos**
- Avalie se a submissão atende aos requisitos da missão
- Identifique objetivos alcançados e não alcançados

### 📚 **Recursos Recomendados**
- Sugira materiais de estudo
- Indique documentações relevantes
- Recomende exercícios complementares

**Importante:** 
- Use linguagem encorajadora e educativa
- Seja específico nas sugestões
- Foque no aprendizado do aluno
- Use emojis para tornar o feedback mais visual e engajante
`;

    return prompt;
}

module.exports = router;

// Evita estourar log/JSON com mensagens enormes
function safeTruncate(text, max = 1200) {
    if (!text) return text;
    return text.length > max ? text.slice(0, max) + '...<truncated>' : text;
}

// Extrai texto dos candidatos do Gemini unificando diferentes formatos
function extractFeedbackText(data) {
    try {
        if (!data || !Array.isArray(data.candidates) || data.candidates.length === 0) return '';
        const cand = data.candidates[0];
        // 1) parts[].text concatenado
        const parts = cand?.content?.parts;
        if (Array.isArray(parts)) {
            const joined = parts.map(p => p?.text).filter(Boolean).join('\n');
            if (joined && joined.trim().length > 0) return joined.trim();
        }
        // 2) output_text (algumas libs expõem assim)
        if (cand.output_text && String(cand.output_text).trim().length > 0) {
            return String(cand.output_text).trim();
        }
        // 3) candidates[0].content como string direta (fallback raro)
        if (typeof cand.content === 'string' && cand.content.trim().length > 0) {
            return cand.content.trim();
        }
        return '';
    } catch (_) {
        return '';
    }
}
