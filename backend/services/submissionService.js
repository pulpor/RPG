// Serviço de Submissões com Firebase Admin SDK
const { db, storage } = require('../config/firebase');

class SubmissionService {
    constructor() {
        this.collectionName = 'submissions';
    }

    /**
     * Criar nova submissão
     * @param {Object} submissionData - Dados da submissão
     * @param {Array} files - Arquivos para upload (opcional)
     * @returns {Promise<Object>} - Submissão criada
     */
    async createSubmission(submissionData, files = []) {
        try {
            const submissionDoc = db.collection(this.collectionName).doc();
            const submissionId = submissionDoc.id;

            // Upload de arquivos para Firebase Storage (se houver)
            const fileUrls = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    const fileData = await this.uploadFile(file, submissionData, submissionId);
                    // Adicionar apenas a URL (string), não o objeto completo
                    fileUrls.push(fileData.url);
                }
            }

            const newSubmission = {
                ...submissionData,
                id: submissionId,
                fileUrls,
                status: submissionData.status || 'pending',
                pending: submissionData.pending ?? true,
                submittedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await submissionDoc.set(newSubmission);
            console.log(`✅ Submissão criada: ${submissionId}`);

            return { ...newSubmission, id: submissionId };
        } catch (error) {
            console.error('❌ Erro ao criar submissão:', error);
            throw error;
        }
    }

    /**
     * Criar nova submissão com arquivos locais (sem Firebase Storage)
     * @param {Object} submissionData - Dados da submissão (já inclui fileUrls)
     * @returns {Promise<Object>} - Submissão criada
     */
    async createSubmissionLocal(submissionData) {
        try {
            const submissionDoc = db.collection(this.collectionName).doc();
            const submissionId = submissionDoc.id;

            const newSubmission = {
                ...submissionData,
                id: submissionId,
                status: submissionData.status || 'pending',
                pending: submissionData.pending ?? true,
                submittedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await submissionDoc.set(newSubmission);
            console.log(`✅ Submissão local criada: ${submissionId}`);

            return { ...newSubmission, id: submissionId };
        } catch (error) {
            console.error('❌ Erro ao criar submissão local:', error);
            throw error;
        }
    }

    /**
     * Upload de arquivo para Firebase Storage
     * @param {Object} file - Arquivo (multer file object)
     * @param {Object} submissionData - Dados da submissão (para organização)
     * @param {string} submissionId - ID da submissão
     * @returns {Promise<Object>} - Objeto com URL e metadados do arquivo
     */
    async uploadFile(file, submissionData, submissionId) {
        try {
            console.log('🔄 [Firebase] Iniciando upload de arquivo:', file.originalname || 'sem nome');

            // Verificar submissionData e dados essenciais
            if (!submissionData) {
                throw new Error('Dados da submissão ausentes');
            }

            const { masterUsername, userId, username } = submissionData;

            // Verificar valores obrigatórios
            if (!masterUsername) {
                console.warn('⚠️ [Firebase] masterUsername não definido, usando "desconhecido"');
                submissionData.masterUsername = 'desconhecido';
            }

            if (!userId) {
                throw new Error('ID do usuário ausente');
            }

            // Determinar nome do arquivo
            const fileName = file.originalname || file.name || `file_${Date.now()}`;
            console.log('🔄 [Firebase] Nome do arquivo:', fileName);
            const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

            // Criar caminho no Storage: submissions/{masterUsername}/{userId}/{submissionId}/{filename}
            const storagePath = `submissions/${submissionData.masterUsername}/${userId}/${submissionId}/${sanitizedFileName}`;
            console.log('🔄 [Firebase] Caminho no Storage:', storagePath);
            const storageRef = ref(storage, storagePath);

            // Preparar metadados
            const metadata = {
                contentType: file.mimetype || 'application/octet-stream',
                customMetadata: {
                    userId,
                    username: username || 'desconhecido',
                    masterUsername: submissionData.masterUsername,
                    submissionId,
                    originalName: fileName,
                    uploadedAt: new Date().toISOString()
                }
            };

            // Fazer upload do arquivo
            let fileBuffer;
            console.log('🔄 [Firebase] Preparando buffer do arquivo...');

            if (file.buffer) {
                console.log('🔄 [Firebase] Usando buffer direto');
                fileBuffer = file.buffer;
            } else if (file.path) {
                console.log('🔄 [Firebase] Lendo arquivo do disco:', file.path);
                const fs = require('fs').promises;
                try {
                    fileBuffer = await fs.readFile(file.path);
                } catch (fsErr) {
                    console.error('❌ [Firebase] Erro ao ler arquivo do disco:', fsErr);
                    throw new Error(`Erro ao ler arquivo: ${fsErr.message}`);
                }
            } else {
                throw new Error('Formato de arquivo inválido (sem buffer ou path)');
            }

            if (!fileBuffer || fileBuffer.length === 0) {
                throw new Error('Arquivo vazio ou inválido');
            }

            console.log('🔄 [Firebase] Enviando para Firebase Storage...');
            await uploadBytes(storageRef, fileBuffer, metadata);
            console.log('✅ [Firebase] Upload concluído para Storage');

            // Obter URL de download
            console.log('🔄 [Firebase] Obtendo URL de download...');
            const downloadURL = await getDownloadURL(storageRef);
            console.log('✅ [Firebase] URL de download obtida:', downloadURL.substring(0, 50) + '...');

            return {
                url: downloadURL,
                name: fileName,
                path: storagePath,
                size: file.size || fileBuffer.length,
                type: file.mimetype || 'application/octet-stream'
            };
        } catch (error) {
            console.error('❌ Erro ao fazer upload para Firebase Storage:', error);
            throw error;
        }
    }

    /**
     * Buscar submissão por ID
     * @param {string} submissionId - ID da submissão
     * @returns {Promise<Object|null>} - Dados da submissão ou null
     */
    async getSubmissionById(submissionId) {
        try {
            const submissionDoc = db.collection(this.collectionName).doc(submissionId);
            const submissionSnap = await submissionDoc.get();

            if (submissionSnap.exists) {
                const data = submissionSnap.data();

                // Converter Timestamps do Firestore para ISO strings
                if (data.submittedAt && data.submittedAt.toDate) {
                    data.submittedAt = data.submittedAt.toDate().toISOString();
                }
                if (data.createdAt && data.createdAt.toDate) {
                    data.createdAt = data.createdAt.toDate().toISOString();
                }
                if (data.updatedAt && data.updatedAt.toDate) {
                    data.updatedAt = data.updatedAt.toDate().toISOString();
                }

                return { id: submissionSnap.id, ...data };
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar submissão:', error);
            throw error;
        }
    }

    /**
     * Listar todas as submissões
     * @param {Object} filters - Filtros opcionais
     * @returns {Promise<Array>} - Lista de submissões
     */
    async getAllSubmissions(filters = {}) {
        try {
            let query = db.collection(this.collectionName);

            // Aplicar filtros
            if (filters.userId) {
                query = query.where('userId', '==', filters.userId);
            }
            if (filters.missionId) {
                query = query.where('missionId', '==', filters.missionId);
            }
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            if (filters.pending !== undefined) {
                query = query.where('pending', '==', filters.pending);
            }
            // NOVO: Filtro por masterUsername
            if (filters.masterUsername) {
                query = query.where('masterUsername', '==', filters.masterUsername);
            }

            const snapshot = await query.get();
            const submissions = [];

            snapshot.forEach((doc) => {
                const data = doc.data();

                // Converter Timestamps do Firestore para ISO strings
                if (data.submittedAt && data.submittedAt.toDate) {
                    data.submittedAt = data.submittedAt.toDate().toISOString();
                }
                if (data.createdAt && data.createdAt.toDate) {
                    data.createdAt = data.createdAt.toDate().toISOString();
                }
                if (data.updatedAt && data.updatedAt.toDate) {
                    data.updatedAt = data.updatedAt.toDate().toISOString();
                }

                submissions.push({ id: doc.id, ...data });
            });

            console.log(`📋 ${submissions.length} submissões encontradas (filtros: ${JSON.stringify(filters)})`);
            return submissions;
        } catch (error) {
            console.error('❌ Erro ao listar submissões:', error);
            throw error;
        }
    }

    /**
     * Buscar submissões de um usuário
     * @param {string} userId - ID do usuário
     * @returns {Promise<Array>} - Lista de submissões
     */
    async getSubmissionsByUser(userId) {
        return await this.getAllSubmissions({ userId });
    }

    /**
     * Buscar submissões pendentes
     * @param {string} masterUsername - Username do mestre (opcional)
     * @returns {Promise<Array>} - Lista de submissões pendentes
     */
    async getPendingSubmissions(masterUsername = null) {
        const filters = { pending: true, status: 'pending' };

        if (masterUsername) {
            // Buscar todas e filtrar por master
            const allPending = await this.getAllSubmissions(filters);
            return allPending.filter(s => s.masterUsername === masterUsername);
        }

        return await this.getAllSubmissions(filters);
    }

    /**
     * Atualizar submissão
     * @param {string} submissionId - ID da submissão
     * @param {Object} updates - Dados a atualizar
     * @returns {Promise<Object>} - Submissão atualizada
     */
    async updateSubmission(submissionId, updates) {
        try {
            console.log(`[SUBMISSION SERVICE] Atualizando submissão ${submissionId} com:`, updates);
            const submissionDoc = db.collection(this.collectionName).doc(submissionId);

            const updateData = {
                ...updates,
                updatedAt: new Date().toISOString()
            };

            // Remover campos undefined (Firestore não aceita undefined)
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            // Se mudou o status, adicionar timestamp de revisão
            if (updates.status && updates.status !== 'pending') {
                updateData.reviewedAt = new Date().toISOString();
            }

            console.log(`[SUBMISSION SERVICE] Dados a serem salvos:`, updateData);
            await submissionDoc.update(updateData);
            console.log(`✅ Submissão atualizada: ${submissionId}`);

            return await this.getSubmissionById(submissionId);
        } catch (error) {
            console.error('❌ Erro ao atualizar submissão:', error);
            console.error('❌ Stack:', error.stack);
            throw error;
        }
    }

    /**
     * Aprovar submissão
     * @param {string} submissionId - ID da submissão
     * @param {Object} reviewData - Dados da revisão (feedback, xpAwarded)
     * @returns {Promise<Object>} - Submissão aprovada
     */
    async approveSubmission(submissionId, reviewData) {
        return await this.updateSubmission(submissionId, {
            status: 'approved',
            pending: false,
            feedback: reviewData.feedback,
            xpAwarded: reviewData.xpAwarded,
            geminiAnalysis: reviewData.geminiAnalysis
        });
    }

    /**
     * Rejeitar submissão
     * @param {string} submissionId - ID da submissão
     * @param {string} feedback - Feedback da rejeição
     * @returns {Promise<Object>} - Submissão rejeitada
     */
    async rejectSubmission(submissionId, feedback) {
        return await this.updateSubmission(submissionId, {
            status: 'rejected',
            pending: false,
            feedback
        });
    }

    /**
     * Deletar submissão (e arquivos locais)
     * @param {string} submissionId - ID da submissão
     * @returns {Promise<boolean>} - Sucesso
     */
    async deleteSubmission(submissionId) {
        try {
            // Buscar submissão para pegar caminhos dos arquivos
            const submission = await this.getSubmissionById(submissionId);

            if (submission && submission.fileUrls) {
                // Deletar arquivos locais
                for (const filePath of submission.fileUrls) {
                    try {
                        // Converter caminho relativo para absoluto
                        const localPath = path.join(process.cwd(), filePath.replace(/^\//, ''));
                        const metadataPath = `${localPath}.metadata.json`;

                        // Deletar arquivo e metadados
                        if (fs.existsSync(localPath)) {
                            fs.unlinkSync(localPath);
                        }

                        if (fs.existsSync(metadataPath)) {
                            fs.unlinkSync(metadataPath);
                        }
                    } catch (error) {
                        console.warn(`⚠️ Erro ao deletar arquivo: ${filePath}`, error.message);
                    }
                }
            }

            // Deletar documento do Firestore
            const submissionDoc = db.collection(this.collectionName).doc(submissionId);
            await submissionDoc.delete();
            console.log(`✅ Submissão deletada: ${submissionId}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao deletar submissão:', error);
            throw error;
        }
    }

    /**
     * Migrar submissões do JSON para Firebase
     * @param {Array} submissionsArray - Array de submissões do JSON
     * @returns {Promise<Object>} - Resultado da migração
     */
    async migrateFromJSON(submissionsArray) {
        try {
            console.log(`🔄 Migrando ${submissionsArray.length} submissões para Firebase...`);
            const results = { success: 0, errors: 0, filesUploaded: 0 };

            for (const submission of submissionsArray) {
                try {
                    const submissionDoc = db.collection(this.collectionName).doc();

                    // Referências para arquivos locais (sem upload para Storage)
                    const fileUrls = [];
                    if (submission.filePaths && submission.filePaths.length > 0) {
                        for (const filePath of submission.filePaths) {
                            if (fs.existsSync(filePath)) {
                                try {
                                    const localPath = await this.uploadFile(
                                        filePath,
                                        submission,
                                        submissionDoc.id
                                    );
                                    fileUrls.push(localPath);
                                    results.filesUploaded++;
                                } catch (error) {
                                    console.warn(`⚠️ Erro ao fazer upload de ${filePath}:`, error.message);
                                }
                            }
                        }
                    }

                    const submissionData = {
                        ...submission,
                        id: submission.id || submissionDoc.id,
                        fileUrls,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    await submissionDoc.set(submissionData);
                    results.success++;
                } catch (error) {
                    console.error(`❌ Erro ao migrar submissão ${submission.id}:`, error.message);
                    results.errors++;
                }
            }

            console.log(`✅ Migração concluída: ${results.success} sucesso, ${results.errors} erros, ${results.filesUploaded} arquivos`);
            return results;
        } catch (error) {
            console.error('❌ Erro na migração:', error);
            throw error;
        }
    }
}

module.exports = new SubmissionService();
