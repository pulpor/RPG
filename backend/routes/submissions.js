const express = require('express');
const router = express.Router();

const { autenticar, ehMestre } = require('../middleware/auth');
const { upload } = require('../utils/armazenamentoArquivos');

router.post('/submit', autenticar, upload, async (req, res) => {
  try {
    const { missionId } = req.body;
    const userId = req.user.userId;
    console.log('Processando submissão:', { missionId, userId, files: req.files, body: req.body });

    // Buscar informações do usuário e missão usando serviços Firebase
    const userService = require('../services/userService');
    const missionService = require('../services/missionService');

    // Obter usuário
    const user = await userService.getUserById(userId.toString());
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Obter missão
    const mission = await missionService.getMissionById(missionId.toString());
    if (!mission) {
      return res.status(404).json({ error: 'Missão não encontrada' });
    }

    // Preparar dados da submissão
    const submissionData = {
      userId: userId.toString(),
      username: user.username,
      masterUsername: user.masterUsername,
      missionId: missionId.toString(),
      submittedAt: new Date().toISOString(),
      pending: true,
      status: 'pending',
      missionTitle: mission.titulo || mission.title || 'Missão sem título',
      xp: mission.xp,
      completed: false
    };

    // Usar o serviço de submissões para Firebase
    const submissionService = require('../services/submissionService');
    const files = req.files && req.files.code ? req.files.code : [];
    const result = await submissionService.createSubmission(submissionData, files);

    console.log('✅ Submissão enviada com sucesso:', result.id);
    res.json({ message: 'Submissão enviada com sucesso', id: result.id });
  } catch (err) {
    console.error('❌ Erro ao processar submissão:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/my-submissions', autenticar, async (req, res) => {
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