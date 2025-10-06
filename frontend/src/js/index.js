// LOGIN + POSICIONAMENTO ÍCONES
import { showToast } from './utils/toast.js';

// Função de login usando os toasts personalizados
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    showToast("Preencha usuário e senha!", "error");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    let data = {};
    try { data = await res.json(); } catch { }

    if (!res.ok) {
      showToast(data.message || data.error || `Erro ${res.status}: ${res.statusText}`, "error");
      return;
    }

    if (data.success || data.user) {
      showToast("Login realizado com sucesso!", "success");

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("isMaster", data.user.isMaster);
      }

      window.location.href = data.user && data.user.isMaster
        ? "/src/pages/master.html"
        : "/src/pages/student.html";
    } else {
      showToast(data.message || "Usuário ou senha inválidos.", "error");
    }

  } catch {
    showToast("Erro de conexão com o servidor.", "error");
  }
}

const loginButton = document.getElementById("loginButton");
const diceIcon = document.querySelector(".logo-icon");
const loginScreen = document.getElementById("login-screen");
const inputs = document.querySelectorAll("#login-screen .input-field, .input-group .input-field");

// FUNÇÕES DE POSICIONAMENTO
function posicionarIcones() {
  const allIcons = document.querySelectorAll("#login-screen .input-icon, .input-group .input-icon");
  allIcons.forEach(icon => {
    Object.assign(icon.style, {
      position: "absolute",
      left: "18px",
      top: "26px",
      transform: "translateY(-50%)",
      color: "#6b7280",
      fontSize: "16px",
      width: "16px",
      height: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      zIndex: "1000",
      transition: "color 0.3s ease",
      lineHeight: "1",
      margin: "0",
      padding: "0"
    });
  });
}



function garantirAlturaInputs() {
  inputs.forEach(input => {
    Object.assign(input.style, {
      height: "52px",
      lineHeight: "20px",
      padding: "16px 16px 16px 52px",
      boxSizing: "border-box",
      transform: "none"
    });
  });
}

// Aplica posicionamento inicial
posicionarIcones();
garantirAlturaInputs();

// ============================
// EVENTOS DE INPUT
// ============================
inputs.forEach(input => {
  const icon = input.nextElementSibling;

  input.addEventListener("focus", () => {
    input.style.paddingLeft = "52px";
    if (icon && icon.classList.contains("input-icon")) {
      icon.style.color = "#667eea";
    }
  });

  input.addEventListener("blur", () => {
    if (icon && icon.classList.contains("input-icon")) {
      icon.style.color = "#6b7280";
    }
  });

  // Mantém altura e posicionamento durante digitação
  ["input", "change"].forEach(eventType => {
    input.addEventListener(eventType, () => {
      garantirAlturaInputs();
      posicionarIcones();
    });
  });
});

// Observer para mudanças dinâmicas no DOM
if (loginScreen) {
  const observer = new MutationObserver(() => {
    setTimeout(() => {
      garantirAlturaInputs();
      posicionarIcones();
    }, 10);
  });
  observer.observe(loginScreen, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });
}


// Efeito de rolar o dado ao clicar (apenas uma vez)
if (diceIcon) {
  diceIcon.addEventListener("click", () => {
    diceIcon.classList.add("rolling");
    diceIcon.addEventListener("animationend", () => {
      diceIcon.classList.remove("rolling");
    }, { once: true });
  });
}

// Evento de login
if (loginButton) {
  loginButton.addEventListener("click", async () => {
    loginButton.classList.add("btn-loading");
    await login();
    loginButton.classList.remove("btn-loading");
  });
}

// Pressionar Enter nos campos
["username", "password"].forEach(id => {
  const input = document.getElementById(id);
  if (input && loginButton) {
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") loginButton.click();
    });
  }
});
