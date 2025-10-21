import { renderLogo } from '../logo.js';

export function renderAdminNavbar() {
  return `
    <header id="navbar">
  <div class="logo-container">${renderLogo('index.html#catalog')}</div>
      <nav>
        <button class="menu-toggle" aria-label="Abrir menu">&#9776;</button>
  <ul class="nav-links">
          <li><a href="#admin-veiculos" class="active">Veículos</a></li>
          <li><a href="#admin-leads">Leads/Contatos</a></li>
          <li><a href="#admin-agendamentos">Agendamentos</a></li>
          <li><a href="#admin-usuarios">Usuários</a></li>
          <li><a href="#admin-relatorios">Relatórios</a></li>
          <li class="account" style="position:relative;">
            <a href="#" id="admin-my-account">Minha conta ▾</a>
            <div id="my-account-menu" class="dropdown" style="display:none; position:absolute; right:0; top:100%; background:#fff; border:1px solid #e2e8f0; border-radius:8px; min-width:240px; box-shadow:0 10px 24px rgba(0,0,0,.12); z-index:10;">
              <div style="padding:.6rem .8rem; color:#475569; font-size:.9rem; border-bottom:1px solid #e2e8f0;" id="account-summary">Conta</div>
              <button id="admin-edit-profile" style="display:block;width:100%;padding:.6rem .8rem;text-align:left;background:none;border:none;color:#0f2747;cursor:pointer;">Editar perfil</button>
              <button id="admin-change-pass" style="display:block;width:100%;padding:.6rem .8rem;text-align:left;background:none;border:none;color:#0f2747;cursor:pointer;">Alterar senha</button>
              <button id="admin-logout" style="display:block;width:100%;padding:.6rem .8rem;text-align:left;background:none;border:none;color:#b91c1c;cursor:pointer;">Sair</button>
            </div>
          </li>
          <li><a href="index.html">Voltar ao site</a></li>
        </ul>
      </nav>
    </header>
  `;
}
