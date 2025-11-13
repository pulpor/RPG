// Configuração do Firebase Admin SDK para Node.js (Backend)
const admin = require('firebase-admin');
require('dotenv').config();

// Configuração do Firebase a partir das variáveis de ambiente
const firebaseConfig = {
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

// Validar configuração
const validateConfig = () => {
    const required = ['projectId', 'storageBucket'];
    const missing = required.filter(key => !process.env[`FIREBASE_${key.toUpperCase()}`] && key !== 'storageBucket');

    if (!process.env.FIREBASE_PROJECT_ID) {
        console.error('❌ FIREBASE_PROJECT_ID está faltando!');
        throw new Error('Firebase configuration incomplete');
    }

    // Se não tem credenciais Admin, tenta usar as variáveis padrão
    if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.warn('⚠️  Credenciais Admin não encontradas, tentando Application Default Credentials...');
        return 'default';
    }

    console.log('✅ Configuração do Firebase Admin validada');
    return 'custom';
};

// Inicializar Firebase Admin
let app, db, storage;

try {
    const configType = validateConfig();
    
    if (configType === 'default') {
        // Inicializar com credenciais padrão (funciona na Vercel se configurado corretamente)
        app = admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
    } else {
        // Inicializar com service account
        app = admin.initializeApp(firebaseConfig);
    }

    db = admin.firestore();
    storage = admin.storage();

    console.log('✅ Firebase Admin inicializado com sucesso');
    console.log(`   Projeto: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log(`   Storage: ${process.env.FIREBASE_STORAGE_BUCKET}`);
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
    console.error('⚠️  O servidor continuará rodando mas as rotas que dependem do Firebase falharão');
    console.error('⚠️  Configure as variáveis de ambiente do Firebase na Vercel!');
}

module.exports = {
    admin,
    app,
    db,
    storage,
    firebaseConfig
};
