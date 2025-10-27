// Configuração de ambiente para o frontend
// Detecta automaticamente entre desenvolvimento e produção

export const API_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
        ? 'https://rpg-azure.vercel.app' // Backend na Vercel
        : 'http://localhost:3000');

export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;
export const MODE = import.meta.env.MODE;

// Debug
if (isDev) {
    console.log('🔧 Modo:', MODE);
    console.log('🌐 API URL:', API_URL);
}
