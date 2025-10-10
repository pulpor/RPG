const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Importar serviços do Firebase diretamente
const userService = require('../services/userService');
const missionService = require('../services/missionService');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: async (req, file, cb) => {
    try {
      const userId = req.user ? req.user.userId : 'desconhecido';
      const missionId = req.body.missionId || 'desconhecida';

      // Buscar usuário e missão do Firebase
      const user = await userService.getUserById(userId.toString());
      const mission = await missionService.getMissionById(missionId.toString());

      const safeUsername = user ? user.username.replace(/[^a-z0-9]/gi, '_') : 'desconhecido';
      const missionTitle = mission ? (mission.titulo || mission.title || 'desconhecida') : 'desconhecida';
      const safeMission = missionTitle.replace(/[^a-z0-9]/gi, '_');

      cb(null, `${safeUsername}_${safeMission}_${Date.now()}${path.extname(file.originalname)}`);
    } catch (error) {
      console.error('Erro ao gerar nome do arquivo:', error);
      cb(null, `upload_${Date.now()}${path.extname(file.originalname)}`);
    }
  }
});

const upload = multer({ storage }).fields([
  { name: 'code', maxCount: 10 }
]);

module.exports = { upload };
