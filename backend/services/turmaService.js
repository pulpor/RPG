// Serviço de Turmas com Firebase Admin SDK
const { db } = require('../config/firebase');

class TurmaService {
    constructor() {
        this.collectionName = 'turmas';
        // Coleção de relacionamentos aluno-turma
        this.alunosTurmasCollection = 'alunos-turmas';
    }

    /**
     * Criar nova turma
     * @param {Object} turmaData - Dados da turma
     * @returns {Promise<Object>} - Turma criada
     */
    async createTurma(turmaData) {
        try {
            const turmaDoc = db.collection(this.collectionName).doc();
            const turmaId = turmaDoc.id;

            const newTurma = {
                ...turmaData,
                id: turmaId,
                students: turmaData.students || [],
                active: turmaData.active ?? true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await turmaDoc.set(newTurma);

            // Criar relacionamentos aluno-turma
            if (newTurma.students.length > 0) {
                await this.syncAlunosTurmas(turmaId, newTurma.students, turmaData.masterUsername);
            }

            console.log(`✅ Turma criada: ${newTurma.nome} (${turmaId})`);
            return { ...newTurma, id: turmaId };
        } catch (error) {
            console.error('❌ Erro ao criar turma:', error);
            throw error;
        }
    }

    /**
     * Buscar turma por ID
     * @param {string} turmaId - ID da turma
     * @returns {Promise<Object|null>} - Dados da turma ou null
     */
    async getTurmaById(turmaId) {
        try {
            const turmaDoc = db.collection(this.collectionName).doc(turmaId);
            const turmaSnap = await turmaDoc.get();

            if (turmaSnap.exists) {
                return { id: turmaSnap.id, ...turmaSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar turma:', error);
            throw error;
        }
    }

    /**
     * Listar todas as turmas
     * @param {Object} filters - Filtros opcionais
     * @returns {Promise<Array>} - Lista de turmas
     */
    async getAllTurmas(filters = {}) {
        try {
            let query = db.collection(this.collectionName);

            // Aplicar filtros
            if (filters.masterUsername) {
                query = query.where('masterUsername', '==', filters.masterUsername);
            }
            if (filters.active !== undefined) {
                query = query.where('active', '==', filters.active);
            }

            const snapshot = await query.get();
            const turmas = [];

            snapshot.forEach((doc) => {
                turmas.push({ id: doc.id, ...doc.data() });
            });

            console.log(`📋 ${turmas.length} turmas encontradas`);
            return turmas;
        } catch (error) {
            console.error('❌ Erro ao listar turmas:', error);
            throw error;
        }
    }

    /**
     * Buscar turmas de um mestre
     * @param {string} masterUsername - Username do mestre
     * @returns {Promise<Array>} - Lista de turmas
     */
    async getTurmasByMaster(masterUsername) {
        return await this.getAllTurmas({ masterUsername });
    }

    /**
     * Buscar turmas de um aluno
     * @param {string} userId - ID do usuário
     * @returns {Promise<Array>} - Lista de turmas
     */
    async getTurmasByStudent(userId) {
        try {
            // Buscar relacionamentos do aluno
            const q = query(this.alunosTurmasRef, where('userId', '==', userId));
            const snapshot = await query.get();

            const turmaIds = [];
            snapshot.forEach((doc) => {
                turmaIds.push(doc.data().turmaId);
            });

            // Buscar dados completos das turmas
            const turmas = [];
            for (const turmaId of turmaIds) {
                const turma = await this.getTurmaById(turmaId);
                if (turma) {
                    turmas.push(turma);
                }
            }

            console.log(`📋 Aluno ${userId} está em ${turmas.length} turmas`);
            return turmas;
        } catch (error) {
            console.error('❌ Erro ao buscar turmas do aluno:', error);
            throw error;
        }
    }

    /**
     * Atualizar turma
     * @param {string} turmaId - ID da turma
     * @param {Object} updates - Dados a atualizar
     * @returns {Promise<Object>} - Turma atualizada
     */
    async updateTurma(turmaId, updates) {
        try {
            const turmaDoc = db.collection(this.collectionName).doc(turmaId);

            const updateData = {
                ...updates,
                updatedAt: new Date().toISOString()
            };

            // Se os alunos mudaram, sincronizar relacionamentos
            if (updates.students) {
                const turmaAtual = await this.getTurmaById(turmaId);
                if (turmaAtual) {
                    await this.syncAlunosTurmas(turmaId, updates.students, turmaAtual.masterUsername);
                }
            }

            await turmaDoc.update(updateData);
            console.log(`✅ Turma atualizada: ${turmaId}`);

            return await this.getTurmaById(turmaId);
        } catch (error) {
            console.error('❌ Erro ao atualizar turma:', error);
            throw error;
        }
    }

    /**
     * Adicionar aluno à turma
     * @param {string} turmaId - ID da turma
     * @param {string} userId - ID do usuário
     * @returns {Promise<Object>} - Turma atualizada
     */
    async addStudentToTurma(turmaId, userId) {
        try {
            const turmaDoc = db.collection(this.collectionName).doc(turmaId);
            const turma = await this.getTurmaById(turmaId);

            if (!turma) {
                throw new Error('Turma não encontrada');
            }

            // Adicionar aluno ao array
            await turmaDoc.update({
                students: arrayUnion(userId),
                updatedAt: new Date().toISOString()
            });

            // Criar relacionamento aluno-turma
            await this.createAlunoTurmaRelation(userId, turmaId, turma.masterUsername);

            console.log(`✅ Aluno ${userId} adicionado à turma ${turmaId}`);
            return await this.getTurmaById(turmaId);
        } catch (error) {
            console.error('❌ Erro ao adicionar aluno:', error);
            throw error;
        }
    }

    /**
     * Remover aluno da turma
     * @param {string} turmaId - ID da turma
     * @param {string} userId - ID do usuário
     * @returns {Promise<Object>} - Turma atualizada
     */
    async removeStudentFromTurma(turmaId, userId) {
        try {
            const turmaDoc = db.collection(this.collectionName).doc(turmaId);

            // Remover aluno do array
            await turmaDoc.update({
                students: arrayRemove(userId),
                updatedAt: new Date().toISOString()
            });

            // Deletar relacionamento aluno-turma
            await this.deleteAlunoTurmaRelation(userId, turmaId);

            console.log(`✅ Aluno ${userId} removido da turma ${turmaId}`);
            return await this.getTurmaById(turmaId);
        } catch (error) {
            console.error('❌ Erro ao remover aluno:', error);
            throw error;
        }
    }

    /**
     * Desativar turma (soft delete)
     * @param {string} turmaId - ID da turma
     * @returns {Promise<Object>} - Turma desativada
     */
    async deactivateTurma(turmaId) {
        return await this.updateTurma(turmaId, { active: false });
    }

    /**
     * Ativar turma
     * @param {string} turmaId - ID da turma
     * @returns {Promise<Object>} - Turma ativada
     */
    async activateTurma(turmaId) {
        return await this.updateTurma(turmaId, { active: true });
    }

    /**
     * Deletar turma
     * @param {string} turmaId - ID da turma
     * @returns {Promise<boolean>} - Sucesso
     */
    async deleteTurma(turmaId) {
        try {
            const turma = await this.getTurmaById(turmaId);

            if (turma) {
                // Deletar todos os relacionamentos aluno-turma
                await this.deleteAllAlunoTurmaRelations(turmaId);
            }

            const turmaDoc = db.collection(this.collectionName).doc(turmaId);
            await turmaDoc.delete();
            console.log(`✅ Turma deletada: ${turmaId}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao deletar turma:', error);
            throw error;
        }
    }

    // ==================== RELACIONAMENTOS ALUNO-TURMA ====================

    /**
     * Criar relacionamento aluno-turma
     * @param {string} userId - ID do usuário
     * @param {string} turmaId - ID da turma
     * @param {string} masterUsername - Username do mestre
     */
    async createAlunoTurmaRelation(userId, turmaId, masterUsername) {
        try {
            const relationId = `${userId}_${turmaId}`;
            const relationDoc = doc(db, this.alunosTurmasCollection, relationId);

            await relationDoc.set({
                userId,
                turmaId,
                masterUsername,
                createdAt: new Date().toISOString()
            });

            console.log(`✅ Relacionamento criado: ${relationId}`);
        } catch (error) {
            console.error('❌ Erro ao criar relacionamento:', error);
            throw error;
        }
    }

    /**
     * Deletar relacionamento aluno-turma
     * @param {string} userId - ID do usuário
     * @param {string} turmaId - ID da turma
     */
    async deleteAlunoTurmaRelation(userId, turmaId) {
        try {
            const relationId = `${userId}_${turmaId}`;
            const relationDoc = doc(db, this.alunosTurmasCollection, relationId);
            await relationDoc.delete();
            console.log(`✅ Relacionamento deletado: ${relationId}`);
        } catch (error) {
            console.error('❌ Erro ao deletar relacionamento:', error);
            throw error;
        }
    }

    /**
     * Deletar todos os relacionamentos de uma turma
     * @param {string} turmaId - ID da turma
     */
    async deleteAllAlunoTurmaRelations(turmaId) {
        try {
            const q = query(this.alunosTurmasRef, where('turmaId', '==', turmaId));
            const snapshot = await query.get();

            const batch = writeBatch(db);
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            console.log(`✅ Relacionamentos da turma ${turmaId} deletados`);
        } catch (error) {
            console.error('❌ Erro ao deletar relacionamentos:', error);
            throw error;
        }
    }

    /**
     * Sincronizar relacionamentos aluno-turma
     * @param {string} turmaId - ID da turma
     * @param {Array} studentIds - Lista de IDs de alunos
     * @param {string} masterUsername - Username do mestre
     */
    async syncAlunosTurmas(turmaId, studentIds, masterUsername) {
        try {
            // Buscar relacionamentos existentes
            const q = query(this.alunosTurmasRef, where('turmaId', '==', turmaId));
            const snapshot = await query.get();

            const existingRelations = new Set();
            snapshot.forEach((doc) => {
                existingRelations.add(doc.data().userId);
            });

            // Criar novos relacionamentos
            for (const userId of studentIds) {
                if (!existingRelations.has(userId)) {
                    await this.createAlunoTurmaRelation(userId, turmaId, masterUsername);
                }
            }

            // Deletar relacionamentos removidos
            const newStudentIds = new Set(studentIds);
            for (const existingUserId of existingRelations) {
                if (!newStudentIds.has(existingUserId)) {
                    await this.deleteAlunoTurmaRelation(existingUserId, turmaId);
                }
            }

            console.log(`✅ Relacionamentos sincronizados para turma ${turmaId}`);
        } catch (error) {
            console.error('❌ Erro ao sincronizar relacionamentos:', error);
            throw error;
        }
    }

    /**
     * Migrar turmas do JSON para Firebase
     * @param {Array} turmasArray - Array de turmas do JSON
     * @returns {Promise<Object>} - Resultado da migração
     */
    async migrateFromJSON(turmasArray) {
        try {
            console.log(`🔄 Migrando ${turmasArray.length} turmas para Firebase...`);
            const results = { success: 0, errors: 0 };

            for (const turma of turmasArray) {
                try {
                    const turmaDoc = db.collection(this.collectionName).doc();

                    const turmaData = {
                        ...turma,
                        id: turma.id || turmaDoc.id,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    await turmaDoc.set(turmaData);

                    // Criar relacionamentos
                    if (turma.students && turma.students.length > 0) {
                        await this.syncAlunosTurmas(turmaDoc.id, turma.students, turma.masterUsername);
                    }

                    results.success++;
                } catch (error) {
                    console.error(`❌ Erro ao migrar turma ${turma.id}:`, error.message);
                    results.errors++;
                }
            }

            console.log(`✅ Migração concluída: ${results.success} sucesso, ${results.errors} erros`);
            return results;
        } catch (error) {
            console.error('❌ Erro na migração:', error);
            throw error;
        }
    }

    /**
     * Migrar relacionamentos aluno-turma do JSON para Firebase
     * @param {Array} alunosTurmasArray - Array de relacionamentos do JSON
     * @returns {Promise<Object>} - Resultado da migração
     */
    async migrateAlunosTurmasFromJSON(alunosTurmasArray) {
        try {
            console.log(`🔄 Migrando ${alunosTurmasArray.length} relacionamentos aluno-turma...`);
            const results = { success: 0, errors: 0 };

            for (const relation of alunosTurmasArray) {
                try {
                    await this.createAlunoTurmaRelation(
                        relation.userId,
                        relation.turmaId,
                        relation.masterUsername
                    );
                    results.success++;
                } catch (error) {
                    console.error(`❌ Erro ao migrar relacionamento:`, error.message);
                    results.errors++;
                }
            }

            console.log(`✅ Migração concluída: ${results.success} sucesso, ${results.errors} erros`);
            return results;
        } catch (error) {
            console.error('❌ Erro na migração:', error);
            throw error;
        }
    }
}

module.exports = new TurmaService();
