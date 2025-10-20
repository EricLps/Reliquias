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
          <li><a href="#admin-relatorios">Relatórios</a></li>
          <li><a href="index.html">Voltar ao site</a></li>
        </ul>
      </nav>
    </header>
  `;
}
