# RPG de Aprendizado

Plataforma gamificada: missões → XP → níveis (1–10) → ranks (Junior/Pleno/Senior). Professores criam/avaliam; IA (Gemini) auxilia na análise.

## Stack
- Backend: Node.js + Express, Firebase (Firestore/Storage), JWT, Multer, Gemini API
- Frontend: Vite + JavaScript (ESM) + Tailwind CSS
- Infra: Vercel, Dotenv, CORS

## Variáveis (.env)
- backend/.env: FIREBASE_*, JWT_SECRET, GEMINI_API_KEY, NODE_ENV
- frontend/.env: VITE_API_URL (URL do backend)
Exemplos em `backend/.env.example` e `frontend/.env.example`.

## Dev rápido
Backend:
```powershell
cd backend
npm install
npm start
```

Frontend:
```powershell
cd frontend
npm install
npm run dev
# se precisar, defina VITE_API_URL=http://localhost:3000
```

## Deploy (Vercel)
Siga o passo‑a‑passo curto em `DEPLOY_RAPIDO.md`.
- Publique Rules de produção no Firebase (Firestore/Storage)
- Crie dois projetos no Vercel (frontend/ e backend/)
- No frontend, ajuste `VITE_API_URL` para a URL do backend
- No backend, ajuste CORS com a URL do frontend

## Limites/Quotas (essencial)
Resumo curto em `OBS.md`:
- Firestore: 50k leituras/dia, 20k escritas/dia, 1GB storage
- Storage: 5GB total; 1GB/dia download e upload
- Gemini: 15 RPM, 1.500 req/dia
Obs.: o “modo teste 30 dias” só relaxa regras; use regras de produção para funcionar sempre.

## Estrutura mínima
```
project/
├─ backend/
├─ frontend/
├─ DEPLOY_RAPIDO.md
└─ OBS.md
```