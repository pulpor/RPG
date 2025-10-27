# 🚀 DEPLOY RÁPIDO - COPIE E COLE

## ⚡ 1. Instalar Vercel CLI (só uma vez)

```powershell
npm install -g vercel
```

## ⚡ 2. Login na Vercel (só uma vez)

```powershell
vercel login
```

## ⚡ 3. Deploy do Backend

```powershell
# Na raiz do projeto
vercel
```

Quando perguntar:
- **Set up and deploy?** → Digite `Y` e Enter
- **Which scope?** → Escolha sua conta
- **Link to existing project?** → Digite `N` e Enter
- **Project name?** → Digite `rpg-backend` e Enter
- **Directory?** → Apenas Enter (usa `.`)
- **Override settings?** → Digite `N` e Enter

**COPIE A URL QUE APARECER** (algo como: `https://rpg-backend-abc123.vercel.app`)

## ⚡ 4. Configurar Variáveis de Ambiente

Acesse o link que apareceu ou vá em: https://vercel.com/seu-usuario/rpg-backend/settings/environment-variables

Cole TODAS as variáveis do arquivo `.env` (uma por vez):

```env
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY_ID=sua-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_CLIENT_ID=...
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
GEMINI_API_KEY=sua-api-key
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
```

## ⚡ 5. Deploy de Produção

```powershell
vercel --prod
```

**COPIE A URL FINAL DE PRODUÇÃO**

## ⚡ 6. Atualizar Frontend

Abra o arquivo: `frontend/src/js/config.js`

Substitua a linha:

```javascript
? 'https://seu-backend.vercel.app' // ALTERE para sua URL do backend
```

Por:

```javascript
? 'https://SUA-URL-COPIADA.vercel.app' // ← COLE AQUI
```

## ⚡ 7. Rebuild do Frontend

```powershell
cd frontend
npm run build
```

## ⚡ 8. Commit e Push

```powershell
cd ..
git add .
git commit -m "🚀 Deploy completo - Backend + Frontend"
git push origin main
```

## ⚡ 9. Aguardar GitHub Pages Atualizar

Espere 1-2 minutos e acesse:

**https://pulpor.github.io/RPG/frontend/**

## ✅ 10. Testar

1. Abra o site
2. Abra o DevTools (F12)
3. Tente fazer login
4. Se funcionar → **SUCESSO!** 🎉
5. Se der erro de CORS → Aguarde 30 segundos e tente novamente

---

## 🔄 Para Fazer Updates Depois

### Atualizar Backend:

```powershell
# Faça suas mudanças no código
git add backend/
git commit -m "Update backend"
vercel --prod
```

### Atualizar Frontend:

```powershell
# Faça suas mudanças no código
cd frontend
npm run build
cd ..
git add frontend/
git commit -m "Update frontend"
git push origin main
```

---

## 📊 Comandos Úteis

### Ver logs do backend:
```powershell
vercel logs
```

### Ver URL do projeto:
```powershell
vercel ls
```

### Testar localmente antes de deploy:
```powershell
vercel dev
```

---

## ❌ Troubleshooting Rápido

### Erro de CORS:
1. Abra `backend/server.js`
2. Certifique que tem: `'https://pulpor.github.io'`
3. Salve e rode: `vercel --prod`

### Frontend não atualiza:
1. Abra GitHub → Settings → Pages
2. Veja se está ativo
3. Force rebuild: Settings → Pages → Save novamente

### Backend retorna 500:
1. Rode: `vercel logs`
2. Veja o erro
3. Geralmente é variável de ambiente faltando

---

**PRONTO! COLE E EXECUTE! 🚀**
