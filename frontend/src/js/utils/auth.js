import { showSuccess, showError, showWarning } from './toast.js';
import { API_URL } from '../config.js';

export function isTokenValid() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) return false;

        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp && new Date() > new Date(payload.exp * 1000)) return false;

        return true;
    } catch (e) {
        return false;
    }
}

export function validateAuthentication() {
    // Modo debug
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
        localStorage.setItem('token', 'debug-token');
        localStorage.setItem('isMaster', 'true');
        localStorage.setItem('username', 'debug-master');
        showWarning('Modo debug ativado - autenticação simulada');
        return true;
    }

    const token = localStorage.getItem('token');
    const isMaster = localStorage.getItem('isMaster');

    if (!token || isMaster !== 'true' || !isTokenValid()) {
        showError('Acesso negado. Faça login como Mestre.');
        setTimeout(() => {
            const basePath = window.location.hostname.includes('github.io') ? '/RPG' : '';
            window.location.href = `${basePath}/`;
        }, 2000);
        return false;
    }

    return true;
}

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('[API REQUEST] Token não encontrado no localStorage');
        throw new Error('Token não fornecido');
    }

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.headers || {})
        }
    };

    console.log('[API REQUEST]', {
        endpoint,
        method: config.method || 'GET',
        hasToken: !!token,
        headers: config.headers
    });

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

export async function login() {
    alert("Função login chamada!"); // Teste visual

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (!usernameInput || !passwordInput) {
        alert("Elementos de login não encontrados!");
        return;
    }
    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('isMaster', data.user.isMaster);

            if (window.showSuccess) showSuccess('Login realizado com sucesso!');
            else alert('Login realizado com sucesso!');

            // Redirecionar baseado no tipo de usuário
            const basePath = window.location.hostname.includes('github.io') ? '/RPG' : '';
            if (data.user.isMaster) {
                window.location.href = `${basePath}/src/pages/master.html`;
            } else {
                window.location.href = `${basePath}/src/pages/student.html`;
            }
        } else {
            if (window.showError) showError('Login falhou: ' + data.error);
            else alert('Login falhou: ' + data.error);
        }
    } catch (err) {
        console.error('Erro no login:', err);
        if (window.showError) showError('Erro ao conectar com o servidor');
        else alert('Erro ao conectar com o servidor');
    }
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isMaster');
    const basePath = window.location.hostname.includes('github.io') ? '/RPG' : '';
    window.location.href = `${basePath}/`;
}

export function showRegisterForm() {
    // Remover listeners para permitir que a versão melhorada funcione
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm && registerForm) {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
}

export function hideRegisterForm() {
    // Remover listeners para permitir que a versão melhorada funcione
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm && registerForm) {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');

        // Esconder feedback
        const feedbacks = ['username-feedback', 'password-feedback', 'password-strength'];
        feedbacks.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.classList.add('hidden');
        });
    }
}

// Função para calcular força da senha
function calculatePasswordStrength(password) {
    const validation = validatePassword(password);

    // Contar quantos critérios foram atendidos
    let score = 0;
    if (validation.strength.length) score++;
    if (validation.strength.upper) score++;
    if (validation.strength.lower) score++;
    if (validation.strength.number) score++;
    if (validation.strength.symbol) score++;

    // Só é forte quando TODOS os 5 critérios estão atendidos
    let level, color;

    if (score === 5 && validation.isValid) {
        level = 'Forte';
        color = 'bg-green-500';
    } else if (score === 4) {
        level = 'Boa';
        color = 'bg-blue-500';
    } else if (score === 3) {
        level = 'Razoável';
        color = 'bg-yellow-500';
    } else if (score === 2) {
        level = 'Fraca';
        color = 'bg-orange-500';
    } else {
        level = 'Muito fraca';
        color = 'bg-red-500';
    }

    return {
        score,
        level,
        color,
        isStrong: score === 5 && validation.isValid
    };
}

// Função para atualizar feedback visual da senha
function updatePasswordFeedback(password) {
    const strengthDiv = document.getElementById('password-strength');
    const strengthText = document.getElementById('password-strength-text');
    const feedbackDiv = document.getElementById('password-feedback');
    const bars = document.querySelectorAll('.password-bar');

    if (password.length === 0) {
        strengthDiv.classList.add('hidden');
        feedbackDiv.classList.add('hidden');
        return;
    }

    strengthDiv.classList.remove('hidden');
    feedbackDiv.classList.remove('hidden');

    const validation = validatePassword(password);
    const strength = calculatePasswordStrength(password);

    // Atualizar barras de força - só fica verde quando TODOS os critérios estão atendidos
    bars.forEach((bar, index) => {
        if (index < strength.score) {
            // Se tem todos os 5 critérios, fica verde, senão usa a cor correspondente ao nível
            const barColor = (strength.score === 5 && validation.isValid) ? 'bg-green-500' :
                (strength.score === 4) ? 'bg-blue-500' :
                    (strength.score === 3) ? 'bg-yellow-500' :
                        (strength.score === 2) ? 'bg-orange-500' : 'bg-red-500';
            bar.className = `password-bar flex-1 h-1 rounded ${barColor}`;
        } else {
            bar.className = 'password-bar flex-1 h-1 rounded bg-gray-200';
        }
    });

    // Remover o texto "Força: X" - usar apenas a validação de critérios
    strengthText.textContent = '';

    // Mostrar critérios detalhados
    const criteriaHtml = `
    <div class="text-xs space-y-2 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div class="flex items-center space-x-2">
        <span class="${validation.strength.length ? 'text-green-500' : 'text-red-500'}">
          ${validation.strength.length ? '✓' : '✗'}
        </span>
        <span class="${validation.strength.length ? 'text-green-600' : 'text-gray-600'}">
          Pelo menos 8 caracteres
        </span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="${validation.strength.upper ? 'text-green-500' : 'text-red-500'}">
          ${validation.strength.upper ? '✓' : '✗'}
        </span>
        <span class="${validation.strength.upper ? 'text-green-600' : 'text-gray-600'}">
          Uma letra maiúscula (A-Z)
        </span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="${validation.strength.lower ? 'text-green-500' : 'text-red-500'}">
          ${validation.strength.lower ? '✓' : '✗'}
        </span>
        <span class="${validation.strength.lower ? 'text-green-600' : 'text-gray-600'}">
          Uma letra minúscula (a-z)
        </span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="${validation.strength.number ? 'text-green-500' : 'text-red-500'}">
          ${validation.strength.number ? '✓' : '✗'}
        </span>
        <span class="${validation.strength.number ? 'text-green-600' : 'text-gray-600'}">
          Um número (0-9)
        </span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="${validation.strength.symbol ? 'text-green-500' : 'text-red-500'}">
          ${validation.strength.symbol ? '✓' : '✗'}
        </span>
        <span class="${validation.strength.symbol ? 'text-green-600' : 'text-gray-600'}">
          Um símbolo (!@#$%^&* etc.)
        </span>
      </div>
    </div>
  `;

    if (validation.isValid && validation.strength.length && validation.strength.upper &&
        validation.strength.lower && validation.strength.number && validation.strength.symbol) {
        feedbackDiv.innerHTML = `
      <span class="text-green-500 font-semibold">✓ Senha forte e válida!</span>
      ${criteriaHtml}
    `;
    } else {
        feedbackDiv.innerHTML = `
      <span class="text-red-500 font-semibold">⚠ Senha deve atender todos os critérios:</span>
      ${criteriaHtml}
    `;
    }
}

// Função para atualizar feedback do username
function updateUsernameFeedback(username) {
    const feedbackDiv = document.getElementById('username-feedback');

    if (username.length === 0) {
        feedbackDiv.classList.add('hidden');
        return;
    }

    feedbackDiv.classList.remove('hidden');
    const validation = validateUsername(username);

    if (!validation.isValid) {
        feedbackDiv.innerHTML = `<span class="text-red-500">Faltam: ${validation.errors.join(', ')}</span>`;
    } else {
        feedbackDiv.innerHTML = `<span class="text-green-500">✓ Nome de usuário válido</span>`;
    }
}

// Função para validar força da senha
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

    const errors = [];

    if (password.length < minLength) {
        errors.push(`pelo menos ${minLength} caracteres`);
    }
    if (!hasUpperCase) {
        errors.push('pelo menos uma letra maiúscula (A-Z)');
    }
    if (!hasLowerCase) {
        errors.push('pelo menos uma letra minúscula (a-z)');
    }
    if (!hasNumbers) {
        errors.push('pelo menos um número (0-9)');
    }
    if (!hasSpecialChar) {
        errors.push('pelo menos um símbolo (!@#$%^&*etc.)');
    }

    // Senha só é válida se TODOS os critérios forem atendidos
    const isValid = password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar;

    return {
        isValid: isValid,
        errors: errors,
        strength: {
            length: password.length >= minLength,
            upper: hasUpperCase,
            lower: hasLowerCase,
            number: hasNumbers,
            symbol: hasSpecialChar
        }
    };
}

// Função para validar nome de usuário
function validateUsername(username) {
    const minLength = 5;
    const hasValidChars = /^[a-zA-Z0-9_]+$/.test(username);

    const errors = [];

    if (username.length < minLength) {
        errors.push(`pelo menos ${minLength} caracteres`);
    }
    if (!hasValidChars) {
        errors.push('apenas letras, números e underscore (_)');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

export async function register() {
    const username = document.getElementById('reg-username').value.trim();
    const fullname = document.getElementById('reg-fullname').value.trim();
    const password = document.getElementById('reg-password').value;
    const cursoSelect = document.getElementById('curso-select').value;
    const classSelect = document.getElementById('class-select').value.trim();

    // Validações básicas
    if (!username || !fullname || !password || !classSelect || !cursoSelect) {
        showError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Validar nome de usuário
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
        showError(`Nome de usuário deve ter: ${usernameValidation.errors.join(', ')}`);
        return;
    }

    // Validar senha
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showError(`Senha deve ter: ${passwordValidation.errors.join(', ')}`);
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                fullname,
                password,
                curso: cursoSelect,
                class: classSelect,
                isMaster: false
            }),
        });
        const data = await response.json();
        if (response.ok) {
            showSuccess('Registro bem-sucedido! Sua conta foi criada e aguarda aprovação do mestre. Você receberá acesso após a aprovação.');
            setTimeout(() => hideRegisterForm(), 3000);
        } else {
            showError('Erro no registro: ' + data.error);
        }
    } catch (err) {
        console.error('Erro no registro:', err);
        showError('Erro ao conectar com o servidor');
    }
}

// Função para verificar se o formulário pode ser submetido
function updateFormValidation() {
    const username = document.getElementById('reg-username')?.value.trim() || '';
    const password = document.getElementById('reg-password')?.value || '';
    const fullname = document.getElementById('reg-fullname')?.value.trim() || '';
    const cursoSelect = document.getElementById('curso-select')?.value || '';
    const classSelect = document.getElementById('class-select')?.value || '';
    const submitButton = document.getElementById('registerSubmitButton');

    const usernameValid = validateUsername(username).isValid;
    const passwordValid = validatePassword(password).isValid;
    const fieldsComplete = fullname && cursoSelect && classSelect;

    const canSubmit = usernameValid && passwordValid && fieldsComplete;

    if (submitButton) {
        submitButton.disabled = !canSubmit;
        submitButton.className = `w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${canSubmit
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`;
    }
}

// Função para inicializar validações em tempo real
export function initializeValidationListeners() {
    const usernameInput = document.getElementById('reg-username');
    const passwordInput = document.getElementById('reg-password');
    const fullnameInput = document.getElementById('reg-fullname');
    const cursoSelect = document.getElementById('curso-select');
    const classSelect = document.getElementById('class-select');

    if (usernameInput) {
        usernameInput.addEventListener('input', (e) => {
            updateUsernameFeedback(e.target.value.trim());
            updateFormValidation();
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            updatePasswordFeedback(e.target.value);
            updateFormValidation();
        });
    }

    if (fullnameInput) {
        fullnameInput.addEventListener('input', updateFormValidation);
    }

    if (cursoSelect) {
        cursoSelect.addEventListener('change', updateFormValidation);
    }

    if (classSelect) {
        classSelect.addEventListener('change', updateFormValidation);
    }

    // Inicializar estado do formulário
    updateFormValidation();
}