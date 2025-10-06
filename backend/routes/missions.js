const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Caminho correto para o arquivo missions.json
const caminhoMissions = path.join(__dirname, '../data/missions.json');

const { autenticar, ehMestre } = require('../middleware/auth');

const { missions, missionIdCounter, users, submissions } = require('../inicializacao');

// Função auxiliar para detectar área do master baseada na classe
function getMasterArea(masterClass) {
  const masterClassToArea = {
    "Guardião da Lógica": "tecnologia",
    "Mestre Fullstack": "tecnologia", 
    "Grand Maître Cuisinier": "gastronomia",
    "Chanceler Supremo": "gestao",
    "Oráculo da Visão": "oftalmo",
    "Artista Supremo da Forma": "beleza",
    "Orador Supremo": "idiomas"
  };
  return masterClassToArea[masterClass] || null;
}

// Middleware de log específico para missões
router.use((req, res, next) => {
  console.log(`[MISSOES] ${req.method} ${req.originalUrl}`, {
    body: req.body,
    headers: req.headers.authorization ? 'Token presente' : 'Sem token',
    user: req.user?.userId || 'Não autenticado'
  });
  next();
});

router.get('/all', autenticar, (req, res) => {
  console.log('Acessando /missoes/all:', { user: req.user });
  
  // Retorna todas as missões (usado para mostrar missões concluídas)
  res.json(missions);
});

router.get('/', autenticar, (req, res) => {
  console.log('Acessando /missoes:', { user: req.user });

  // Se for mestre, retorna apenas as missões da sua área
  if (req.user.isMaster) {
    const master = users.find(u => u.id === req.user.userId);
    if (!master) {
      return res.status(404).json({ error: 'Master não encontrado' });
    }

    const masterArea = getMasterArea(master.class);
    console.log(`[MISSOES] Master ${master.username} da área ${masterArea} solicitando missões`);

    // Filtrar missões por área do master
    const filteredMissions = missions.filter(mission => {
      // Se a missão tem masterId, deve ser do mesmo master
      if (mission.masterId) {
        return mission.masterId === master.id;
      }
      
      // Se a missão tem masterArea, deve ser da mesma área
      if (mission.masterArea) {
        return mission.masterArea === masterArea;
      }
      
      // Se não tem identificação de área/master, considerar como missão geral (pode ver todas)
      return true;
    });

    console.log(`[MISSOES] Retornando ${filteredMissions.length} missões para master ${master.username}`);
    res.json(filteredMissions);
    return;
  }

  // Para alunos, filtrar por master, ano e classe, e remover missões já submetidas
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  // Buscar submissões do usuário que estão pendentes ou aprovadas
  const userSubmissions = submissions.filter(sub =>
    parseInt(sub.userId) === req.user.userId &&
    (sub.status === 'pending' || sub.status === 'approved')
  );

  const submittedMissionIds = new Set(userSubmissions.map(sub => parseInt(sub.missionId)));

  // Encontrar o master do aluno
  const studentMaster = users.find(u => u.isMaster && u.username === user.masterUsername);
  const masterArea = studentMaster ? getMasterArea(studentMaster.class) : null;

  console.log(`[MISSOES] Aluno ${user.username} do master ${user.masterUsername} (área: ${masterArea}) solicitando missões`);
  console.log(`[DEBUG] Dados do aluno:`, {
    id: user.id,
    username: user.username,
    class: user.class,
    turma: user.turma,
    assignedTurma: user.assignedTurma,
    masterUsername: user.masterUsername
  });
  console.log(`[DEBUG] Master encontrado:`, studentMaster ? {
    id: studentMaster.id,
    username: studentMaster.username,
    class: studentMaster.class,
    area: masterArea
  } : 'NÃO ENCONTRADO');

  const filteredMissions = missions.filter(mission => {
    console.log(`[DEBUG] Analisando missão ${mission.id}:`, {
      titulo: mission.titulo,
      masterId: mission.masterId,
      masterArea: mission.masterArea,
      turma: mission.turma,
      targetClass: mission.targetClass
    });

    // Excluir missões já submetidas (pendentes ou aprovadas)
    if (submittedMissionIds.has(mission.id)) {
      console.log(`[DEBUG] Missão ${mission.id} excluída: já submetida`);
      return false;
    }

    // Verificar se a missão é do master do aluno
    if (mission.masterId && studentMaster) {
      if (mission.masterId !== studentMaster.id) {
        console.log(`[DEBUG] Missão ${mission.id} excluída: masterId diferente (${mission.masterId} vs ${studentMaster.id})`);
        return false;
      }
    } else if (mission.masterArea && masterArea) {
      if (mission.masterArea !== masterArea) {
        console.log(`[DEBUG] Missão ${mission.id} excluída: masterArea diferente (${mission.masterArea} vs ${masterArea})`);
        return false;
      }
    }

    // Verificar se é para a turma específica (se especificada)
    if (mission.turma && mission.turma !== user.turma && mission.turma !== user.assignedTurma) {
      console.log(`[DEBUG] Missão ${mission.id} excluída: turma diferente (${mission.turma} vs ${user.turma}/${user.assignedTurma})`);
      return false;
    }

    // Verificar classe
    if (mission.targetClass && mission.targetClass !== 'geral' && mission.targetClass !== user.class) {
      console.log(`[DEBUG] Missão ${mission.id} excluída: classe diferente (${mission.targetClass} vs ${user.class})`);
      return false;
    }
    if (mission.targetClass && mission.targetClass !== 'geral' && mission.targetClass !== user.class) {
      return false;
    }

    // Missões gerais (sem ano específico) são visíveis se passaram nos filtros acima
    if (!mission.targetYear) {
      console.log(`[DEBUG] Missão ${mission.id} incluída: sem targetYear`);
      return true;
    }

    // Missões específicas por ano
    if (mission.targetYear !== user.year) {
      console.log(`[DEBUG] Missão ${mission.id} excluída: ano diferente (${mission.targetYear} vs ${user.year})`);
      return false;
    }

    console.log(`[DEBUG] Missão ${mission.id} incluída: passou em todos os filtros`);
    return true;
  });

  console.log(`Missões filtradas para ${user.username} (Master: ${user.masterUsername}, Turma: ${user.turma || user.assignedTurma}, Classe: ${user.class}):`, filteredMissions.length);
  res.json(filteredMissions);
});

router.post('/', autenticar, ehMestre, async (req, res) => {
  try {
    const { titulo, descricao, xp, turma, targetClass } = req.body;
    console.log('[MISSOES] Criando missão:', { titulo, descricao, xp, turma, targetClass, user: req.user });

    // Obter informações do master
    const master = users.find(u => u.id === req.user.userId);
    if (!master) {
      return res.status(404).json({ error: 'Master não encontrado' });
    }

    const masterArea = getMasterArea(master.class);

    // Validação mais robusta
    if (!titulo || titulo.trim() === '') {
      console.log('[MISSOES] Erro: título vazio');
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    if (!descricao || descricao.trim() === '') {
      console.log('[MISSOES] Erro: descrição vazia');
      return res.status(400).json({ error: 'Descrição é obrigatória' });
    }

    if (!xp || parseInt(xp) <= 0) {
      console.log('[MISSOES] Erro: XP inválido');
      return res.status(400).json({ error: 'XP deve ser maior que zero' });
    }

    if (!targetClass) {
      console.log('[MISSOES] Erro: classe alvo não especificada');
      return res.status(400).json({ error: 'Classe alvo é obrigatória' });
    }

    const mission = {
      id: missionIdCounter.value++,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      xp: parseInt(xp),
      turma: turma || null,
      targetClass: targetClass,
      status: 'ativa',
      masterId: master.id,
      masterUsername: master.username,
      masterArea: masterArea,
      createdAt: new Date().toISOString()
    };

    console.log('[MISSOES] Missão criada:', mission);
    missions.push(mission);

    console.log('[MISSOES] Salvando no arquivo...');
    await fs.writeFile(caminhoMissions, JSON.stringify(missions, null, 2));
    console.log('[MISSOES] ✅ missions.json salvo com sucesso');

    res.status(201).json(mission);
  } catch (err) {
    console.error('[MISSOES] ❌ Erro ao criar missão:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});

// Rota para atualizar missão
router.put('/:id', autenticar, ehMestre, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, xp, turma, targetClass } = req.body;
    console.log('Atualizando missão:', { id, titulo, descricao, xp, turma, targetClass, user: req.user });

    if (!titulo || !descricao || !xp || !targetClass) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
    }

    const missionIndex = missions.findIndex(m => m.id === parseInt(id));
    if (missionIndex === -1) {
      return res.status(404).json({ error: 'Missão não encontrada' });
    }

    // Verificar se o master pode editar esta missão
    const master = users.find(u => u.id === req.user.userId);
    const mission = missions[missionIndex];
    
    if (mission.masterId && mission.masterId !== master.id) {
      return res.status(403).json({ error: 'Você não tem permissão para editar esta missão' });
    }

    missions[missionIndex] = {
      ...missions[missionIndex],
      titulo: titulo,
      descricao: descricao,
      xp: parseInt(xp),
      turma: turma || null,
      targetClass: targetClass,
      status: missions[missionIndex].status || 'ativa',
      updatedAt: new Date().toISOString()
    };

    console.log('[MISSOES] Salvando no arquivo...');
    await fs.writeFile(caminhoMissions, JSON.stringify(missions, null, 2));
    console.log('[MISSOES] ✅ missions.json salvo com sucesso');

    res.json(missions[missionIndex]);
  } catch (err) {
    console.error('[MISSOES] ❌ Erro ao atualizar missão:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
});

// Rota para excluir missão
router.delete('/:id', autenticar, ehMestre, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Excluindo missão:', { id, user: req.user });

    const missionIndex = missions.findIndex(m => m.id === parseInt(id));
    if (missionIndex === -1) {
      return res.status(404).json({ error: 'Missão não encontrada' });
    }

    // Verificar se o master pode excluir esta missão
    const master = users.find(u => u.id === req.user.userId);
    const mission = missions[missionIndex];
    
    if (mission.masterId && mission.masterId !== master.id) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir esta missão' });
    }

    const deletedMission = missions.splice(missionIndex, 1)[0];

    await fs.writeFile(caminhoMissions, JSON.stringify(missions, null, 2));
    console.log('Missão excluída com sucesso:', deletedMission);
    res.json({ message: 'Missão excluída com sucesso', mission: deletedMission });
  } catch (err) {
    console.error('Erro ao excluir missão:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;