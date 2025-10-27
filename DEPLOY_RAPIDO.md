# 🚀 Deploy Rápido (5 passos)

Guia curto para colocar o projeto no ar (Vercel + Firebase), sem enrolação.

## 1) Pré-requisitos
- Conta no Firebase (Firestore + Storage ativados)
- API Key do Gemini (https://ai.google.dev)
- Conta no GitHub e Vercel
- Node 16+

## 2) Configurar backend/.env
Crie `backend/.env` com:

```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
JWT_SECRET=chave_aleatoria_segura_min_32_chars
GEMINI_API_KEY=...
NODE_ENV=production
```

## 3) Regras de Produção (Firebase)
Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function auth() { return request.auth != null; }
    function isProf() { return auth() && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'professor'; }

    match /usuarios/{userId} {
      allow read, write: if auth() && request.auth.uid == userId;
      allow create: if true;
    }
    match /missoes/{id} {
      allow read: if auth();
      allow create, update, delete: if isProf();
    }
    match /submissoes/{id} {
      allow read: if auth();
      allow create: if auth();
      allow update, delete: if auth();
    }
    match /turmas/{id} {
      allow read: if auth();
      allow create, update, delete: if isProf();
    }
  }
}
```

Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function auth() { return request.auth != null; }
    match /submissions/{all=**} {
      allow read: if auth();
      allow write: if auth() && request.resource.size < 10 * 1024 * 1024; // 10MB
    }
    match /bug-reports/{all=**} {
      allow read, write: if auth() && request.resource.size < 5 * 1024 * 1024; // 5MB
    }
  }
}
```

No Firebase > Authentication > Settings > Authorized domains: adicione seu domínio do Vercel.

## 4) Deploy (Vercel)
1. Suba o código para um repositório PRIVADO no GitHub
2. Vercel > Add New Project > importe o repo duas vezes:
   - Frontend: Root Directory = `frontend` | Build = `npm run build` | Output = `dist`
   - Backend: Root Directory = `backend` | Build = `npm install` | Output = (vazio)
3. Variáveis do Backend (Vercel > Project > Settings > Env): copie as do `.env`
4. Variável do Frontend: `VITE_API_URL=https://SEU_BACKEND.vercel.app`
5. Atualize CORS no `backend/server.js` com a URL do seu frontend do Vercel

## 5) Teste rápido
- Acesse frontend (Vercel URL), crie conta, faça login
- Crie uma missão (professor) e submeta como aluno
- Aprove a submissão e verifique XP subindo

Dica: se der CORS, confira a lista de origins no backend. Se der Permission Denied, revise as Rules.
