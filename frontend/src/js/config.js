// Configuração de ambiente para o frontend
// Detecta automaticamente entre desenvolvimento e produção

// Verificar se está em produção (GitHub Pages OU Vercel)
const isProduction = window.location.hostname.includes('github.io') || 
                     window.location.hostname.includes('vercel.app') ||
                     window.location.hostname !== 'localhost';

export const API_URL = isProduction
    ? 'https://rpg-azure.vercel.app' // Backend na Vercel
    : 'http://localhost:3000'; // Desenvolvimento local

export const isDev = !isProduction;
export const isProd = isProduction;

// Debug
console.log('🔧 Modo:', isProd ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('🌐 API URL:', API_URL);
console.log('🌍 Hostname:', window.location.hostname);
