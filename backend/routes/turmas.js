const express = require('express');
const router = express.Router();
const { autenticar, ehMestre } = require('../middleware/auth');
const turmaService = require('../services/turmaService');
const userService = require('../services/userService');

// GET /turmas/me - Buscar turmas do master logado
router.get('/me', autenticar, ehMestre, async (req, res) => {
    try {
        console.log('[TURMAS] GET /me - Buscando turmas do master:', req.user.userId);

        // Buscar dados do master para pegar o username
        const master = await userService.getUserById(req.user.userId);
        if (!master) {
            return res.status(404).json({ error: 'Master não encontrado' });
        }

        const turmas = await turmaService.getTurmasByMaster(master.username);

        // Retornar array de nomes de turmas para compatibilidade com frontend
        const turmasNomes = turmas.map(t => t.name || t.nome);

        console.log('[TURMAS] GET /me ✅ Turmas encontradas:', turmasNomes.length);

        res.json({ turmas: turmasNomes });
    } catch (error) {
        console.error('[TURMAS] GET /me ❌ Erro:', error);
        res.status(500).json({
            error: 'Erro ao buscar turmas',
            details: error.message
        });
    }
});

// GET /turmas - Buscar turmas do master logado (fallback)
router.get('/', autenticar, ehMestre, async (req, res) => {
    try {
        console.log('[TURMAS] GET / - Buscando turmas do master:', req.user.userId);

        // Buscar dados do master para pegar o username
        const master = await userService.getUserById(req.user.userId);
        if (!master) {
            return res.status(404).json({ error: 'Master não encontrado' });
        }

        const turmas = await turmaService.getTurmasByMaster(master.username);

        // Retornar array de nomes de turmas para compatibilidade com frontend
        const turmasNomes = turmas.map(t => t.name || t.nome);

        console.log('[TURMAS] GET / ✅ Turmas encontradas:', turmasNomes.length);

        res.json({ turmas: turmasNomes });
    } catch (error) {
        console.error('[TURMAS] GET / ❌ Erro:', error);
        res.status(500).json({
            error: 'Erro ao buscar turmas',
            details: error.message
        });
    }
});

// POST /turmas - Criar nova turma
router.post('/', autenticar, ehMestre, async (req, res) => {
    try {
        const { nome } = req.body;

        console.log('[TURMAS] POST - Criando turma:', nome, 'para master:', req.user.userId);

        if (!nome || typeof nome !== 'string' || nome.trim() === '') {
            return res.status(400).json({ error: 'Nome da turma é obrigatório' });
        }

        // Buscar dados do master para pegar o username
        const master = await userService.getUserById(req.user.userId);
        console.log('[TURMAS] POST - Master encontrado:', {
            id: master?.id,
            username: master?.username,
            isMaster: master?.isMaster
        });

        if (!master) {
            return res.status(404).json({ error: 'Master não encontrado' });
        }

        // Criar turma com os dados corretos
        const turmaData = {
            name: nome.trim(),
            nome: nome.trim(), // Compatibilidade
            masterUsername: master.username,
            masterId: req.user.userId,
            students: [],
            active: true
        };

        console.log('[TURMAS] POST - Dados da turma a criar:', turmaData);

        const turma = await turmaService.createTurma(turmaData);

        console.log('[TURMAS] POST - Turma criada no Firebase:', {
            id: turma.id,
            name: turma.name || turma.nome,
            masterUsername: turma.masterUsername
        });

        // Buscar todas as turmas para retornar a lista atualizada
        console.log('[TURMAS] POST - Buscando turmas do master:', master.username);
        const todasTurmas = await turmaService.getTurmasByMaster(master.username);
        console.log('[TURMAS] POST - Turmas encontradas após criação:', todasTurmas.length, todasTurmas.map(t => ({ id: t.id, name: t.name || t.nome, masterUsername: t.masterUsername })));

        const turmasNomes = todasTurmas.map(t => t.name || t.nome);

        console.log('[TURMAS] POST ✅ Turma criada:', turma.id, 'Total de turmas:', turmasNomes.length);

        res.json({ turmas: turmasNomes });
    } catch (error) {
        console.error('[TURMAS] POST ❌ Erro:', error);
        res.status(500).json({
            error: 'Erro ao criar turma',
            details: error.message
        });
    }
});

// DELETE /turmas - Excluir turma
router.delete('/', autenticar, ehMestre, async (req, res) => {
    try {
        const { nome } = req.body;

        console.log('[TURMAS] DELETE - Excluindo turma:', nome);

        if (!nome || typeof nome !== 'string' || nome.trim() === '') {
            return res.status(400).json({ error: 'Nome da turma é obrigatório' });
        }

        // Buscar dados do master para pegar o username
        const master = await userService.getUserById(req.user.userId);
        if (!master) {
            return res.status(404).json({ error: 'Master não encontrado' });
        }

        // Buscar turmas do master
        const turmas = await turmaService.getTurmasByMaster(master.username);

        // Encontrar a turma pelo nome
        const turma = turmas.find(t => (t.name || t.nome) === nome.trim());

        if (!turma) {
            return res.status(404).json({ error: 'Turma não encontrada' });
        }

        // Excluir a turma
        await turmaService.deleteTurma(turma.id);

        // Buscar todas as turmas para retornar a lista atualizada
        const turmasRestantes = await turmaService.getTurmasByMaster(master.username);
        const turmasNomes = turmasRestantes.map(t => t.name || t.nome);

        console.log('[TURMAS] DELETE ✅ Turma excluída. Total restante:', turmasNomes.length);

        res.json({ turmas: turmasNomes });
    } catch (error) {
        console.error('[TURMAS] DELETE ❌ Erro:', error);
        res.status(500).json({
            error: 'Erro ao excluir turma',
            details: error.message
        });
    }
});

module.exports = router;
