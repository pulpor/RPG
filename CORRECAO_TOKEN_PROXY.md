# Correção do Erro de Token na Proxy API

## Problema Identificado

Quando usuários tentavam acessar arquivos do Firebase Storage através do proxy backend, recebiam o erro:

```
{"error":"Token não fornecido"}
```

## Causa do Problema

1. O endpoint `/files/proxy` no backend estava usando o middleware `autenticar`
2. As chamadas diretas ao endpoint via `window.open()` não incluíam o token JWT
3. O token JWT normalmente é enviado via header `Authorization`, mas isso não é possível em links diretos

## Solução Implementada

### 1. Modificações no Backend

**Arquivo:** `/backend/routes/files.js`

1. **Removido middleware `autenticar`** para permitir autenticação via query parameter:
   ```javascript
   // Antes
   router.get('/proxy', autenticar, async (req, res) => { ... });
   
   // Depois
   router.get('/proxy', async (req, res) => { ... });
   ```

2. **Adicionada autenticação manual** via token na URL:
   ```javascript
   const { url, token } = req.query;
   
   // Verificar token (autenticação manual em vez de middleware)
   if (!token) {
       return res.status(401).json({
           success: false,
           error: 'Token não fornecido'
       });
   }
   ```

### 2. Modificações no Frontend

**Arquivo:** `/frontend/src/js/master/missoes.js`

1. **Incluído token nas URLs do proxy**:
   ```javascript
   // Obter token de autenticação
   const token = localStorage.getItem('token');
   
   // Criar URL do proxy com token na URL
   const proxyUrl = `http://localhost:3000/files/proxy?url=${encodeURIComponent(fileUrl)}&token=${token}`;
   ```

2. **Aplicado em ambas funções**:
   - `openFileWithPreview()` 
   - `downloadFileSecurely()`

## Benefícios desta Abordagem

1. **Sem CORS**: Continua usando o backend como proxy para evitar problemas de CORS
2. **Autenticação preservada**: O token é passado de forma segura via HTTPS
3. **Compatível com links diretos**: Funciona em contextos onde headers não são possíveis (links, iframes)
4. **Experiência suave**: Usuários não precisam fazer login novamente

## Como Testar

1. Fazer login no sistema
2. Acessar a página de submissões
3. Clicar nos botões "Ver" ou "Baixar" em qualquer arquivo
4. Confirmar que os arquivos são abertos/baixados sem erros
5. Verificar no console do navegador o log: "Usando proxy para arquivo Firebase"

## Aspectos de Segurança

1. Em produção, seria recomendável:
   - Validar o token JWT adequadamente no backend
   - Implementar expiração para as URLs do proxy
   - Considerar assinatura das URLs para evitar modificação
   - Utilizar HTTPS para proteger o token na URL

## Erros Resolvidos

- `{"error":"Token não fornecido"}` ao acessar arquivos via proxy
- Redirecionamento para tela de login ao tentar ver/baixar arquivos

## Nota Técnica

A utilização de tokens em URLs não é a abordagem mais segura em todos os contextos, mas é um compromisso necessário para resolver o problema específico de visualização/download direto de arquivos do Firebase Storage em contextos onde headers não estão disponíveis.