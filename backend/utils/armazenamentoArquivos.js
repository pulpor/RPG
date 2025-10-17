const multer = require('multer');

console.log('🔄 Configurando middleware de upload...');

// Configurar upload com limites de tamanho e tratamento de erros
const upload = function (req, res, next) {
  console.log('🔄 Iniciando middleware de upload...');
  console.log('📊 Content-Type:', req.headers['content-type']);
  console.log('📊 Content-Length:', req.headers['content-length']);

  // Usar armazenamento em memória (buffer) para enviar ao Firebase Storage
  const uploadMiddleware = multer({
    storage: multer.memoryStorage(), // Buffer em memória para Firebase Storage
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limite
      files: 10, // Máximo de 10 arquivos
      fieldSize: 10 * 1024 * 1024, // 10MB para fields
      parts: 20 // Máximo de parts (campos + arquivos)
    },
    // Configurações do Busboy para evitar timeout
    busboyOptions: {
      limits: {
        fileSize: 50 * 1024 * 1024,
        files: 10,
        fields: 20,
        parts: 30
      },
      highWaterMark: 2 * 1024 * 1024 // Buffer de 2MB
    },
    fileFilter: (req, file, cb) => {
      console.log('🔄 Validando arquivo:', file.originalname);
      cb(null, true); // Aceitar todos os tipos de arquivos
    }
  }).single('code');

  // Wrapper para capturar erros do multer
  uploadMiddleware(req, res, function (err) {
    if (err) {
      console.error('❌ Erro no middleware de upload:', {
        type: err.constructor.name,
        message: err.message,
        code: err.code,
        field: err.field
      });

      if (err instanceof multer.MulterError) {
        // Erro específico do multer
        console.error('❌ MulterError:', err.code);
        return res.status(400).json({
          error: 'Erro no upload de arquivo',
          code: err.code,
          details: err.message,
          suggestion: 'Verifique o tamanho e formato do arquivo'
        });
      }

      // Se for erro de "Unexpected end of form", provavelmente é timeout ou conexão ruim
      if (err.message && err.message.includes('Unexpected end of form')) {
        console.error('❌ Erro de conexão no multipart (timeout ou desconexão)');
        return res.status(400).json({
          error: 'Erro de conexão ao enviar arquivo',
          details: 'Conexão interrompida. Tente novamente.',
          suggestion: 'Verifique sua conexão de internet'
        });
      }

      // Erro genérico
      return res.status(500).json({
        error: 'Erro ao processar upload de arquivo',
        details: err.message,
        type: err.constructor.name
      });
    }

    if (req.file) {
      console.log('✅ Upload processado com sucesso');
      console.log('📁 Arquivo recebido:', {
        name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        encoding: req.file.encoding
      });
    } else {
      console.warn('⚠️ Nenhum arquivo recebido no req.file');
      console.log('📊 FormData enviado:', req.body);
    }

    next();
  });
};

module.exports = { upload };
