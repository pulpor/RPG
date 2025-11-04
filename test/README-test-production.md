# 🧪 Script de Teste do Backend em Produção

## Como usar este script

Execute este arquivo para testar se o backend está funcionando corretamente.

```powershell
node test-production.js
```

---

## O que ele testa:

1. ✅ Health Check - Verifica se o servidor está no ar
2. ✅ Firebase - Verifica se está configurado
3. ✅ Gemini AI - Verifica se a API key está presente
4. ✅ CORS - Verifica se aceita requisições do GitHub Pages
5. ⚠️ Rotas protegidas - Tentará acessar (deve retornar 401 sem token)

---

## Resultados esperados:

### ✅ SUCESSO:
```json
{
  "status": "ok",
  "firebase": "✅",
  "gemini": "✅"
}
```

### ❌ FALHA (faltam variáveis):
```json
{
  "status": "ok",
  "firebase": "✅",
  "gemini": "❌"
}
```

Se aparecer gemini com ❌, configure a variável `GEMINI_API_KEY` na Vercel.

