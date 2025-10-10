const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const router = express.Router();

// Usar o serviço Firebase para usuários
const userService = require('../services/userService');

const secret = process.env.JWT_SECRET || 'sua-chave-secreta';

// Mapeamento de curso para username do mestre responsável
const masterMap = {
  beleza: 'beleza',
  gastronomia: 'gastro',
  gestao: 'gestao',
  oftalmo: 'oftalmo',
  tecnologia: 'tecno',
  idiomas: 'idioma'
};

router.post('/register', async (req, res) => {
  const { username, fullname, password, curso, class: userClass, isMaster } = req.body;

  // Log para depuração dos dados recebidos
  console.log("[REGISTER] Dados recebidos:", { username, fullname, password, curso, userClass, isMaster });

  // Validações básicas
  if (!username || !fullname || !password || !userClass || !curso) {
    console.log("[REGISTER] Falta campo:", { username, fullname, password, curso, userClass });
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  // Validar nome de usuário
  const usernameValidation = validateUsername(username.trim());
  if (!usernameValidation.isValid) {
    return res.status(400).json({
      error: `Nome de usuário deve ter: ${usernameValidation.errors.join(', ')}`
    });
  }

  // Validar senha
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      error: `Senha deve ter: ${passwordValidation.errors.join(', ')}`
    });
  }

  const trimmedUsername = username.trim();

  // Verificar se usuário já existe no Firebase
  const existingUser = await userService.getUserByUsername(trimmedUsername);
  if (existingUser) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }

  // Definir o mestre responsável pela aprovação
  let masterUsername = null;
  if (!isMaster && curso && masterMap[curso]) {
    masterUsername = masterMap[curso];
  }

  const userData = {
    username: username.trim(),
    fullname: fullname.trim(),
    password: await bcrypt.hash(password, 10),
    curso: curso.trim(),
    class: userClass.trim(),
    isMaster: isMaster || false,
    level: 1,
    xp: 0,
    pending: !isMaster,
    masterUsername, // mestre responsável pela aprovação
    createdAt: new Date().toISOString()
  };

  try {
    // Salvar no Firebase
    const firebaseUser = await userService.createUser(userData);
    res.json({ success: true, user: { ...firebaseUser, password: undefined } });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("[LOGIN] username recebido:", username);

  // Buscar usuário do Firebase
  const user = await userService.getUserByUsername(username);
  console.log("[LOGIN] usuário encontrado:", user ? user.username : null);

  if (!user) {
    console.log("[LOGIN] Usuário não encontrado.");
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  console.log("[LOGIN] senha recebida:", password);
  console.log("[LOGIN] senha hash:", user.password);
  console.log("[LOGIN] senha confere?", passwordMatch);

  if (!passwordMatch) {
    console.log("[LOGIN] Senha inválida.");
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  if (user.pending && !user.isMaster) {
    return res.status(403).json({ error: 'Cadastro pendente de aprovação pelo mestre' });
  }
  const token = jwt.sign({ userId: user.id, isMaster: user.isMaster }, secret, { expiresIn: '1d' });
  res.json({ user: { ...user, password: undefined }, token });
});

// Adicione esta rota para retornar todos os usuários em JSON
router.get('/users', (req, res) => {
  try {
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao retornar usuários' });
  }
});

module.exports = router;

// Função para validar força da senha
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`pelo menos ${minLength} caracteres`);
  }
  if (!hasUpperCase) {
    errors.push('pelo menos uma letra maiúscula');
  }
  if (!hasLowerCase) {
    errors.push('pelo menos uma letra minúscula');
  }
  if (!hasNumbers) {
    errors.push('pelo menos um número');
  }
  if (!hasSpecialChar) {
    errors.push('pelo menos um caractere especial');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Função para validar nome de usuário
function validateUsername(username) {
  const minLength = 5;
  const hasValidChars = /^[a-zA-Z0-9_]+$/.test(username);

  const errors = [];

  if (username.length < minLength) {
    errors.push(`pelo menos ${minLength} caracteres`);
  }
  if (!hasValidChars) {
    errors.push('apenas letras, números e underscore (_)');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}