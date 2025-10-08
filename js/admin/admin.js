// admin.js - SPA/Admin para Relíquias
import { renderAdminVeiculos, renderAdminLeads, renderAdminAgendamentos, renderAdminRelatorios } from './adminViews.js';

function setActiveNav(hash) {
  document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
  const link = document.querySelector(`.admin-nav a[href='${hash}']`);
  if (link) link.classList.add('active');
}

function renderAdminPage() {
  const hash = window.location.hash || '#admin-veiculos';
  setActiveNav(hash);
  const main = document.getElementById('admin-content');
  if (hash === '#admin-veiculos') {
    main.innerHTML = renderAdminVeiculos();
    renderTabelaVeiculos();
  } else if (hash === '#admin-leads') main.innerHTML = renderAdminLeads();
  else if (hash === '#admin-agendamentos') main.innerHTML = renderAdminAgendamentos();
  else if (hash === '#admin-relatorios') main.innerHTML = renderAdminRelatorios();
  else main.innerHTML = '<p>Página não encontrada.</p>';
}

document.addEventListener('DOMContentLoaded', () => {
  // Forçar hash inicial se não houver
  if (!window.location.hash) {
    window.location.hash = '#admin-veiculos';
  }
  renderAdminPage();
});

window.addEventListener('hashchange', renderAdminPage);

// Dados simulados de veículos
const veiculosFake = [
  { id: 1, marca: 'Chevrolet', modelo: 'Opala SS', ano: 1978, preco: 65000, cor: 'Azul', km: 120000 },
  { id: 2, marca: 'FIAT', modelo: '147', ano: 1983, preco: 28000, cor: 'Branco', km: 90000 },
  { id: 3, marca: 'Toyota', modelo: 'Corolla AE101', ano: 1995, preco: 42000, cor: 'Amarelo', km: 110000 },
];

// --- MODAL DE CADASTRO/EDIÇÃO ---
function abrirModalVeiculo(edicao = false, dados = null) {
  const modal = document.getElementById('admin-veiculo-form-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  const titulo = document.getElementById('modal-titulo');
  if (titulo) titulo.textContent = edicao ? 'Editar Veículo' : 'Cadastrar Veículo';
  const form = document.getElementById('form-veiculo');
  if (form && dados) {
    form.marca.value = dados.marca || '';
    form.modelo.value = dados.modelo || '';
    form.ano.value = dados.ano || '';
    form.preco.value = dados.preco || '';
    form.cor.value = dados.cor || '';
    form.km.value = dados.km || '';
    form.foto.value = dados.foto || '';
  } else if (form) {
    form.reset();
  }
}

function fecharModalVeiculo() {
  const modal = document.getElementById('admin-veiculo-form-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Eventos do modal - devem ser reanexados após renderização SPA
function setupModalVeiculoEvents() {
  const btnAdd = document.getElementById('btn-add-veiculo');
  if (btnAdd) {
    btnAdd.onclick = () => abrirModalVeiculo(false);
  }
  const btnCancel = document.getElementById('btn-cancelar-veiculo');
  if (btnCancel) {
    btnCancel.onclick = fecharModalVeiculo;
  }
  // Fechar modal ao clicar fora do form
  const modal = document.getElementById('admin-veiculo-form-modal');
  if (modal) {
    modal.addEventListener('mousedown', function(e) {
      if (e.target === modal) fecharModalVeiculo();
    });
  }
}

// Chamar após renderização da view de veículos
function renderTabelaVeiculos() {
  const lista = document.getElementById('admin-veiculos-lista');
  if (!lista) return;
  let html = `<table class="admin-table">
    <thead>
      <tr>
        <th></th><th>ID</th><th>Marca</th><th>Modelo</th><th>Ano</th><th>Preço</th><th>Cor</th><th>KM</th><th>Ações</th>
      </tr>
    </thead>
    <tbody>
      ${veiculosFake.map(v => `
        <tr>
          <td><img src="${v.imagem || 'https://via.placeholder.com/48x32?text=Car'}" alt="Miniatura ${v.modelo}" class="admin-thumb"></td>
          <td>${v.id}</td>
          <td>${v.marca}</td>
          <td>${v.modelo}</td>
          <td>${v.ano}</td>
          <td>R$ ${v.preco.toLocaleString('pt-BR')}</td>
          <td>${v.cor}</td>
          <td>${v.km.toLocaleString('pt-BR')}</td>
          <td>
            <button class="admin-action-btn admin-action-edit" title="Editar">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 13.5V16h2.5l7.1-7.1-2.5-2.5L4 13.5zM17.7 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.13 1.13 3.75 3.75 1.13-1.13z" fill="#c9a74a"/></svg>
              <span class="sr-only">Editar</span>
            </button>
            <button class="admin-action-btn admin-action-delete" title="Excluir">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 7v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7M4 7h12M9 3h2a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z" stroke="#c9a74a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span class="sr-only">Excluir</span>
            </button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>`;
  lista.innerHTML = html;
  setupModalVeiculoEvents();
}

