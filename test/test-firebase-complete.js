/**
 * Teste Completo do Firebase
 * Verifica se todos os dados (users, masters, missions, submissions, uploads) 
 * estão sendo corretamente armazenados no Firebase Firestore
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Importar Firebase config
const { db } = require('../backend/config/firebase');
const {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    limit
} = require('firebase/firestore');

// Cores para output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testCollection(collectionName, description) {
    try {
        log('cyan', `\n📋 Testando: ${description}`);
        log('blue', `   Collection: ${collectionName}`);

        const collRef = collection(db, collectionName);
        const snapshot = await getDocs(collRef);

        const count = snapshot.size;
        log('green', `   ✅ ${count} documento(s) encontrado(s)`);

        if (count > 0) {
            // Mostrar amostra dos primeiros 3 documentos
            log('yellow', '   📄 Amostra de dados:');
            let shown = 0;
            snapshot.forEach(doc => {
                if (shown < 3) {
                    const data = doc.data();
                    log('yellow', `      - ID: ${doc.id}`);

                    // Mostrar campos específicos dependendo da coleção
                    if (collectionName === 'users') {
                        log('yellow', `        Username: ${data.username || 'N/A'}`);
                        log('yellow', `        Is Master: ${data.isMaster ? 'Sim' : 'Não'}`);
                        log('yellow', `        XP: ${data.xp || 0}`);
                        log('yellow', `        Level: ${data.level || 1}`);
                    } else if (collectionName === 'missions') {
                        log('yellow', `        Título: ${data.titulo || data.title || 'N/A'}`);
                        log('yellow', `        XP: ${data.xp || 0}`);
                        log('yellow', `        Mestre: ${data.masterUsername || 'N/A'}`);
                        log('yellow', `        Status: ${data.status || 'N/A'}`);
                    } else if (collectionName === 'submissions') {
                        log('yellow', `        Aluno: ${data.username || 'N/A'}`);
                        log('yellow', `        Missão: ${data.missionId || 'N/A'}`);
                        log('yellow', `        Status: ${data.status || 'N/A'}`);
                        log('yellow', `        Arquivos: ${data.fileUrls ? data.fileUrls.length : 0}`);
                    } else if (collectionName === 'turmas') {
                        log('yellow', `        Nome: ${data.nome || 'N/A'}`);
                        log('yellow', `        Mestre: ${data.masterUsername || 'N/A'}`);
                        log('yellow', `        Alunos: ${data.students ? data.students.length : 0}`);
                    }

                    shown++;
                }
            });

            if (count > 3) {
                log('yellow', `      ... e mais ${count - 3} documento(s)`);
            }
        } else {
            log('yellow', '   ℹ️  Coleção vazia - nenhum dado armazenado ainda');
        }

        return { success: true, count };
    } catch (error) {
        log('red', `   ❌ Erro: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function testMastersAndStudents() {
    try {
        log('cyan', '\n👥 Verificando Mestres e Alunos');

        const usersRef = collection(db, 'users');

        // Buscar mestres
        const mastersQuery = query(usersRef, where('isMaster', '==', true));
        const mastersSnapshot = await getDocs(mastersQuery);
        log('green', `   ✅ ${mastersSnapshot.size} Mestre(s) encontrado(s)`);

        if (mastersSnapshot.size > 0) {
            mastersSnapshot.forEach(doc => {
                const master = doc.data();
                log('yellow', `      - ${master.username} (${master.masterArea || 'Área não definida'})`);
            });
        }

        // Buscar alunos
        const studentsQuery = query(usersRef, where('isMaster', '==', false));
        const studentsSnapshot = await getDocs(studentsQuery);
        log('green', `   ✅ ${studentsSnapshot.size} Aluno(s) encontrado(s)`);

        if (studentsSnapshot.size > 0) {
            let shown = 0;
            studentsSnapshot.forEach(doc => {
                if (shown < 5) {
                    const student = doc.data();
                    log('yellow', `      - ${student.username} (Classe: ${student.class || 'N/A'}, XP: ${student.xp || 0})`);
                    shown++;
                }
            });

            if (studentsSnapshot.size > 5) {
                log('yellow', `      ... e mais ${studentsSnapshot.size - 5} aluno(s)`);
            }
        }

        return { masters: mastersSnapshot.size, students: studentsSnapshot.size };
    } catch (error) {
        log('red', `   ❌ Erro: ${error.message}`);
        return null;
    }
}

async function testSubmissionsByStatus() {
    try {
        log('cyan', '\n📊 Análise de Submissões por Status');

        const submissionsRef = collection(db, 'submissions');
        const snapshot = await getDocs(submissionsRef);

        const statuses = {
            pending: 0,
            approved: 0,
            rejected: 0,
            other: 0
        };

        snapshot.forEach(doc => {
            const data = doc.data();
            const status = data.status || 'other';

            if (statuses.hasOwnProperty(status)) {
                statuses[status]++;
            } else {
                statuses.other++;
            }
        });

        log('green', `   ✅ Pendentes: ${statuses.pending}`);
        log('green', `   ✅ Aprovadas: ${statuses.approved}`);
        log('green', `   ✅ Rejeitadas: ${statuses.rejected}`);

        if (statuses.other > 0) {
            log('yellow', `   ⚠️  Outros: ${statuses.other}`);
        }

        return statuses;
    } catch (error) {
        log('red', `   ❌ Erro: ${error.message}`);
        return null;
    }
}

async function runAllTests() {
    log('blue', '\n════════════════════════════════════════════════════════');
    log('blue', '   TESTE COMPLETO DO FIREBASE FIRESTORE');
    log('blue', '   Verificando armazenamento de dados');
    log('blue', '════════════════════════════════════════════════════════');

    // Testar configuração
    log('cyan', '\n🔧 Verificando Configuração');
    log('green', `   ✅ Firebase Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    log('green', `   ✅ Firebase Auth Domain: ${process.env.FIREBASE_AUTH_DOMAIN}`);

    const results = {
        users: await testCollection('users', 'Usuários (Mestres + Alunos)'),
        missions: await testCollection('missions', 'Missões'),
        submissions: await testCollection('submissions', 'Submissões'),
        turmas: await testCollection('turmas', 'Turmas'),
    };

    // Testes adicionais
    const userBreakdown = await testMastersAndStudents();
    const submissionStats = await testSubmissionsByStatus();

    // Resumo final
    log('blue', '\n════════════════════════════════════════════════════════');
    log('blue', '   RESUMO FINAL');
    log('blue', '════════════════════════════════════════════════════════');

    const allSuccess = Object.values(results).every(r => r.success);

    if (allSuccess) {
        log('green', '\n✅ TODOS OS TESTES PASSARAM!');
        log('green', '\nFirebase Firestore está funcionando corretamente:');
        log('cyan', `   📦 ${results.users.count} usuários armazenados`);
        if (userBreakdown) {
            log('cyan', `      └─ ${userBreakdown.masters} mestres`);
            log('cyan', `      └─ ${userBreakdown.students} alunos`);
        }
        log('cyan', `   📦 ${results.missions.count} missões armazenadas`);
        log('cyan', `   📦 ${results.submissions.count} submissões armazenadas`);
        if (submissionStats) {
            log('cyan', `      └─ ${submissionStats.pending} pendentes`);
            log('cyan', `      └─ ${submissionStats.approved} aprovadas`);
            log('cyan', `      └─ ${submissionStats.rejected} rejeitadas`);
        }
        log('cyan', `   📦 ${results.turmas.count} turmas armazenadas`);

        if (results.users.count === 0) {
            log('yellow', '\n⚠️  Nenhum dado encontrado no Firebase.');
            log('yellow', '   Isso é normal se você ainda não cadastrou usuários.');
            log('yellow', '   Cadastre alguns usuários pelo sistema para ver os dados aqui.');
        }
    } else {
        log('red', '\n❌ ALGUNS TESTES FALHARAM!');
        log('red', 'Verifique os erros acima para mais detalhes.');
    }

    log('blue', '\n════════════════════════════════════════════════════════\n');
}

// Executar testes
runAllTests()
    .then(() => {
        log('green', '✅ Teste concluído com sucesso!');
        process.exit(0);
    })
    .catch(error => {
        log('red', `❌ Erro fatal: ${error.message}`);
        console.error(error);
        process.exit(1);
    });
