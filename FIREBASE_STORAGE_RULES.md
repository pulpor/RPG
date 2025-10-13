# 🔥 Configuração das Regras do Firebase Storage

## Problema
Você está recebendo o erro: `storage/unauthorized` ao tentar fazer upload de arquivos.

## Solução

### Passo 1: Acessar o Firebase Console
1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto: **rpg-educacional**

### Passo 2: Configurar as Regras de Segurança
1. No menu lateral, clique em **Storage**
2. Clique na aba **Rules** (Regras)
3. Substitua as regras atuais por uma das opções abaixo:

### Opção 1: Permitir apenas para usuários autenticados (RECOMENDADO)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Regra para permitir upload e leitura apenas para usuários autenticados
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Opção 2: Permitir para todos durante desenvolvimento (NÃO RECOMENDADO EM PRODUÇÃO)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // ATENÇÃO: Esta regra permite acesso total. Use apenas em desenvolvimento!
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

### Opção 3: Regras mais específicas (MAIS SEGURO)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir leitura pública de todos os arquivos
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Permitir escrita apenas em submissions/{masterUsername}/{userId}/{submissionId}/{filename}
    match /submissions/{masterUsername}/{userId}/{submissionId}/{filename} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Passo 3: Publicar as Regras
1. Clique no botão **Publish** (Publicar)
2. Aguarde a confirmação de que as regras foram publicadas

### Passo 4: Testar
1. Reinicie o servidor backend se estiver rodando
2. Tente enviar um arquivo novamente
3. O upload deve funcionar agora! ✅

## Estrutura dos Arquivos no Firebase Storage

Os arquivos serão salvos no seguinte formato:
```
submissions/
  ├── {masterUsername}/          # Nome do mestre que criou a missão
  │   └── {userId}/               # ID do aluno que enviou
  │       └── {submissionId}/     # ID único da submissão
  │           └── {filename}      # Arquivo enviado (código ou imagem)
```

Exemplo:
```
submissions/
  ├── conta2/
  │   └── wqGe9GacbET7N5T7CqzS/
  │       └── abc123xyz/
  │           └── cadastro.html
```

## Verificar Status das Regras
Após publicar, você pode verificar se as regras estão ativas:
1. Vá em **Storage** → **Rules**
2. Confirme que as novas regras estão listadas
3. Verifique a data/hora da última publicação

## Notas Importantes
- ⚠️ A **Opção 2** (permitir tudo) é útil apenas para testes locais
- ✅ Use a **Opção 1** para produção (requer autenticação)
- 🔒 A **Opção 3** é a mais segura (restringe por userId)
- 📁 Os metadados dos arquivos ficam no **Firestore**
- 🗂️ Os arquivos binários ficam no **Storage**
