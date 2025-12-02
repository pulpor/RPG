const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const { Resend } = require('resend');

const router = express.Router();

// Usar o serviço Firebase para usuários
const userService = require('../services/userService');

// Inicializar Resend para envio de emails
const resend = new Resend(process.env.RESEND_API_KEY);

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
  const { username, fullname, email, password, curso, class: userClass, isMaster } = req.body;

  // Log para depuração dos dados recebidos
  console.log("[REGISTER] Dados recebidos:", { username, fullname, email, password, curso, userClass, isMaster });

  // Validações básicas
  if (!username || !fullname || !email || !password || !userClass || !curso) {
    console.log("[REGISTER] Falta campo:", { username, fullname, email, password, curso, userClass });
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
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
  const trimmedEmail = email.trim().toLowerCase();

  // Verificar se usuário já existe no Firebase
  const existingUser = await userService.getUserByUsername(trimmedUsername);
  if (existingUser) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }

  // Verificar se email já existe no Firebase
  const existingEmail = await userService.getUserByEmail(trimmedEmail);
  if (existingEmail) {
    return res.status(400).json({ error: 'Email já cadastrado' });
  }

  // Definir o mestre responsável pela aprovação
  let masterUsername = null;
  if (!isMaster && curso && masterMap[curso]) {
    masterUsername = masterMap[curso];
  }

  const userData = {
    username: username.trim(),
    fullname: fullname.trim(),
    email: trimmedEmail,
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
  try {
    const { username, password } = req.body;
    console.log("[LOGIN] username recebido:", username);

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

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
  } catch (error) {
    console.error('[LOGIN] Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro interno no servidor',
      message: error.message,
      hint: 'Verifique se as variáveis de ambiente do Firebase estão configuradas'
    });
  }
});

// Adicione esta rota para retornar todos os usuários em JSON
router.get('/users', (req, res) => {
  try {
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao retornar usuários' });
  }
});

// Rota de esqueci minha senha
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('[FORGOT-PASSWORD] Iniciando processamento...');
    const { email } = req.body;
    console.log('[FORGOT-PASSWORD] Email recebido:', email);

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    console.log('[FORGOT-PASSWORD] Buscando usuário por email...');
    // Buscar usuário por email (assumindo que o campo email existe no Firestore)
    const user = await userService.getUserByEmail(email);
    console.log('[FORGOT-PASSWORD] Usuário encontrado:', user ? 'SIM' : 'NÃO');

    if (!user) {
      // Por segurança, sempre retornar sucesso mesmo se o email não existir
      return res.json({
        success: true,
        message: 'Se o email existir em nossa base, você receberá um link de recuperação.'
      });
    }

    // Gerar token de recuperação (válido por 1 hora)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora

    // Salvar token no usuário
    await userService.updateUser(user.id, {
      resetToken,
      resetTokenExpiry
    });

    // URL do frontend (ajustar conforme seu deploy)
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendURL}/reset-password.html?token=${resetToken}`;

    // Enviar email usando Resend
    const { data, error } = await resend.emails.send({
      from: 'RPG Educacional <onboarding@resend.dev>', // Use seu domínio verificado no Resend
      to: [email],
      subject: '🔑 Recuperação de Senha - RPG Educacional',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 RPG Educacional</h1>
              <p>Recuperação de Senha</p>
            </div>
            <div class="content">
              <p>Olá, <strong>${user.fullname || user.username}</strong>!</p>
              <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Redefinir Senha</a>
              </div>
              <p>Ou copie e cole este link no navegador:</p>
              <p style="word-break: break-all; background: #fff; padding: 10px; border-left: 3px solid #667eea;">
                ${resetLink}
              </p>
              <p><strong>Este link expira em 1 hora.</strong></p>
              <p>Se você não solicitou esta recuperação, ignore este email. Sua senha permanecerá inalterada.</p>
            </div>
            <div class="footer">
              <p>Este é um email automático, por favor não responda.</p>
              <p>&copy; 2025 RPG Educacional. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('[FORGOT-PASSWORD] Erro ao enviar email:', error);
      return res.status(500).json({ error: 'Erro ao enviar email de recuperação' });
    }

    console.log(`[FORGOT-PASSWORD] Email enviado para ${email}`, data);

    res.json({
      success: true,
      message: 'Email de recuperação enviado com sucesso!'
    });

  } catch (error) {
    console.error('[FORGOT-PASSWORD] Erro:', error);
    res.status(500).json({ error: 'Erro ao processar recuperação de senha' });
  }
});

// Rota de redefinição de senha
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
    }

    // Validar nova senha
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: `Senha deve ter: ${passwordValidation.errors.join(', ')}`
      });
    }

    // Buscar usuário pelo token
    const user = await userService.getUserByResetToken(token);

    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    // Verificar se token expirou
    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ error: 'Token expirado. Solicite um novo link de recuperação.' });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e remover token
    await userService.updateUser(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    console.log(`[RESET-PASSWORD] Senha redefinida para usuário ${user.username}`);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso!'
    });

  } catch (error) {
    console.error('[RESET-PASSWORD] Erro:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
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