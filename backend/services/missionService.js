// Serviço de Missões com Firebase Admin SDK
const { db } = require('../config/firebase');

class MissionService {
    constructor() {
        this.collectionName = 'missions';
    }

    /**
     * Criar nova missão
     * @param {Object} missionData - Dados da missão
     * @returns {Promise<Object>} - Missão criada
     */
    async createMission(missionData) {
        try {
            const missionDoc = db.collection(this.collectionName).doc();
            const missionId = missionDoc.id;

            const newMission = {
                ...missionData,
                id: missionId,
                status: missionData.status || 'ativa',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await missionDoc.set(newMission);
            console.log(`✅ Missão criada: ${missionData.titulo} (${missionId})`);

            return { ...newMission, id: missionId };
        } catch (error) {
            console.error('❌ Erro ao criar missão:', error);
            throw error;
        }
    }

    /**
     * Buscar missão por ID
     * @param {string} missionId - ID da missão
     * @returns {Promise<Object|null>} - Dados da missão ou null
     */
    async getMissionById(missionId) {
        try {
            const missionDoc = db.collection(this.collectionName).doc(missionId);
            const missionSnap = await missionDoc.get();

            if (missionSnap.exists) {
                return { id: missionSnap.id, ...missionSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar missão:', error);
            throw error;
        }
    }

    /**
     * Listar todas as missões
     * @param {Object} filters - Filtros opcionais
     * @returns {Promise<Array>} - Lista de missões
     */
    async getAllMissions(filters = {}) {
        try {
            let query = db.collection(this.collectionName);

            // Aplicar filtros
            if (filters.masterId) {
                query = query.where('masterId', '==', filters.masterId);
            }
            if (filters.masterUsername) {
                query = query.where('masterUsername', '==', filters.masterUsername);
            }
            if (filters.masterArea) {
                query = query.where('masterArea', '==', filters.masterArea);
            }
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            if (filters.turma) {
                query = query.where('turma', '==', filters.turma);
            }
            if (filters.targetClass) {
                query = query.where('targetClass', '==', filters.targetClass);
            }

            const snapshot = await query.get();
            const missions = [];

            snapshot.forEach((doc) => {
                missions.push({ id: doc.id, ...doc.data() });
            });

            console.log(`📋 ${missions.length} missões encontradas`);
            return missions;
        } catch (error) {
            console.error('❌ Erro ao listar missões:', error);
            throw error;
        }
    }

    /**
     * Buscar missões por mestre
     * @param {string} masterUsername - Username do mestre
     * @returns {Promise<Array>} - Lista de missões do mestre
     */
    async getMissionsByMaster(masterUsername) {
        return await this.getAllMissions({ masterUsername, status: 'ativa' });
    }

    /**
     * Buscar missões disponíveis para um aluno
     * @param {Object} studentData - Dados do aluno (masterUsername, turma, class)
     * @returns {Promise<Array>} - Missões disponíveis
     */
    async getAvailableMissionsForStudent(studentData) {
        try {
            const { masterUsername, turma, class: studentClass } = studentData;

            // Buscar todas as missões ativas do mestre do aluno
            const q = query(
                this.missionsRef,
                where('masterUsername', '==', masterUsername),
                where('status', '==', 'ativa')
            );

            const snapshot = await query.get();
            const missions = [];

            snapshot.forEach((doc) => {
                const mission = { id: doc.id, ...doc.data() };

                // Filtrar por turma e classe
                const matchTurma = !mission.turma || mission.turma === turma;
                const matchClass = !mission.targetClass ||
                    mission.targetClass === 'geral' ||
                    mission.targetClass === studentClass;

                if (matchTurma && matchClass) {
                    missions.push(mission);
                }
            });

            console.log(`📋 ${missions.length} missões disponíveis para ${studentData.username}`);
            return missions;
        } catch (error) {
            console.error('❌ Erro ao buscar missões disponíveis:', error);
            throw error;
        }
    }

    /**
     * Atualizar missão
     * @param {string} missionId - ID da missão
     * @param {Object} updates - Dados a atualizar
     * @returns {Promise<Object>} - Missão atualizada
     */
    async updateMission(missionId, updates) {
        try {
            const missionDoc = db.collection(this.collectionName).doc(missionId);

            const updateData = {
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await missionDoc.update(updateData);
            console.log(`✅ Missão atualizada: ${missionId}`);

            return await this.getMissionById(missionId);
        } catch (error) {
            console.error('❌ Erro ao atualizar missão:', error);
            throw error;
        }
    }

    /**
     * Deletar missão
     * @param {string} missionId - ID da missão
     * @returns {Promise<boolean>} - Sucesso
     */
    async deleteMission(missionId) {
        try {
            const missionDoc = db.collection(this.collectionName).doc(missionId);
            await missionDoc.delete();
            console.log(`✅ Missão deletada: ${missionId}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao deletar missão:', error);
            throw error;
        }
    }

    /**
     * Desativar missão
     * @param {string} missionId - ID da missão
     * @returns {Promise<Object>} - Missão desativada
     */
    async deactivateMission(missionId) {
        return await this.updateMission(missionId, { status: 'inativa' });
    }

    /**
     * Ativar missão
     * @param {string} missionId - ID da missão
     * @returns {Promise<Object>} - Missão ativada
     */
    async activateMission(missionId) {
        return await this.updateMission(missionId, { status: 'ativa' });
    }

    /**
     * Migrar missões do JSON para Firebase
     * @param {Array} missionsArray - Array de missões do JSON
     * @returns {Promise<Object>} - Resultado da migração
     */
    async migrateFromJSON(missionsArray) {
        try {
            console.log(`🔄 Migrando ${missionsArray.length} missões para Firebase...`);
            const batch = writeBatch(db);
            const results = { success: 0, errors: 0 };

            for (const mission of missionsArray) {
                try {
                    const missionDoc = db.collection(this.collectionName).doc();
                    const missionData = {
                        ...mission,
                        id: mission.id || missionDoc.id,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    batch.set(missionDoc, missionData);
                    results.success++;
                } catch (error) {
                    console.error(`❌ Erro ao migrar missão ${mission.titulo}:`, error.message);
                    results.errors++;
                }
            }

            await batch.commit();
            console.log(`✅ Migração concluída: ${results.success} sucesso, ${results.errors} erros`);
            return results;
        } catch (error) {
            console.error('❌ Erro na migração:', error);
            throw error;
        }
    }

    /**
     * Atualizar missão existente
     * @param {string} missionId - ID da missão
     * @param {Object} missionData - Novos dados da missão
     * @returns {Promise<Object>} - Missão atualizada
     */
    async updateMission(missionId, missionData) {
        try {
            const missionDoc = db.collection(this.collectionName).doc(missionId);

            // Remover campos que não devem ser atualizados
            const { id, createdAt, ...updateData } = missionData;

            const dataToUpdate = {
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            await missionDoc.update(dataToUpdate);
            console.log(`✅ Missão atualizada: ${missionId}`);

            return { ...missionData, id: missionId };
        } catch (error) {
            console.error(`❌ Erro ao atualizar missão ${missionId}:`, error);
            throw error;
        }
    }

    /**
     * Atualizar status de uma missão para um aluno específico
     * @param {string} missionId - ID da missão
     * @param {string} userId - ID do aluno
     * @param {string} newStatus - Novo status (disponivel, pendente, aprovada, rejeitada, concluida)
     * @returns {Promise<Object>} - Dados atualizados
     */
    async updateMissionStatus(missionId, userId, newStatus) {
        try {
            console.log(`🔄 Atualizando status da missão ${missionId} para aluno ${userId}: ${newStatus}`);

            const missionDoc = db.collection(this.collectionName).doc(missionId);

            // Manter o histórico de status
            const dataToUpdate = {
                [`userStatus.${userId}`]: newStatus,
                updatedAt: new Date().toISOString()
            };

            await missionDoc.update(dataToUpdate);
            console.log(`✅ Status da missão atualizado para: ${newStatus}`);

            return { missionId, userId, status: newStatus };
        } catch (error) {
            console.error(`❌ Erro ao atualizar status da missão ${missionId}:`, error);
            throw error;
        }
    }

    /**
     * Excluir missão
     * @param {string} missionId - ID da missão
     * @returns {Promise<boolean>} - true se excluída com sucesso
     */
    async deleteMission(missionId) {
        try {
            const missionDoc = db.collection(this.collectionName).doc(missionId);
            await missionDoc.delete();
            console.log(`✅ Missão excluída: ${missionId}`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao excluir missão ${missionId}:`, error);
            throw error;
        }
    }
}

module.exports = new MissionService();
