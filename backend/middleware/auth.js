const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'sua-chave-secreta';

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('[AUTH] Header de autorização:', { authHeader: authHeader ? 'Presente' : 'Ausente', url: req.url });

  if (!authHeader) {
    console.log('[AUTH] Erro: Header Authorization não encontrado');
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[AUTH] Token extraído:', { hasToken: !!token, tokenLength: token ? token.length : 0 });

  if (!token) {
    console.log('[AUTH] Erro: Token não encontrado no header');
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    console.log('[AUTH] Token decodificado com sucesso:', { userId: decoded.userId, isMaster: decoded.isMaster });
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[AUTH] Erro na verificação do token:', err.message);
    return res.status(401).json({ error: 'Token inválido: ' + err.message });
  }
}

const ehMestre = (req, res, next) => {
  if (!req.user.isMaster) {
    return res.status(403).json({ error: 'Acesso restrito ao mestre' });
  }
  next();
};

module.exports = { autenticar, ehMestre };