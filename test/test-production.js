// Script de teste do backend em produção
const https = require('https');

const API_URL = 'rpg-azure.vercel.app';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_URL,
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Origin': 'https://pulpor.github.io'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testProduction() {
  console.log('🧪 Testando Backend em Produção\n');
  console.log('━'.repeat(60));
  console.log(`🌐 URL: https://${API_URL}`);
  console.log('━'.repeat(60));
  console.log('');

  try {
    // Test 1: Health Check
    console.log('1️⃣  Testando /health...');
    const health = await makeRequest('/health');
    console.log(`   Status: ${health.status}`);
    
    if (health.status === 200) {
      const data = JSON.parse(health.body);
      console.log('   ✅ Backend está no ar!');
      console.log(`   📅 Timestamp: ${data.timestamp}`);
      console.log(`   🔥 Firebase: ${data.firebase}`);
      console.log(`   🤖 Gemini: ${data.gemini}`);
      
      if (data.gemini === '❌') {
        console.log('   ⚠️  ATENÇÃO: GEMINI_API_KEY não configurada!');
      }
    } else {
      console.log('   ❌ Backend não respondeu corretamente');
    }
    console.log('');

    // Test 2: CORS
    console.log('2️⃣  Testando CORS...');
    if (health.headers['access-control-allow-origin']) {
      console.log('   ✅ CORS configurado corretamente');
      console.log(`   🌐 Origin permitida: ${health.headers['access-control-allow-origin']}`);
    } else {
      console.log('   ⚠️  CORS pode ter problemas');
    }
    console.log('');

    // Test 3: Missões (deve retornar 401 sem autenticação)
    console.log('3️⃣  Testando /missoes (sem autenticação)...');
    const missoes = await makeRequest('/missoes');
    console.log(`   Status: ${missoes.status}`);
    
    if (missoes.status === 401 || missoes.status === 403) {
      console.log('   ✅ Rota protegida funcionando (requer autenticação)');
    } else if (missoes.status === 200) {
      console.log('   ⚠️  Rota deveria estar protegida mas retornou 200');
    } else {
      console.log(`   ❌ Resposta inesperada: ${missoes.status}`);
    }
    console.log('');

    // Test 4: Auth Login
    console.log('4️⃣  Testando /auth/login (verificando se rota existe)...');
    const login = await makeRequest('/auth/login');
    console.log(`   Status: ${login.status}`);
    
    if (login.status === 405 || login.status === 400) {
      console.log('   ✅ Rota existe (mas requer POST com credenciais)');
    } else {
      console.log(`   ℹ️  Resposta: ${login.status}`);
    }
    console.log('');

    console.log('━'.repeat(60));
    console.log('✅ TESTES CONCLUÍDOS');
    console.log('━'.repeat(60));
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('   1. Se gemini está com ❌, configure na Vercel');
    console.log('   2. Teste o login no site: https://pulpor.github.io/RPG');
    console.log('   3. Verifique se as missões carregam após login');
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
    console.log('');
    console.log('Possíveis causas:');
    console.log('  • Backend não está no ar');
    console.log('  • Deploy falhou na Vercel');
    console.log('  • Problemas de rede');
    console.log('');
    console.log('Verifique: https://vercel.com/dashboard');
  }
}

// Executar testes
testProduction();
