const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Endpoint de debug para testar Firebase
router.get('/test-firebase', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({
                error: 'Firebase não inicializado',
                hint: 'Verifique as variáveis de ambiente'
            });
        }

        const { collection, getDocs } = require('firebase/firestore');
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        res.json({
            status: 'ok',
            firebaseConnected: true,
            usersCount: snapshot.size,
            message: 'Firebase funcionando!'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack,
            hint: 'Erro ao conectar com Firebase'
        });
    }
});

module.exports = router;
