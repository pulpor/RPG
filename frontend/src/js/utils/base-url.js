// Helper para gerar URLs corretas tanto em dev quanto em produção
// Em produção (GitHub Pages): usa /RPG/
// Em desenvolvimento: usa /

const isProduction = window.location.hostname.includes('github.io');
const BASE_PATH = isProduction ? '/RPG/' : '/';

export function getAssetUrl(path) {
    // Remove barra inicial se existir
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${BASE_PATH}${cleanPath}`;
}

export function getPageUrl(page) {
    // Para páginas HTML
    return `${BASE_PATH}${page}`;
}

export { BASE_PATH };
