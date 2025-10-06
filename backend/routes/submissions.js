const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Caminho correto para o arquivo submissions.json
const caminhoSubmissions = path.join(__dirname, '../data/submissions.json');
const caminhoUsers = path.join(__dirname, '../data/users.json');

const { autenticar, ehMestre } = require('../middleware/auth');

const { users, missions, submissions, submissionIdCounter } = require('../inicializacao');
const { upload } = require('../utils/armazenamentoArquivos');
const { updateUserLevel, calculateLevel } = require('../utils/levelSystem');

// Função auxiliar para atualizar o XP do usuário
async function updateUserXP(userId, xpToAdd) {
  const user = users.find(u => u.id === parseInt(userId));
  if (user) {
    user.xp = (user.xp || 0) + xpToAdd;
    user.level = calculateLevel(user.xp).currentLevel;
    await fs.writeFile(caminhoUsers, JSON.stringify(users, null, 2));
  }
}

router.post('/submit', autenticar, upload, async (req, res) => {
  const { missionId } = req.body;
  const userId = req.user.userId;
  console.log('Processando submissão:', { missionId, userId, files: req.files, body: req.body });
  const mission = missions.find(m => m.id === parseInt(missionId));
  if (!mission) {
    return res.status(404).json({ error: 'Missão não encontrada' });
  }
  const submission = {
    id: submissionIdCounter.value++,
    userId,
    missionId: parseInt(missionId),
    filePaths: req.files.code ? req.files.code.map(file => file.path) : [],
    submittedAt: new Date(),
    pending: true,
    status: 'pending',
    missionTitle: mission.titulo || mission.title || 'Missão sem título',
    xp: mission.xp,
    completed: false
  };
  submissions.push(submission);
  try {
    await fs.writeFile(caminhoSubmissions, JSON.stringify(submissions, null, 2));
    console.log('submissions.json salvo com sucesso:', submission);
    res.json({ message: 'Submissão enviada com sucesso' });
  } catch (err) {
    console.error('Erro ao salvar submissions.json:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/my-submissions', autenticar, (req, res) => {
  const userId = req.user.userId;
  console.log('[DEBUG] Buscando submissões do usuário:', userId);

  try {
    const userSubmissions = submissions.filter(sub => parseInt(sub.userId) === parseInt(userId));
    console.log('[DEBUG] Submissões encontradas:', userSubmissions.length);

    const enrichedSubmissions = userSubmissions.map(sub => {
      const mission = missions.find(m => m.id === parseInt(sub.missionId));
      return {
        ...sub,
        missionTitle: mission ? (mission.titulo || mission.title || 'Missão Desconhecida') : 'Missão Desconhecida',
        missionDescription: mission ? mission.description : ''
      };
    });

    console.log('[DEBUG] Submissões do usuário enriquecidas:', enrichedSubmissions);
    res.json(enrichedSubmissions);
  } catch (err) {
    console.error('[DEBUG] Erro na rota GET /my-submissions:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});

router.get('/', autenticar, ehMestre, (req, res) => {
  console.log('[DEBUG] Rota GET /submissoes chamada');
  console.log('[DEBUG] Usuário autenticado:', req.user);
  console.log('[DEBUG] Total de submissões:', submissions.length);

  try {
    const enrichedSubmissions = submissions.map(sub => {
      console.log('[DEBUG] Processando submissão:', sub.id);
      const user = users.find(u => u.id === parseInt(sub.userId));
      const mission = missions.find(m => m.id === parseInt(sub.missionId));

      console.log('[DEBUG] Usuário encontrado:', user ? user.username : 'não encontrado');
      console.log('[DEBUG] Missão encontrada:', mission ? (mission.titulo || mission.title || 'não encontrada') : 'não encontrada');

      return {
        ...sub,
        username: user ? user.username : 'Desconhecido',
        userClass: user ? user.class : 'N/A',
        userYear: user ? user.year : 'N/A',
        missionTitle: mission ? (mission.titulo || mission.title || 'Desconhecida') : 'Desconhecida'
      };
    });

    console.log('[DEBUG] Submissões enriquecidas:', enrichedSubmissions);
    res.json(enrichedSubmissions);
  } catch (err) {
    console.error('[DEBUG] Erro na rota GET /submissoes:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});

router.post('/:id/approve', autenticar, ehMestre, async (req, res) => {
  const submissionId = parseInt(req.params.id);
  const { feedback } = req.body;

  console.log('[DEBUG] Aprovando submissão:', submissionId);

  const submission = submissions.find(s => s.id === submissionId);
  if (!submission) {
    return res.status(404).json({ error: 'Submissão não encontrada' });
  }

  const user = users.find(u => u.id === parseInt(submission.userId));
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  // Atualizar XP apenas se a submissão não foi completada antes
  const wasAlreadyCompleted = submission.completed;

  submission.status = 'approved';
  submission.pending = false;
  submission.completed = true;
  submission.feedback = feedback || '';

  // Atualizar XP apenas se a missão não foi completada antes
  if (!wasAlreadyCompleted) {
    await updateUserXP(submission.userId, submission.xp);

    // Registrar no histórico do usuário
    if (!user.history) {
      user.history = [];
    }

    user.history.push({
      type: 'mission_approved',
      missionId: submission.missionId,
      missionTitle: submission.missionTitle || 'Missão',
      xpGained: submission.xp,
      feedback: feedback || '',
      appliedBy: req.user.userId,
      appliedAt: new Date().toISOString()
    });

    // Salvar o histórico no arquivo users.json
    await fs.writeFile(caminhoUsers, JSON.stringify(users, null, 2));
  }

  try {
    await fs.writeFile(caminhoSubmissions, JSON.stringify(submissions, null, 2));
    console.log('[DEBUG] Submissão aprovada e arquivos salvos');
    res.json({ submission, user: { ...user, password: undefined } });
  } catch (err) {
    console.error('Erro ao salvar arquivos:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/:id/reject', autenticar, ehMestre, async (req, res) => {
  const submissionId = parseInt(req.params.id);

  console.log('[DEBUG] Rejeitando submissão:', submissionId);

  const index = submissions.findIndex(s => s.id === submissionId);
  if (index === -1) {
    return res.status(404).json({ error: 'Submissão não encontrada' });
  }

  submissions[index].status = 'rejected';
  submissions[index].pending = false;
  submissions[index].completed = false;
  submissions[index].feedback = req.body.feedback || '';

  // Registrar no histórico do usuário
  const user = users.find(u => u.id === parseInt(submissions[index].userId));
  if (user) {
    if (!user.history) {
      user.history = [];
    }

    user.history.push({
      type: 'mission_rejected',
      missionId: submissions[index].missionId,
      missionTitle: submissions[index].missionTitle || 'Missão',
      feedback: req.body.feedback || '',
      appliedBy: req.user.userId,
      appliedAt: new Date().toISOString()
    });

    // Salvar o histórico no arquivo users.json
    await fs.writeFile(caminhoUsers, JSON.stringify(users, null, 2));
  }

  try {
    await fs.writeFile(caminhoSubmissions, JSON.stringify(submissions, null, 2));
    console.log('[DEBUG] Submissão rejeitada e arquivo salvo');
    res.json({ message: 'Submissão rejeitada' });
  } catch (err) {
    console.error('Erro ao salvar submissions.json:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;