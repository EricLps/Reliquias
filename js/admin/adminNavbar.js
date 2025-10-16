import { renderLogo } from '../logo.js';

export function renderAdminNavbar() {
  return `
    <header>
      <div class="logo-container">${renderLogo()}</div>
      <nav>
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
