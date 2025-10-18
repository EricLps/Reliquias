import { renderAdminVeiculos, renderAdminLeads, renderAdminAgendamentos, renderAdminRelatorios } from './adminViews.js';
import { renderLeads } from './leads.js';
import { renderAgendamentos } from './agendamentos.js';
import { API_BASE } from '../config.js';

function ensureAuthenticated() {
  try {
    const sessionRaw = localStorage.getItem('session');
    const isAuthFlag = localStorage.getItem('isAuthenticated');
    const session = sessionRaw ? JSON.parse(sessionRaw) : null;
    if (!session || session.role !== 'admin' || isAuthFlag !== 'true') {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  } catch (e) {
    console.error('Erro ao validar autenticação:', e);
    window.location.href = 'login.html';
    return false;
  }
}


function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

function handleAuthFailure(resp) {
  if (resp && (resp.status === 401 || resp.status === 403)) {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'login.html';
    return true;
  }
  return false;
}

function setActiveNav(hash) {
  document.querySelectorAll('header nav a').forEach(a => a.classList.remove('active'));
  const link = document.querySelector(`header nav a[href='${hash}']`);
  if (link) link.classList.add('active');
}

function renderIntoMain(html, afterRender) {
  const main = document.getElementById('admin-content');
  if (!main) return;
  main.innerHTML = html;
  if (typeof afterRender === 'function') afterRender();
}

function renderAdminPage() {
  if (!ensureAuthenticated()) return;
  const hash = window.location.hash || '#admin-veiculos';
  setActiveNav(hash);
  const main = document.getElementById('admin-content');
  if (hash === '#admin-veiculos') {
    renderIntoMain(renderAdminVeiculos(), () => {
      setupModalVeiculoEvents();
      listarVeiculos();
    });
  } else if (hash === '#admin-leads') {
    renderIntoMain(renderAdminLeads(), () => {
      renderLeads();
    });
  } else if (hash === '#admin-agendamentos') {
    renderIntoMain(renderAdminAgendamentos(), () => {
      renderAgendamentos();
    });
  } else if (hash === '#admin-relatorios') {
    renderIntoMain(renderAdminRelatorios());
  }
  else main.innerHTML = '<p>Página não encontrada.</p>';
}

document.addEventListener('DOMContentLoaded', () => {
  if (!ensureAuthenticated()) return;
  if (!window.location.hash) {
    window.location.hash = '#admin-veiculos';
  }
  renderAdminPage();
});

window.addEventListener('hashchange', renderAdminPage);

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
  if (form.carroceria) form.carroceria.value = dados.carroceria || '';
    form.km.value = dados.km || '';
  if (form.descricaoCurta) form.descricaoCurta.value = dados.descricaoCurta || '';
  if (form.descricao) form.descricao.value = dados.descricao || '';
    form.dataset.editId = dados._id || '';
    const container = document.getElementById('imagens-atuais');
    if (container) {
      container.innerHTML = '';
      (dados.imagens || []).forEach((img) => {
        const wrap = document.createElement('div');
        wrap.className = 'img-item';
        wrap.innerHTML = `
          <span class="badge-principal" style="display:${img.principal ? 'inline-block' : 'none'};">PRINCIPAL</span>
          <img src="${img.url ? img.url : (`${API_BASE}/veiculos/imagem/${img.fileId}`)}" class="preview" alt="imagem">
          ${img.url ? `
            <label><input type="checkbox" class="chk-remover-url" value="${img.url}"> Remover (URL)</label>
            <label><input type="radio" name="principal" class="radio-principal" value="url::${img.url}" ${img.principal ? 'checked' : ''}> Principal</label>
          ` : `
            <label><input type="checkbox" class="chk-remover" value="${img.fileId}"> Remover</label>
            <label><input type="radio" name="principal" class="radio-principal" value="${img.fileId}" ${img.principal ? 'checked' : ''}> Principal</label>
          `}
        `;
        container.appendChild(wrap);
      });
      container.querySelectorAll('.radio-principal').forEach(r => {
        r.addEventListener('change', () => {
          container.querySelectorAll('.img-item').forEach(item => {
            const badge = item.querySelector('.badge-principal');
            const radio = item.querySelector('.radio-principal');
            if (badge) badge.style.display = radio?.checked ? 'inline-block' : 'none';
          });
        });
      });
    }
  } else if (form) {
    form.reset();
    delete form.dataset.editId;
    const container = document.getElementById('imagens-atuais');
    if (container) container.innerHTML = '';
  }
}

function fecharModalVeiculo() {
  const modal = document.getElementById('admin-veiculo-form-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
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

  const formVeiculo = document.getElementById('form-veiculo');
  if (formVeiculo) {
    const precoInput = formVeiculo.querySelector('input[name="preco"]');
    const kmInput = formVeiculo.querySelector('input[name="km"]');

    const formatMoneyBR = (value) => {
      const num = Number(value);
      if (!isFinite(num)) return '0,00';
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    const parseMoneyBR = (str) => {
      if (!str) return 0;
      const cleaned = String(str).replace(/\./g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
      const n = parseFloat(cleaned);
      return isNaN(n) ? 0 : n;
    };
    const formatIntBR = (value) => {
      const n = parseInt(value, 10);
      if (!isFinite(n)) return '0';
      return n.toLocaleString('pt-BR');
    };
    const parseIntBR = (str) => {
      if (!str) return 0;
      const cleaned = String(str).replace(/\D/g, '');
      const n = parseInt(cleaned, 10);
      return isNaN(n) ? 0 : n;
    };

    if (precoInput) {
      // Permite digitação livre com dígitos, ponto e vírgula
      precoInput.addEventListener('input', () => {
        precoInput.value = precoInput.value.replace(/[^0-9.,]/g, '');
      });
      // Formata somente ao sair do campo
      precoInput.addEventListener('blur', () => {
        const n = parseMoneyBR(precoInput.value);
        precoInput.value = formatMoneyBR(n);
      });
    }
    if (kmInput) {
      kmInput.addEventListener('input', () => {
        kmInput.value = kmInput.value.replace(/\D/g, '');
      });
      kmInput.addEventListener('blur', () => {
        const n = parseIntBR(kmInput.value);
        kmInput.value = formatIntBR(n);
      });
    }

    formVeiculo.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(formVeiculo);
      // Normalizar números para o backend
      const precoNumber = parseMoneyBR(precoInput ? precoInput.value : '0');
      const kmNumber = parseIntBR(kmInput ? kmInput.value : '');
      if (precoInput) formData.set('preco', String(precoNumber));
      if (kmInput && kmInput.value) formData.set('km', String(kmNumber));
      const editId = formVeiculo.dataset.editId;
  const removals = Array.from(document.querySelectorAll('#imagens-atuais .chk-remover:checked')).map(i => i.value);
  const removalsUrl = Array.from(document.querySelectorAll('#imagens-atuais .chk-remover-url:checked')).map(i => i.value);
  const principalChecked = (document.querySelector('#imagens-atuais .radio-principal:checked') || {}).value;
  const principalSel = principalChecked && principalChecked.startsWith('url::') ? null : principalChecked;
  const principalUrl = principalChecked && principalChecked.startsWith('url::') ? principalChecked.replace('url::','') : null;
  const imagemUrl = formData.get('imagemUrl');
  const imagensUrls = formData.get('imagensUrls');
      try {
        let resp;
        const hasNewImages = (formData.getAll('imagens') || []).some(v => v && typeof v !== 'string');
        if (editId) {
          if (hasNewImages || removals.length || removalsUrl.length || principalSel || principalUrl || imagemUrl || imagensUrls) {
            const fd = new FormData();
            const campos = ['marca','modelo','ano','preco','cor','carroceria','km','descricao','descricaoCurta'];
            campos.forEach(k => { const v = formData.get(k); if (v !== null && v !== undefined && v !== '') fd.append(k, v); });
            if (removals.length) fd.append('removeImages', JSON.stringify(removals));
            if (removalsUrl.length) fd.append('removeImageUrls', JSON.stringify(removalsUrl));
            if (principalSel) fd.append('principalFileId', principalSel);
            if (principalUrl) fd.append('principalUrl', principalUrl);
            if (imagemUrl) fd.append('imagemUrl', imagemUrl);
            if (imagensUrls) fd.append('addImageUrls', JSON.stringify(String(imagensUrls).split(',').map(s=>s.trim()).filter(Boolean)));
            const newImgs = formData.getAll('imagens');
            newImgs.forEach(f => { if (f && typeof f !== 'string') fd.append('imagens', f); });
            resp = await fetch(`${API_BASE}/veiculos/${editId}`, { method: 'PUT', headers: authHeaders(), body: fd });
          } else {
            // Apenas campos, sem imagens
            const payload = Object.fromEntries(formData);
            if (payload.preco !== undefined) payload.preco = precoNumber;
            if (payload.km !== undefined) payload.km = kmNumber;
            if (payload.ano !== undefined) payload.ano = Number(payload.ano);
            // Mantém descricao/descricaoCurta conforme digitado
            resp = await fetch(`${API_BASE}/veiculos/${editId}`, {
              method: 'PUT',
              headers: authHeaders({ 'Content-Type': 'application/json' }),
              body: JSON.stringify(payload)
            });
          }
        } else {
          // Criação (multipart) + URLs
          if (imagemUrl) formData.set('imagemUrl', imagemUrl);
          if (imagensUrls) formData.set('imagensUrls', JSON.stringify(String(imagensUrls).split(',').map(s=>s.trim()).filter(Boolean)));
          resp = await fetch(`${API_BASE}/veiculos`, { method: 'POST', headers: authHeaders(), body: formData });
        }
        if (handleAuthFailure(resp)) return;
        if (!resp.ok) {
          let msg = 'Falha ao salvar veículo';
          try { const j = await resp.json(); if (j?.error) msg = msg + `: ${j.error}`; } catch(_){}
          throw new Error(msg);
        }
        await listarVeiculos();
        fecharModalVeiculo();
        formVeiculo.reset();
        delete formVeiculo.dataset.editId;
      } catch (e) {
        console.error(e);
        alert(e?.message || 'Erro ao salvar veículo.');
      }
    });
  }
}

// Buscar e renderizar veículos
async function listarVeiculos() {
  const lista = document.getElementById('admin-veiculos-lista');
  if (!lista) return;
  try {
    const resp = await fetch(`${API_BASE}/veiculos`, { headers: { Accept: 'application/json' } });
    if (!resp.ok) {
      if (handleAuthFailure(resp)) return;
      let msg = `Falha ao carregar veículos (HTTP ${resp.status})`;
      try { const j = await resp.json(); if (j?.error) msg += `: ${j.error}`; } catch {}
      throw new Error(msg);
    }
    const veiculos = await resp.json();
    renderTabelaVeiculos(veiculos);
  } catch (e) {
    console.error('Erro ao buscar veículos:', e);
    lista.innerHTML = `<p>Erro ao carregar veículos. ${e?.message ? '('+e.message+')' : ''}</p>`;
  }
}

function renderTabelaVeiculos(veiculos = []) {
  const lista = document.getElementById('admin-veiculos-lista');
  if (!lista) return;
  let html = `<table class="admin-table">
    <thead>
      <tr>
        <th></th><th>ID</th><th>Marca</th><th>Modelo</th><th>Ano</th><th>Preço</th><th>Cor</th><th>KM</th><th>Ações</th>
      </tr>
    </thead>
    <tbody>
      ${veiculos.map(v => `
        <tr>
          <td><img src="${(v.imagens && v.imagens[0]) ? (v.imagens[0].url ? v.imagens[0].url : `${API_BASE}/veiculos/imagem/${v.imagens[0].fileId}`) : 'https://via.placeholder.com/48x32?text=Car'}" alt="Miniatura ${v.modelo}" class="admin-thumb"></td>
          <td>${v._id || ''}</td>
          <td>${v.marca}</td>
          <td>${v.modelo}</td>
          <td>${v.ano}</td>
          <td>R$ ${(Number(v.preco)||0).toLocaleString('pt-BR')}</td>
          <td>${v.cor || ''}</td>
          <td>${(Number(v.km)||0).toLocaleString('pt-BR')}</td>
          <td>
            <button class="admin-action-btn admin-action-edit" data-id="${v._id}" title="Editar">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 13.5V16h2.5l7.1-7.1-2.5-2.5L4 13.5zM17.7 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.13 1.13 3.75 3.75 1.13-1.13z" fill="#c9a74a"/></svg>
              <span class="sr-only">Editar</span>
            </button>
            <button class="admin-action-btn admin-action-delete" data-id="${v._id}" title="Excluir">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 7v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7M4 7h12M9 3h2a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z" stroke="#c9a74a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span class="sr-only">Excluir</span>
            </button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>`;
  lista.innerHTML = html;
  // Bind excluir
  lista.querySelectorAll('.admin-action-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!id) return;
      if (!confirm('Excluir este veículo?')) return;
      try {
        const resp = await fetch(`${API_BASE}/veiculos/${id}`, { method: 'DELETE', headers: authHeaders() });
        if (handleAuthFailure(resp)) return;
        if (!resp.ok) throw new Error('Falha ao excluir veículo');
        await listarVeiculos();
      } catch (e) {
        console.error(e);
        alert('Erro ao excluir veículo.');
      }
    });
  });
  // Bind editar
  lista.querySelectorAll('.admin-action-edit').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (!id) return;
      try {
  const resp = await fetch(`${API_BASE}/veiculos/${id}`);
        if (!resp.ok) throw new Error('Falha ao carregar veículo');
        const dados = await resp.json();
        abrirModalVeiculo(true, dados);
      } catch (e) {
        console.error(e);
        alert('Erro ao carregar dados do veículo.');
      }
    });
  });
}

