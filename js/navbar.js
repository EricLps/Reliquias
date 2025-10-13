import { renderLogo } from './logo.js';

// navbar.js - Componente de navegação
export function renderNavbar() {
    const navbar = document.getElementById('navbar');
    navbar.innerHTML = `
        <div class="logo-container">
            ${renderLogo()}
        </div>
        <nav>
            <button class="menu-toggle" aria-label="Abrir menu">&#9776;</button>
                    <ul class="nav-links">
                        <li><a href="#catalog">Catálogo</a></li>
                        <li><a href="#favoritos">Favoritos</a></li>
                        <li><a href="#contato">Contato</a></li>
                        <li><a href="#sobre">Sobre Nós</a></li>
                        <li><a href="#login" id="login-link">Login/Cadastro</a></li>
                    </ul>
        </nav>
    `;
    // Menu responsivo
    const toggle = navbar.querySelector('.menu-toggle');
    const links = navbar.querySelector('.nav-links');
    toggle.onclick = () => {
        links.classList.toggle('active');
    };
    // Fecha menu ao clicar em link (mobile)
    links.querySelectorAll('a').forEach(a => {
        a.onclick = () => {
            links.classList.remove('active');
        };
    });
}
