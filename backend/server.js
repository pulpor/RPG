// Carregar variáveis de ambiente
// Em desenvolvimento local: usa arquivo .env
// No Vercel: usa variáveis de ambiente da plataforma
const path = require('path');
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
}

// Inicializar Firebase (deve ser feito antes de importar as rotas)
require('./config/firebase');

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const autenticacaoRotas = require('./routes/auth');
const missoesRotas = require('./routes/missions');
const usuariosRotas = require('./routes/users');
const submissoesRotas = require('./routes/submissions');
const geminiRotas = require('./routes/gemini');
const turmasRotas = require('./routes/turmas');
const bugReportEmailRotas = require('./routes/bugReportEmail');

const app = express();
const port = 3000;

// Log rápido para validar a presença da chave em runtime
console.log('[ENV] GEMINI_API_KEY presente:', process.env.GEMINI_API_KEY ? 'SIM' : 'NÃO');

// Configurar CORS - permite localhost em dev e domínio do Vercel em produção
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  // Adicione sua URL do Vercel aqui após o deploy
  // 'https://seu-projeto.vercel.app',
];

// Em produção no Vercel, aceita o próprio domínio automaticamente
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (como mobile apps ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      console.warn('[CORS] Origin não permitida:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// limite de payload para upload de arquivos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// NÃO usar multer global - cada rota usa seu próprio middleware

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

// Middleware de logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Log especial para requisições do Gemini
  if (req.url.includes('/gemini')) {
    console.log('🤖 [GEMINI] Requisição detectada!');
    console.log('   - Method:', req.method);
    console.log('   - URL:', req.url);
    console.log('   - Headers:', JSON.stringify(req.headers, null, 2));
  }

  // Log extra para login
  if (req.method === "POST" && req.url === "/auth/login") {
    console.log("[LOGIN DEBUG] Body recebido:", req.body);
  }
  next();
});

// Configurar rotas
console.log('[SERVER] Configurando rotas...');
app.use('/auth', autenticacaoRotas);
app.use('/missoes', missoesRotas);
app.use('/usuarios', usuariosRotas);
app.use('/submissoes', submissoesRotas);
app.use('/gemini', geminiRotas);
app.use('/turmas', turmasRotas);
app.use('/api', bugReportEmailRotas);
app.use('/files', require('./routes/files'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('[SERVER] ✅ Rotas configuradas');

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rota padrão para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.post('/api/register', (req, res) => {
  // Receba os dados, salve em uma lista de pendentes, não em users.json
  // Exemplo:
  // pendingUsers.push({ ...req.body });
  // res.json({ success: true });
});

// Middleware para rotas não encontradas (404) - sempre retorna JSON
app.use((req, res, next) => {
  res.status(404).json({ error: 'Rota não encontrada', url: req.originalUrl });
});

// Handlers de erro para evitar que o processo termine
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Iniciar servidor apenas em desenvolvimento local
// No Vercel, o app é exportado como serverless function
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const server = app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log('📋 Rotas disponíveis:');
    console.log('   - POST /auth/login');
    console.log('   - POST /auth/register');
    console.log('   - GET  /missoes (requer autenticação)');
    console.log('   - POST /missoes (requer autenticação de mestre)');
    console.log('   - GET  /usuarios/me (requer autenticação)');
    console.log('   - GET  /submissoes/my-submissions (requer autenticação)');
    console.log('✅ Sistema pronto para uso!');
    console.log('🔥 Firebase Firestore: Conectado');
    console.log('🤖 Gemini 2.5-Flash: Configurado');
  });

  // Aumentar timeout para upload de arquivos (60 segundos)
  server.timeout = 60000;
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  server.on('error', (err) => {
    console.error('❌ Erro no servidor:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`Porta ${port} já está em uso. Tente fechar outros processos ou use outra porta.`);
    }
  });
}

// Exportar app para Vercel serverless
module.exports = app;