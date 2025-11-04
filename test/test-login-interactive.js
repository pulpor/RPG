// Teste completo de login em produção
const https = require('https');

const API_URL = 'rpg-azure.vercel.app';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Origin': 'https://pulpor.github.io',
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testLogin() {
  console.log('🔐 Teste de Login em Produção\n');
  console.log('━'.repeat(60));
  
  // Solicitar credenciais ao usuário
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Digite seu username: ', (username) => {
      rl.question('Digite sua senha: ', async (password) => {
        rl.close();
        
        console.log('');
        console.log('🔄 Tentando fazer login...');
        console.log('━'.repeat(60));
        console.log('');

        try {
          const response = await makeRequest('/auth/login', 'POST', {
            username: username.trim(),
            password: password.trim()
          });

          console.log(`📊 Status: ${response.status}`);
          console.log('');

          if (response.status === 200) {
            const data = JSON.parse(response.body);
            console.log('✅ LOGIN BEM-SUCEDIDO!');
            console.log('');
            console.log('📦 Dados recebidos:');
            console.log(`   👤 Nome: ${data.fullname || data.name || 'N/A'}`);
            console.log(`   🎓 Tipo: ${data.role || data.type || 'N/A'}`);
            console.log(`   📚 Curso: ${data.curso || 'N/A'}`);
            console.log(`   🔑 Token JWT: ${data.token ? '✅ Recebido' : '❌ Não recebido'}`);
            console.log('');
            console.log('━'.repeat(60));
            console.log('✅ BACKEND ESTÁ FUNCIONANDO PERFEITAMENTE!');
            console.log('━'.repeat(60));
            console.log('');
            console.log('🎉 O login está funcionando em produção!');
            console.log('   Agora você pode usar o site normalmente.');
            console.log('');
          } else if (response.status === 401) {
            console.log('❌ CREDENCIAIS INVÁLIDAS');
            console.log('');
            const data = JSON.parse(response.body);
            console.log(`   Mensagem: ${data.error || data.message}`);
            console.log('');
            console.log('💡 Verifique:');
            console.log('   • Username está correto?');
            console.log('   • Senha está correta?');
            console.log('   • Usuário existe no Firebase?');
            console.log('');
          } else {
            console.log(`⚠️  RESPOSTA INESPERADA: ${response.status}`);
            console.log('');
            console.log('📄 Body:', response.body);
            console.log('');
          }

        } catch (error) {
          console.error('❌ Erro ao fazer login:', error.message);
          console.log('');
          console.log('Possíveis causas:');
          console.log('  • Backend não está respondendo');
          console.log('  • Erro de rede');
          console.log('  • Timeout');
          console.log('');
        }

        resolve();
      });
    });
  });
}

// Executar teste
testLogin();
