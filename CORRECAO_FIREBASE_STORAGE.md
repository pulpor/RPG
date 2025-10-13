# Correção: CORS e Autenticação em Arquivos Firebase Storage

## Problema
Estávamos enfrentando dois problemas principais com os botões de "Ver" e "Baixar" arquivos:

1. **Erro de CORS**: O navegador bloqueava solicitações diretas para o Firebase Storage devido às políticas de CORS
2. **Redirecionamento para login**: Os tokens de autenticação se perdiam ao abrir os links diretamente, causando redirecionamento

## Solução implementada

### 1. Proxy no backend (contorna CORS)

Criamos uma rota proxy no backend que:
- Recebe a URL do Firebase Storage e o token JWT
- Verifica se o token é válido
- Faz a solicitação ao Firebase Storage a partir do servidor
- Transmite o conteúdo do arquivo ao frontend

Arquivo: `backend/routes/files.js`
```javascript
router.get('/proxy', async (req, res) => {
    // Pega URL e token dos query params
    const { url, token } = req.query;
    
    // Verifica token JWT
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Busca o arquivo do Firebase Storage
    const response = await fetch(url);
    
    // Encaminha o conteúdo para o cliente
    res.setHeader('Content-Type', response.headers.get('content-type'));
    const fileData = await response.buffer();
    res.send(fileData);
});
```

### 2. Download seguro com fetch + blob

Modificamos a função `downloadFileSecurely` para:
- Usar fetch com token JWT no cabeçalho para manter a autenticação
- Criar um blob do conteúdo recebido
- Usar um URL de objeto para iniciar o download

```javascript
export async function downloadFileSecurely(fileUrl, fileName) {
  // Obter token de autenticação do localStorage
  const token = localStorage.getItem('token');
  
  // Se for URL do Firebase, usar nosso proxy
  if (fileUrl.includes('firebasestorage.googleapis.com')) {
    const proxyUrl = `http://localhost:3000/files/proxy?url=${encodeURIComponent(fileUrl)}&token=${token}`;
    
    // Fazer fetch para o proxy com autenticação
    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    
    // Criar URL de objeto e acionar download
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    
    // Limpar URL de objeto
    setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
  }
}
```

### 3. Preview seguro

Modificamos a função `openFileWithPreview` e `openCodePreview` para:
- Usar o mesmo mecanismo de proxy que o download
- Garantir que o token de autenticação seja incluído na solicitação

## Como funciona

1. **Usuário clica em "Ver" ou "Baixar"**
2. **Frontend**:
   - Detecta URL do Firebase Storage
   - Obtém token JWT do localStorage
   - Cria URL para o endpoint proxy com token e URL codificada
   
3. **Backend (Proxy)**:
   - Recebe solicitação com URL e token
   - Verifica autenticação do token
   - Busca arquivo do Firebase Storage
   - Retorna conteúdo do arquivo para o frontend
   
4. **Frontend (continuação)**:
   - Para download: Cria blob e inicia download
   - Para visualização: Abre conteúdo em nova aba

## Atenção ao implementar novos recursos

- Sempre use as funções `downloadFileSecurely` e `openFileWithPreview` para manipular arquivos do Firebase
- Nunca tente acessar URLs do Firebase Storage diretamente no frontend
- Os tokens JWT são necessários para acessar o Storage

## Testes realizados

- Download de diferentes tipos de arquivos: ✅ OK
- Visualização de diferentes tipos de arquivos: ✅ OK
- Verificação de erros de CORS: ✅ Resolvidos
- Redirecionamentos para login: ✅ Resolvidos