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
  // Define o hash inicial se não houver
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

// Funções para gerenciar o modal de cadastro/edição de veículos
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
  }
}

function fecharModalVeiculo() {
  const modal = document.getElementById('admin-veiculo-form-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function renderModalVeiculo() {
  const modalHTML = `
    <div id="admin-veiculo-form-modal" class="modal" style="display:none">
      <form id="form-veiculo" class="admin-form-modal">
        <h3 id="modal-titulo">Cadastrar Veículo</h3>
        <label>Marca<input type="text" name="marca" required maxlength="32"></label>
        <label>Modelo<input type="text" name="modelo" required maxlength="32"></label>
        <label>Ano<input type="number" name="ano" required min="1900" max="2100"></label>
        <label>Preço (R$)<input type="number" name="preco" required min="0" step="100"></label>
        <label>Cor<input type="text" name="cor" maxlength="24"></label>
        <label>KM<input type="number" name="km" min="0" step="100"></label>
        <label>Foto<input type="file" name="foto" accept="image/*"></label>
        <div class="admin-form-modal-actions">
          <button type="submit" class="botao-comprar admin-add-btn" id="btn-salvar-veiculo">Salvar</button>
          <button type="button" class="admin-add-btn" id="btn-cancelar-veiculo">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  const body = document.querySelector('body');
  body.insertAdjacentHTML('beforeend', modalHTML);
}

function setupModalVeiculoEvents() {
  const btnAdd = document.getElementById('btn-add-veiculo');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => abrirModalVeiculo(false));
  }

  const btnCancel = document.getElementById('btn-cancelar-veiculo');
  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      const modal = document.getElementById('admin-veiculo-form-modal');
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  const modal = document.getElementById('admin-veiculo-form-modal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

  // Evento de envio do formulário do modal
  const formVeiculo = document.getElementById('form-veiculo');
  if (formVeiculo) {
    formVeiculo.addEventListener('submit', (event) => {
      event.preventDefault(); // Previne o comportamento padrão do formulário

      const formData = new FormData(formVeiculo);
      const foto = formData.get('foto'); // Captura o arquivo enviado

      if (foto && foto instanceof File) {
        console.log('Arquivo selecionado:', foto.name);
        // Lógica para enviar o arquivo ao servidor ou exibir uma pré-visualização
      } else {
        console.error('Nenhum arquivo foi selecionado ou o arquivo é inválido.');
      }

      fecharModalVeiculo(); // Fecha o modal após o envio
    });
  }
}

// Renderiza a tabela de veículos
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

// Renderiza o modal ao carregar a página
renderModalVeiculo();
setupModalVeiculoEvents();

//exibir miniatura e gerenciar imagem
const fotoInput = document.querySelector('input[name="foto"]');
const fotoContainer = document.createElement('div');
fotoContainer.className = 'foto-container';

const previewImg = document.createElement('img');
previewImg.className = 'preview-img';

const removeBtn = document.createElement('button');
removeBtn.className = 'remove-btn';
removeBtn.textContent = 'Remover';

removeBtn.addEventListener('click', () => {
  previewImg.src = '';
  previewImg.style.display = 'none';
  removeBtn.style.display = 'none';
  fotoInput.value = '';
});

fotoInput.style.display = 'none';
fotoInput.style.opacity = '0';
fotoInput.style.position = 'absolute';
fotoInput.style.zIndex = '-1';

const customBtn = document.createElement('button');
customBtn.textContent = 'Selecionar um arquivo';
customBtn.className = 'custom-file-btn';

customBtn.addEventListener('mouseover', () => {
  customBtn.classList.add('hover');
});

customBtn.addEventListener('mouseout', () => {
  customBtn.classList.remove('hover');
});

customBtn.addEventListener('click', (e) => {
  e.preventDefault();
  fotoInput.click();
});

fotoInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewImg.style.display = 'block';
      removeBtn.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

fotoContainer.appendChild(customBtn);
fotoContainer.appendChild(previewImg);
fotoContainer.appendChild(removeBtn);

const fotoLabel = fotoInput.closest('label');
if (fotoLabel) {
  fotoLabel.classList.add('foto-label');
  fotoLabel.appendChild(fotoContainer);
}

