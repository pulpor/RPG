# ✅ Checklist de Deploy no Vercel

Use este checklist para garantir que nada foi esquecido antes do deploy.

## Antes de Começar

- [ ] Leu o **README-VERCEL.md** completo
- [ ] Tem conta no Vercel vinculada ao GitHub
- [ ] Tem todas as credenciais necessárias (Firebase, Gemini, Email)

## Preparação do Código

- [ ] Código está no GitHub (fork ou repositório próprio)
- [ ] Testou localmente:
  - [ ] Backend: `node backend/server.js` funciona
  - [ ] Frontend: `cd frontend && npm run dev` funciona
  - [ ] Build frontend: `cd frontend && npm run build` sem erros

## Configuração do Projeto no Vercel

### Importar Repositório
- [ ] Importou repositório do GitHub no Vercel
- [ ] Framework Preset: **Other**
- [ ] Root Directory: `./` (vazio/raiz)
- [ ] Build Command: `cd frontend && npm install && npm run build`
- [ ] Output Directory: `frontend/dist`
- [ ] Install Command: `npm install`

### Variáveis de Ambiente

#### Firebase (Obrigatório)
- [ ] `FIREBASE_TYPE` = `service_account`
- [ ] `FIREBASE_PROJECT_ID` = seu project ID
- [ ] `FIREBASE_PRIVATE_KEY_ID` = key ID
- [ ] `FIREBASE_PRIVATE_KEY` = chave completa com `\n` literais
- [ ] `FIREBASE_CLIENT_EMAIL` = email do service account
- [ ] `FIREBASE_CLIENT_ID` = client ID
- [ ] `FIREBASE_AUTH_URI` = https://accounts.google.com/o/oauth2/auth
- [ ] `FIREBASE_TOKEN_URI` = https://oauth2.googleapis.com/token
- [ ] `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` = URL do Google
- [ ] `FIREBASE_CLIENT_X509_CERT_URL` = URL do certificado

#### Google Gemini (Obrigatório)
- [ ] `GEMINI_API_KEY` = sua chave da API

#### Email (Opcional mas recomendado)
- [ ] `EMAIL_HOST` = smtp.gmail.com
- [ ] `EMAIL_PORT` = 587
- [ ] `EMAIL_USER` = seu email
- [ ] `EMAIL_PASS` = senha de app do Gmail
- [ ] `EMAIL_FROM` = nome e email para envios

#### Segurança
- [ ] `JWT_SECRET` = chave secreta (gere com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

#### URLs
- [ ] `FRONTEND_URL` = https://seu-projeto.vercel.app (copiar depois do primeiro deploy)
- [ ] `VITE_API_URL` = https://seu-projeto.vercel.app (copiar depois do primeiro deploy)
- [ ] `NODE_ENV` = production (Vercel define automaticamente)

## Primeiro Deploy

- [ ] Clicou em **Deploy** no Vercel
- [ ] Deploy concluído com sucesso
- [ ] Copiou a URL do projeto (ex: https://rpg-xyz.vercel.app)

## Pós-Deploy - Configurações

### Atualizar URLs
- [ ] Adicionou `FRONTEND_URL` com a URL do Vercel
- [ ] Adicionou `VITE_API_URL` com a URL do Vercel
- [ ] Re-deploy (automático após salvar variáveis)

### Teste Funcional
- [ ] Frontend carrega (https://seu-projeto.vercel.app)
- [ ] Página de login aparece corretamente
- [ ] Consegue fazer login (testa conexão com backend)
- [ ] Dashboard do aluno/mestre funciona
- [ ] API responde (testa /api/*, /auth/*, etc.)

## Verificações de Segurança

- [ ] Arquivo `.env` NÃO foi commitado no Git
- [ ] CORS está configurado apenas para domínios conhecidos
- [ ] Firebase Security Rules estão ativas
- [ ] Variáveis sensíveis estão apenas no Vercel (não no código)

## Monitoramento

- [ ] Verificou logs no Vercel (Deployments > Functions > Logs)
- [ ] Testou todas as funcionalidades principais:
  - [ ] Login
  - [ ] Registro de usuário
  - [ ] Criar missão (mestre)
  - [ ] Submeter missão (aluno)
  - [ ] Upload de arquivos
  - [ ] Análise com Gemini

## Problemas?

Se algo não funcionar:

1. **Verifique logs no Vercel:**
   - Vá em Deployments > Clique no deploy > Functions > Veja logs

2. **Erros comuns:**
   - CORS blocked → Atualize URLs no backend
   - Firebase error → Verifique FIREBASE_PRIVATE_KEY (com `\n`)
   - 404 na API → Verifique vercel.json e rotas
   - Build failed → Verifique logs de build

3. **Consulte README-VERCEL.md** seção "Problemas Comuns"

---

## 🎉 Deploy Concluído!

Se todos os itens estão marcados e tudo funciona, parabéns! 🚀

Seu RPG Educacional está no ar em: **https://seu-projeto.vercel.app**

---

**Dica:** Salve este checklist para usar em futuros deploys ou atualizações.
