// Serviço de Submissões com Firebase Firestore + Storage
const {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    writeBatch
} = require('firebase/firestore');
const {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} = require('firebase/storage');
const { db, storage } = require('../config/firebase');

class SubmissionService {
    constructor() {
        this.collectionName = 'submissions';
        this.submissionsRef = collection(db, this.collectionName);
    }

    /**
     * Criar nova submissão
     * @param {Object} submissionData - Dados da submissão
     * @param {Array} files - Arquivos para upload (opcional)
     * @returns {Promise<Object>} - Submissão criada
     */
    async createSubmission(submissionData, files = []) {
        try {
            const submissionDoc = doc(this.submissionsRef);
            const submissionId = submissionDoc.id;

            // Upload de arquivos para Firebase Storage (se houver)
            const fileUrls = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    const fileUrl = await this.uploadFile(file, submissionData, submissionId);
                    fileUrls.push(fileUrl);
                }
            }

            const newSubmission = {
                ...submissionData,
                id: submissionId,
                fileUrls,
                status: submissionData.status || 'pending',
                pending: submissionData.pending ?? true,
                submittedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(submissionDoc, newSubmission);
            console.log(`✅ Submissão criada: ${submissionId}`);

            return { ...newSubmission, id: submissionId };
        } catch (error) {
            console.error('❌ Erro ao criar submissão:', error);
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
            const { masterUsername, userId, username } = submissionData;

            // Determinar nome do arquivo
            const fileName = file.originalname || file.name || `file_${Date.now()}`;
            const fileExtension = fileName.split('.').pop();
            const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

            // Criar caminho no Storage: submissions/{masterUsername}/{userId}/{submissionId}/{filename}
            const storagePath = `submissions/${masterUsername}/${userId}/${submissionId}/${sanitizedFileName}`;
            const storageRef = ref(storage, storagePath);

            // Preparar metadados
            const metadata = {
                contentType: file.mimetype || 'application/octet-stream',
                customMetadata: {
                    userId,
                    username,
                    masterUsername,
                    submissionId,
                    originalName: fileName,
                    uploadedAt: new Date().toISOString()
                }
            };

            // Fazer upload do arquivo
            let fileBuffer;
            if (file.buffer) {
                fileBuffer = file.buffer;
            } else if (file.path) {
                const fs = require('fs');
                fileBuffer = fs.readFileSync(file.path);
            } else {
                throw new Error('Formato de arquivo inválido');
            }

            await uploadBytes(storageRef, fileBuffer, metadata);

            // Obter URL de download
            const downloadURL = await getDownloadURL(storageRef);

            console.log(`✅ Arquivo enviado para Firebase Storage: ${sanitizedFileName}`);

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
            const submissionDoc = doc(db, this.collectionName, submissionId);
            const submissionSnap = await getDoc(submissionDoc);

            if (submissionSnap.exists()) {
                return { id: submissionSnap.id, ...submissionSnap.data() };
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
            let q = this.submissionsRef;

            // Aplicar filtros
            if (filters.userId) {
                q = query(q, where('userId', '==', filters.userId));
            }
            if (filters.missionId) {
                q = query(q, where('missionId', '==', filters.missionId));
            }
            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }
            if (filters.pending !== undefined) {
                q = query(q, where('pending', '==', filters.pending));
            }

            const querySnapshot = await getDocs(q);
            const submissions = [];

            querySnapshot.forEach((doc) => {
                submissions.push({ id: doc.id, ...doc.data() });
            });

            console.log(`📋 ${submissions.length} submissões encontradas`);
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
            const submissionDoc = doc(db, this.collectionName, submissionId);

            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            // Se mudou o status, adicionar timestamp de revisão
            if (updates.status && updates.status !== 'pending') {
                updateData.reviewedAt = serverTimestamp();
            }

            await updateDoc(submissionDoc, updateData);
            console.log(`✅ Submissão atualizada: ${submissionId}`);

            return await this.getSubmissionById(submissionId);
        } catch (error) {
            console.error('❌ Erro ao atualizar submissão:', error);
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
            const submissionDoc = doc(db, this.collectionName, submissionId);
            await deleteDoc(submissionDoc);
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
                    const submissionDoc = doc(this.submissionsRef);

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
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    };

                    await setDoc(submissionDoc, submissionData);
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
