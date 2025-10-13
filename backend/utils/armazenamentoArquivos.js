const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Importar serviços do Firebase diretamente
const userService = require('../services/userService');
const missionService = require('../services/missionService');

console.log('🔄 Configurando middleware de upload...');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      console.log('🔄 Definindo pasta de destino para upload...');
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      console.log('✅ Pasta de destino criada:', uploadDir);
      cb(null, uploadDir);
    } catch (err) {
      console.error('❌ Erro ao criar pasta de destino:', err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    try {
      console.log('🔄 Gerando nome do arquivo...');
      // Versão simplificada que não usa async - evita problemas de promises
      const userId = req.user ? req.user.userId : 'desconhecido';
      const timestamp = Date.now();
      const filename = `upload_${userId}_${timestamp}${path.extname(file.originalname || '')}`;
      console.log('✅ Nome de arquivo gerado:', filename);
      cb(null, filename);
    } catch (error) {
      console.error('❌ Erro ao gerar nome do arquivo:', error);
      cb(error);
    }
  }
});

// Configurar upload com limites de tamanho e tratamento de erros
const upload = function (req, res, next) {
  console.log('🔄 Iniciando middleware de upload...');

  // Usar armazenamento em memória (buffer) para enviar ao Firebase Storage
  const uploadMiddleware = multer({
    storage: multer.memoryStorage(), // Buffer em memória para Firebase Storage
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limite
      files: 10 // Máximo de 10 arquivos
    },
    fileFilter: (req, file, cb) => {
      console.log('🔄 Validando arquivo:', file.originalname);
      cb(null, true); // Aceitar todos os tipos de arquivos
    }
  }).single('code');

  // Wrapper para capturar erros do multer
  uploadMiddleware(req, res, function (err) {
    if (err) {
      console.error('❌ Erro no middleware de upload:', err);
      if (err instanceof multer.MulterError) {
        // Erro específico do multer
        return res.status(400).json({
          error: 'Erro no upload',
          code: err.code,
          field: err.field,
          details: err.message
        });
      }

      // Erro genérico
      return res.status(500).json({
        error: 'Erro ao processar upload de arquivo',
        details: err.message
      });
    }

    console.log('✅ Upload processado com sucesso no multer');
    console.log('📁 Arquivo recebido:', req.file ? req.file.originalname : 'nenhum');
    next();
  });
};

module.exports = { upload };
