// Serviço de Usuários com Firebase Firestore
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
const { db } = require('../config/firebase');

class UserService {
    constructor() {
        this.collectionName = 'users';
        this.usersRef = collection(db, this.collectionName);
    }

    /**
     * Criar novo usuário
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<Object>} - Usuário criado
     */
    async createUser(userData) {
        try {
            const userDoc = doc(this.usersRef);
            const userId = userDoc.id;

            const newUser = {
                ...userData,
                id: userId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                xp: userData.xp || 0,
                level: userData.level || 1,
                approved: userData.approved ?? false
            };

            await setDoc(userDoc, newUser);
            console.log(`✅ Usuário criado: ${userData.username} (${userId})`);

            return { ...newUser, id: userId };
        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            throw error;
        }
    }

    /**
     * Buscar usuário por ID
     * @param {string} userId - ID do usuário
     * @returns {Promise<Object|null>} - Dados do usuário ou null
     */
    async getUserById(userId) {
        try {
            const userDoc = doc(db, this.collectionName, userId);
            const userSnap = await getDoc(userDoc);

            if (userSnap.exists()) {
                return { id: userSnap.id, ...userSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar usuário:', error);
            throw error;
        }
    }

    /**
     * Buscar usuário por username
     * @param {string} username - Nome de usuário
     * @returns {Promise<Object|null>} - Dados do usuário ou null
     */
    async getUserByUsername(username) {
        try {
            const q = query(this.usersRef, where('username', '==', username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                return { id: userDoc.id, ...userDoc.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao buscar usuário por username:', error);
            throw error;
        }
    }

    /**
     * Listar todos os usuários
     * @param {Object} filters - Filtros opcionais (isMaster, approved, etc)
     * @returns {Promise<Array>} - Lista de usuários
     */
    async getAllUsers(filters = {}) {
        try {
            let q = this.usersRef;

            // Aplicar filtros
            if (filters.isMaster !== undefined) {
                q = query(q, where('isMaster', '==', filters.isMaster));
            }
            if (filters.approved !== undefined) {
                q = query(q, where('approved', '==', filters.approved));
            }
            if (filters.masterUsername) {
                q = query(q, where('masterUsername', '==', filters.masterUsername));
            }

            const querySnapshot = await getDocs(q);
            const users = [];

            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });

            return users;
        } catch (error) {
            console.error('❌ Erro ao listar usuários:', error);
            throw error;
        }
    }

    /**
     * Atualizar usuário
     * @param {string} userId - ID do usuário
     * @param {Object} updates - Dados a atualizar
     * @returns {Promise<Object>} - Usuário atualizado
     */
    async updateUser(userId, updates) {
        try {
            const userDoc = doc(db, this.collectionName, userId);

            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            await updateDoc(userDoc, updateData);
            console.log(`✅ Usuário atualizado: ${userId}`);

            return await this.getUserById(userId);
        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    /**
     * Deletar usuário
     * @param {string} userId - ID do usuário
     * @returns {Promise<boolean>} - Sucesso
     */
    async deleteUser(userId) {
        try {
            const userDoc = doc(db, this.collectionName, userId);
            await deleteDoc(userDoc);
            console.log(`✅ Usuário deletado: ${userId}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao deletar usuário:', error);
            throw error;
        }
    }

    /**
     * Aprovar usuário (para alunos)
     * @param {string} userId - ID do usuário
     * @returns {Promise<Object>} - Usuário aprovado
     */
    async approveUser(userId) {
        return await this.updateUser(userId, { approved: true });
    }

    /**
     * Atualizar XP do usuário
     * @param {string} userId - ID do usuário
     * @param {number} xpToAdd - XP a adicionar
     * @returns {Promise<Object>} - Usuário com XP atualizado
     */
    async addXP(userId, xpToAdd) {
        console.log(`[ADD-XP] ⭐ Iniciando adição de XP`);
        console.log(`[ADD-XP] ⭐ UserId: ${userId}`);
        console.log(`[ADD-XP] ⭐ XP a adicionar: ${xpToAdd}`);

        const user = await this.getUserById(userId);
        if (!user) throw new Error('User not found');

        console.log(`[ADD-XP] ⭐ XP atual do usuário: ${user.xp || 0}`);
        const newXP = (user.xp || 0) + xpToAdd;
        console.log(`[ADD-XP] ⭐ Novo XP total: ${newXP}`);

        // Calcular nível real usando tabela do sistema de níveis
        const { calculateLevel } = require('../utils/levelSystem');
        const levelInfo = calculateLevel(newXP);
        const newLevel = levelInfo.currentLevel;

        console.log(`[ADD-XP] ⭐ Nível anterior: ${user.level || 1}`);
        console.log(`[ADD-XP] ⭐ Novo nível: ${newLevel}`);

        const updatedUser = await this.updateUser(userId, {
            xp: newXP,
            level: newLevel
        });

        console.log(`[ADD-XP] ✅ XP atualizado com sucesso!`);
        return updatedUser;
    }

    /**
     * Migrar usuários do JSON para Firebase
     * @param {Array} usersArray - Array de usuários do JSON
     * @returns {Promise<Object>} - Resultado da migração
     */
    async migrateFromJSON(usersArray) {
        try {
            console.log(`🔄 Migrando ${usersArray.length} usuários para Firebase...`);
            const batch = writeBatch(db);
            const results = { success: 0, errors: 0 };

            for (const user of usersArray) {
                try {
                    const userDoc = doc(this.usersRef);
                    const userData = {
                        ...user,
                        id: user.id || userDoc.id,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    };

                    batch.set(userDoc, userData);
                    results.success++;
                } catch (error) {
                    console.error(`❌ Erro ao migrar usuário ${user.username}:`, error.message);
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
}

module.exports = new UserService();
