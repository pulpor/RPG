// Script para converter Client SDK para Admin SDK
const fs = require('fs');
const path = require('path');

const files = [
    'backend/services/missionService.js',
    'backend/services/submissionService.js',
    'backend/services/turmaService.js'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Conversões
    content = content.replace(/doc\(this\.(\w+)Ref\)/g, 'db.collection(this.collectionName).doc()');
    content = content.replace(/doc\(db, this\.collectionName, (\w+)\)/g, 'db.collection(this.collectionName).doc($1)');
    content = content.replace(/await setDoc\(([^,]+), ([^)]+)\)/g, 'await $1.set($2)');
    content = content.replace(/await updateDoc\(([^,]+), ([^)]+)\)/g, 'await $1.update($2)');
    content = content.replace(/await deleteDoc\(([^)]+)\)/g, 'await $1.delete()');
    content = content.replace(/const (\w+)Snap = await getDoc\((\w+)Doc\)/g, 'const $1Snap = await $2Doc.get()');
    content = content.replace(/(\w+)Snap\.exists\(\)/g, '$1Snap.exists');
    content = content.replace(/serverTimestamp\(\)/g, 'new Date().toISOString()');
    content = content.replace(/let q = this\.(\w+)Ref;/g, 'let query = db.collection(this.collectionName);');
    content = content.replace(/q = query\(q, where/g, 'query = query.where');
    content = content.replace(/q = query\(q, orderBy/g, 'query = query.orderBy');
    content = content.replace(/const querySnapshot = await getDocs\(q\)/g, 'const snapshot = await query.get()');
    content = content.replace(/querySnapshot\.forEach/g, 'snapshot.forEach');
    content = content.replace(/querySnapshot\.empty/g, 'snapshot.empty');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Convertido: ${file}`);
});

console.log('✅ Conversão concluída!');
