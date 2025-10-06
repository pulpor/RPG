export function applyThemeOnLoad() {
  const theme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);
  console.log('[THEME] Tema carregado:', theme);
  
  // Aguardar o DOM carregar completamente antes de atualizar o ícone
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateThemeIcon(theme);
      setupTooltipEvents();
    });
  } else {
    updateThemeIcon(theme);
    setupTooltipEvents();
  }
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("theme-icon");
  if (!icon) {
    console.error('[THEME] Ícone do tema não encontrado!');
    return;
  }

  const tooltip = icon.closest(".theme-toggle")?.querySelector(".lumus-nox-tooltip");

  if (theme === "dark") {
    icon.classList.remove("fa-sun", "theme-icon-sun");
    icon.classList.add("fa-moon", "theme-icon-moon", "fas");
    if (tooltip) tooltip.textContent = "Nox";
    console.log('[THEME] Ícone alterado para MOON (dark mode)');
  } else {
    icon.classList.remove("fa-moon", "theme-icon-moon");
    icon.classList.add("fa-sun", "theme-icon-sun", "fas");
    if (tooltip) tooltip.textContent = "Lumus";
    console.log('[THEME] Ícone alterado para SUN (light mode)');
  }

  // Forçar display inline-block
  icon.style.display = 'inline-block';
  icon.style.opacity = '1';
  icon.style.visibility = 'visible';
}

function setupTooltipEvents() {
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    // Eventos para desktop (hover)
    btn.addEventListener("mouseenter", () => {
      const tooltip = btn.querySelector(".lumus-nox-tooltip");
      if (tooltip) {
        tooltip.style.opacity = "1";
        tooltip.style.transform = "translateX(-50%) scale(1)";
      }
    });
    btn.addEventListener("mouseleave", () => {
      const tooltip = btn.querySelector(".lumus-nox-tooltip");
      if (tooltip) {
        tooltip.style.opacity = "0";
        tooltip.style.transform = "translateX(-50%) scale(0.95)";
      }
    });

    // Eventos para mobile (toque)
    let touchTimeout;
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault(); // Evita comportamento padrão, como zoom
      const tooltip = btn.querySelector(".lumus-nox-tooltip");
      if (tooltip) {
        tooltip.style.opacity = "1";
        tooltip.style.transform = "translateX(-50%) scale(1)";
        // Esconde após 2 segundos
        touchTimeout = setTimeout(() => {
          tooltip.style.opacity = "0";
          tooltip.style.transform = "translateX(-50%) scale(0.95)";
        }, 2000);
      }
    });
    btn.addEventListener("touchend", () => {
      clearTimeout(touchTimeout); // Cancela o timeout se o toque terminar cedo
    });
  });
}

window.toggleTheme = toggleTheme;
window.applyThemeOnLoad = applyThemeOnLoad;