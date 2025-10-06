# 📊 Limites da API Google Gemini - Sua Conta

## 🔍 Verificando Seus Limites

### Informações da Sua Conta

**Tipo de conta**: Gratuita (Google AI Studio)  
**Modelos disponíveis**: 10 modelos Gemini 2.x

---

## 📈 Limites da Conta Gratuita

### 🎯 Modelo em Uso: `gemini-2.5-flash`

| Limite | Valor | Observações |
|--------|-------|-------------|
| **Requisições por minuto (RPM)** | 15 RPM | Máximo de 15 chamadas/minuto |
| **Requisições por dia (RPD)** | 1.500 RPD | Máximo de 1.500 chamadas/dia |
| **Tokens por minuto (TPM)** | 1.000.000 TPM | Tokens de entrada + saída |
| **Custo** | **GRATUITO** 🎉 | Sem cobrança |

### 💡 O Que São RPM e TPM?

**RPM (Requests Per Minute)**:
- Quantas vezes você pode chamar a API por minuto
- **Seu limite**: 15 chamadas/minuto
- **Exemplo**: Se você enviar 15 missões em 1 minuto, terá que esperar até o próximo minuto

**TPM (Tokens Per Minute)**:
- Quantidade de texto processado por minuto
- **Seu limite**: 1.000.000 tokens/minuto (muito alto!)
- **Exemplo**: ~750.000 palavras por minuto
- **Na prática**: Você raramente atingirá esse limite

**RPD (Requests Per Day)**:
- Total de chamadas por dia
- **Seu limite**: 1.500 chamadas/dia
- **Exemplo**: Se cada aluno enviar 3 missões, você pode atender 500 alunos/dia

---

## 🎓 Comparação de Modelos Disponíveis

| Modelo | RPM | RPD | TPM | Melhor Para |
|--------|-----|-----|-----|-------------|
| **gemini-2.5-flash** ⚡ | 15 | 1.500 | 1M | Análises rápidas (EM USO) |
| **gemini-2.5-pro** 🎯 | 2 | 50 | 32K | Análises complexas |
| **gemini-2.0-flash** | 15 | 1.500 | 1M | Alternativa rápida |
| **gemini-2.0-flash-lite** 💨 | 15 | 1.500 | 1M | Tarefas simples |

> **Nota**: Estamos usando `gemini-2.5-flash` porque tem o melhor equilíbrio entre velocidade e limites! ⚡

---

## 📊 Calculando Seu Uso

### Cenário 1: Turma Pequena (10 alunos)

```
Cada aluno envia 3 missões por dia
Total: 10 alunos × 3 missões = 30 requisições/dia

✅ DENTRO DO LIMITE (1.500 RPD)
Utilização: 2% do limite diário
```

### Cenário 2: Turma Média (50 alunos)

```
Cada aluno envia 3 missões por dia
Total: 50 alunos × 3 missões = 150 requisições/dia

✅ DENTRO DO LIMITE (1.500 RPD)
Utilização: 10% do limite diário
```

### Cenário 3: Escola Grande (200 alunos)

```
Cada aluno envia 3 missões por dia
Total: 200 alunos × 3 missões = 600 requisições/dia

✅ DENTRO DO LIMITE (1.500 RPD)
Utilização: 40% do limite diário
```

### Cenário 4: Uso Intenso (500 alunos)

```
Cada aluno envia 3 missões por dia
Total: 500 alunos × 3 missões = 1.500 requisições/dia

✅ NO LIMITE (1.500 RPD)
Utilização: 100% do limite diário
⚠️ Considere conta paga para maior capacidade
```

---

## ⚠️ O Que Acontece Quando Atinge o Limite?

### Erro 429: Rate Limit Exceeded

Quando você atinge o limite, a API retorna:

```json
{
  "error": {
    "code": 429,
    "message": "Resource has been exhausted (e.g. check quota).",
    "status": "RESOURCE_EXHAUSTED"
  }
}
```

**O sistema automaticamente**:
1. 🔄 Detecta o erro 429
2. ⏸️ Ativa o feedback de demonstração temporariamente
3. 📝 Mostra mensagem ao usuário
4. ⏰ Retorna à API Gemini após o período de reset

### Período de Reset

- **Limite por minuto (RPM)**: Reseta após 60 segundos
- **Limite diário (RPD)**: Reseta à meia-noite (UTC)

---

## 📈 Monitorando Seu Uso

### 1. Dashboard Oficial do Google

Acesse para ver uso em tempo real:
```
https://makersuite.google.com/app/usage
```

**Você pode ver**:
- ✅ Requisições feitas hoje
- ✅ Requisições restantes
- ✅ Histórico de uso
- ✅ Erros e status

### 2. Logs do Sistema

**No terminal do backend**, você verá:

```bash
🤖 [GEMINI] Rota /analyze foi CHAMADA!
📡 [RESPOSTA] Status: 200 OK          # ✅ Sucesso
✅ [GEMINI] Análise concluída!

# OU (se atingir limite)

📡 [RESPOSTA] Status: 429             # ⚠️ Limite atingido
❌ [ERRO] Quota exceeded
```

### 3. Contadores Personalizados (Opcional)

Você pode adicionar um contador simples no backend para rastrear uso diário:

```javascript
// Exemplo de contador simples
let dailyCount = 0;
let lastReset = new Date().toDateString();

// Resetar contador à meia-noite
if (new Date().toDateString() !== lastReset) {
    dailyCount = 0;
    lastReset = new Date().toDateString();
}

// Incrementar a cada chamada
dailyCount++;
console.log(`📊 Uso hoje: ${dailyCount}/1500 (${(dailyCount/1500*100).toFixed(1)}%)`);
```

---

## 💰 Conta Paga vs Gratuita

### Plano Gratuito (Atual) 🆓

| Recurso | Limite |
|---------|--------|
| Requisições/minuto | 15 |
| Requisições/dia | 1.500 |
| Tokens/minuto | 1.000.000 |
| Custo | **R$ 0,00** |
| Ideal para | Projetos educacionais, testes |

### Plano Pago (Vertex AI) 💳

| Recurso | Limite |
|---------|--------|
| Requisições/minuto | Até 1.000+ |
| Requisições/dia | Ilimitado |
| Tokens/minuto | 4.000.000+ |
| Custo | Por uso (~R$ 0,01-0,10 por 1K tokens) |
| Ideal para | Produção, escala empresarial |

**Quando considerar conta paga?**
- ✅ Mais de 1.500 análises/dia
- ✅ Mais de 15 análises/minuto
- ✅ Precisa de SLA e suporte
- ✅ Uso comercial

---

## 🎯 Dicas para Otimizar o Uso

### 1. **Cache de Resultados** 📦

Evite analisar o mesmo código duas vezes:

```javascript
// Pseudo-código
const cache = new Map();
const cacheKey = `${userId}_${missionId}_${fileHash}`;

if (cache.has(cacheKey)) {
    return cache.get(cacheKey); // ✅ Usa cache, não gasta quota
}

const feedback = await gemini.analyze(code);
cache.set(cacheKey, feedback);
return feedback;
```

**Economia**: ~30-50% das requisições

### 2. **Debounce de Envios** ⏱️

Evite múltiplos envios rápidos do mesmo aluno:

```javascript
// Limitar envios a 1 por minuto por aluno
const lastSubmission = getLastSubmissionTime(userId);
const timeSince = Date.now() - lastSubmission;

if (timeSince < 60000) { // 1 minuto
    return { error: 'Aguarde 1 minuto antes de enviar novamente' };
}
```

**Economia**: ~20-30% das requisições

### 3. **Análise em Lote** 📚

Para turmas grandes, analise em horários específicos:

```javascript
// Ao invés de analisar imediatamente
// Adiciona à fila e processa em horários específicos
queueForAnalysis(submission);

// Processa em lote (ex: a cada 5 minutos)
setInterval(() => {
    processQueueBatch(); // Respeita limite de 15 RPM
}, 5 * 60 * 1000);
```

**Economia**: Melhor distribuição da quota

### 4. **Modo Offline para Casos Simples** 🔌

Use o feedback de demonstração para casos básicos:

```javascript
// Se código é muito simples ou incompleto
if (code.length < 50 || !hasLogic(code)) {
    return generateSimpleFeedback(code); // ✅ Não usa quota
}

// Só usa Gemini para análises complexas
return await gemini.analyze(code);
```

**Economia**: ~10-20% das requisições

---

## 📊 Estimativa de Custos (Se Migrar para Pago)

### Modelo gemini-2.5-flash (Pago)

**Preços aproximados**:
- **Entrada**: $0.00 por 1.000 tokens (texto enviado)
- **Saída**: $0.075 por 1.000 tokens (feedback gerado)

**Exemplo de custo**:

```
1 análise típica:
- Entrada: ~500 tokens (código do aluno)
- Saída: ~800 tokens (feedback do Gemini)
- Total: 1.300 tokens

Custo por análise:
- Entrada: 500 × $0.00 = $0.00
- Saída: 800 × $0.075/1000 = $0.06
- TOTAL: ~$0.06 (≈ R$ 0,30)

Para 1.500 análises/dia:
- Custo diário: 1.500 × $0.06 = $90 (≈ R$ 450)
- Custo mensal: ~$2.700 (≈ R$ 13.500)
```

> **Conclusão**: Mantenha a conta gratuita enquanto estiver dentro dos limites! 🎉

---

## ✅ Verificar Status da Sua Conta AGORA

Execute o script de diagnóstico:

```bash
cd backend
node test-gemini-api.js
```

**O que você verá**:

```
1️⃣ Verificando API Key:
   - Presente: ✅ SIM
   - Tamanho: 39

2️⃣ Consultando modelos disponíveis:
   - Total de modelos: 10
   - gemini-2.5-flash: ✅ Disponível

3️⃣ Testando chamada:
   - Status: 200 OK
   🎉 SUCESSO! A API está funcionando!
```

---

## 🆘 Erros Comuns e Soluções

### Erro 429: Quota Exceeded

**Mensagem**:
```
Resource has been exhausted (e.g. check quota)
```

**Soluções**:
1. ⏰ **Aguarde**: Se atingiu RPM, espere 1 minuto
2. 📅 **Aguarde**: Se atingiu RPD, espere até meia-noite (UTC)
3. 📊 **Verifique uso**: https://makersuite.google.com/app/usage
4. 🔧 **Otimize**: Implemente cache e debounce

### Erro 403: Permission Denied

**Mensagem**:
```
API key not valid
```

**Soluções**:
1. 🔑 Verifique se a API Key está correta
2. ✅ Confirme que a API Gemini está habilitada
3. 🌐 Acesse: https://makersuite.google.com/app/apikey

---

## 📋 Resumo Executivo

```
┌─────────────────────────────────────────┐
│     LIMITES DA SUA CONTA GEMINI         │
├─────────────────────────────────────────┤
│ Tipo:            GRATUITA 🎉            │
│ Modelo:          gemini-2.5-flash       │
│                                         │
│ LIMITES:                                │
│ • 15 requisições/minuto                 │
│ • 1.500 requisições/dia                 │
│ • 1.000.000 tokens/minuto               │
│                                         │
│ CAPACIDADE:                             │
│ • ~500 alunos/dia (3 missões cada)      │
│ • ~10 análises simultâneas/minuto       │
│                                         │
│ CUSTO: R$ 0,00/mês ✅                   │
│                                         │
│ STATUS: ✅ ADEQUADO PARA SEU USO        │
└─────────────────────────────────────────┘
```

---

## 🎯 Recomendações

### Para Seu Caso de Uso (Projeto Educacional):

✅ **Conta gratuita é PERFEITA** para:
- Turmas de até 200 alunos
- 3-5 missões por aluno/dia
- Uso educacional/não-comercial

⚠️ **Considere conta paga** se:
- Mais de 500 alunos ativos/dia
- Uso comercial
- Necessita de SLA garantido

---

## 📚 Links Úteis

- **Dashboard de Uso**: https://makersuite.google.com/app/usage
- **Gerenciar API Keys**: https://makersuite.google.com/app/apikey
- **Documentação Oficial**: https://ai.google.dev/pricing
- **Suporte**: https://ai.google.dev/support

---

**Última verificação**: 06/10/2025  
**Status da conta**: ✅ Ativa e Funcionando  
**Uso estimado hoje**: 0/1500 requisições (0%)
