// Efeito de rolar o dado ao clicar na tela de cadastro
document.addEventListener('DOMContentLoaded', () => {
  const diceIcon = document.querySelector('.logo-icon');
  if (diceIcon) {
    diceIcon.addEventListener('click', () => {
      diceIcon.classList.add('rolling');
      diceIcon.addEventListener('animationend', () => {
        diceIcon.classList.remove('rolling');
      }, { once: true });
    });
  }
});
import { showToast } from './utils/toast.js';

// --- ÁREAS E CLASSES ---
export const areasClasses = {
  beleza: { name: "👒 Beleza", classes: { "Estilista das Sombras": {}, "Feiticeira das Unhas": {}, "Encantador de Cores": {}, "Artista das Luzes": {}, "Cortes Fantasma": {}, "Guardiã das Flores": {}, "Alquimista do Perfume": {}, "Mestre do Reflexo": {} } },
  gastronomia: { name: "👨‍🍳 Gastronomia", classes: { "Cozinheiro Arcano": {}, "Alquimista dos Sabores": {}, "Guardiã do Forno": {}, "Mestre das Caldeiradas": {}, "Confeiteiro Místico": {}, "Senhor dos Temperos": {}, "Sommelier Sagrado": {}, "Druida da Nutrição": {} } },
  gestao: { name: "👩‍🎓 Gestão", classes: { "Senhor dos Números": {}, "Administrador da Ordem": {}, "Analista Visionário": {}, "Estrategista de Elite": {}, "Protetor do Equilíbrio": {}, "Mediador das Alianças": {}, "Juiz da Justiça": {}, "Cronista do Progresso": {} } },
  oftalmo: { name: "👁️ Oftalmologia", classes: { "Vidente da Visão": {}, "Guardiã do Olhar": {}, "Caçador de Detalhes": {}, "Mestre da Clareza": {}, "Sentinela Invisível": {}, "Oráculo das Lentes": {}, "Defensor da Retina": {}, "Ilusionista da Percepção": {} } },
  tecnologia: { name: "🖥️ Tecnologia", classes: { "Arqueiro do JavaScript": {}, "Cafeicultor do Java": {}, "Mago do CSS": {}, "Paladino do HTML": {}, "Bárbaro do Back-end": {}, "Domador de Dados": {}, "Elfo do Front-end": {}, "Caçador de Bugs": {} } },
  idiomas: { name: "🌐 Idiomas", classes: { "Orador das Runas": {}, "Tradutor das Sombras": {}, "Bardo Poliglota": {}, "Sábio dos Dialetos": {}, "Emissário Universal": {}, "Guardião da Palavra": {}, "Feiticeiro da Pronúncia": {}, "Lexicógrafo Arcano": {} } }
};

// --- LIBERAR CLASSES CONFORME CURSO ---
export function setupCursoClasse() {
  const cursoSelect = document.getElementById('curso-select');
  const classSelect = document.getElementById('class-select');
  if (!cursoSelect || !classSelect) {
    console.error('Elementos curso-select ou class-select não encontrados');
    return;
  }
  cursoSelect.addEventListener('change', function () {
    const area = cursoSelect.value;
    classSelect.innerHTML = '';
    if (!area || !areasClasses[area]) {
      classSelect.innerHTML = '<option value="">Escolha o curso primeiro</option>';
      classSelect.disabled = true;
      return;
    }
    classSelect.disabled = false;
    classSelect.innerHTML = '<option value="">Escolha sua classe RPG</option>';
    Object.keys(areasClasses[area].classes).forEach(classe => {
      classSelect.innerHTML += `<option value="${classe}">${classe}</option>`;
    });
    updateRegisterButtonState();
  });
}

if (document.getElementById('curso-select') && document.getElementById('class-select')) {
  setupCursoClasse();
}

// --- LOGIN/CADASTRO ENHANCED ---
function initializeEnhancedForms() {
  setupInputEffects();
  setupButtonAnimations();
  setupFormTransitions();
  setupEasterEggs();
}

function setupInputEffects() {
  // Desabilitado para evitar conflitos
}

function setupButtonAnimations() {
  const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px) scale(1.02)';
      this.style.transition = 'all 0.3s ease';
    });
    button.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)';
    });
    button.addEventListener('mousedown', function () {
      this.style.transform = 'translateY(0) scale(0.98)';
    });
    button.addEventListener('mouseup', function () {
      this.style.transform = 'translateY(-2px) scale(1.02)';
    });
  });
}

function setupFormTransitions() {
  const registerForm = document.getElementById('register-form');
  function animateFormEntry(form) {
    if (form) {
      form.style.opacity = '0';
      form.style.transform = 'translateY(20px)';
      setTimeout(() => {
        form.style.transition = 'all 0.5s ease';
        form.style.opacity = '1';
        form.style.transform = 'translateY(0)';
      }, 50);
    }
  }
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.id === 'register-form' && !target.classList.contains('hidden')) {
          animateFormEntry(target);
          clearRegistrationForm();
        }
      }
    });
  });
  if (registerForm) {
    observer.observe(registerForm, { attributes: true });
  }
}

function clearRegistrationForm() {
  const fields = [
    'reg-username',
    'reg-fullname',
    'reg-password',
    'curso-select',
    'class-select'
  ];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.value = '';
      field.classList.remove('has-content');
    }
  });
  const feedbacks = ['username-feedback', 'fullname-feedback', 'password-feedback', 'password-strength'];
  feedbacks.forEach(feedbackId => {
    const feedback = document.getElementById(feedbackId);
    if (feedback) {
      feedback.classList.add('hidden');
    }
  });
  updateRegisterButtonState();
}

function setupEasterEggs() {
  let clickCount = 0;
  const logo = document.querySelector('.logo, h1');
  if (logo) {
    logo.addEventListener('click', function () {
      clickCount++;
      if (clickCount === 5) {
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
          document.body.style.filter = 'none';
        }, 2000);
        clickCount = 0;
      }
    });
  }
  document.addEventListener('click', function (e) {
    createClickParticle(e.clientX, e.clientY);
  });
}

function createClickParticle(x, y) {
  const particle = document.createElement('div');
  particle.style.position = 'fixed';
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  particle.style.width = '6px';
  particle.style.height = '6px';
  particle.style.background = '#667eea';
  particle.style.borderRadius = '50%';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '9999';
  particle.style.transition = 'all 0.5s ease-out';
  document.body.appendChild(particle);
  setTimeout(() => {
    particle.style.transform = 'translateY(-20px) scale(0)';
    particle.style.opacity = '0';
  }, 10);
  setTimeout(() => {
    document.body.removeChild(particle);
  }, 500);
}

const style = document.createElement('style');
style.textContent = `
  .has-content {
    background: rgba(255, 255, 255, 0.95) !important;
  }
`;
document.head.appendChild(style);

const passwordBarStyle = document.createElement('style');
passwordBarStyle.textContent = `
  .password-bar.active {
    background: #22c55e !important;
  }
`;
document.head.appendChild(passwordBarStyle);
console.log('Estilos dinâmicos aplicados:', style.textContent, passwordBarStyle.textContent);

// --- REGISTRO ---
function validateUsername(username) {
  return username.length >= 5;
}

function validateFullname(fullname) {
  const minLength = 3;
  const validFormat = /^[A-Za-z\s]+$/.test(fullname);
  return fullname.length >= minLength && validFormat;
}

function validatePassword(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\\/]/.test(password)
  };
}

function showUsernameFeedback() {
  const usernameInput = document.getElementById('reg-username');
  const feedback = document.getElementById('username-feedback');
  if (!usernameInput || !feedback) {
    console.error('Elementos reg-username ou username-feedback não encontrados');
    return;
  }
  const username = usernameInput.value.trim();
  if (username.length === 0) {
    feedback.textContent = '';
    feedback.classList.add('hidden');
    feedback.classList.remove('text-red-500');
    return;
  }
  if (!validateUsername(username)) {
    feedback.textContent = 'Faltam: pelo menos 5 caracteres';
    feedback.classList.remove('hidden');
    feedback.classList.add('text-red-500');
  } else {
    feedback.textContent = '';
    feedback.classList.add('hidden');
    feedback.classList.remove('text-red-500');
  }
}

function showFullnameFeedback() {
  const fullnameInput = document.getElementById('reg-fullname');
  const feedback = document.getElementById('fullname-feedback');
  if (!fullnameInput || !feedback) {
    console.error('Elementos reg-fullname ou fullname-feedback não encontrados');
    return;
  }
  const fullname = fullnameInput.value.trim();
  if (fullname.length === 0) {
    feedback.textContent = '';
    feedback.classList.add('hidden');
    feedback.classList.remove('text-red-500');
    return;
  }
  if (!validateFullname(fullname)) {
    feedback.textContent = 'Nome completo deve ter pelo menos 3 caracteres e conter apenas letras e espaços.';
    feedback.classList.remove('hidden');
    feedback.classList.add('text-red-500');
  } else {
    feedback.textContent = '';
    feedback.classList.add('hidden');
    feedback.classList.remove('text-red-500');
  }
}

function showPasswordFeedback() {
  const passwordInput = document.getElementById('reg-password');
  const feedback = document.getElementById('password-feedback');
  const strengthDiv = document.getElementById('password-strength');
  const strengthText = document.getElementById('password-strength-text');
  if (!passwordInput || !feedback || !strengthDiv || !strengthText) {
    console.error('Elementos de senha não encontrados');
    return;
  }
  const bars = strengthDiv.querySelectorAll('.password-bar');
  const password = passwordInput.value;
  const result = validatePassword(password);

  let validCount = Object.values(result).filter(Boolean).length;
  let allValid = validCount === 5;

  if (password.length === 0) {
    feedback.textContent = '';
    feedback.classList.add('hidden');
    feedback.classList.remove('text-red-500');
    strengthDiv.classList.add('hidden');
    bars.forEach(bar => {
      bar.classList.remove('active');
      bar.style.background = '#e5e7eb';
    });
    return;
  }

  strengthDiv.classList.remove('hidden');
  // Adiciona margem inferior à barra de progresso
  strengthDiv.classList.add('mb-3');
  feedback.innerHTML = '';
  if (!allValid) {
    feedback.innerHTML = '<span class="text-yellow-600"><i class="fas fa-exclamation-triangle"></i> Senha deve atender todos os critérios:</span>';
    feedback.classList.remove('hidden');
    feedback.classList.add('text-red-500');
    feedback.classList.add('dark:text-red-300');
  } else {
    feedback.textContent = '';
    feedback.classList.add('hidden');
    feedback.classList.remove('text-red-500');
    feedback.classList.remove('dark:text-red-300');
  }

  let criteria = [
    { label: 'Pelo menos 8 caracteres', valid: result.length },
    { label: 'Uma letra maiúscula (A-Z)', valid: result.uppercase },
    { label: 'Uma letra minúscula (a-z)', valid: result.lowercase },
    { label: 'Um número (0-9)', valid: result.number },
    { label: 'Um símbolo (!@#$%^&* etc.)', valid: result.symbol }
  ];
  let html = '';
  criteria.forEach(c => {
    html += `<div class="flex items-center gap-2 mb-1">
      <span class="${c.valid ? 'text-green-600' : 'text-red-500'}">
        <i class="fas fa-${c.valid ? 'check' : 'times'}"></i>
      </span>
      ${c.label}
    </div>`;
  });
  strengthText.innerHTML = html;

  bars.forEach((bar, i) => {
    if (i < validCount) {
      bar.classList.add('active');
    } else {
      bar.classList.remove('active');
      bar.style.background = '#e5e7eb';
    }
  });
}

function validateRegisterFields() {
  const username = document.getElementById('reg-username')?.value.trim();
  const fullname = document.getElementById('reg-fullname')?.value.trim();
  const password = document.getElementById('reg-password')?.value;
  const curso = document.getElementById('curso-select')?.value;
  const classe = document.getElementById('class-select')?.value;

  if (!username || !fullname || !password || !curso || !classe) {
    console.log('Campos obrigatórios não preenchidos:', { username, fullname, password, curso, classe });
    return false;
  }

  const usernameValid = validateUsername(username);
  const fullnameValid = validateFullname(fullname);
  const passwordValid = Object.values(validatePassword(password)).every(Boolean);

  console.log('Validações:', { usernameValid, fullnameValid, passwordValid });
  return usernameValid && fullnameValid && passwordValid;
}

function updateRegisterButtonState() {
  const btn = document.getElementById('registerSubmitButton');
  if (!btn) {
    console.error('Botão registerSubmitButton não encontrado');
    return;
  }
  const isValid = validateRegisterFields();
  btn.disabled = !isValid;
  btn.classList.toggle('opacity-50', !isValid);
  btn.classList.toggle('cursor-not-allowed', !isValid);
}

function getMasterForArea(area) {
  const masters = {
    beleza: 'beleza',
    gastronomia: 'gastro',
    gestao: 'gestao',
    oftalmo: 'oftalmo',
    tecnologia: 'tecno',
    idiomas: 'idioma'
  };
  return masters[area] || null;
}

async function handleRegister() {
  if (!validateRegisterFields()) {
    showToast('Preencha todos os campos corretamente!', 'error');
    return;
  }
  const username = document.getElementById('reg-username').value.trim();
  const fullname = document.getElementById('reg-fullname').value.trim();
  const password = document.getElementById('reg-password').value;
  const curso = document.getElementById('curso-select').value;
  const classe = document.getElementById('class-select').value;
  const masterArea = getMasterForArea(curso);

  console.log("[REGISTER FRONT] Dados enviados:", { username, fullname, password, curso, classe, masterArea });

  try {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        fullname,
        password,
        curso,
        class: classe,
        pending: true,
        masterArea,
        isMaster: false
      })
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      showToast(data.message || data.error || `Erro ${res.status}: ${res.statusText}`, 'error');
      return;
    }

    if (data.success) {
      showToast('Conta criada! Aguarde aprovação do mestre da área.', 'success');
      clearRegistrationForm();
      updateRegisterButtonState();
    } else {
      showToast(data.message || 'Erro ao criar213 conta.', 'error');
    }
  } catch (err) {
    showToast('Erro de conexão com o servidor.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded: Inicializando validações');
  initializeEnhancedForms();
  showUsernameFeedback();
  showFullnameFeedback();
  showPasswordFeedback();
  updateRegisterButtonState();

  const usernameInput = document.getElementById('reg-username');
  const fullnameInput = document.getElementById('reg-fullname');
  const passwordInput = document.getElementById('reg-password');
  const cursoSelect = document.getElementById('curso-select');
  const classSelect = document.getElementById('class-select');
  const registerBtn = document.getElementById('registerSubmitButton');

  if (usernameInput) {
    usernameInput.addEventListener('input', () => {
      console.log('Input no username');
      showUsernameFeedback();
      updateRegisterButtonState();
    });
  } else {
    console.error('Elemento reg-username não encontrado');
  }

  if (fullnameInput) {
    fullnameInput.addEventListener('input', () => {
      console.log('Input no fullname');
      showFullnameFeedback();
      updateRegisterButtonState();
    });
  } else {
    console.error('Elemento reg-fullname não encontrado');
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      console.log('Input no password');
      showPasswordFeedback();
      updateRegisterButtonState();
    });
  } else {
    console.error('Elemento reg-password não encontrado');
  }

  ['curso-select', 'class-select'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        console.log(`Change no ${id}`);
        updateRegisterButtonState();
      });
    } else {
      console.error(`Elemento ${id} não encontrado`);
    }
  });

  if (classSelect) {
    classSelect.addEventListener('click', function () {
      if (this.disabled) {
        showToast('Por favor, escolha um curso primeiro!', 'warning');
      }
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('Botão de cadastro clicado');
      handleRegister();
    });
  } else {
    console.error('Botão registerSubmitButton não encontrado');
  }
});