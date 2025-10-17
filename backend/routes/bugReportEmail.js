const express = require('express');
const { Resend } = require('resend');
const router = express.Router();

console.log('[BUG REPORT] Sistema de email configurado com Resend');

router.post('/bug-report', async (req, res) => {
    try {
        const { title, description, userName, userEmail, url, screenshot } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Campos obrigatórios' });
        }

        console.log('[BUG REPORT] Recebido:', { title, userName, userEmail, hasScreenshot: !!screenshot });

        // Inicializar Resend com API key
        const resend = new Resend(process.env.RESEND_API_KEY || 're_demo_key');

        // Preparar conteúdo do email
        let emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #e74c3c;">🐛 Novo Bug Report - RPG</h2>
                <hr style="border: 1px solid #e74c3c;">
                
                <h3>📌 Título:</h3>
                <p><strong>${title}</strong></p>
                
                <h3>📝 Descrição:</h3>
                <p>${description.replace(/\n/g, '<br>')}</p>
                
                <h3>👤 Informações do Usuário:</h3>
                <ul>
                    <li><strong>Nome:</strong> ${userName}</li>
                    <li><strong>Email:</strong> ${userEmail}</li>
                    <li><strong>Página:</strong> ${url || 'N/A'}</li>
                    <li><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                </ul>
        `;

        emailHtml += `</div>`;

        // Preparar anexo de screenshot se houver
        const attachments = [];
        if (screenshot && screenshot.length < 2000000) {
            const screenshotSize = (screenshot.length / 1024).toFixed(2);

            // Extrair o conteúdo Base64 e tipo de arquivo
            const matches = screenshot.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
                const mimeType = matches[1];
                const base64Content = matches[2];

                // Determinar extensão do arquivo
                const extension = mimeType.includes('png') ? 'png' : 'jpg';

                attachments.push({
                    filename: `screenshot-${Date.now()}.${extension}`,
                    content: base64Content,
                    type: mimeType
                });

                emailHtml = emailHtml.replace('</div>', `
                    <h3>📸 Screenshot (${screenshotSize}KB):</h3>
                    <p>✅ <strong>Screenshot anexada neste email!</strong></p>
                    <p><em>Verifique os anexos para visualizar a imagem.</em></p>
                </div>`);

                console.log(`[BUG REPORT] Screenshot anexada: ${screenshotSize}KB`);
            }
        } else if (screenshot) {
            const screenshotMB = (screenshot.length / 1024 / 1024).toFixed(2);
            emailHtml = emailHtml.replace('</div>', `
                <h3>📸 Screenshot:</h3>
                <p><em>❌ Screenshot muito grande para ser enviada. Tamanho: ${screenshotMB}MB (limite: 2MB)</em></p>
            </div>`);
            console.log(`[BUG REPORT] ⚠️ Screenshot muito grande: ${screenshotMB}MB`);
        }

        // Enviar email via Resend com anexo
        const emailOptions = {
            from: 'RPG Bug Report <onboarding@resend.dev>',
            to: 'pulppor@gmail.com',
            reply_to: userEmail,
            subject: `🐛 Bug Report RPG: ${title}`,
            html: emailHtml
        };

        // Adicionar anexos se houver
        if (attachments.length > 0) {
            emailOptions.attachments = attachments;
        }

        const data = await resend.emails.send(emailOptions);

        console.log('[BUG REPORT] ✅ Email enviado com sucesso!');
        console.log(`[BUG REPORT] Message ID: ${data.id}`);

        res.json({
            success: true,
            message: '✅ Bug report enviado para pulppor@gmail.com!'
        });

    } catch (error) {
        console.error('[BUG REPORT] ❌ Erro ao enviar email:', error);
        console.error('[BUG REPORT] ❌ Detalhes:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;