// Configuração de ambiente para o frontend
// Detecta automaticamente entre desenvolvimento e produção

// Verificar se está em produção (GitHub Pages OU Vercel)
const isProduction = window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname !== 'localhost';

const API_URL = isProduction
    ? 'https://rpg-azure.vercel.app' // Backend na Vercel
    : 'http://localhost:3000'; // Desenvolvimento local

const isDev = !isProduction;
const isProd = isProduction;

// Exportar para módulos ES6
export { API_URL, isDev, isProd };

// Também disponibilizar globalmente para compatibilidade
window.API_URL = API_URL;
window.isDev = isDev;
window.isProd = isProd;

// Debug - Build v2.0
console.log('🔧 Modo:', isProd ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('🌐 API URL:', API_URL);
console.log('🌍 Hostname:', window.location.hostname);
console.log('📦 Build:', '2.0');
