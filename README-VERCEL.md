# 🚀 Guia Completo de Deploy no Vercel - RPG Educacional

Este guia explica **tudo que você precisa saber** para fazer o deploy deste projeto no Vercel.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Arquitetura do Deploy](#arquitetura-do-deploy)
3. [Configuração Passo a Passo](#configuração-passo-a-passo)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Estrutura de Arquivos](#estrutura-de-arquivos)
6. [Problemas Comuns e Soluções](#problemas-comuns-e-soluções)
7. [Limitações do Vercel](#limitações-do-vercel)

---

## 🎯 Pré-requisitos

Antes de começar, você precisa:

### 1. **Conta Vercel**
- Crie uma conta gratuita em [vercel.com](https://vercel.com)
- Vincule sua conta do GitHub

### 2. **Credenciais Firebase**
- Projeto Firebase ativo
- Service Account (arquivo JSON de credenciais)
- Firestore Database habilitado
- Firebase Storage habilitado

### 3. **API Keys**
- **Google Gemini API Key**: [Obter aqui](https://makersuite.google.com/app/apikey)
- **Email SMTP**: Gmail com senha de aplicativo ou serviço SMTP

### 4. **Repositório GitHub**
- Fork ou clone deste repositório
- Push para seu GitHub pessoal

---

## 🏗️ Arquitetura do Deploy

O projeto será implantado no Vercel como um **monorepo**:

```
Vercel Project
│
├── 🎨 Frontend (Static Site)
│   ├── Build: npm run build (na pasta frontend/)
│   ├── Output: dist/
│   └── Deploy: Servido como site estático
│
└── ⚙️ Backend (Serverless Functions)
    ├── Runtime: Node.js 18
    ├── Entry: backend/server.js
    └── Deploy: Serverless Functions na rota /api/*
```

**Como funciona:**
- O **frontend** é buildado pelo Vite e servido como HTML/CSS/JS estático
- O **backend** roda como **Serverless Functions** no caminho `/api/*`
- Todas as chamadas que começam com `/api/` vão para o backend
- Outras rotas servem o frontend estático

---

## 🔧 Configuração Passo a Passo

### Passo 1: Preparar o Repositório

1. **Clone ou faça fork do repositório**
```bash
git clone https://github.com/seu-usuario/RPG.git
cd RPG
```

2. **Certifique-se que os arquivos estão corretos**
   - ✅ `vercel.json` na raiz
   - ✅ `package.json` na raiz e em `frontend/`
   - ✅ `.env.example` em `backend/` e `frontend/`

### Passo 2: Criar Projeto no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe seu repositório do GitHub
3. Configure da seguinte forma:

**Framework Preset:** `Other`

**Root Directory:** `./` (deixe vazio ou use raiz)

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Output Directory:** `frontend/dist`

**Install Command:**
```bash
npm install
```

### Passo 3: Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

#### 🔥 **Firebase (Backend)**
```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY_ID=sua-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua chave privada aqui\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=seu-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

**⚠️ IMPORTANTE:** A `FIREBASE_PRIVATE_KEY` deve ter `\n` literais (não quebras de linha reais). Exemplo:
```
"-----BEGIN PRIVATE KEY-----\nMIIE...\n...\n-----END PRIVATE KEY-----\n"
```

#### 🤖 **Google Gemini**
```
GEMINI_API_KEY=sua-chave-da-api-gemini
```

#### 📧 **Email (Nodemailer)**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
EMAIL_FROM="RPG Educacional <seu-email@gmail.com>"
```

#### 🌐 **URLs**
```
FRONTEND_URL=https://seu-projeto.vercel.app
NODE_ENV=production
```

#### 🔐 **Segurança (JWT)**
```
JWT_SECRET=seu-jwt-secret-aqui
```

**Como gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Passo 4: Configurar CORS no Backend

Após o deploy, você precisa atualizar o CORS no `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173', // dev local
    'https://seu-projeto.vercel.app', // ⬅️ ADICIONE SUA URL DO VERCEL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

Faça commit e push para atualizar.

### Passo 5: Configurar URL do Backend no Frontend

Crie o arquivo `frontend/.env.production`:

```env
VITE_API_URL=https://seu-projeto.vercel.app
```

Ou atualize `frontend/src/js/config.js`:

```javascript
export const API_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
        ? 'https://seu-projeto.vercel.app' // ⬅️ ALTERE AQUI
        : 'http://localhost:3000');
```

### Passo 6: Deploy!

1. Clique em **Deploy** no Vercel
2. Aguarde o build (2-5 minutos)
3. Acesse a URL gerada (ex: `https://seu-projeto.vercel.app`)

---

## 📝 Variáveis de Ambiente

### Backend (Server-side)

Essas variáveis são usadas pelo **backend** (serverless functions):

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `FIREBASE_PROJECT_ID` | ✅ Sim | ID do projeto Firebase |
| `FIREBASE_PRIVATE_KEY` | ✅ Sim | Chave privada do Service Account |
| `FIREBASE_CLIENT_EMAIL` | ✅ Sim | Email do Service Account |
| `GEMINI_API_KEY` | ✅ Sim | API Key do Google Gemini |
| `EMAIL_USER` | ⚠️ Opcional | Email para SMTP (recuperação de senha) |
| `EMAIL_PASS` | ⚠️ Opcional | Senha do email SMTP |
| `JWT_SECRET` | ✅ Sim | Chave secreta para JWT |
| `NODE_ENV` | ⚠️ Opcional | `production` (auto-definido pelo Vercel) |

### Frontend (Build-time)

Essas variáveis são usadas durante o **build do frontend**:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `VITE_API_URL` | ✅ Sim | URL do backend (ex: https://seu-projeto.vercel.app) |

**⚠️ IMPORTANTE:** Variáveis `VITE_*` são embutidas no código JavaScript durante o build. Não use para informações sensíveis!

---

## 📂 Estrutura de Arquivos

### Arquivos de Configuração do Vercel

```
RPG/
├── vercel.json              # ⬅️ Configuração principal do Vercel
├── .vercelignore            # ⬅️ Arquivos a ignorar no deploy
├── package.json             # ⬅️ Dependências do backend (raiz)
├── README-VERCEL.md         # ⬅️ Este guia
│
├── backend/
│   ├── server.js            # ⬅️ Entry point do backend
│   ├── .env.example         # Template de variáveis
│   └── ...
│
└── frontend/
    ├── package.json         # Dependências do frontend
    ├── vite.config.js       # Config do Vite
    ├── .env.example         # Template de variáveis
    └── dist/                # ⬅️ Build output (gerado)
```

### `vercel.json` Explicado

```json
{
  "version": 2,
  "name": "rpg-educacional",
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ]
}
```

**O que isso faz:**
- **builds**: Define 2 builds
  1. Frontend: Build estático do Vite
  2. Backend: Serverless function Node.js
- **routes**: Define roteamento
  1. `/api/*` → Backend
  2. Tudo mais → Frontend

---

## 🐛 Problemas Comuns e Soluções

### 1. **Erro: "FIREBASE_PRIVATE_KEY is not valid"**

**Causa:** Formatação incorreta da chave privada.

**Solução:**
- No Vercel, a chave deve ter `\n` **literais** (não quebras de linha reais)
- Copie a chave do arquivo JSON do Firebase
- Substitua quebras de linha por `\n`

**Exemplo:**
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQ...\n-----END PRIVATE KEY-----\n"
```

**Dica:** Use um editor de texto para fazer "find & replace" de `\n` (quebra de linha) por `\\n` (literal).

### 2. **Erro: "CORS policy blocked"**

**Causa:** Frontend tentando acessar backend de origem diferente.

**Solução:**
- Adicione a URL do Vercel no array `origin` do CORS
- Atualize `backend/server.js`:
```javascript
origin: ['https://seu-projeto.vercel.app']
```

### 3. **Erro: "Cannot find module"**

**Causa:** Dependências não instaladas ou caminho incorreto.

**Solução:**
- Verifique `package.json` na raiz (backend)
- Certifique-se que todas as dependências estão listadas
- Re-deploy para forçar reinstalação

### 4. **Frontend carregou mas API não funciona**

**Causa:** `VITE_API_URL` não configurado corretamente.

**Solução:**
- Adicione `VITE_API_URL` nas variáveis de ambiente do Vercel
- Ou atualize `frontend/src/js/config.js` manualmente
- Re-deploy o frontend

### 5. **Upload de arquivos não funciona**

**Causa:** Vercel Serverless Functions têm filesystem read-only.

**Solução:**
- Use `/tmp` para arquivos temporários
- Para persistência, use Firebase Storage (já configurado no projeto)
- Atualize código que salva em `./uploads` para usar Storage

### 6. **Build falha com "Command not found"**

**Causa:** Comando de build incorreto ou dependências faltando.

**Solução:**
- No Vercel, configure:
  - **Build Command:** `cd frontend && npm install && npm run build`
  - **Install Command:** `npm install`
- Certifique-se que `frontend/package.json` tem script `build`

---

## 🚨 Limitações do Vercel

### Free Tier

- ⏱️ **Timeout:** 10 segundos (Hobby), 60s (Pro)
- 💾 **Payload:** 4.5 MB por request
- 📦 **Deployment size:** 100 MB (compressed)
- 🔄 **Build time:** 45 minutos/mês (Hobby)
- 🌐 **Bandwidth:** 100 GB/mês

### Filesystem

- ❌ **Write:** Apenas em `/tmp` (efêmero)
- ❌ **Persistent storage:** Não disponível
- ✅ **Solução:** Use Firebase Storage

### Serverless Functions

- ❌ **WebSockets:** Não suportado nativamente
- ❌ **Long-running processes:** Máximo 10s (Hobby)
- ✅ **Solução:** Use Vercel Edge Functions ou outro serviço

---

## 📊 Monitoramento

### Logs

1. Acesse seu projeto no Vercel
2. Vá em **Deployments** > Clique no deployment
3. Vá em **Functions** > Clique na função
4. Veja logs em tempo real

### Analytics

No painel do Vercel:
- **Analytics:** Tráfego, performance
- **Speed Insights:** Core Web Vitals
- **Logs:** Erros e warnings

---

## 🔒 Segurança

### Checklist de Segurança

- ✅ Nunca commite `.env` no Git
- ✅ Use variáveis de ambiente do Vercel
- ✅ Ative CORS apenas para domínios conhecidos
- ✅ Use HTTPS (Vercel fornece automaticamente)
- ✅ Rotacione API keys periodicamente
- ✅ Monitore logs para atividade suspeita

### Firebase Security Rules

Certifique-se que suas regras do Firestore estão configuradas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

## 🎓 Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel + Node.js](https://vercel.com/docs/runtimes#official-runtimes/node-js)
- [Vercel + Vite](https://vercel.com/docs/frameworks/vite)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Gemini API](https://ai.google.dev/docs)

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. **Verifique os logs** no painel do Vercel
2. **Teste localmente** primeiro (`npm run dev`)
3. **Revise este guia** passo a passo
4. **Abra uma issue** no GitHub

---

## 📝 Checklist Final

Antes de fazer o deploy, verifique:

- [ ] Conta Vercel criada e GitHub vinculado
- [ ] Repositório no GitHub com código atualizado
- [ ] Arquivo `vercel.json` na raiz
- [ ] Todas as variáveis de ambiente configuradas
- [ ] CORS atualizado com URL do Vercel
- [ ] `VITE_API_URL` apontando para URL do Vercel
- [ ] Firebase Service Account válido
- [ ] Gemini API Key válida
- [ ] Build local funciona (`cd frontend && npm run build`)
- [ ] Backend local funciona (`node backend/server.js`)

---

<div align="center">

**🚀 Pronto! Agora você tem tudo para fazer o deploy no Vercel!**

Se este guia foi útil, considere dar uma ⭐ no repositório!

</div>
