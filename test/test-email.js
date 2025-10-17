// Teste de configuração de email
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('🔍 Testando configurações de email...');

    console.log('📧 Configurações carregadas:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NÃO CONFIGURADO');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Credenciais de email não configuradas no .env');
        return;
    }

    if (process.env.EMAIL_PASS === 'your-gmail-app-password-here') {
        console.error('❌ EMAIL_PASS ainda está com valor placeholder');
        console.log('💡 Configure uma senha de app real do Gmail');
        return;
    }

    try {
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log('📋 Verificando conexão com Gmail...');
        await transporter.verify();
        console.log('✅ Conexão com Gmail estabelecida com sucesso!');

        console.log('📧 Enviando email de teste...');
        const result = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'leonardo.pulpor@docente.pr.senac.br',
            subject: '🧪 Teste de Email - Sistema RPG',
            text: `
Teste de configuração de email do Sistema RPG

Este é um email de teste para verificar se as configurações estão funcionando corretamente.

✅ Configurações:
- EMAIL_USER: ${process.env.EMAIL_USER}
- Serviço: Gmail
- Data/Hora: ${new Date().toLocaleString('pt-BR')}

Se você recebeu este email, as configurações estão corretas!

---
Sistema RPG - Teste Automático
            `.trim()
        });

        console.log('✅ Email de teste enviado com sucesso!');
        console.log('📧 Message ID:', result.messageId);

    } catch (error) {
        console.error('❌ Erro ao testar email:', error);

        if (error.code === 'EAUTH') {
            console.log('💡 Possíveis soluções:');
            console.log('   1. Verifique se a senha de app está correta');
            console.log('   2. Certifique-se que a verificação em duas etapas está ativada');
            console.log('   3. Gere uma nova senha de app em myaccount.google.com');
        }
    }
}

testEmail();