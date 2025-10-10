require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
    console.log('\n🧪 TESTE DA API GEMINI 2.5-FLASH\n');
    console.log('=====================================\n');

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ ERRO: GEMINI_API_KEY não encontrada no .env');
        console.log('\nPara corrigir:');
        console.log('1. Acesse: https://makersuite.google.com/app/apikey');
        console.log('2. Crie uma nova API Key');
        console.log('3. Adicione no arquivo .env: GEMINI_API_KEY=sua_chave_aqui\n');
        process.exit(1);
    }

    console.log('✅ API Key encontrada');
    console.log(`   Chave: ${apiKey.substring(0, 20)}...\n`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        console.log('🤖 Testando modelo: gemini-2.5-flash\n');

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Teste 1: Resposta simples
        console.log('📝 Teste 1: Gerando resposta simples...');
        const result1 = await model.generateContent("Diga olá em português de forma amigável");
        const response1 = await result1.response;
        const text1 = response1.text();
        console.log('✅ Resposta recebida:', text1);
        console.log();

        // Teste 2: Análise de código
        console.log('📝 Teste 2: Analisando código JavaScript...');
        const codeExample = `
function calcularMedia(numeros) {
  let soma = 0;
  for (let i = 0; i < numeros.length; i++) {
    soma += numeros[i];
  }
  return soma / numeros.length;
}

const notas = [8, 7, 9, 6];
console.log(calcularMedia(notas));
`;

        const prompt2 = `Analise este código JavaScript e dê um feedback breve e educativo:

\`\`\`javascript
${codeExample}
\`\`\`

Forneça:
1. Um ponto positivo
2. Uma sugestão de melhoria
3. Uma nota de 0-100`;

        const result2 = await model.generateContent(prompt2);
        const response2 = await result2.response;
        const text2 = response2.text();
        console.log('✅ Análise recebida:');
        console.log(text2);
        console.log();

        // Sucesso
        console.log('=====================================');
        console.log('✅ TODOS OS TESTES PASSARAM!');
        console.log('   Modelo: gemini-2.5-flash');
        console.log('   Status: Funcionando perfeitamente');
        console.log('=====================================\n');

        return true;

    } catch (error) {
        console.error('\n❌ ERRO AO TESTAR API:', error.message);
        console.log('\nDetalhes do erro:', error);

        if (error.message.includes('API_KEY_INVALID')) {
            console.log('\n💡 Solução: A chave da API é inválida');
            console.log('   1. Verifique se copiou a chave completa');
            console.log('   2. Crie uma nova chave em: https://makersuite.google.com/app/apikey');
        } else if (error.message.includes('PERMISSION_DENIED')) {
            console.log('\n💡 Solução: A chave não tem permissão para o modelo gemini-2.5-flash');
            console.log('   1. Verifique se a API está habilitada no Google Cloud Console');
            console.log('   2. Crie uma nova chave em: https://makersuite.google.com/app/apikey');
        }

        console.log();
        process.exit(1);
    }
}

// Executar teste
if (require.main === module) {
    testGeminiAPI()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Erro fatal:', error);
            process.exit(1);
        });
}

module.exports = { testGeminiAPI };
