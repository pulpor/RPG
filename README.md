# 🎮 RPG Educacional - Sistema de Gestão Gamificado

> **Plataforma full-stack de gamificação educacional com IA integrada para análise automatizada de submissões**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Storage-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)

---

## 🚀 Visão Geral

Sistema educacional inovador que transforma o aprendizado em uma experiência RPG, onde alunos avançam através de **missões**, acumulam **XP**, sobem de **nível** e desbloqueiam conquistas. Professores (mestres) gerenciam turmas, aprovam alunos e acompanham o progresso através de dashboards dinâmicos com **análise de IA integrada**.

### 🎯 Diferenciais Técnicos

- **🤖 Análise Automatizada com IA**: Integração com Google Gemini 2.5 Flash para avaliação inteligente de código e respostas de alunos
- **📊 Sistema de Gamificação Complexo**: Algoritmo proprietário de XP/Level com curvas de progressão exponenciais
- **🔥 Arquitetura Serverless**: Firebase Firestore + Storage para escalabilidade automática
- **🎨 UI/UX Responsiva**: Interface moderna com Tailwind CSS, dark mode e animações suaves
- **🔐 Autenticação Robusta**: Sistema de roles (student/master) com middleware JWT
- **📧 Sistema de Notificações**: Email automatizado para bug reports e validações
- **📁 Upload Multi-formato**: Suporte para imagens, PDFs, código e documentos
- **⚡ Real-time Updates**: Sincronização instantânea de dados via Firebase listeners

---

## 🏗️ Arquitetura do Projeto

```
RPG Educacional
│
├── 🎨 Frontend (Vanilla JS + Vite + Tailwind)
│   ├── Sistema de autenticação com localStorage
│   ├── Dashboards diferenciados (Student/Master)
│   ├── Sistema de modais e toasts customizados
│   ├── Gerenciamento de estado reativo
│   └── Integração com APIs RESTful
│
├── ⚙️ Backend (Node.js + Express)
│   ├── Arquitetura MVC escalável
│   ├── Middleware de autenticação JWT
│   ├── Rotas RESTful organizadas por domínio
│   ├── Services para lógica de negócio complexa
│   └── Integração Firebase Admin SDK
│
└── 🗄️ Database & Storage (Firebase)
    ├── Firestore: Collections otimizadas
    ├── Storage: Buckets organizados por tipo
    └── Security Rules: Controle granular de acesso
```

---

## 💻 Stack Tecnológica

### **Frontend**
- **JavaScript ES6+**: Modules, async/await, destructuring
- **Vite**: Build tool ultrarrápido com HMR
- **Tailwind CSS**: Utility-first framework
- **PostCSS**: Processamento avançado de CSS
- **Fetch API**: Comunicação HTTP moderna

### **Backend**
- **Node.js 18+**: Runtime JavaScript server-side
- **Express.js 4.x**: Framework web minimalista
- **Firebase Admin SDK**: Integração oficial Firebase
- **Multer**: Upload de arquivos multipart/form-data
- **Nodemailer**: SMTP para envio de emails
- **Cors**: Cross-origin resource sharing

### **Database & Storage**
- **Firebase Firestore**: NoSQL document database
- **Firebase Storage**: Object storage escalável
- **Indexing**: Queries otimizadas com índices compostos

### **IA & Machine Learning**
- **Google Gemini 2.5 Flash**: LLM para análise de texto/código
- **Prompt Engineering**: Templates otimizados para avaliação educacional
- **Token Management**: Sistema de rate limiting e retry

### **DevOps & Deploy**
- **Vercel**: Deploy automatizado do backend
- **Environment Variables**: Configuração segura via `.env`
- **Git**: Controle de versão com branches organizadas
- **ES Modules**: Módulos nativos do Node.js

---

## 📂 Estrutura de Pastas

```
project/
│
├── backend/
│   ├── server.js                 # Entry point do servidor Express
│   ├── config/
│   │   └── firebase.js           # Configuração Firebase Admin SDK
│   ├── middleware/
│   │   └── auth.js               # Middleware JWT de autenticação
│   ├── routes/                   # Rotas RESTful organizadas
│   │   ├── auth.js               # Login, registro, reset password
│   │   ├── users.js              # CRUD de usuários
│   │   ├── missions.js           # Gerenciamento de missões
│   │   ├── submissions.js        # Submissões de alunos
│   │   ├── turmas.js             # Gestão de turmas
│   │   ├── files.js              # Upload de arquivos
│   │   ├── gemini.js             # Integração com IA
│   │   └── bugReportEmail.js     # Sistema de bug reports
│   ├── services/                 # Lógica de negócio
│   │   ├── userService.js        # Regras de usuários
│   │   ├── missionService.js     # Sistema de missões
│   │   ├── submissionService.js  # Validação de submissões
│   │   └── turmaService.js       # Gestão de turmas
│   └── utils/
│       ├── levelSystem.js        # Algoritmo de XP/Level
│       └── armazenamentoArquivos.js  # Storage helpers
│
├── frontend/
│   ├── index.html                # Landing page
│   ├── cadastro.html             # Página de registro
│   ├── reset-password.html       # Reset de senha
│   ├── vite.config.js            # Configuração Vite
│   ├── tailwind.config.js        # Configuração Tailwind
│   ├── src/
│   │   ├── js/
│   │   │   ├── index.js          # Entry point frontend
│   │   │   ├── cadastro.js       # Lógica de registro
│   │   │   ├── config.js         # Configurações globais
│   │   │   ├── student.js        # Dashboard do aluno
│   │   │   ├── master/           # Módulos do professor
│   │   │   │   ├── master.js     # Dashboard principal
│   │   │   │   ├── alunos.js     # Gestão de alunos
│   │   │   │   ├── missoes.js    # Gestão de missões
│   │   │   │   └── pendentes.js  # Submissões pendentes
│   │   │   └── utils/            # Utilitários compartilhados
│   │   │       ├── api.js        # Cliente HTTP
│   │   │       ├── auth.js       # Helpers de autenticação
│   │   │       ├── modals.js     # Sistema de modais
│   │   │       ├── toast.js      # Notificações toast
│   │   │       ├── gemini.js     # Integração IA frontend
│   │   │       └── interface.js  # Manipulação de DOM
│   │   └── css/                  # Estilos organizados
│   │       ├── tailwind.css      # Base Tailwind
│   │       ├── master.css        # Estilos do professor
│   │       ├── student.css       # Estilos do aluno
│   │       └── modal.css         # Estilos de modais
│   └── src/pages/
│       ├── student.html          # Interface do aluno
│       └── master.html           # Interface do professor
│
├── test/                         # Scripts de teste
│   ├── test-firebase.js          # Testes Firebase
│   ├── test-gemini-api.js        # Testes Gemini API
│   └── test-email.js             # Testes Nodemailer
│
├── .env                          # Variáveis de ambiente (não versionado)
├── package.json                  # Dependências do projeto
├── vercel.json                   # Configuração deploy Vercel
└── README.md                     # Documentação do projeto
```

---

## ⚙️ Funcionalidades Principais

### 🎓 **Para Alunos (Students)**
- ✅ Dashboard personalizado com progresso gamificado
- ✅ Visualização de missões disponíveis por área (Tecnologia, Gastronomia, Beleza, etc.)
- ✅ Sistema de submissão de respostas (texto, código, arquivos)
- ✅ Barra de XP com indicador de nível atual e próximo
- ✅ Histórico de missões completadas
- ✅ Sistema de conquistas e badges
- ✅ Interface responsiva com dark mode

### 👨‍🏫 **Para Professores (Masters)**
- ✅ Dashboard com visão geral de todas as turmas
- ✅ Aprovação/reprovação de novos alunos
- ✅ Gestão de missões (criar, editar, deletar)
- ✅ Avaliação de submissões com auxílio de IA
- ✅ Sistema de comentários e feedback
- ✅ Filtros avançados por turma, classe e nível
- ✅ Painel de submissões pendentes
- ✅ Estatísticas de progresso dos alunos
- ✅ **Filtro de classes baseado na área do mestre** (cada mestre vê apenas suas classes)

### 🤖 **Análise com IA (Gemini)**
- ✅ Avaliação automatizada de respostas textuais
- ✅ Análise de código com sugestões de melhoria
- ✅ Detecção de plágio e similaridade
- ✅ Geração de feedback construtivo
- ✅ Rate limiting e retry automático
- ✅ Suporte a múltiplos formatos (texto, markdown, código)

---

## 🔥 Destaques de Implementação

### 1. **Sistema de Níveis Exponencial**
```javascript
// Algoritmo proprietário em utils/levelSystem.js
const baseXP = 100;
const exponent = 1.5;
const xpForNextLevel = Math.floor(baseXP * Math.pow(level, exponent));
```
- Curva de progressão balanceada
- Sistema de recompensas escaláveis
- Motivação contínua do aluno

### 2. **Filtros Inteligentes por Área**
```javascript
// Cada mestre vê apenas classes da sua área
const masterAreaMap = {
  tecno: 'tecnologia',
  gastro: 'gastronomia',
  beleza: 'beleza',
  // ...
};
populateStudentClassFilterByMaster(); // Filtragem automática
```

### 3. **Upload Seguro de Arquivos**
```javascript
// Validação de tipo, tamanho e storage organizado
const storage = multer.diskStorage({
  destination: './uploads/bug-reports/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
```

### 4. **Integração Firebase Otimizada**
```javascript
// Queries com índices compostos
const studentsRef = db.collection('users')
  .where('role', '==', 'student')
  .where('status', '==', 'approved')
  .orderBy('level', 'desc');
```

### 5. **Análise de IA com Retry Logic**
```javascript
// Resiliência contra rate limits
async function analyzeWithGemini(content) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      if (attempt === 2) throw error;
      await sleep(2000 * (attempt + 1));
    }
  }
}
```

---

## 🚀 Como Executar Localmente

### **Pré-requisitos**
- Node.js 18+
- Conta Firebase (Firestore + Storage)
- API Key do Google Gemini
- Conta Gmail para SMTP

### **Instalação**

1. **Clone o repositório**
```bash
git clone https://github.com/pulpor/RPG.git
cd RPG
```

2. **Instale as dependências**
```bash
npm install
cd frontend && npm install && cd ..
```

3. **Configure as variáveis de ambiente**
```bash
# Crie o arquivo .env na raiz do projeto
cp .env.example .env
```

```env
# Firebase
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY_ID=sua-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=seu-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# Gemini AI
GEMINI_API_KEY=sua-api-key-do-gemini

# Email (Nodemailer)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-gmail

# Server
PORT=3000
```

4. **Execute o projeto**

**Backend (Terminal 1)**
```bash
node backend/server.js
```

**Frontend (Terminal 2)**
```bash
cd frontend
npm run dev
```

5. **Acesse a aplicação**
```
Frontend: http://localhost:5173
Backend: http://localhost:3000
```

---

## 📊 Limites e Escalabilidade

### **Firebase (Free Tier)**
- 📖 Leituras: 50.000/dia
- ✍️ Escritas: 20.000/dia
- 🗑️ Deleções: 20.000/dia
- 💾 Armazenamento: 1 GB
- 🌐 Transferência: ~10 GB/mês
- 📁 Storage: 5 GB (arquivos até 10 MB recomendados)

### **Gemini API (Free Tier)**
- ⚡ 15 requests/minuto
- 📅 1.500 requests/dia (renovação diária)
- 🎯 ~1.000.000 tokens/minuto
- 💡 Cada análise consome ~500-2.000 tokens

### **Email (Gmail SMTP)**
- 📧 ~500 emails/dia (Gmail gratuito)
- 🚀 ~2.000 emails/dia (Google Workspace)

---

## 🔐 Segurança

- ✅ Autenticação JWT com middleware
- ✅ Validação de roles (student/master)
- ✅ Sanitização de inputs
- ✅ CORS configurado
- ✅ Rate limiting em APIs críticas
- ✅ Variáveis sensíveis em `.env`
- ✅ Firebase Security Rules
- ✅ Upload validation (tipo, tamanho)

---

## 🎨 UI/UX Features

- 🌓 **Dark Mode**: Tema escuro/claro automático
- 📱 **Responsivo**: Mobile-first design
- ✨ **Animações**: Transições suaves CSS
- 🎯 **Feedback Visual**: Toasts, modals, loading states
- 🎨 **Gradientes**: Design moderno e atrativo
- ⚡ **Performance**: Lazy loading, code splitting
- ♿ **Acessibilidade**: ARIA labels, keyboard navigation

---

## 🧪 Testes

Scripts de teste disponíveis em `/test/`:
```bash
# Testar conexão Firebase
node test/test-firebase.js

# Testar Gemini API
node test/test-gemini-api.js

# Testar envio de email
node test/test-email.js
```

---

## 🚀 Deploy no Vercel

Este projeto está **pronto para deploy** no Vercel! Toda a configuração já foi feita.

### 📖 Guias de Deploy

Escolha o guia de acordo com seu nível de experiência:

- **🚀 Iniciante?** → [VERCEL-QUICKSTART.md](VERCEL-QUICKSTART.md) - Setup em 5 minutos
- **📚 Guia Completo** → [README-VERCEL.md](README-VERCEL.md) - Tudo que você precisa saber
- **✅ Checklist** → [DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md) - Não esqueça nada

### ⚡ Deploy Rápido

1. **Criar conta**: [vercel.com](https://vercel.com)
2. **Importar** este repositório do GitHub
3. **Configurar** variáveis de ambiente (Firebase, Gemini, JWT)
4. **Deploy!** 🎉

```bash
# Configurações básicas no Vercel:
Framework Preset: Other
Build Command: cd frontend && npm install && npm run build
Output Directory: frontend/dist
Install Command: npm install
```

### 🔐 Variáveis de Ambiente Necessárias

Configure no **Vercel Dashboard → Settings → Environment Variables**:

```env
# Firebase
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...

# Google Gemini
GEMINI_API_KEY=sua-chave-aqui

# Segurança
JWT_SECRET=sua-chave-secreta (gere com crypto.randomBytes)

# URLs (após primeiro deploy)
VITE_API_URL=https://seu-projeto.vercel.app
FRONTEND_URL=https://seu-projeto.vercel.app
```

### 📊 O que já está configurado

- ✅ `vercel.json` - Configuração de build e rotas
- ✅ `.vercelignore` - Otimização de deploy
- ✅ CORS automático para `.vercel.app`
- ✅ Build scripts otimizados
- ✅ Serverless functions prontas
- ✅ Frontend build configurado

### 🆘 Problemas?

Consulte a seção **"Problemas Comuns e Soluções"** em [README-VERCEL.md](README-VERCEL.md)

---

## 📈 Roadmap Futuro

- [ ] Sistema de rankings e leaderboards
- [ ] Notificações push em tempo real
- [ ] Chat integrado entre alunos e mestres
- [ ] Dashboard de analytics para administradores
- [ ] Sistema de badges e conquistas visuais
- [ ] Integração com GitHub para submissões de código
- [ ] API GraphQL para queries otimizadas
- [ ] Mobile app (React Native)
- [ ] Testes automatizados (Jest/Vitest)
- [ ] CI/CD pipeline completo

---

## 👨‍💻 Autor

**Leonardo Felipe de Góes Pulpor**

🔗 [GitHub](https://github.com/pulpor) | 📧 [Email](mailto:pulppor@gmail.com) | 🧐 [Linkedin](https://www.linkedin.com/in/pulpor/)

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🌟 Agradecimentos

- Google Gemini pela API de IA
- Firebase pela infraestrutura serverless
- Comunidade open-source pelas bibliotecas utilizadas

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

Made with ❤️ and ☕ by <b>Leonardo Pulpor</b>

</div>
