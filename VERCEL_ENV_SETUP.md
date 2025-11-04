# 🚀 Configuração de Variáveis de Ambiente na Vercel

## ⚠️ IMPORTANTE: Sem essas variáveis, o backend NÃO funcionará em produção!

O backend precisa das mesmas variáveis de ambiente que você usa localmente no arquivo `.env`.

---

## 📋 Passo a Passo

### 1. Acesse o Dashboard da Vercel
1. Vá para: https://vercel.com/dashboard
2. Clique no projeto **RPG** (ou rpg-azure)
3. Clique em **Settings** (Configurações)
4. No menu lateral, clique em **Environment Variables**

---

### 2. Adicione TODAS as variáveis abaixo

Para cada variável, clique em **Add New** e preencha:
- **Key** (Nome da variável)
- **Value** (Valor - use os mesmos do seu `.env` local)
- **Environment**: Marque `Production`, `Preview` e `Development`

---

## 🔑 Variáveis Obrigatórias

### 🤖 Google Gemini (IA)
```
GEMINI_API_KEY
```
- Valor: Sua chave da API Gemini
- Obter em: https://makersuite.google.com/app/apikey

---

### 🔥 Firebase (Banco de Dados)
```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
```

**Como obter:**
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Vá em: ⚙️ Configurações do Projeto > Geral
4. Role até "Seus apps" > Configuração do SDK
5. Copie os valores de `firebaseConfig`

---

### 🔐 JWT (Autenticação)
```
JWT_SECRET
```
- Valor: Uma string aleatória longa (mínimo 32 caracteres)
- Para gerar no terminal: 
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

---

### 📧 Email (Recuperação de Senha) - OPCIONAL
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_do_gmail
EMAIL_FROM=Plataforma RPG <seu_email@gmail.com>
```

**Como configurar Gmail:**
1. Ative a verificação em 2 etapas
2. Gere uma senha de app: https://myaccount.google.com/apppasswords

---

### ⚙️ Outras Configurações
```
NODE_ENV=production
FRONTEND_URL=https://pulpor.github.io/RPG
```

---

## 3. ✅ Verificar se funcionou

Após adicionar todas as variáveis:

1. **Trigger um novo deploy:**
   - Na aba **Deployments**, clique nos 3 pontinhos do último deploy
   - Clique em **Redeploy**

2. **Teste o endpoint de health:**
   - Abra: https://rpg-azure.vercel.app/health
   - Deve retornar algo como:
     ```json
     {
       "status": "ok",
       "timestamp": "2025-11-04T...",
       "environment": "production",
       "firebase": "✅",
       "gemini": "✅"
     }
     ```

3. **Se aparecer `gemini: "❌"`:**
   - A variável `GEMINI_API_KEY` não foi configurada corretamente
   - Verifique se não tem espaços extras no valor
   - Faça redeploy após corrigir

4. **Teste o login:**
   - Vá para: https://pulpor.github.io/RPG
   - Tente fazer login
   - Abra o Console do navegador (F12)
   - Verifique se as requisições vão para `rpg-azure.vercel.app` (não localhost)

---

## 🐛 Problemas Comuns

### ❌ "Firebase configuration incomplete"
- Faltam variáveis do Firebase
- Verifique se TODAS as 6 variáveis estão corretas

### ❌ Erro CORS
- O domínio já está configurado no backend
- Faça hard refresh: Ctrl+Shift+R

### ❌ "Failed to fetch"
- O backend não está respondendo
- Verifique os logs da Vercel: Dashboard > Deployments > [último deploy] > Runtime Logs

---

## 📝 Checklist Final

- [ ] GEMINI_API_KEY configurada
- [ ] Todas 6 variáveis do Firebase configuradas
- [ ] JWT_SECRET configurada
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL configurada
- [ ] Redeploy feito após adicionar variáveis
- [ ] Endpoint /health retorna "ok"
- [ ] Login funciona no site em produção
- [ ] Missões carregam após o login

---

## 🆘 Precisa de Ajuda?

1. Teste o health check: https://rpg-azure.vercel.app/health
2. Verifique os logs da Vercel
3. Me envie o resultado do health check ou os erros do console

