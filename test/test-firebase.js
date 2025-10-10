// Testar conexao com Firebase (apenas Firestore)
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
const { app, db } = require("../backend/config/firebase");
const { collection, getDocs } = require("firebase/firestore");

/**
 * Testa a conexao com o Firebase Firestore
 * @returns {Promise<boolean>} - true se o teste passar
 */
async function testFirebaseConnection() {
  console.log(" TESTE DE CONEXAO FIREBASE \n");

  try {
    // 1. Verificar configuracao
    console.log(" 1/2 - Verificando configuracao...");
    console.log(`   Project ID: ${app.options.projectId}`);
    console.log("    Firebase inicializado\n");

    // 2. Testar Firestore
    console.log(" 2/2 - Testando Firestore...");
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    console.log(`    Conexao com Firestore OK (${snapshot.size} usuarios encontrados)\n`);

    // 3. Resumo
    console.log("========================================");
    console.log(" TODOS OS TESTES PASSARAM!");
    console.log("========================================");
    console.log(" Firestore: Conectado");
    console.log(" Seu projeto esta pronto para usar Firebase Firestore!\n");
    
    return true;
  } catch (error) {
    console.error(" ERRO NO TESTE:", error.message);
    console.error("========================================");
    console.error("\nPossiveis causas:");
    console.error("1. Variaveis de ambiente do Firebase nao configuradas no .env");
    console.error("2. Firestore nao habilitado no console do Firebase");
    console.error("3. Regras de seguranca bloqueando acesso");
    console.error("========================================");
    return false;
  }
}

// Executar o teste se este arquivo for chamado diretamente
if (require.main === module) {
  testFirebaseConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error("Erro inesperado:", error);
      process.exit(1);
    });
}

// Exportar funcao para uso em outros modulos
module.exports = { testFirebaseConnection };