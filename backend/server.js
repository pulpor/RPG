// Carregar variáveis de ambiente a partir de backend/.env (caminho absoluto)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Inicializar Firebase (deve ser feito antes de importar as rotas)
require('./config/firebase');

const express = require('express');
const cors = require('cors');
const autenticacaoRotas = require('./routes/auth');
const missoesRotas = require('./routes/missions');
const usuariosRotas = require('./routes/users');
const submissoesRotas = require('./routes/submissions');
const geminiRotas = require('./routes/gemini');

const app = express();
const port = 3000;

// Log rápido para validar a presença da chave em runtime
console.log('[ENV] GEMINI_API_KEY presente:', process.env.GEMINI_API_KEY ? 'SIM' : 'NÃO');

// Configurar CORS
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

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

// Iniciar servidor
app.listen(port, () => {
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