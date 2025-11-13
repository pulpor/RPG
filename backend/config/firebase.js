// Configuração do Firebase para Node.js
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');
require('dotenv').config();

// Configuração do Firebase a partir das variáveis de ambiente
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Validar configuração
const validateConfig = () => {
    const required = ['apiKey', 'authDomain', 'projectId', 'appId', 'storageBucket'];
    const missing = required.filter(key => !firebaseConfig[key]);

    if (missing.length > 0) {
        console.error('❌ Configuração do Firebase incompleta!');
        console.error('   Faltando no .env:', missing.join(', '));
        console.error('   Configure em: backend/.env');
        throw new Error('Firebase configuration incomplete');
    }

    console.log('✅ Configuração do Firebase validada');
    return true;
};

// Inicializar Firebase
let app, db, storage;

try {
    validateConfig();

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);

    console.log('✅ Firebase inicializado com sucesso');
    console.log(`   Projeto: ${firebaseConfig.projectId}`);
    console.log(`   Storage: ${firebaseConfig.storageBucket}`);
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error.message);
    console.error('⚠️  O servidor continuará rodando mas as rotas que dependem do Firebase falharão');
    console.error('⚠️  Configure as variáveis de ambiente do Firebase na Vercel!');
    // Não fazer process.exit(1) para não crashear serverless
}

module.exports = {
    app,
    db,
    storage,
    firebaseConfig
};
