# 📏 Limites e Quotas (Resumo)

Documento curto com os limites essenciais para operar o projeto em produção. Sem rodeios.

## Firebase (Plano Gratuito)

- Firestore
  - Leituras: até 50.000/dia
  - Escritas: até 20.000/dia
  - Deleções: até 20.000/dia
  - Armazenamento: 1 GB incluído
  - Transferência: ~10 GB/mês

- Storage
  - Armazenamento total: 5 GB
  - Downloads: 1 GB/dia
  - Uploads: 1 GB/dia
  - Operações: 50.000/dia
  - Recomendado no projeto: arquivos até 10 MB (submissions) e 5 MB (bug-reports)

Observação importante: o “Modo de teste 30 dias” do Firebase só relaxa as regras de segurança. O serviço não expira. Use regras de produção para funcionar para sempre.

## Gemini (Free Tier)

- Modelo: `gemini-2.5-flash`
- Requests por minuto (RPM): 15
- Requests por dia (RPD): 1.500
- Tokens por minuto: ~1.000.000
- Dica: cada análise consome ~500–2.000 tokens, então 1.500 análises/dia é um bom teto.

## Recomendações rápidas

- Configure alertas no Firebase em 80% de uso (reads/writes/storage)
- Limite tamanho de upload no backend (10 MB)
- Faça cache de resultados de análises Gemini repetidas
- Evite múltiplas chamadas paralelas ao Gemini (risco de 429)

## TL;DR Operacional (100 alunos)

- Tráfego e uso típico ficam bem abaixo dos limites gratuitos
- Se precisar escalar: Firebase Blaze (paga por uso) + manter Vercel gratuito
# 📝 Observações Importantes - Configurações e Limites

Este documento detalha as **configurações necessárias**, **limites de API**, **quotas**, e **boas práticas** para Firebase e Google Gemini utilizados no projeto.

---

## 📑 Índice

1. [Firebase Configuration](#-firebase-configuration)
2. [Google Gemini AI](#-google-gemini-ai)
3. [Limites e Quotas](#-limites-e-quotas)
4. [Segurança e Regras](#-segurança-e-regras)
5. [Troubleshooting](#-troubleshooting)
6. [Melhores Práticas](#-melhores-práticas)

---

## 🔥 Firebase Configuration

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em **"Adicionar projeto"**
3. Dê um nome ao projeto (ex: `rpg-aprendizado`)
4. Desabilite Google Analytics (opcional para este projeto)
5. Clique em **"Criar projeto"**

### 2. Habilitar Serviços

#### Firestore Database

1. No menu lateral, acesse **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha o modo:
   - **Modo de produção**: Mais seguro, requer regras personalizadas
   - **Modo de teste**: Permite leitura/escrita por 30 dias (recomendado para desenvolvimento)
4. Selecione a localização (ex: `southamerica-east1` para Brasil)
5. Clique em **"Ativar"**

**Estrutura de Coleções** (criadas automaticamente pelo app):
```
📂 usuarios/         - Dados dos usuários
📂 missoes/          - Missões criadas por professores
📂 submissoes/       - Submissões de código dos alunos
📂 turmas/           - Turmas e grupos de alunos
```

#### Firebase Storage

1. No menu lateral, acesse **"Storage"**
2. Clique em **"Começar"**
3. Escolha o modo de segurança:
   - **Modo de produção**: Requer autenticação
   - **Modo de teste**: Permite uploads por 30 dias
4. Selecione a mesma localização do Firestore
5. Clique em **"Concluir"**

**Estrutura de Pastas** (criadas automaticamente):
```
📁 submissions/              - Arquivos de submissões
   📄 {userId}_{timestamp}_{filename}
📁 bug-reports/              - Prints de bugs reportados
   📄 bug_{timestamp}_{filename}
```

### 3. Obter Credenciais

1. Acesse **"Configurações do projeto"** (ícone de engrenagem)
2. Na aba **"Geral"**, role até **"Seus aplicativos"**
3. Clique no ícone **"Web"** (`</>`)
4. Registre o app (nome: `rpg-frontend`)
5. **NÃO** marque Firebase Hosting
6. Copie o objeto `firebaseConfig`

**Exemplo de credenciais:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "rpg-aprendizado.firebaseapp.com",
  projectId: "rpg-aprendizado",
  storageBucket: "rpg-aprendizado.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 4. Configurar `.env`

Crie o arquivo `backend/.env` e adicione as variáveis:

```env
# Firebase Configuration (copie do Firebase Console)
FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=rpg-aprendizado.firebaseapp.com
FIREBASE_PROJECT_ID=rpg-aprendizado
FIREBASE_STORAGE_BUCKET=rpg-aprendizado.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# JWT Secret (gere uma chave segura)
JWT_SECRET=substitua_por_chave_aleatoria_minimo_32_caracteres

# Google Gemini AI (obtenha em ai.google.dev)
GEMINI_API_KEY=AIzaSyByyyyyyyyyyyyyyyyyyyyyyyyyy

# Email Service (opcional)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@seudominio.com
```

**⚠️ NUNCA commite o arquivo `.env` no Git!**

Adicione ao `.gitignore`:
```
backend/.env
.env
*.env
```

### 5. Limites Firebase (Plano Gratuito)

#### Firestore Database

| Recurso | Limite Diário | Limite Total |
|---------|---------------|--------------|
| **Leituras** | 50.000 | 50.000/dia |
| **Escritas** | 20.000 | 20.000/dia |
| **Deletes** | 20.000 | 20.000/dia |
| **Armazenamento** | - | 1 GB |
| **Transferência** | - | 10 GB/mês |
| **Documentos** | - | Ilimitado |

**Estimativa para o projeto:**
- Login: 1 leitura (usuario)
- Carregar missões: 10-50 leituras
- Submeter código: 2-3 escritas (submissao + update usuario)
- Aprovar submissão: 3-4 escritas (update submissao, update usuario, create history)

**Capacidade aproximada:**
- ~500 logins/dia
- ~200 submissões/dia
- ~100 aprovações/dia

#### Firebase Storage

| Recurso | Limite |
|---------|--------|
| **Armazenamento** | 5 GB |
| **Downloads** | 1 GB/dia |
| **Uploads** | 1 GB/dia |
| **Operações** | 50.000/dia |

**Estimativa para o projeto:**
- Arquivo médio: 50 KB (código + anexos)
- Capacidade: ~100.000 arquivos
- 1 GB = ~20.000 submissões com arquivos

### 6. Como Enviar e Receber Dados

#### Enviar Dados (Create/Update)

```javascript
// Backend - Criar documento
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const db = getFirestore();

const novoUsuario = {
  nome: 'João Silva',
  email: 'joao@exemplo.com',
  tipo: 'aluno',
  totalXP: 0,
  nivel: 1,
  createdAt: new Date()
};

const docRef = await addDoc(collection(db, 'usuarios'), novoUsuario);
console.log('ID criado:', docRef.id);

// Atualizar documento
const { doc, updateDoc } = require('firebase/firestore');
await updateDoc(doc(db, 'usuarios', userId), {
  totalXP: 150,
  nivel: 2
});
```

#### Receber Dados (Read)

```javascript
// Backend - Buscar todos
const { getDocs, collection } = require('firebase/firestore');
const snapshot = await getDocs(collection(db, 'missoes'));
const missoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Buscar por ID
const { getDoc, doc } = require('firebase/firestore');
const docSnap = await getDoc(doc(db, 'usuarios', userId));
if (docSnap.exists()) {
  const usuario = { id: docSnap.id, ...docSnap.data() };
}

// Buscar com filtro
const { query, where } = require('firebase/firestore');
const q = query(
  collection(db, 'submissoes'),
  where('alunoId', '==', userId),
  where('status', '==', 'aprovado')
);
const snapshot = await getDocs(q);
```

#### Upload de Arquivos

```javascript
// Backend - Upload para Storage
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const storage = getStorage();

const fileRef = ref(storage, `submissions/${userId}_${Date.now()}_${filename}`);
await uploadBytes(fileRef, fileBuffer);
const downloadURL = await getDownloadURL(fileRef);

// Salvar URL no Firestore
await addDoc(collection(db, 'submissoes'), {
  alunoId: userId,
  arquivos: [downloadURL],
  submittedAt: new Date()
});
```

#### Download de Arquivos

```javascript
// Frontend - Download via URL
const response = await fetch(downloadURL);
const blob = await response.blob();
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = filename;
link.click();
```

### 7. Configurações Avançadas

#### Regras de Segurança Firestore (Produção)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários: apenas o próprio usuário pode ler/escrever
    match /usuarios/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Missões: todos autenticados podem ler, apenas professores criar
    match /missoes/{missionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'professor';
      allow update, delete: if request.auth != null && 
        resource.data.professorId == request.auth.uid;
    }
    
    // Submissões: aluno vê suas, professor vê todas da turma
    match /submissoes/{submissionId} {
      allow read: if request.auth != null && 
        (resource.data.alunoId == request.auth.uid || 
         get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'professor');
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.alunoId == request.auth.uid || 
         get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'professor');
    }
    
    // Turmas: professor dono pode gerenciar
    match /turmas/{turmaId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'professor';
    }
  }
}
```

#### Regras de Segurança Storage (Produção)

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Submissões: apenas o dono pode fazer upload
    match /submissions/{userId}_{timestamp}_{filename} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
    
    // Bug reports: qualquer um autenticado pode enviar
    match /bug-reports/{filename} {
      allow write: if request.auth != null;
      allow read: if request.auth != null;
    }
  }
}
```

---

## 🤖 Google Gemini AI

### 1. Obter API Key

1. Acesse [Google AI Studio](https://ai.google.dev)
2. Faça login com sua conta Google
3. Clique em **"Get API key"**
4. Clique em **"Create API key in new project"** (ou use projeto existente)
5. Copie a chave gerada (formato: `AIzaSyByyyyyy...`)
6. Adicione ao `backend/.env` como `GEMINI_API_KEY`

### 2. Modelo Utilizado

**Gemini 2.5 Flash**
- Modelo: `gemini-2.5-flash`
- Velocidade: Ultra-rápida (< 2s de resposta)
- Capacidade: Análise de código, debugging, sugestões
- Contexto: 1M tokens (suficiente para analisar arquivos grandes)

### 3. Limites da API Gratuita

#### Quotas (Free Tier)

| Recurso | Limite |
|---------|--------|
| **Requests por minuto (RPM)** | 15 |
| **Requests por dia (RPD)** | 1.500 |
| **Tokens por minuto (TPM)** | 1.000.000 |
| **Tokens por dia** | Ilimitado (sujeito a RPM/RPD) |

**Estimativa para o projeto:**
- Análise de código: ~500-2000 tokens/request
- Com 1.500 requests/dia: **500-1500 análises/dia**
- Para 100 alunos: ~15 submissões/aluno/dia

#### Rate Limiting

Se exceder os limites:
```json
{
  "error": {
    "code": 429,
    "message": "Resource has been exhausted (e.g. check quota).",
    "status": "RESOURCE_EXHAUSTED"
  }
}
```

**Solução:**
- Implementar retry com backoff exponencial
- Cachear análises repetidas
- Queue de análises para distribuir ao longo do dia

### 4. Como Usar o Gemini

#### Análise Básica de Código

```javascript
// Backend - backend/routes/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const prompt = `
Analise o seguinte código ${linguagem}:

\`\`\`${linguagem}
${codigo}
\`\`\`

Forneça:
1. Score de 0-100
2. Feedback detalhado
3. Sugestões de melhoria
4. Problemas encontrados
`;

const result = await model.generateContent(prompt);
const response = result.response.text();
```

#### Configurações de Geração

```javascript
const generationConfig = {
  temperature: 0.7,        // Criatividade (0-1): 0.7 = balanceado
  topK: 40,                // Top-K sampling
  topP: 0.95,              // Nucleus sampling
  maxOutputTokens: 2048,   // Máximo de tokens na resposta
};

const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig,
});
```

#### Análise com Arquivos

```javascript
// Suporta imagens, PDFs, etc.
const imagePart = {
  inlineData: {
    data: Buffer.from(fileBuffer).toString('base64'),
    mimeType: 'image/png'
  }
};

const result = await model.generateContent([
  'Analise este diagrama de arquitetura:',
  imagePart
]);
```

### 5. Boas Práticas Gemini

#### ✅ DO (Faça)

- **Use prompts estruturados** com exemplos
- **Limite o tamanho do código** (< 5000 tokens)
- **Implemente retry logic** para erros 429
- **Cache análises repetidas** (mesmo código)
- **Sanitize output** antes de exibir ao usuário
- **Valide entrada** (código malicioso, XSS)

#### ❌ DON'T (Evite)

- **Não envie dados sensíveis** (senhas, tokens)
- **Não confie cegamente** nas análises (valide)
- **Não faça requests paralelos** (respeite RPM)
- **Não exponha API key** no frontend
- **Não envie código > 10MB** (timeout)

### 6. Exemplo de Implementação Completa

```javascript
// backend/routes/gemini.js (simplificado)
router.post('/analyze', autenticar, async (req, res) => {
  try {
    const { codigo, linguagem } = req.body;
    
    // Validação
    if (!codigo || codigo.length > 50000) {
      return res.status(400).json({ erro: 'Código inválido' });
    }
    
    // Prompt estruturado
    const prompt = `
Você é um professor de programação experiente. Analise o código ${linguagem} abaixo:

\`\`\`${linguagem}
${codigo}
\`\`\`

Responda em JSON:
{
  "score": <número 0-100>,
  "feedback": "<texto descritivo>",
  "pontosPositivos": ["<ponto1>", "<ponto2>"],
  "problemasEncontrados": ["<problema1>", "<problema2>"],
  "sugestoes": ["<sugestao1>", "<sugestao2>"]
}
`;
    
    // Chamar Gemini com retry
    let retries = 3;
    let result;
    
    while (retries > 0) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (error) {
        if (error.status === 429 && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
          retries--;
        } else {
          throw error;
        }
      }
    }
    
    // Parse resposta
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
      score: 50, 
      feedback: responseText 
    };
    
    res.json(analysis);
    
  } catch (error) {
    console.error('[GEMINI] Erro:', error);
    res.status(500).json({ 
      erro: 'Falha na análise', 
      detalhes: error.message 
    });
  }
});
```

---

## 📊 Limites e Quotas

### Resumo Consolidado

| Serviço | Recurso | Limite Gratuito |
|---------|---------|-----------------|
| **Firestore** | Leituras | 50.000/dia |
| **Firestore** | Escritas | 20.000/dia |
| **Firestore** | Armazenamento | 1 GB |
| **Storage** | Armazenamento | 5 GB |
| **Storage** | Download | 1 GB/dia |
| **Storage** | Upload | 1 GB/dia |
| **Gemini** | Requests | 1.500/dia |
| **Gemini** | RPM | 15/minuto |
| **Gemini** | Tokens | 1M/minuto |

### Estimativa de Capacidade (100 Alunos)

**Cenário: 100 alunos ativos/dia**

- **Firestore Leituras:**
  - 100 logins = 100
  - 100 carregamentos de missões (x10) = 1.000
  - 50 submissões visualizadas (x5) = 250
  - **Total: ~1.350/dia (2.7% do limite)**

- **Firestore Escritas:**
  - 50 submissões novas = 50
  - 30 aprovações (x3 updates) = 90
  - 20 XP updates = 20
  - **Total: ~160/dia (0.8% do limite)**

- **Storage:**
  - 50 submissões x 100KB/arquivo = 5 MB/dia
  - **Total: ~150 MB/mês (3% do limite)**

- **Gemini:**
  - 50 análises/dia
  - **Total: 50/dia (3.3% do limite)**

**✅ Conclusão: Limites gratuitos são mais do que suficientes para 100-200 alunos!**

### Quando Fazer Upgrade (Planos Pagos)

**Firebase Blaze (Pay-as-you-go):**
- > 50.000 leituras/dia
- > 20.000 escritas/dia
- > 1 GB armazenamento Firestore
- > 5 GB armazenamento Storage

**Gemini Paid Tier:**
- > 1.500 requests/dia
- Necessidade de RPM > 15
- Modelos avançados (Gemini Pro, Ultra)

---

## 🔐 Segurança e Regras

### Checklist de Segurança

- [x] ✅ `.env` no `.gitignore`
- [x] ✅ JWT tokens com expiração
- [x] ✅ Senhas hasheadas (bcrypt)
- [x] ✅ CORS configurado
- [x] ✅ Validação de entrada no backend
- [x] ✅ Middleware de autenticação em rotas protegidas
- [ ] ⚠️ Firestore rules em modo produção (atualmente teste)
- [ ] ⚠️ Storage rules em modo produção (atualmente teste)
- [ ] ⚠️ Rate limiting implementado
- [ ] ⚠️ Logs de auditoria

### Regras Firebase (Modo Teste vs Produção)

#### Modo Teste (30 dias)
```javascript
// firestore.rules
allow read, write: if request.time < timestamp.date(2025, 11, 20);
```
✅ Bom para: Desenvolvimento local
❌ Ruim para: Produção (inseguro)

#### Modo Produção
```javascript
// firestore.rules
allow read, write: if request.auth != null;
```
✅ Bom para: Produção
⚠️ Requer: Autenticação Firebase (não apenas JWT custom)

**Recomendação para este projeto:**
Use Firebase Authentication + JWT custom, ou implemente validação de token JWT nas rules.

---

## 🐛 Troubleshooting

### Firebase

#### ❌ Erro: "Permission denied"
```
FirebaseError: Missing or insufficient permissions
```

**Solução:**
1. Verifique Firestore Rules (console.firebase.google.com)
2. Se em modo teste, certifique-se que não expirou (30 dias)
3. Se em produção, valide autenticação

#### ❌ Erro: "Quota exceeded"
```
FirebaseError: Quota exceeded
```

**Solução:**
1. Verifique uso em Firebase Console > Usage
2. Otimize queries (use índices, limite resultados)
3. Implemente paginação
4. Considere upgrade para Blaze

#### ❌ Erro: "Storage: object not found"
```
FirebaseError: Object 'submissions/file.txt' does not exist
```

**Solução:**
1. Verifique caminho do arquivo
2. Confirme que upload foi bem-sucedido
3. Valide Storage Rules

### Gemini

#### ❌ Erro: "429 Resource Exhausted"
```json
{
  "error": {
    "code": 429,
    "message": "Resource has been exhausted"
  }
}
```

**Solução:**
```javascript
// Implementar retry com backoff
async function analyzeWithRetry(code, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      } else {
        throw error;
      }
    }
  }
}
```

#### ❌ Erro: "Invalid API Key"
```json
{
  "error": {
    "code": 400,
    "message": "API key not valid"
  }
}
```

**Solução:**
1. Verifique se `GEMINI_API_KEY` está no `.env`
2. Gere nova key em ai.google.dev
3. Confirme que não tem espaços ou caracteres extras

#### ❌ Erro: "Model not found"
```json
{
  "error": {
    "code": 404,
    "message": "Model 'gemini-2.5-flash' not found"
  }
}
```

**Solução:**
1. Verifique nome do modelo (case-sensitive)
2. Use: `gemini-2.5-flash` ou `gemini-1.5-pro`
3. Atualize SDK: `npm update @google/generative-ai`

---

## ✅ Melhores Práticas

### Firebase

1. **Use batch writes** quando possível:
```javascript
const batch = db.batch();
batch.set(ref1, data1);
batch.update(ref2, data2);
await batch.commit(); // 1 write count
```

2. **Implemente índices compostos** para queries complexas
3. **Use paginação** em listas grandes:
```javascript
const first = query(collection(db, 'missoes'), limit(25));
const next = query(collection(db, 'missoes'), startAfter(lastDoc), limit(25));
```

4. **Cache dados localmente** (localStorage, sessionStorage)
5. **Delete arquivos antigos** do Storage periodicamente

### Gemini

1. **Limite tamanho do input**:
```javascript
const MAX_CODE_LENGTH = 10000;
if (codigo.length > MAX_CODE_LENGTH) {
  codigo = codigo.substring(0, MAX_CODE_LENGTH) + '\n// ... código truncado';
}
```

2. **Use streaming para respostas longas**:
```javascript
const result = await model.generateContentStream(prompt);
for await (const chunk of result.stream) {
  process.stdout.write(chunk.text());
}
```

3. **Implemente cache de análises**:
```javascript
const cacheKey = `analysis_${hashCode(codigo)}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

4. **Monitore custos e uso**:
```javascript
console.log('[GEMINI] Tokens usados:', result.usageMetadata.totalTokenCount);
```

---

## 📞 Suporte

### Links Úteis

- **Firebase Console:** https://console.firebase.google.com
- **Firebase Docs:** https://firebase.google.com/docs
- **Firestore Pricing:** https://firebase.google.com/pricing
- **Gemini AI Studio:** https://ai.google.dev
- **Gemini Docs:** https://ai.google.dev/docs
- **Gemini Pricing:** https://ai.google.dev/pricing

### Monitoramento

**Firebase Console > Usage:**
- Veja gráficos de leituras/escritas
- Monitore Storage usage
- Configure alertas de quota

**Logs do Backend:**
```javascript
// Adicione logging detalhado
console.log('[FIREBASE] Leitura:', collectionName, docId);
console.log('[GEMINI] Request:', { model, tokens: prompt.length });
```

---

## 🚀 Deploy para Produção

### Preparação para Vercel

#### 1. **Firebase - Configuração de Produção**

**⚠️ IMPORTANTE:** Configure as regras de produção **ANTES** de liberar para alunos!

**Firestore Rules (Produção):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Função helper para verificar autenticação
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Função helper para verificar se é o próprio usuário
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Função helper para verificar se é professor
    function isProfessor() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'professor';
    }
    
    // Usuários: apenas o próprio pode ler/escrever seus dados
    match /usuarios/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
      // Permitir criação (registro)
      allow create: if true;
    }
    
    // Missões: todos autenticados podem ler, apenas professores criar/editar/deletar
    match /missoes/{missionId} {
      allow read: if isAuthenticated();
      allow create: if isProfessor();
      allow update, delete: if isProfessor() && 
        resource.data.professorId == request.auth.uid;
    }
    
    // Submissões: aluno vê suas, professor vê todas
    match /submissoes/{submissionId} {
      allow read: if isAuthenticated() && 
        (resource.data.alunoId == request.auth.uid || isProfessor());
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (resource.data.alunoId == request.auth.uid || isProfessor());
      allow delete: if isProfessor();
    }
    
    // Turmas: professor pode gerenciar suas turmas
    match /turmas/{turmaId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isProfessor();
    }
  }
}
```

**Storage Rules (Produção):**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Função helper para verificar autenticação
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Submissões: apenas autenticados podem fazer upload/download
    match /submissions/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
        request.resource.size < 10 * 1024 * 1024; // Max 10MB
    }
    
    // Bug reports: qualquer autenticado pode enviar
    match /bug-reports/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
        request.resource.size < 5 * 1024 * 1024; // Max 5MB
    }
  }
}
```

#### 2. **Authorized Domains**

Adicione seu domínio Vercel ao Firebase:

1. Firebase Console > Authentication > Settings
2. **Authorized domains** > Add domain
3. Adicione: `seu-projeto.vercel.app`

#### 3. **Variáveis de Ambiente Vercel**

Configure no Vercel Dashboard > Settings > Environment Variables:

**Backend:**
```env
FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=rpg-aprendizado.firebaseapp.com
FIREBASE_PROJECT_ID=rpg-aprendizado
FIREBASE_STORAGE_BUCKET=rpg-aprendizado.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef123456
JWT_SECRET=sua_chave_super_secreta_minimo_32_caracteres
GEMINI_API_KEY=AIzaSyByyyyyyyyyyyyyyyyyyyyyyyyyy
NODE_ENV=production
```

**Frontend:**
```env
VITE_API_URL=https://seu-backend.vercel.app
```

#### 4. **Estrutura de Deploy**

**Opção 1: Monorepo (Recomendado)**
```
Projeto único no GitHub com 2 deploys no Vercel:
- Deploy 1: frontend/ (Static Site)
- Deploy 2: backend/ (Serverless Functions)
```

**Opção 2: Repositórios Separados**
```
- Repo 1: rpg-frontend (deploy Vercel)
- Repo 2: rpg-backend (deploy Vercel)
```

#### 5. **CORS em Produção**

Atualize `backend/server.js`:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://seu-frontend.vercel.app', // Adicione seu domínio
  'https://seu-dominio-customizado.com.br' // Se tiver
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

<div align="center">

**Última atualização:** Outubro 2025

[⬆ Voltar ao README](./README.md) • [📖 Guia de Deploy](./DEPLOY.md)

</div>
