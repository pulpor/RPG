const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { users, missions } = require('../inicializacao');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user ? req.user.userId : 'desconhecido';
    const missionId = req.body.missionId || 'desconhecida';
    const user = users.find(u => u.id === parseInt(userId));
    const mission = missions.find(m => m.id === parseInt(missionId));
    const safeUsername = user ? user.username.replace(/[^a-z0-9]/gi, '_') : 'desconhecido';
    // Suportar tanto 'titulo' (português) quanto 'title' (inglês)
    const missionTitle = mission ? (mission.titulo || mission.title || 'desconhecida') : 'desconhecida';
    const safeMission = missionTitle.replace(/[^a-z0-9]/gi, '_');
    cb(null, `${safeUsername}_${safeMission}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage }).fields([
  { name: 'code', maxCount: 10 }
]);

module.exports = { upload };