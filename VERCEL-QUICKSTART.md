# 🚀 Guia Rápido de Deploy no Vercel

**Referência rápida para deploy. Para guia completo, veja [README-VERCEL.md](README-VERCEL.md)**

---

## ⚡ Setup Rápido (5 minutos)

### 1. Criar Projeto no Vercel

```bash
1. Acesse: https://vercel.com/new
2. Importe seu repositório do GitHub
3. Configure:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: cd frontend && npm install && npm run build
   - Output Directory: frontend/dist
   - Install Command: npm install
```

### 2. Variáveis de Ambiente Essenciais

No Vercel Dashboard → Settings → Environment Variables:

```env
# Firebase (obrigatório)
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com

# Gemini (obrigatório)
GEMINI_API_KEY=sua-chave-gemini

# JWT (obrigatório - gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=sua-chave-secreta-aqui

# Email (opcional)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-gmail

# URLs (configure após primeiro deploy)
VITE_API_URL=https://seu-projeto.vercel.app
FRONTEND_URL=https://seu-projeto.vercel.app
```

### 3. Deploy

```bash
Clique em "Deploy" → Aguarde 2-5 minutos → Pronto! 🎉
```

---

## 📋 Checklist Mínimo

- [ ] Conta Vercel + GitHub vinculado
- [ ] Credenciais Firebase
- [ ] Gemini API Key
- [ ] Deploy realizado
- [ ] URLs atualizadas no Vercel
- [ ] Testou login/API

---

## 🐛 Problemas Comuns

### CORS Error
```javascript
// backend/server.js - adicione sua URL
allowedOrigins.push('https://seu-projeto.vercel.app');
```

### Firebase PRIVATE_KEY Error
```
Use \n literal (não quebra de linha real):
"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

### Build Failed
```bash
# Verifique logs em: Vercel Dashboard → Deployments → Ver logs
# Teste local: cd frontend && npm run build
```

### API 404
```bash
# Verifique vercel.json tem as rotas corretas
# Teste: https://seu-projeto.vercel.app/api/health
```

---

## 📚 Documentação Completa

- **Guia Completo**: [README-VERCEL.md](README-VERCEL.md)
- **Checklist Detalhado**: [DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md)
- **Docs Vercel**: https://vercel.com/docs

---

## 🆘 Precisa de Ajuda?

1. Leia [README-VERCEL.md](README-VERCEL.md) seção "Problemas Comuns"
2. Verifique logs no Vercel Dashboard
3. Abra uma issue no GitHub

---

**Feito com ❤️ para facilitar seu deploy!**
