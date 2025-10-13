const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { autenticar } = require('../middleware/auth');

/**
 * Endpoint para servir como proxy para arquivos do Firebase Storage
 * GET /files/proxy?url=...&token=...
 * 
 * Esta rota recebe uma URL Firebase Storage como query parameter
 * e serve o conteúdo do arquivo, contornando problemas de CORS
 * O token pode ser passado via query parameter para facilitar links diretos
 */
router.get('/proxy', async (req, res) => {
    try {
        const { url, token } = req.query;

        // Verificar token (autenticação manual em vez de middleware)
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token não fornecido'
            });
        }

        // Importar para usar jwt
        const jwt = require('jsonwebtoken');
        const config = require('../config/firebase');

        try {
            // Verificar se o token é válido
            const decoded = jwt.verify(token, config.jwtSecret);
            console.log(`[PROXY] Token verificado para usuário: ${decoded.userId}`);
        } catch (err) {
            console.error('[PROXY] Token inválido:', err.message);
            return res.status(401).json({
                success: false,
                error: 'Token inválido ou expirado'
            });
        }

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL é obrigatória'
            });
        }

        console.log(`🔄 Proxy para arquivo: ${url}`);

        // Verificar se é uma URL válida do Firebase Storage
        if (!url.includes('firebasestorage.googleapis.com')) {
            return res.status(400).json({
                success: false,
                error: 'URL inválida: deve ser do Firebase Storage'
            });
        }

        // Fazer requisição para a URL
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro ao buscar arquivo: ${response.status} ${response.statusText}`);
        }

        // Obter tipo de conteúdo
        const contentType = response.headers.get('content-type');
        const contentDisposition = response.headers.get('content-disposition');

        // Configurar headers na resposta
        res.setHeader('Content-Type', contentType || 'application/octet-stream');

        if (contentDisposition) {
            res.setHeader('Content-Disposition', contentDisposition);
        }

        // Encaminhar o conteúdo do arquivo
        const fileData = await response.buffer();
        res.send(fileData);

        console.log(`✅ Arquivo servido com sucesso: ${contentType}, ${fileData.length} bytes`);

    } catch (error) {
        console.error('❌ Erro no proxy de arquivo:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erro ao processar arquivo'
        });
    }
});

module.exports = router;