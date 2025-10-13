# Correção de Problemas de CORS e Download/Visualização de Arquivos

## Problema Identificado

Ao clicar nos botões "Ver" ou "Baixar" arquivos do Firebase Storage, os usuários eram redirecionados para a tela de login do sistema em vez de visualizar ou baixar os arquivos. Isso ocorre devido a restrições de CORS (Cross-Origin Resource Sharing) do Firebase Storage.

### Detalhes do Erro
```
Access to fetch at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solução Implementada

Foi criado um sistema de **proxy no backend** que contorna as restrições de CORS do Firebase Storage. Esta abordagem tem as seguintes vantagens:

1. **Solução Definitiva**: Resolve o problema em vez de apenas tentar contorná-lo no frontend
2. **Segurança Mantida**: O backend já tem autenticação implementada
3. **Experiência Suave**: Os usuários podem baixar/visualizar arquivos sem problemas

### Componentes da Solução

1. **Proxy Backend**: Novo endpoint `/files/proxy` que busca arquivos do Firebase Storage 
2. **Redirecionamento das URLs**: Frontend modifica URLs de Firebase Storage para usar o proxy
3. **Detecção Inteligente**: Sistema detecta automaticamente URLs do Firebase Storage

## Arquivos Modificados

### 1. Backend - Novo Endpoint de Proxy

**Arquivo:** `/backend/routes/files.js`
```javascript
// Novo arquivo criado
router.get('/proxy', autenticar, async (req, res) => {
    const { url } = req.query;
    // Busca o arquivo do Firebase Storage e encaminha
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    const fileData = await response.buffer();
    res.send(fileData);
});
```

**Arquivo:** `/backend/server.js`
```javascript
// Adicionado registro da nova rota
app.use('/files', require('./routes/files'));
```

### 2. Frontend - Uso do Proxy para Firebase Storage

**Arquivo:** `/frontend/src/js/master/missoes.js`
```javascript
// openFileWithPreview - modifica URLs para usar o proxy
if (fileUrl.includes('firebasestorage.googleapis.com')) {
  const proxyUrl = `http://localhost:3000/files/proxy?url=${encodeURIComponent(fileUrl)}`;
  console.log('📡 Usando proxy para arquivo Firebase:', proxyUrl);
  fileUrl = proxyUrl;
}

// downloadFileSecurely - usa o proxy para downloads
if (fileUrl.includes('firebasestorage.googleapis.com')) {
  const proxyUrl = `http://localhost:3000/files/proxy?url=${encodeURIComponent(fileUrl)}`;
  window.open(proxyUrl, '_blank');
  // ...
}
```

## Como Funciona

1. **Botão "Ver"**:
   - Detecta URL do Firebase Storage
   - Substitui por URL do proxy: `http://localhost:3000/files/proxy?url=...`
   - Abre a URL modificada em nova aba

2. **Botão "Baixar"**:
   - Detecta URL do Firebase Storage
   - Substitui por URL do proxy: `http://localhost:3000/files/proxy?url=...`
   - Abre a URL modificada para download

3. **Proxy no Backend**:
   - Recebe a URL original como parâmetro
   - Faz a requisição para o Firebase Storage (servidor-servidor, sem CORS)
   - Mantém o tipo de conteúdo original (Content-Type)
   - Encaminha o arquivo para o frontend

## Benefícios Adicionais

- **Melhor Controle de Acesso**: O backend verifica autenticação para cada download
- **Logs Centralizados**: Todas as visualizações/downloads são registrados no backend
- **Flexibilidade**: Facilita implementação futura de recursos como contagem de downloads

## Como Testar

1. Certifique-se de que o servidor backend está rodando (`npm run start` na pasta backend)
2. Navegue até a área de submissões no frontend
3. Clique em [Ver] ou [Baixar] para qualquer arquivo
4. Verifique:
   - O arquivo é exibido ou baixado corretamente
   - Não há redirecionamento para a tela de login
   - O console do backend mostra logs do proxy: `🔄 Proxy para arquivo: [url]` e `✅ Arquivo servido com sucesso`

## Erros Resolvidos

- Erro CORS ao usar `fetch()` diretamente no frontend
- Redirecionamento para login ao tentar baixar/visualizar arquivos
- Visualização sempre do mesmo arquivo independente de qual arquivo era clicado

## Considerações Futuras

- Implementar cache no proxy para melhor performance
- Adicionar compressão para arquivos grandes
- Criar estatísticas de visualização/download por arquivo