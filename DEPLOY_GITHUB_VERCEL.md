# 🚀 Deploy Frontend (GitHub Pages) + Backend (Vercel)

## 📋 Visão Geral

- **Frontend**: GitHub Pages (https://pulpor.github.io/RPG/frontend/)
- **Backend**: Vercel (https://seu-projeto.vercel.app)

---

## 1️⃣ Deploy do Backend na Vercel

### **Passo 1: Instalar Vercel CLI**

```bash
npm install -g vercel
```

### **Passo 2: Login na Vercel**

```bash
vercel login
```

### **Passo 3: Deploy do Backend**

Na raiz do projeto, execute:

```bash
vercel
```

Responda as perguntas:
- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → Escolha sua conta
- **Link to existing project?** → `N` (No)
- **Project name?** → `rpg-backend` (ou outro nome)
- **Directory?** → `.` (raiz do projeto)
- **Override settings?** → `N` (No)

### **Passo 4: Configurar Variáveis de Ambiente na Vercel**

Acesse: https://vercel.com/seu-usuario/rpg-backend/settings/environment-variables

Adicione TODAS as variáveis do seu `.env`:

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

⚠️ **IMPORTANTE:** A variável `FIREBASE_PRIVATE_KEY` deve manter as quebras de linha `\n`!

### **Passo 5: Deploy de Produção**

```bash
vercel --prod
```

Copie a URL final (algo como: `https://rpg-backend.vercel.app`)

---

## 2️⃣ Conectar Frontend ao Backend

### **Passo 1: Atualizar config.js**

Edite `frontend/src/js/config.js`:

```javascript
export const API_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
        ? 'https://rpg-backend.vercel.app' // ← COLE SUA URL DA VERCEL AQUI
        : 'http://localhost:3000');
```

### **Passo 2: Rebuild do Frontend**

```bash
cd frontend
npm run build
```

### **Passo 3: Atualizar GitHub Pages**

Copie o conteúdo de `frontend/dist/` e faça commit:

```bash
# Voltar para raiz
cd ..

# Adicionar arquivos buildados
git add frontend/dist/
git add frontend/src/js/config.js
git commit -m "🚀 Conectar frontend ao backend Vercel"
git push origin main
```

---

## 3️⃣ Configurar CORS no Backend

O backend precisa aceitar requests do GitHub Pages:

### **Atualizar backend/server.js**

Certifique-se que o CORS está configurado:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://pulpor.github.io' // ← Adicione seu GitHub Pages
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

Depois, redeploy:

```bash
vercel --prod
```

---

## 4️⃣ Testar a Integração

### **Teste 1: Abrir o Frontend**

Acesse: https://pulpor.github.io/RPG/frontend/

Abra o **DevTools (F12)** → Aba **Console**

Você deve ver:
```
🌐 API URL: https://rpg-backend.vercel.app
```

### **Teste 2: Fazer Login**

Tente fazer login. Se der erro de CORS:
- Verifique se adicionou `https://pulpor.github.io` no `corsOptions`
- Redeploy do backend: `vercel --prod`

### **Teste 3: Verificar Network**

No DevTools → Aba **Network**:
- As requests devem ir para `https://rpg-backend.vercel.app/api/...`
- Status deve ser `200 OK` ou `201 Created`

---

## 5️⃣ Comandos Úteis

### **Ver logs do backend**

```bash
vercel logs
```

### **Ver domínios do projeto**

```bash
vercel domains ls
```

### **Remover projeto da Vercel**

```bash
vercel remove rpg-backend
```

### **Rebuild frontend**

```bash
cd frontend
npm run build
```

---

## 🔧 Troubleshooting

### ❌ Erro: "CORS policy: No 'Access-Control-Allow-Origin'"

**Solução:**
1. Adicione `https://pulpor.github.io` no array `corsOptions.origin`
2. Redeploy: `vercel --prod`

### ❌ Erro: "Failed to fetch"

**Solução:**
1. Verifique se a URL no `config.js` está correta
2. Teste acessando diretamente: `https://sua-url.vercel.app/api/health`
3. Verifique logs: `vercel logs`

### ❌ Erro: "FUNCTION_INVOCATION_FAILED"

**Solução:**
1. Verifique variáveis de ambiente na Vercel
2. Cheque logs: `vercel logs`
3. Teste localmente: `node backend/server.js`

### ❌ Erro: "Cannot find module 'firebase-admin'"

**Solução:**
1. Certifique-se que `firebase-admin` está no `package.json` da raiz
2. Redeploy: `vercel --prod`

---

## 📊 Checklist Final

- [ ] Backend deployado na Vercel
- [ ] Todas as variáveis de ambiente configuradas
- [ ] URL da Vercel copiada
- [ ] `config.js` atualizado com a URL
- [ ] Frontend rebuildado (`npm run build`)
- [ ] CORS configurado com GitHub Pages
- [ ] Commit e push dos arquivos
- [ ] GitHub Pages atualizado
- [ ] Teste de login funcionando
- [ ] Teste de submissão funcionando
- [ ] Logs sem erros

---

## 🎯 Estrutura Final

```
Frontend (GitHub Pages)
https://pulpor.github.io/RPG/frontend/
    ↓
    ↓ (API calls)
    ↓
Backend (Vercel)
https://rpg-backend.vercel.app
    ↓
    ↓ (Database)
    ↓
Firebase (Firestore + Storage)
```

---

## 🚀 Próximos Passos (Opcional)

### **1. Custom Domain**

Se tiver um domínio próprio:
- **Frontend**: Configurar no GitHub Pages
- **Backend**: Configurar na Vercel (`vercel domains add`)

### **2. Monitoring**

- Vercel Analytics: https://vercel.com/analytics
- Firebase Console: https://console.firebase.google.com

### **3. CI/CD Automático**

Criar `.github/workflows/deploy.yml` para deploy automático no push.

---

**Pronto! Agora seu projeto está 100% na nuvem! 🎉**
