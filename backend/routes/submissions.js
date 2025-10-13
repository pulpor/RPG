const express = require('express');
const router = express.Router();

const { autenticar, ehMestre } = require('../middleware/auth');
const { upload } = require('../utils/armazenamentoArquivos');

router.post('/submit', autenticar, upload, async (req, res) => {
  console.log('🔵 [UPLOAD] Iniciando processamento de submissão...');
  try {
    console.log('🔵 [UPLOAD] Body:', req.body);
    console.log('🔵 [UPLOAD] File:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : 'Nenhum arquivo');
    console.log('🔵 [UPLOAD] User:', req.user ? {
      userId: req.user.userId,
      username: req.user.username,
      role: req.user.role
    } : 'Usuário não autenticado');

    const { missionId } = req.body;
    const userId = req.user.userId;
    const username = req.user.username;

    if (!missionId) {
      return res.status(400).json({ error: 'ID da missão não fornecido' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
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

    res.json({
      message: 'Submissão enviada com sucesso para Firebase Storage',
      submission: submission
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

module.exports = router;