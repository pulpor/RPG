const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const { autenticar, ehMestre } = require('../middleware/auth');

// Usar serviços Firebase
const userService = require('../services/userService');
const missionService = require('../services/missionService');
const submissionService = require('../services/submissionService');

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

router.get('/all', autenticar, async (req, res) => {
  try {
    console.log('Acessando /missoes/all:', { user: req.user });

    // Retorna todas as missões do Firebase
    const missions = await missionService.getAllMissions();
    res.json(missions);
  } catch (error) {
    console.error('[ERROR] Erro ao buscar todas as missões:', error);
    res.status(500).json({ error: 'Erro ao buscar missões' });
  }
});

router.get('/', autenticar, async (req, res) => {
  try {
    console.log('Acessando /missoes:', { user: req.user });

    // Se for mestre, retorna apenas as missões da sua área
    if (req.user.isMaster) {
      const master = await userService.getUserById(req.user.userId);
      if (!master) {
        return res.status(404).json({ error: 'Master não encontrado' });
      }

      const masterArea = getMasterArea(master.class);
      console.log(`[MISSOES] Master ${master.username} da área ${masterArea} solicitando missões`);

      // Buscar todas as missões do Firebase
      const allMissions = await missionService.getAllMissions();

      // Filtrar missões APENAS deste master (isolamento total)
      const filteredMissions = allMissions.filter(mission => {
        // Prioridade 1: Filtrar por masterUsername (mais confiável)
        if (mission.masterUsername) {
          return mission.masterUsername === master.username;
        }

        // Prioridade 2: Filtrar por masterId
        if (mission.masterId) {
          return mission.masterId === master.id;
        }

        // Prioridade 3: Filtrar por masterArea
        if (mission.masterArea) {
          return mission.masterArea === masterArea;
        }

        // Se não tem identificação, NÃO mostrar (isolamento total)
        return false;
      });

      console.log(`[MISSOES] Retornando ${filteredMissions.length} missões para master ${master.username}`);
      res.json(filteredMissions);
      return;
    }

    // Para alunos, filtrar por master, ano e classe, e remover missões já submetidas
    const user = await userService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar submissões do usuário que estão pendentes ou aprovadas
    const userSubmissions = await submissionService.getSubmissionsByUser(req.user.userId);
    const submissionsFiltered = userSubmissions.filter(sub =>
      sub.status === 'pending' || sub.status === 'approved'
    );

    const submittedMissionIds = new Set(submissionsFiltered.map(sub => parseInt(sub.missionId)));

    // Encontrar o master do aluno
    const allUsers = await userService.getAllUsers();
    const studentMaster = allUsers.find(u => u.isMaster && u.username === user.masterUsername);
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

    // Buscar todas as missões do Firebase
    const allMissions = await missionService.getAllMissions();

    const filteredMissions = allMissions.filter(mission => {
      console.log(`[DEBUG] Analisando missão ${mission.id}:`, {
        titulo: mission.titulo,
        masterId: mission.masterId,
        masterUsername: mission.masterUsername,
        masterArea: mission.masterArea,
        turma: mission.turma,
        targetClass: mission.targetClass
      });

      // Excluir missões já submetidas (pendentes ou aprovadas)
      if (submittedMissionIds.has(mission.id)) {
        console.log(`[DEBUG] Missão ${mission.id} excluída: já submetida`);
        return false;
      }

      // ===== FILTRO PRINCIPAL: APENAS MISSÕES DO SEU MESTRE =====
      // Primeiro, verificar por masterUsername (mais confiável)
      if (mission.masterUsername && user.masterUsername) {
        if (mission.masterUsername !== user.masterUsername) {
          console.log(`[DEBUG] Missão ${mission.id} excluída: masterUsername diferente (${mission.masterUsername} vs ${user.masterUsername})`);
          return false;
        }
        // Se chegou aqui, a missão é do mestre correto
        console.log(`[DEBUG] Missão ${mission.id}: masterUsername correto ✓`);
      }
      // Senão, verificar por masterId
      else if (mission.masterId && studentMaster) {
        if (mission.masterId !== studentMaster.id) {
          console.log(`[DEBUG] Missão ${mission.id} excluída: masterId diferente (${mission.masterId} vs ${studentMaster.id})`);
          return false;
        }
        console.log(`[DEBUG] Missão ${mission.id}: masterId correto ✓`);
      }
      // Senão, verificar por masterArea
      else if (mission.masterArea && masterArea) {
        if (mission.masterArea !== masterArea) {
          console.log(`[DEBUG] Missão ${mission.id} excluída: masterArea diferente (${mission.masterArea} vs ${masterArea})`);
          return false;
        }
        console.log(`[DEBUG] Missão ${mission.id}: masterArea correto ✓`);
      }
      // Se não tem nenhuma identificação de mestre, EXCLUIR por segurança
      else {
        console.log(`[DEBUG] Missão ${mission.id} excluída: sem identificação de mestre`);
        return false;
      }
      // ===== FIM DO FILTRO PRINCIPAL =====

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

      console.log(`[DEBUG] Missão ${mission.id} incluída: passou em todos os filtros ✓✓✓`);
      return true;
    });

    console.log(`Missões filtradas para ${user.username} (Master: ${user.masterUsername}, Turma: ${user.turma || user.assignedTurma}, Classe: ${user.class}):`, filteredMissions.length);
    res.json(filteredMissions);
  } catch (error) {
    console.error('[ERROR] Erro ao buscar missões:', error);
    res.status(500).json({ error: 'Erro ao buscar missões' });
  }
});

router.post('/', autenticar, ehMestre, async (req, res) => {
  try {
    const { titulo, descricao, xp, turma, targetClass } = req.body;
    console.log('[MISSOES] Criando missão:', { titulo, descricao, xp, turma, targetClass, user: req.user });

    // Obter informações do master do Firebase
    const master = await userService.getUserById(req.user.userId);
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

    // Gerar ID único para a missão
    const missionId = Date.now();

    const mission = {
      id: missionId,
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

    // Salvar no Firebase
    await missionService.createMission(mission);
    console.log('[MISSOES] ✅ Missão salva no Firebase com sucesso');

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

    // Usar o serviço do Firebase para atualizar a missão
    const missionService = require('../services/missionService');
    await missionService.updateMission(missions[missionIndex].id.toString(), missions[missionIndex]);
    console.log('[MISSOES] ✅ Missão atualizada no Firebase com sucesso');

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

    // Usar o serviço do Firebase para excluir a missão
    const missionService = require('../services/missionService');
    await missionService.deleteMission(deletedMission.id.toString());
    console.log('Missão excluída com sucesso:', deletedMission);
    res.json({ message: 'Missão excluída com sucesso', mission: deletedMission });
  } catch (err) {
    console.error('Erro ao excluir missão:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;