const express = require('express');
const { autenticar, ehMestre } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');
const { updateUserLevel, getLevelInfo, getRank } = require('../utils/levelSystem');
const router = express.Router();

// Usar serviços Firebase
const userService = require('../services/userService');
const submissionService = require('../services/submissionService');
const turmaService = require('../services/turmaService');

router.get('/students', autenticar, ehMestre, async (req, res) => {
  try {
    const allUsers = await userService.getAllUsers();
    res.json(allUsers.filter(u => !u.isMaster));
  } catch (error) {
    console.error('[ERROR] Erro ao buscar estudantes:', error);
    res.status(500).json({ error: 'Erro ao buscar estudantes' });
  }
});

router.get('/approved-students', autenticar, ehMestre, async (req, res) => {
  try {
    // Obter o master logado
    const master = await userService.getUserById(req.user.userId);
    if (!master) {
      return res.status(404).json({ error: 'Master não encontrado' });
    }

    // Buscar todos os usuários do Firebase
    const allUsers = await userService.getAllUsers();

    // Filtrar alunos aprovados que pertencem a este master
    const approvedStudents = allUsers.filter(u =>
      !u.pending &&
      !u.isMaster &&
      u.masterUsername === master.username
    );

    console.log('[DEBUG BACKEND] Alunos aprovados para master', master.username, ':', approvedStudents.length);

    // Enriquecer dados com informações de nível e masterUsername
    const enrichedStudents = approvedStudents.map(student => {
      const levelInfo = getLevelInfo(student.xp || 0);
      return {
        id: student.id,
        username: student.username,
        fullname: student.fullname,
        class: student.class,
        curso: student.curso,
        turma: student.turma,
        assignedTurma: student.assignedTurma,
        level: student.level,
        xp: student.xp,
        levelInfo: levelInfo,
        masterUsername: student.masterUsername
      };
    });

    res.json(enrichedStudents);
  } catch (err) {
    console.error('[DEBUG BACKEND] Erro ao buscar alunos aprovados:', err);
    res.status(500).json({ error: 'Erro interno ao buscar alunos aprovados' });
  }
});

// Rota para obter informações do usuário logado
router.get('/me', autenticar, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Obter informações detalhadas do nível
    const levelInfo = getLevelInfo(user.xp || 0);
    const rank = getRank(levelInfo.currentLevel);

    res.json({
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      class: user.class,
      year: user.year,
      level: user.level,
      xp: user.xp,
      isMaster: user.isMaster,
      rank: rank,
      levelInfo: levelInfo
    });
  } catch (error) {
    console.error('[ERROR] Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar informações do usuário' });
  }
});

// Rota para obter histórico de penalidades e recompensas do usuário logado
router.get('/my-penalties-rewards', autenticar, async (req, res) => {
  try {
    console.log('[DEBUG BACKEND] Chamada para /my-penalties-rewards:', req.user);
    const user = await userService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Retornar histórico se existir, senão array vazio
    const history = user.history || [];

    // Filtrar apenas penalidades e recompensas (excluir outros tipos de histórico se houver)
    const penaltiesRewards = history.filter(item =>
      item.type === 'penalty' || item.type === 'reward'
    ).map(item => ({
      type: item.type,
      xp: item.amount,
      reason: item.reason,
      createdAt: item.appliedAt,
      appliedBy: item.appliedBy
    }));

    console.log('[DEBUG BACKEND] Histórico de penalidades/recompensas:', penaltiesRewards.length);
    res.json(penaltiesRewards);
  } catch (error) {
    console.error('[ERROR] Erro ao buscar penalidades/recompensas:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

router.get('/pending-users', autenticar, ehMestre, async (req, res) => {
  try {
    console.log('[DEBUG BACKEND] ================================');
    console.log('[DEBUG BACKEND] Chamada para pending-users (com autenticação)');

    // Obter o master logado do Firebase
    const master = await userService.getUserById(req.user.userId);
    if (!master) {
      console.log('[DEBUG BACKEND] Master não encontrado para userId:', req.user.userId);
      return res.status(404).json({ error: 'Master não encontrado' });
    }

    console.log('[DEBUG BACKEND] Master encontrado:', {
      id: master.id,
      username: master.username,
      class: master.class,
      isMaster: master.isMaster
    });

    // Mapear classes de master para áreas
    const masterClassToArea = {
      "Guardião da Lógica": "tecnologia",
      "Mestre Fullstack": "tecnologia",
      "Grand Maître Cuisinier": "gastronomia",
      "Chanceler Supremo": "gestao",
      "Oráculo da Visão": "oftalmo",
      "Artista Supremo da Forma": "beleza",
      "Orador Supremo": "idiomas"
    };

    // Mapear cursos para áreas
    const cursoToArea = {
      "tecnologia": "tecnologia",
      "gastronomia": "gastronomia",
      "gestao": "gestao",
      "oftalmologia": "oftalmo",
      "beleza": "beleza",
      "idiomas": "idiomas"
    };

    // Detectar área do master
    const masterArea = masterClassToArea[master.class];
    console.log('[DEBUG BACKEND] Master:', master.username, 'Classe:', master.class, 'Área detectada:', masterArea);

    // Buscar todos os usuários do Firebase e filtrar pendentes
    const allUsers = await userService.getAllUsers();
    const allPendingUsers = allUsers.filter(u => u.pending && !u.isMaster);
    console.log('[DEBUG BACKEND] Total de usuários pendentes:', allPendingUsers.length);

    if (allPendingUsers.length > 0) {
      console.log('[DEBUG BACKEND] Usuários pendentes encontrados:');
      allPendingUsers.forEach(u => {
        console.log(`  - ${u.username} (curso: ${u.curso}, área: ${cursoToArea[u.curso] || 'não mapeada'})`);
      });
    }

    // Filtrar usuários pendentes por área
    let pendingUsers = allPendingUsers;

    if (masterArea) {
      pendingUsers = pendingUsers.filter(u => {
        const userArea = cursoToArea[u.curso] || cursoToArea[u.area] || null;
        console.log('[DEBUG BACKEND] Usuário:', u.username, 'Curso:', u.curso, 'Área detectada:', userArea, 'Match:', userArea === masterArea);
        return userArea === masterArea;
      });
    }

    console.log('[DEBUG BACKEND] Usuários pendentes filtrados para área', masterArea, ':', pendingUsers.length);
    console.log('[DEBUG BACKEND] ================================');

    res.json(pendingUsers);
  } catch (err) {
    console.error('[DEBUG BACKEND] Erro ao buscar usuários pendentes:', err);
    res.status(500).json({ error: 'Erro interno ao buscar usuários pendentes' });
  }
});

// Rotas para gerenciar turmas (usando Firebase Firestore)
router.get('/turmas', autenticar, ehMestre, async (req, res) => {
  try {
    console.log('[TURMAS] GET /turmas - Master:', req.user.userId);

    // Buscar turmas do master no Firebase
    const turmas = await turmaService.getTurmasByMaster(req.user.userId);

    console.log('[TURMAS] Turmas encontradas:', turmas.length);

    // Retornar apenas os nomes das turmas (para compatibilidade com frontend)
    const turmasNomes = turmas.map(t => t.nome || t.name);

    res.json({ turmas: turmasNomes });
  } catch (err) {
    console.error('[TURMAS] Erro ao ler turmas:', err);
    res.status(500).json({ error: 'Erro ao ler turmas', details: err.message });
  }
});

router.post('/turmas', autenticar, ehMestre, async (req, res) => {
  try {
    const { nome } = req.body;

    console.log('[TURMAS] POST /turmas - Criando turma:', nome, 'Master:', req.user.userId);

    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome inválido' });
    }

    // Criar turma no Firebase
    const novaTurma = await turmaService.createTurma({
      nome: nome.trim(),
      masterId: req.user.userId,
      createdAt: new Date().toISOString()
    });

    console.log('[TURMAS] Turma criada:', novaTurma.id);

    // Buscar todas as turmas do master
    const turmas = await turmaService.getTurmasByMaster(req.user.userId);
    const turmasNomes = turmas.map(t => t.nome || t.name);

    res.json({ turmas: turmasNomes });
  } catch (err) {
    console.error('[TURMAS] Erro ao salvar turma:', err);
    res.status(500).json({ error: 'Erro ao salvar turma', details: err.message });
  }
});

router.delete('/turmas', autenticar, ehMestre, async (req, res) => {
  try {
    const { nome } = req.body;

    console.log('[TURMAS] DELETE /turmas - Deletando turma:', nome, 'Master:', req.user.userId);

    if (!nome) {
      return res.status(400).json({ error: 'Nome inválido' });
    }

    // Buscar a turma pelo nome e masterId
    const turmas = await turmaService.getTurmasByMaster(req.user.userId);
    const turmaParaDeletar = turmas.find(t => (t.nome || t.name) === nome);

    if (turmaParaDeletar) {
      await turmaService.deleteTurma(turmaParaDeletar.id);
      console.log('[TURMAS] Turma deletada:', turmaParaDeletar.id);
    }

    // Buscar turmas atualizadas
    const turmasAtualizadas = await turmaService.getTurmasByMaster(req.user.userId);
    const turmasNomes = turmasAtualizadas.map(t => t.nome || t.name);

    res.json({ turmas: turmasNomes });
  } catch (err) {
    console.error('[TURMAS] Erro ao deletar turma:', err);
    res.status(500).json({ error: 'Erro ao deletar turma', details: err.message });
  }
});

router.post('/approve-user', autenticar, ehMestre, async (req, res) => {
  try {
    const { userId, turma } = req.body;

    console.log('[APPROVE-USER] Iniciando aprovação:', { userId, turma });

    // Validação: userId é obrigatório
    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }

    // Validação: turma é obrigatória
    if (!turma || typeof turma !== 'string' || turma.trim() === '' || turma === 'Selecione uma turma') {
      return res.status(400).json({
        error: 'Turma é obrigatória. Não é possível aprovar usuário sem atribuir uma turma válida.'
      });
    }

    // Buscar usuário no Firebase
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Obter o master logado
    const master = await userService.getUserById(req.user.userId);
    if (!master) {
      return res.status(404).json({ error: 'Master não encontrado' });
    }

    // Atualizar usuário no Firebase
    await userService.updateUser(userId, {
      turma: turma.trim(),
      assignedTurma: turma.trim(),
      masterUsername: master.username,
      pending: false
    });

    console.log('[APPROVE-USER] ✅ Usuário aprovado:', user.username, 'Master:', master.username, 'Turma:', turma);

    // Buscar usuário atualizado
    const updatedUser = await userService.getUserById(userId);

    res.json({ user: { ...updatedUser, password: undefined } });
  } catch (err) {
    console.error('[APPROVE-USER] ❌ Erro ao aprovar usuário:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});

// Rota alternativa com padrão REST
router.post('/:id/approve', autenticar, ehMestre, async (req, res) => {
  try {
    const userId = req.params.id; // Firebase IDs são strings
    const { turma } = req.body;

    console.log('[APPROVE/:id] Iniciando aprovação:', { userId, turma });

    // Validação: turma é obrigatória
    if (!turma || typeof turma !== 'string' || turma.trim() === '' || turma === 'Selecione uma turma') {
      return res.status(400).json({
        error: 'Turma é obrigatória. Não é possível aprovar usuário sem atribuir uma turma válida.'
      });
    }

    // Buscar usuário no Firebase
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Obter o master logado
    const master = await userService.getUserById(req.user.userId);
    if (!master) {
      return res.status(404).json({ error: 'Master não encontrado' });
    }

    // Atualizar usuário no Firebase
    await userService.updateUser(userId, {
      turma: turma.trim(),
      assignedTurma: turma.trim(),
      masterUsername: master.username,
      pending: false
    });

    console.log('[APPROVE/:id] ✅ Usuário aprovado:', user.username, 'Master:', master.username, 'Turma:', turma);

    // Buscar usuário atualizado
    const updatedUser = await userService.getUserById(userId);

    res.json({ user: { ...updatedUser, password: undefined } });
  } catch (err) {
    console.error('[APPROVE/:id] ❌ Erro ao aprovar usuário:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});

router.post('/reject-user', autenticar, ehMestre, async (req, res) => {
  const { userId } = req.body;
  const index = users.findIndex(u => u.id === parseInt(userId));
  if (index === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  users.splice(index, 1);
  try {
    await fs.writeFile(caminhoUsers, JSON.stringify(users, null, 2));
    res.json({ message: 'Usuário rejeitado' });
  } catch (err) {
    console.error('Erro ao salvar users.json:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota alternativa com padrão REST
router.post('/:id/reject', autenticar, ehMestre, async (req, res) => {
  const userId = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  console.log('[DEBUG BACKEND] Usuário rejeitado via REST:', users[index].username);

  users.splice(index, 1);
  try {
    await fs.writeFile(caminhoUsers, JSON.stringify(users, null, 2));
    res.json({ message: 'Usuário rejeitado' });
  } catch (err) {
    console.error('Erro ao salvar users.json:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/penalty', autenticar, ehMestre, async (req, res) => {
  const { studentId, penalty, reason } = req.body;
  console.log('[DEBUG] Aplicando penalidade:', { studentId, penalty, reason });

  const user = users.find(u => u.id === parseInt(studentId));
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  if (!penalty || isNaN(penalty) || parseInt(penalty) <= 0) {
    return res.status(400).json({ error: 'Valor de penalidade inválido' });
  }

  if (!reason || reason.trim().length === 0) {
    return res.status(400).json({ error: 'Motivo da penalidade é obrigatório' });
  }

  const oldXp = user.xp || 0;
  user.xp = Math.max(0, oldXp - parseInt(penalty));

  // Adicionar ao histórico
  if (!user.history) user.history = [];
  user.history.push({
    type: 'penalty',
    amount: parseInt(penalty),
    reason: reason.trim(),
    oldXp: oldXp,
    newXp: user.xp,
    appliedBy: req.user.userId,
    appliedAt: new Date().toISOString()
  });

  // Usar o novo sistema de níveis
  updateUserLevel(user);

  try {
    await fs.writeFile(caminhoUsers, JSON.stringify(users, null, 2));
    res.json({
      message: `Penalidade de ${penalty} XP aplicada com sucesso!`,
      user: { ...user, password: undefined }
    });
  } catch (err) {
    console.error('Erro ao salvar users.json:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/reward', autenticar, ehMestre, async (req, res) => {
  const { studentId, reward, reason } = req.body;
  console.log('[DEBUG] Aplicando recompensa:', { studentId, reward, reason });

  const user = users.find(u => u.id === parseInt(studentId));
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  if (!reward || isNaN(reward) || parseInt(reward) <= 0) {
    return res.status(400).json({ error: 'Valor de recompensa inválido' });
  }

  if (!reason || reason.trim().length === 0) {
    return res.status(400).json({ error: 'Motivo da recompensa é obrigatório' });
  }

  const oldXp = user.xp || 0;
  user.xp = oldXp + parseInt(reward);

  // Adicionar ao histórico
  if (!user.history) user.history = [];
  user.history.push({
    type: 'reward',
    amount: parseInt(reward),
    reason: reason.trim(),
    oldXp: oldXp,
    newXp: user.xp,
    appliedBy: req.user.userId,
    appliedAt: new Date().toISOString()
  });

  // Usar o novo sistema de níveis
  updateUserLevel(user);

  try {
    await fs.writeFile(caminhoUsers, JSON.stringify(users, null, 2));
    res.json({
      message: `Recompensa de ${reward} XP aplicada com sucesso!`,
      user: { ...user, password: undefined }
    });
  } catch (err) {
    console.error('Erro ao salvar users.json:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/student-history/:id', autenticar, ehMestre, async (req, res) => {
  const { id } = req.params;
  console.log('[DEBUG] Buscando histórico do aluno:', id);

  // Ler dados atualizados do arquivo
  const currentUsers = JSON.parse(await fs.readFile(caminhoUsers, 'utf8'));
  const user = currentUsers.find(u => u.id === parseInt(id));
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const history = user.history || [];
  console.log('[DEBUG] Histórico encontrado:', history);

  // Enriquecer o histórico com nomes dos mestres que aplicaram as ações
  const enrichedHistory = history.map(entry => {
    const master = currentUsers.find(u => u.id === entry.appliedBy);
    return {
      ...entry,
      appliedByName: master ? master.username : 'Usuário removido'
    };
  }).sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)); // Mais recente primeiro

  res.json({
    student: {
      id: user.id,
      username: user.username,
      currentXp: user.xp || 0,
      level: user.level || 1
    },
    history: enrichedHistory,
    totalEntries: enrichedHistory.length
  });
});

router.post('/expel-student', autenticar, ehMestre, async (req, res) => {
  const { studentId } = req.body;
  console.log('[DEBUG] Expulsando aluno:', studentId);

  const userIndex = users.findIndex(u => u.id === parseInt(studentId));
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const user = users[userIndex];

  // Verificar se é realmente um aluno (não mestre)
  if (user.isMaster) {
    return res.status(400).json({ error: 'Não é possível expulsar um mestre' });
  }

  // Remover submissões do aluno
  const userSubmissionsIndices = [];
  for (let i = submissions.length - 1; i >= 0; i--) {
    if (parseInt(submissions[i].userId) === parseInt(studentId)) {
      userSubmissionsIndices.push(i);
      submissions.splice(i, 1);
    }
  }

  // Remover usuário da lista
  const expelledUser = users.splice(userIndex, 1)[0];

  try {
    // Salvar ambos os arquivos
    await fs.writeFile(caminhoUsers, JSON.stringify(users, null, 2));
    await fs.writeFile(caminhoSubmissions, JSON.stringify(submissions, null, 2));

    console.log(`[DEBUG] Aluno expulso com sucesso: ${expelledUser.username}. ${userSubmissionsIndices.length} submissões removidas.`);
    res.json({
      message: 'Aluno expulso com sucesso',
      user: { ...expelledUser, password: undefined },
      submissionsRemoved: userSubmissionsIndices.length
    });
  } catch (err) {
    console.error('Erro ao salvar arquivos:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para trocar aluno de turma
router.post('/:id/change-turma', autenticar, ehMestre, async (req, res) => {
  try {
    const userId = req.params.id; // Firebase IDs são strings
    const { novaTurma } = req.body;

    console.log('[CHANGE-TURMA] Iniciando troca de turma:', { userId, novaTurma });

    // Validação: nova turma é obrigatória
    if (!novaTurma || typeof novaTurma !== 'string' || novaTurma.trim() === '') {
      return res.status(400).json({
        error: 'Nova turma é obrigatória.'
      });
    }

    // Buscar o aluno no Firebase
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se o usuário é um aluno (não master) e não está pendente
    if (user.isMaster || user.pending) {
      return res.status(400).json({ error: 'Só é possível trocar alunos aprovados de turma' });
    }

    // Obter o master logado
    const master = await userService.getUserById(req.user.userId);
    if (!master) {
      return res.status(404).json({ error: 'Master não encontrado' });
    }

    // Verificar se o aluno pertence a este master
    if (user.masterUsername !== master.username) {
      return res.status(403).json({ error: 'Você só pode trocar alunos da sua área' });
    }

    const turmaAnterior = user.turma || user.assignedTurma;

    // Atualizar a turma do aluno no Firebase
    await userService.updateUser(userId, {
      turma: novaTurma.trim(),
      assignedTurma: novaTurma.trim()
    });

    console.log(`[CHANGE-TURMA] ✅ Aluno ${user.username} transferido de "${turmaAnterior}" para "${novaTurma}" pelo master ${master.username}`);

    res.json({
      message: 'Aluno transferido com sucesso',
      user: { ...user, turma: novaTurma.trim(), assignedTurma: novaTurma.trim(), password: undefined },
      turmaAnterior,
      novaTurma: novaTurma.trim()
    });

  } catch (err) {
    console.error('[CHANGE-TURMA] ❌ Erro ao trocar aluno de turma:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});

// 🔧 ROTA TEMPORÁRIA: Recalcular XP de missões já aprovadas
router.post('/recalculate-xp', autenticar, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('[RECALC-XP] Iniciando recálculo de XP para usuário:', userId);

    // Buscar usuário
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar todas as submissões aprovadas do usuário
    const allSubmissions = await submissionService.getSubmissionsByUser(userId);
    const approvedSubmissions = allSubmissions.filter(sub => sub.status === 'approved');

    console.log('[RECALC-XP] Submissões aprovadas encontradas:', approvedSubmissions.length);

    // Calcular XP total das submissões aprovadas
    let totalXP = 0;
    const missionService = require('../services/missionService');

    for (const submission of approvedSubmissions) {
      // Buscar XP da submissão ou da missão
      let xpFromSubmission = submission.xp || submission.xpAwarded || 0;

      if (xpFromSubmission === 0) {
        // Tentar buscar da missão
        try {
          const mission = await missionService.getMissionById(submission.missionId);
          xpFromSubmission = mission?.xp || 0;
        } catch (e) {
          console.warn('[RECALC-XP] Não foi possível obter missão:', submission.missionId);
        }
      }

      totalXP += xpFromSubmission;
      console.log('[RECALC-XP] Missão:', submission.missionTitle, '- XP:', xpFromSubmission);
    }

    console.log('[RECALC-XP] XP total calculado:', totalXP);
    console.log('[RECALC-XP] XP atual do usuário:', user.xp || 0);

    // Atualizar XP do usuário se necessário
    if (totalXP !== (user.xp || 0)) {
      const { calculateLevel } = require('../utils/levelSystem');
      const levelInfo = calculateLevel(totalXP);

      await userService.updateUser(userId, {
        xp: totalXP,
        level: levelInfo.currentLevel
      });

      console.log('[RECALC-XP] ✅ XP atualizado de', user.xp || 0, 'para', totalXP);
      console.log('[RECALC-XP] ✅ Nível atualizado para', levelInfo.currentLevel);

      res.json({
        message: 'XP recalculado com sucesso!',
        xpAnterior: user.xp || 0,
        xpAtualizado: totalXP,
        nivelAnterior: user.level || 1,
        nivelAtualizado: levelInfo.currentLevel,
        missoesContabilizadas: approvedSubmissions.length
      });
    } else {
      res.json({
        message: 'XP já está correto!',
        xpAtual: totalXP,
        nivelAtual: user.level,
        missoesContabilizadas: approvedSubmissions.length
      });
    }

  } catch (err) {
    console.error('[RECALC-XP] ❌ Erro ao recalcular XP:', err);
    res.status(500).json({ error: 'Erro ao recalcular XP', details: err.message });
  }
});

module.exports = router;