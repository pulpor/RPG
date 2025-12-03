// Carregar variáveis de ambiente a partir de backend/.env (caminho absoluto)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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
const debugRotas = require('./routes/debug');

const app = express();
const port = process.env.PORT || 3000;

// CORS deve vir PRIMEIRO antes de qualquer outra coisa
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://127.0.0.1:5500',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://pulpor.github.io',
      'https://rpg-azure.vercel.app'
    ];

    // Permitir requisições sem origin (mobile apps, postman, etc)
    if (!origin) return callback(null, true);

    // Verificar se origin está na lista OU termina com vercel.app
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app') || origin.includes('github.io')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Adicionar headers CORS manualmente como backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('github.io') || origin.includes('vercel.app') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  // Responder imediatamente para OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// limite de payload para upload de arquivos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

// Health check endpoint (sem autenticação)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    firebase: '✅',
    gemini: process.env.GEMINI_API_KEY ? '✅' : '❌'
  });
});

// Configurar rotas
app.use('/auth', autenticacaoRotas);
app.use('/missoes', missoesRotas);
app.use('/usuarios', usuariosRotas);
app.use('/submissoes', submissoesRotas);
app.use('/gemini', geminiRotas);
app.use('/turmas', turmasRotas);
app.use('/api', bugReportEmailRotas);
app.use('/debug', debugRotas);
app.use('/files', require('./routes/files'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rota padrão para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.post('/api/register', (req, res) => {
  // Receba os dados, salve em uma lista de pendentes, não em users.json
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

// Iniciar servidor apenas em ambiente standalone (não serverless)
if (require.main === module) {
  const server = app.listen(port, () => {
    // Server started
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

// Exportar o app (necessário para Vercel Serverless Functions)
module.exports = app;