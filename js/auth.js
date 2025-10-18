//(simulada)
const usersKey = 'usuarios';

function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey) || '[]');
}
function saveUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}
function setSession(user) {
  localStorage.setItem('session', JSON.stringify(user));
}
function getSession() {
  return JSON.parse(localStorage.getItem('session') || 'null');
}
function clearSession() {
  localStorage.removeItem('session');
  localStorage.removeItem('token');
  localStorage.removeItem('isAuthenticated');
}

import { API_BASE } from './config.js';

export function renderAuth(main) {
  const session = getSession();
  if (session) {
    main.innerHTML = `<h2>Bem-vindo, ${session.nome}!</h2><button class="btn" id="logout">Sair</button>`;
    document.getElementById('logout').onclick = () => {
      clearSession();
      location.reload();
    };
    return;
  }
  main.innerHTML = `
    <div style="max-width:400px;margin:auto;">
      <h2>Login</h2>
      <form id="login-form" style="display:flex;flex-direction:column;gap:1rem;">
        <input type="email" name="email" placeholder="E-mail" required>
        <input type="password" name="senha" placeholder="Senha" required>
        <button class="btn" type="submit">Entrar</button>
      </form>
      <p>Não tem conta? <a href="#cadastro" id="to-cad">Cadastre-se</a></p>
      <div id="login-feedback"></div>
    </div>
  `;
  document.getElementById('login-form').onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const email = (data.email || '').trim().toLowerCase();
    const senha = (data.senha || '').trim();

    // Fluxo admin: autentica no backend para obter token
    if (email === 'admin@reliquias.com') {
      try {
        let resp = await fetch(`${API_BASE}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email, senha })
        });
        if (resp.status === 404) {
          resp = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, senha })
          });
        }
        if (!resp.ok) throw new Error('Credenciais inválidas');
        const payload = await resp.json();
        if (!payload?.token) throw new Error('Resposta de login inválida');
        localStorage.setItem('token', payload.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('session', JSON.stringify(payload.user || { email, role: 'admin', nome: 'Administrador' }));
        window.location.href = 'admin.html#admin-veiculos';
        return;
      } catch (err) {
        document.getElementById('login-feedback').innerHTML = '<span style="color:red;">Credenciais inválidas.</span>';
        return;
      }
    }

    // Fluxo usuário comum (simulado)
    const users = getUsers();
    const user = users.find(u => (u.email || '').toLowerCase() === email && (u.senha || '') === senha);
    if (user) {
      setSession(user);
      localStorage.setItem('isAuthenticated', 'true');
      document.getElementById('login-feedback').innerHTML = '<span style="color:green;">Login realizado, redirecionando...</span>';
      setTimeout(() => location.hash = '#catalog', 300);
    } else {
      document.getElementById('login-feedback').innerHTML = '<span style="color:red;">Credenciais inválidas.</span>';
    }
  };
  document.getElementById('to-cad').onclick = e => {
    e.preventDefault();
    renderCadastro(main);
  };
}

function renderCadastro(main) {
  main.innerHTML = `
    <div style="max-width:400px;margin:auto;">
      <h2>Cadastro</h2>
      <form id="cadastro-form" style="display:flex;flex-direction:column;gap:1rem;">
        <input type="text" name="nome" placeholder="Nome" required>
        <input type="email" name="email" placeholder="E-mail" required>
        <input type="password" name="senha" placeholder="Senha" required>
        <button class="btn" type="submit">Cadastrar</button>
      </form>
      <p>Já tem conta? <a href="#login" id="to-login">Entrar</a></p>
      <div id="cadastro-feedback"></div>
    </div>
  `;
  document.getElementById('cadastro-form').onsubmit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    let users = getUsers();
    if (users.find(u => u.email === data.email)) {
      document.getElementById('cadastro-feedback').innerHTML = '<span style="color:red;">E-mail já cadastrado.</span>';
      return;
    }
    users.push(data);
    saveUsers(users);
    setSession(data);
    location.reload();
  };
  document.getElementById('to-login').onclick = e => {
    e.preventDefault();
    renderAuth(main);
  };
}
