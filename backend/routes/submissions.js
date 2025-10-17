const express = require('express');
const router = express.Router();

const { autenticar, ehMestre } = require('../middleware/auth');
const { upload } = require('../utils/armazenamentoArquivos');

router.post('/submit', autenticar, (req, res, next) => upload(req, res, next), async (req, res) => {
  console.log('🔵 [UPLOAD] Iniciando processamento de submissão...');
  try {
    console.log('🔵 [UPLOAD] Body:', req.body);
    console.log('🔵 [UPLOAD] File:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? `${req.file.buffer.length} bytes` : 'sem buffer',
      path: req.file.path
    } : 'Nenhum arquivo');
    console.log('🔵 [UPLOAD] User:', req.user ? {
      userId: req.user.userId,
      username: req.user.username,
      role: req.user.role
    } : 'Usuário não autenticado');

    const { missionId } = req.body;
    const userId = req.user?.userId;
    const username = req.user?.username;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado', details: 'Token inválido ou expirado' });
    }

    if (!missionId) {
      return res.status(400).json({ error: 'ID da missão não fornecido', suggestion: 'Envie missionId no formulário' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado', suggestion: 'Selecione um arquivo antes de enviar' });
    }

    console.log('🔵 [UPLOAD] MissionId:', missionId);
    console.log('🔵 [UPLOAD] UserId:', userId);

    // Importar os serviços necessários
    const submissionService = require('../services/submissionService');
    const missionService = require('../services/missionService');
    const userService = require('../services/userService');

    // Buscar informações da missão
    const mission = await missionService.getMissionById(missionId);
    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada' });
    }

    // Buscar informações do usuário
    const user = await userService.getUserById(userId.toString());
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Criar dados da submissão para Firebase Storage
    const submissionData = {
      userId: userId.toString(),
      username: user.username || username || 'Desconhecido', // Pegar do user, depois do token, ou usar padrão
      missionId: missionId,
      missionTitle: mission.titulo || mission.title || 'Missão sem título',
      masterUsername: mission.createdBy || user.masterUsername || 'desconhecido',
      status: 'pending',
      pending: true
    };

    console.log('🔵 [UPLOAD] Dados da submissão:', submissionData);

    // Criar a submissão no Firestore E fazer upload para Firebase Storage
    const submission = await submissionService.createSubmission(submissionData, [req.file]);

    console.log('✅ [UPLOAD] Submissão criada com sucesso:', submission.id);

    // Atualizar status da missão para 'pendente'
    console.log('🔄 [UPLOAD] Atualizando status da missão para pendente...');
    await missionService.updateMissionStatus(missionId, userId, 'pending');
    console.log('✅ [UPLOAD] Status da missão atualizado para pendente');

    // Gerar feedback automático com Gemini (em background, não bloqueia resposta)
    console.log('🤖 [UPLOAD] Gerando feedback automático com Gemini...');
    generateGeminiFeedback(submission, req.file, userService).catch(err => {
      console.error('❌ [GEMINI] Erro ao gerar feedback:', err.message);
    });

    res.json({
      message: '✅ Submissão enviada com sucesso! Aguardando análise do professor...',
      submission: submission,
      status: 'pending',
      feedback: 'Seu código será analisado automaticamente. Você receberá um feedback em breve!'
    });

  } catch (err) {
    console.error('❌ [UPLOAD] Erro no processamento da submissão:', err);
    console.error('❌ [UPLOAD] Stack:', err.stack);

    // Verificar se é erro de permissão do Firebase Storage
    if (err.code === 'storage/unauthorized') {
      return res.status(403).json({
        error: 'Erro de permissão no Firebase Storage',
        details: 'Configure as regras de segurança no Firebase Console: Storage > Rules',
        suggestion: 'Regras recomendadas: allow read, write: if request.auth != null;'
      });
    }

    res.status(500).json({
      error: 'Erro ao processar submissão',
      details: err.message
    });
  }
}); router.get('/my-submissions', autenticar, async (req, res) => {
  const userId = req.user.userId;
  console.log('[DEBUG] Buscando submissões do usuário:', userId);

  try {
    // Usar o serviço de submissões para Firebase
    const submissionService = require('../services/submissionService');
    const missionService = require('../services/missionService');

    // Buscar submissões do usuário pelo serviço
    const userSubmissions = await submissionService.getSubmissionsByUser(userId.toString());
    console.log('[DEBUG] Submissões encontradas:', userSubmissions.length);

    // Enriquecer com dados de missões
    const enrichedSubmissions = await Promise.all(userSubmissions.map(async (sub) => {
      const mission = await missionService.getMissionById(sub.missionId);
      return {
        ...sub,
        missionTitle: mission ? (mission.titulo || mission.title || 'Missão Desconhecida') : 'Missão Desconhecida',
        missionDescription: mission ? mission.description : ''
      };
    }));

    console.log('[DEBUG] Submissões do usuário enriquecidas:', enrichedSubmissions.length);
    res.json(enrichedSubmissions);
  } catch (err) {
    console.error('[DEBUG] Erro na rota GET /my-submissions:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});

router.get('/', autenticar, ehMestre, async (req, res) => {
  console.log('[DEBUG] Rota GET /submissoes chamada');
  console.log('[DEBUG] Usuário autenticado:', req.user);

  try {
    // Usar o serviço de submissões para Firebase
    const submissionService = require('../services/submissionService');
    const userService = require('../services/userService');
    const missionService = require('../services/missionService');

    // Obter informações completas do mestre
    const master = await userService.getUserById(req.user.userId);
    if (!master) {
      return res.status(404).json({ error: 'Mestre não encontrado' });
    }

    console.log('[DEBUG] Mestre logado:', master.username);

    // Filtrar submissões APENAS dos alunos deste mestre
    const filters = { masterUsername: master.username };

    // Buscar submissões pelo serviço
    const allSubmissions = await submissionService.getAllSubmissions(filters);
    console.log('[DEBUG] Total de submissões do mestre', master.username, ':', allSubmissions.length);

    // Enriquecer com dados de usuários e missões
    const enrichedSubmissions = await Promise.all(allSubmissions.map(async (sub) => {
      console.log('[DEBUG] Processando submissão:', sub.id);

      const user = await userService.getUserById(sub.userId);
      const mission = await missionService.getMissionById(sub.missionId);

      console.log('[DEBUG] Usuário encontrado:', user ? user.username : 'não encontrado');
      console.log('[DEBUG] Missão encontrada:', mission ? (mission.titulo || mission.title || 'não encontrada') : 'não encontrada');

      return {
        ...sub,
        username: user ? user.username : 'Desconhecido',
        userClass: user ? user.class : 'N/A',
        userYear: user ? user.year : 'N/A',
        userTurma: user ? (user.assignedTurma || user.turma || 'Sem turma') : 'Sem turma',
        missionTitle: mission ? (mission.titulo || mission.title || 'Desconhecida') : 'Desconhecida',
        missionDescription: mission ? (mission.descricao || mission.description || '') : ''
      };
    }));

    console.log('[DEBUG] Submissões enriquecidas:', enrichedSubmissions.length);
    res.json(enrichedSubmissions);
  } catch (err) {
    console.error('[DEBUG] Erro na rota GET /submissoes:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});

router.post('/:id/approve', autenticar, ehMestre, async (req, res) => {
  const submissionId = req.params.id;
  const { feedback } = req.body;

  console.log('[DEBUG] Aprovando submissão:', submissionId);

  try {
    // Usar serviços Firebase
    const submissionService = require('../services/submissionService');
    const userService = require('../services/userService');

    // Buscar submissão por ID
    const submission = await submissionService.getSubmissionById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submissão não encontrada' });
    }

    // Buscar usuário relacionado
    const user = await userService.getUserById(submission.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar XP apenas se a submissão não foi completada antes
    const wasAlreadyCompleted = submission.completed;

    // Aprovar a submissão
    const updatedSubmission = await submissionService.approveSubmission(submissionId, {
      feedback: feedback || '',
      xpAwarded: submission.xp || 0
    });

    // Atualizar XP apenas se a missão não foi completada antes
    let updatedUser = user;
    if (!wasAlreadyCompleted) {
      // Adicionar XP ao usuário
      updatedUser = await userService.addXP(user.id, submission.xp || 0);

      // Registrar no histórico do usuário
      const historyEntry = {
        type: 'mission_approved',
        missionId: submission.missionId,
        missionTitle: submission.missionTitle || 'Missão',
        xpGained: submission.xp || 0,
        feedback: feedback || '',
        appliedBy: req.user.userId,
        appliedAt: new Date().toISOString()
      };

      // Adicionar ao histórico
      const history = Array.isArray(user.history) ? [...user.history] : [];
      history.push(historyEntry);

      // Atualizar histórico do usuário
      updatedUser = await userService.updateUser(user.id, { history });
    }

    console.log('[DEBUG] Submissão aprovada com sucesso:', submissionId);
    res.json({
      submission: updatedSubmission,
      user: { ...updatedUser, password: undefined }
    });
  } catch (err) {
    console.error('[DEBUG] Erro ao aprovar submissão:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});

router.post('/:id/reject', autenticar, ehMestre, async (req, res) => {
  const submissionId = req.params.id;
  const { feedback } = req.body;

  console.log('[DEBUG] Rejeitando submissão:', submissionId);

  try {
    // Usar serviços Firebase
    const submissionService = require('../services/submissionService');
    const userService = require('../services/userService');

    // Buscar submissão por ID
    const submission = await submissionService.getSubmissionById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submissão não encontrada' });
    }

    // Buscar usuário relacionado
    const user = await userService.getUserById(submission.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Rejeitar a submissão
    const updatedSubmission = await submissionService.rejectSubmission(submissionId, feedback || '');

    // Registrar no histórico do usuário
    const historyEntry = {
      type: 'mission_rejected',
      missionId: submission.missionId,
      missionTitle: submission.missionTitle || 'Missão',
      feedback: feedback || '',
      appliedBy: req.user.userId,
      appliedAt: new Date().toISOString()
    };

    // Adicionar ao histórico
    const history = Array.isArray(user.history) ? [...user.history] : [];
    history.push(historyEntry);

    // Atualizar histórico do usuário
    const updatedUser = await userService.updateUser(user.id, { history });

    console.log('[DEBUG] Submissão rejeitada com sucesso:', submissionId);
    res.json({
      message: 'Submissão rejeitada',
      submission: updatedSubmission
    });
  } catch (err) {
    console.error('[DEBUG] Erro ao rejeitar submissão:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 🤖 FUNÇÃO AUXILIAR: Gerar Feedback Automático com Gemini
// ═══════════════════════════════════════════════════════════════════════════

async function generateGeminiFeedback(submission, file, userService) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const fs = require('fs').promises;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('[GEMINI] API Key não configurada. Pulando feedback automático.');
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    console.log('🤖 [GEMINI] Gerando feedback para submissão:', submission.id);

    // Ler conteúdo do arquivo
    let fileContent = '';
    if (file.buffer) {
      fileContent = file.buffer.toString('utf-8');
    } else if (file.path) {
      fileContent = await fs.readFile(file.path, 'utf-8');
    }

    if (!fileContent) {
      console.log('[GEMINI] Arquivo vazio. Pulando análise.');
      return;
    }

    // Limitar tamanho do conteúdo para análise (Gemini tem limite)
    const maxLength = 8000;
    if (fileContent.length > maxLength) {
      fileContent = fileContent.substring(0, maxLength) + '\n\n[... arquivo truncado ...]';
    }

    // Prompt para o Gemini analisar o código
    const prompt = `Você é um professor de programação experiente. Um aluno enviou este código para a missão "${submission.missionTitle}".

Por favor, forneça um feedback conciso e construtivo em português (máximo 3-4 frases):
1. Cite 1 ponto positivo do código
2. Cite 1 ponto que pode melhorar
3. Dê uma dica prática

Seja encorajador e educativo. Formato desejado:
✅ Ponto Positivo: ...
💡 Melhoria: ...
🎯 Dica: ...

CÓDIGO ENVIADO:
\`\`\`
${fileContent}
\`\`\``;

    // Chamar Gemini
    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    console.log('✅ [GEMINI] Feedback gerado:', feedback.substring(0, 100) + '...');

    // Salvar feedback no Firestore (em uma coleção separada)
    const submissionService = require('../services/submissionService');
    await submissionService.updateSubmission(submission.id, {
      geminiFeedback: feedback,
      feedbackGeneratedAt: new Date().toISOString()
    });

    console.log('✅ [GEMINI] Feedback salvo na submissão');

  } catch (error) {
    console.error('❌ [GEMINI] Erro ao gerar feedback:', error.message);
    // Não lança erro para não bloquear o fluxo principal
  }
}

module.exports = router;