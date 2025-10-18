import { renderLogo } from './logo.js';

export function renderNavbar() {
    const navbar = document.getElementById('navbar');
    // Detecta sessão e tipo de usuário
    let session = null;
    try {
        session = JSON.parse(localStorage.getItem('session') || 'null');
    } catch (_) {
        session = null;
    }
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const isAdmin = !!session && session.role === 'admin' && isAuthenticated;

    const accountItem = session
        ? '<li><a href="#login" id="account-link">Minha Conta</a></li>'
        : '<li><a href="#login" id="login-link">Login/Cadastro</a></li>';

    const adminItem = isAdmin
        ? '<li><a href="admin.html#admin-veiculos" id="admin-link">Admin</a></li>'
        : '';

    navbar.innerHTML = `
        <div class="logo-container">
            ${renderLogo()}
        </div>
        <nav>
            <button class="menu-toggle" aria-label="Abrir menu">&#9776;</button>
            <ul class="nav-links">
                <li><a href="#catalog">Catálogo</a></li>
                <li><a href="#contato">Contato</a></li>
                <li><a href="#sobre">Sobre Nós</a></li>
                ${adminItem}
                ${accountItem}
            </ul>
        </nav>
    `;
    // Menu responsivo
    const toggle = navbar.querySelector('.menu-toggle');
    const links = navbar.querySelector('.nav-links');
    toggle.onclick = () => {
        links.classList.toggle('active');
    };
    // Fecha menu ao clicar em link (somente mobile)
    links.querySelectorAll('a').forEach(a => {
        a.onclick = () => {
            links.classList.remove('active');
        };
    });
}
