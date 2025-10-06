// Sistema de níveis baseado em XP
const XP_LEVELS = [
    { level: 1, minXP: 0 },
    { level: 2, minXP: 100 },
    { level: 3, minXP: 250 },
    { level: 4, minXP: 450 },
    { level: 5, minXP: 700 },
    { level: 6, minXP: 1000 },
    { level: 7, minXP: 1400 },
    { level: 8, minXP: 2000 },
    { level: 9, minXP: 3000 },
    { level: 10, minXP: 5000 }
];

/**
 * Calcula o nível do usuário baseado no XP atual
 * @param {number} currentXP - XP atual do usuário
 * @returns {object} - Objeto com informações do nível
 */
function calculateLevel(currentXP) {
    // Encontrar o nível atual
    let currentLevel = 1;
    for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
        if (currentXP >= XP_LEVELS[i].minXP) {
            currentLevel = XP_LEVELS[i].level;
            break;
        }
    }

    // Calcular XP para o próximo nível
    const nextLevelData = XP_LEVELS.find(level => level.level === currentLevel + 1);
    const currentLevelData = XP_LEVELS.find(level => level.level === currentLevel);

    let xpForNextLevel = null;
    let xpProgressInCurrentLevel = 0;
    let xpNeededForCurrentLevel = 0;

    if (nextLevelData) {
        xpForNextLevel = nextLevelData.minXP;
        xpNeededForCurrentLevel = nextLevelData.minXP - currentLevelData.minXP;
        xpProgressInCurrentLevel = currentXP - currentLevelData.minXP;
    } else {
        // Nível máximo atingido
        xpProgressInCurrentLevel = currentXP - currentLevelData.minXP;
        xpNeededForCurrentLevel = 0;
    }

    return {
        currentLevel,
        currentXP,
        xpForNextLevel,
        xpProgressInCurrentLevel,
        xpNeededForCurrentLevel,
        progressPercentage: xpNeededForCurrentLevel > 0 ?
            Math.round((xpProgressInCurrentLevel / xpNeededForCurrentLevel) * 100) : 100,
        isMaxLevel: currentLevel === 10
    };
}

/**
 * Atualiza o nível do usuário baseado no XP atual
 * @param {object} user - Objeto do usuário
 * @returns {object} - Usuário atualizado com novo nível
 */
function updateUserLevel(user) {
    const levelInfo = calculateLevel(user.xp || 0);
    user.level = levelInfo.currentLevel;
    return user;
}

/**
 * Obter informações detalhadas do nível para exibição
 * @param {number} currentXP - XP atual do usuário
 * @returns {object} - Informações detalhadas do nível
 */
function getLevelInfo(currentXP) {
    return calculateLevel(currentXP);
}

module.exports = {
    XP_LEVELS,
    calculateLevel,
    updateUserLevel,
    getLevelInfo
};
