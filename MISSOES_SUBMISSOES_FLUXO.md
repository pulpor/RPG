# 📚 FLUXO COMPLETO DE SUBMISSÃO DE MISSÕES

## 🎯 Objetivo
Quando um aluno envia um arquivo de uma missão:
1. ✅ Arquivo é salvo no Firebase Storage
2. ✅ Informações são salvas no Firestore
3. ✅ Status da missão muda de "disponível" → "pendente"
4. ✅ Gemini gera feedback automático
5. ✅ Submissão aparece no painel do Master
6. ✅ Master aprova ou rejeita
7. ✅ Status atualiza para "aprovada" ou volta para "disponível"

---

## 🔄 FLUXO VISUAL

```
ALUNO (Frontend)
├─ Vê missão em "Disponíveis"
├─ Clica em "Enviar Código"
├─ Seleciona arquivo
└─ Envia (POST /submissoes/submit)
         │
         ↓
BACKEND (Node.js)
├─ Valida autenticação ✅
├─ Valida arquivo ✅
├─ Faz upload para Firebase Storage ✅
├─ Salva submissão no Firestore ✅
├─ Atualiza status da missão para "pendente" ✅
├─ Chama Gemini para gerar feedback (background) ✅
└─ Retorna sucesso ao frontend
         │
         ↓
ALUNO (Frontend)
├─ Recebe mensagem de sucesso
├─ Missão sai de "Disponíveis"
└─ Missão entra em "Pendentes"
         │
         ↓
MASTER (Painel)
├─ Vê nova submissão em "Pendentes"
├─ Lê código e feedback automático
├─ Aprova ou Rejeita
└─ Clica em botão
         │
      ┌──┴──┐
      ↓     ↓
  APROVA  REJEITA
      │     │
      ↓     ↓
  Status =  Status =
  "aprovada" "disponível"
      │     │
      └─────┴──→ Aluno é notificado
```

---

## 📁 ESTRUTURA NO FIREBASE

### **Collections**

```
submissions/
├── submissionId
│   ├── userId
│   ├── username
│   ├── missionId
│   ├── missionTitle
│   ├── status: "pending" | "approved" | "rejected"
│   ├── fileUrls: ["https://..."]
│   ├── geminiFeedback: "✅ Ponto Positivo: ..."
│   ├── submittedAt: timestamp
│   └── updatedAt: timestamp

missions/
├── missionId
│   ├── titulo
│   ├── descricao
│   ├── userStatus: {
│   │   "userId1": "pendente",
│   │   "userId2": "disponivel",
│   │   "userId3": "aprovada"
│   └── }

users/
├── userId
│   ├── submissions: ["submissionId1", "submissionId2"]
│   └── missionsStatus: {
│        "missionId1": "pendente",
│        "missionId2": "disponivel"
│      }
```

### **Storage**

```
gs://rpg-educacional.appspot.com/
└── submissions/
    └── [masterUsername]/
        └── [userId]/
            └── [submissionId]/
                └── arquivo.js (ou .html, .txt, etc)
```

---

## 🔧 ENDPOINTS MODIFICADOS

### 1️⃣ **POST /submissoes/submit** (ALUNO - Enviar arquivo)

**Request:**
```json
{
  "missionId": "abc123",
  "file": <arquivo>
}
```

**Response (Sucesso):**
```json
{
  "message": "✅ Submissão enviada com sucesso! Aguardando análise do professor...",
  "submission": {
    "id": "sub123",
    "missionId": "abc123",
    "status": "pending",
    "fileUrls": ["https://storage.googleapis.com/..."],
    "submittedAt": "2025-10-17T11:45:25.123Z"
  },
  "status": "pending",
  "feedback": "Seu código será analisado automaticamente. Você receberá um feedback em breve!"
}
```

---

## 🎨 O QUE MUDA NO FRONTEND

### **student.js** - Após Submissão
```javascript
// Quando a submissão é enviada com sucesso:
// 1. A missão desaparece de "Disponíveis" ✨
// 2. A missão aparece em "Pendentes" 📋
// 3. Mostra badge "Aguardando Aprovação" 🕐
// 4. Mostra feedback automático do Gemini 🤖
```

### **master.js** - Novo Painel
```javascript
// Será mostrado em um novo painel "Submissões":
// ├─ Pendentes (aguardando aprovação)
// ├─ Aprovadas (alunos completaram)
// └─ Rejeitadas (devem reenviar)
//
// Para cada uma:
// ├─ Nome do aluno
// ├─ Nome da missão
// ├─ Download do arquivo
// ├─ Feedback automático (Gemini)
// ├─ Botão [APROVAR] ✅
// └─ Botão [REJEITAR] ❌
```

---

## 🚀 COMO TESTAR

### 1. **Enviar Uma Submissão (como aluno)**
```
1. Fazer login como aluno
2. Ir para painel de aluno
3. Ir para "Missões Disponíveis"
4. Clicar em "Enviar Código"
5. Selecionar um arquivo (.js, .html, etc)
6. Clicar em "ENVIAR"
7. ✅ Deve aparecer "Sucesso"
8. ✅ Missão deve ir para "Pendentes"
```

### 2. **Verificar no Backend**
```
Logs devem mostrar:
✅ [UPLOAD] Iniciando processamento...
✅ [UPLOAD] Arquivo recebido
✅ [Firebase] Upload para Storage iniciado
✅ [Firebase] URL de download obtida
✅ [UPLOAD] Submissão criada
✅ [GEMINI] Feedback gerado
```

### 3. **Verificar no Master**
```
1. Fazer login como master
2. Ir para novo painel "Submissões"
3. Deve aparecer a submissão com:
   ├─ Nome do aluno
   ├─ Arquivo para download
   ├─ Feedback automático
   └─ Botões [APROVAR] e [REJEITAR]
```

### 4. **Aprovar/Rejeitar (como master)**
```
[APROVAR]:
- Status muda para "aprovada"
- Missão sai de "Pendentes"
- Missão vai para "Aprovadas" (novo status)

[REJEITAR]:
- Status volta a "disponível"
- Submissão sai de "Pendentes"
- Aluno vê missão novamente em "Disponíveis"
- Aluno pode reenviar
```

---

## ⚠️ POSSÍVEIS ERROS E SOLUÇÕES

### **Erro 500 ao enviar arquivo**
**Causa:** Firebase Storage não configurado ou arquivo vazio
**Solução:**
1. Verifique se está usando memória (buffer) ou disco
2. Verifique regras do Firebase Storage
3. Verifique se arquivo tem conteúdo

### **Feedback do Gemini não aparece**
**Causa:** API Key não configurada
**Solução:**
1. Verifique `GEMINI_API_KEY` no `.env`
2. Verifique se API do Gemini está ativa
3. Verifique quota de requisições

### **Arquivo não aparece no Firebase Storage**
**Causa:** Path do storage incorreto ou permissões
**Solução:**
1. Verifique `masterUsername` preenchido
2. Verifique regras de segurança do Storage
3. Regra recomendada:
   ```
   allow read, write: if request.auth != null;
   ```

---

## 📝 PRÓXIMOS PASSOS

1. ✅ Backend pronto para receber e processar
2. 🔄 Frontend precisa ser atualizado para mostrar novo status
3. 🔄 Painel do Master precisa ser criado
4. 🔄 Sistema de notificações (opcional)
5. 🔄 Relatório de desempenho (opcional)

