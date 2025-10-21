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
    const isAdmin = !!session && (session.role === 'admin' || session.role === 'adminMaster') && isAuthenticated;

    const accountItem = session
        ? ''
        : '<li><a href="login.html" id="login-link">Login</a></li>';

    const adminItem = isAdmin
        ? '<li><a href="admin.html#admin-veiculos" id="admin-link">Admin</a></li>'
        : '';

    navbar.innerHTML = `
        <div class="logo-container">
            ${renderLogo()}
        </div>
        <nav>
            <button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-links">&#9776;</button>
            <ul class="nav-links" id="nav-links">
                <li><a href="#catalog">Catálogo</a></li>
                <li><a href="#contato">Contato</a></li>
                <li><a href="#sobre">Sobre Nós</a></li>
                ${adminItem}
                ${accountItem}
            </ul>
        </nav>
    `;
    // Menu responsivo (drawer + overlay no mobile)
    const toggle = navbar.querySelector('.menu-toggle');
    const links = navbar.querySelector('.nav-links');
    let overlay = document.getElementById('nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'nav-overlay';
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }

    let lastFocused = null;
    const getFocusable = () => Array.from(links.querySelectorAll('a, button'));
    const openDrawer = () => {
        lastFocused = document.activeElement;
        links.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('nav-open');
        toggle.setAttribute('aria-expanded', 'true');
        const first = getFocusable()[0];
        if (first) first.focus();
    };
    const closeDrawer = () => {
        links.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        if (lastFocused) { try { lastFocused.focus(); } catch(_){} }
    };
    toggle.onclick = () => {
        if (links.classList.contains('active')) closeDrawer(); else openDrawer();
    };
    overlay.onclick = closeDrawer;
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
        // Trap de foco dentro do drawer
        if (e.key === 'Tab' && links.classList.contains('active')) {
            const focusable = getFocusable();
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;
            if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
        }
    });
    // Fecha menu ao clicar em link (somente mobile)
    links.querySelectorAll('a').forEach(a => {
        a.onclick = () => closeDrawer();
    });

    // Gesto de arraste para fechar (mobile)
    let startX = 0, currentX = 0, dragging = false;
    const onTouchStart = (e) => {
        if (!links.classList.contains('active')) return;
        if (!e.touches || e.touches.length !== 1) return;
        dragging = true; startX = currentX = e.touches[0].clientX;
        links.style.transition = 'none';
    };
    const onTouchMove = (e) => {
        if (!dragging) return;
        currentX = e.touches[0].clientX;
        const dx = Math.min(0, currentX - startX); // só arrasta para a direita (fechar)
        links.style.transform = `translateX(${Math.abs(dx)}px)`;
    };
    const onTouchEnd = () => {
        if (!dragging) return;
        dragging = false;
        const dx = currentX - startX;
        links.style.transition = '';
        if (dx > 60) { // limiar
            closeDrawer();
        } else {
            links.style.transform = '';
        }
    };
    links.addEventListener('touchstart', onTouchStart, { passive: true });
    links.addEventListener('touchmove', onTouchMove, { passive: true });
    links.addEventListener('touchend', onTouchEnd, { passive: true });

    // Limpeza ao redimensionar: se sair do mobile, garante estados resetados
    const onResize = () => {
        if (window.innerWidth > 768) {
            overlay.classList.remove('active');
            links.classList.remove('active');
            document.body.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    };
    window.addEventListener('resize', onResize);
}
