import { API_BASE } from '../config.js';
function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

let __ag_cache = [];

function applyFilters(lista, container) {
  const fTipo = container.querySelector('#f-tipo')?.value || 'all';
  const fStatus = container.querySelector('#f-status')?.value || 'all';
  const fPrio = container.querySelector('#f-prio')?.value || 'all';
  const fRange = container.querySelector('#f-range')?.value || 'all';
  let out = [...lista];
  if (fTipo !== 'all') out = out.filter(x => (x.tipo || 'outro') === fTipo);
  if (fStatus !== 'all') out = out.filter(x => (x.status || 'pendente') === fStatus);
  if (fPrio !== 'all') out = out.filter(x => (x.prioridade || 'azul') === fPrio);
  if (fRange !== 'all') {
    const now = new Date();
    let end = null;
    if (fRange === '7') end = new Date(now.getTime() + 7*24*60*60*1000);
    if (fRange === '30') end = new Date(now.getTime() + 30*24*60*60*1000);
    if (end) out = out.filter(x => x.dataHora && new Date(x.dataHora) <= end && new Date(x.dataHora) >= now);
  }
  return out;
}

function openEditModal(item, container) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" aria-label="Fechar">&times;</button>
      <h3 style="margin-top:0">Editar agendamento</h3>
      <form id="ag-edit-form" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
        <label>Título<input type="text" name="titulo" value="${item.titulo || ''}"></label>
        <label>Tipo
          <select name="tipo" value="${item.tipo || 'outro'}">
            <option value="test-drive" ${item.tipo==='test-drive'?'selected':''}>Test-Drive</option>
            <option value="vistoria" ${item.tipo==='vistoria'?'selected':''}>Vistoria</option>
            <option value="evento" ${item.tipo==='evento'?'selected':''}>Evento</option>
            <option value="outro" ${!item.tipo||item.tipo==='outro'?'selected':''}>Outro</option>
          </select>
        </label>
        <label>Prioridade
          <select name="prioridade">
            <option value="azul" ${!item.prioridade||item.prioridade==='azul'?'selected':''}>Azul</option>
            <option value="amarelo" ${item.prioridade==='amarelo'?'selected':''}>Amarelo</option>
            <option value="vermelho" ${item.prioridade==='vermelho'?'selected':''}>Vermelho</option>
          </select>
        </label>
        <label>Status
          <select name="status">
            <option value="pendente" ${!item.status||item.status==='pendente'?'selected':''}>Pendente</option>
            <option value="confirmado" ${item.status==='confirmado'?'selected':''}>Confirmado</option>
            <option value="cancelado" ${item.status==='cancelado'?'selected':''}>Cancelado</option>
          </select>
        </label>
        <label>Nome<input type="text" name="nome" value="${item.nome || ''}"></label>
        <label>Telefone<input type="text" name="telefone" value="${item.telefone || ''}"></label>
        <label style="grid-column:1/-1;">Data/Hora<input type="datetime-local" name="dataHora" value="${item.dataHora ? new Date(item.dataHora).toISOString().slice(0,16) : ''}"></label>
        <label style="grid-column:1/-1;">Notas<input type="text" name="notas" value="${item.notas || ''}"></label>
        <div style="grid-column:1/-1;display:flex;gap:8px;margin-top:6px;">
          <button type="submit" class="admin-add-btn">Salvar</button>
          <button type="button" id="ag-edit-cancel" class="admin-add-btn" style="background:#eee;color:#333;">Cancelar</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(modal);
  const close = () => { modal.remove(); };
  modal.querySelector('.modal-close').onclick = close;
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.querySelector('#ag-edit-cancel').onclick = close;
  modal.querySelector('#ag-edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      const resp = await fetch(`${API_BASE}/agendamentos/${item._id}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!resp.ok) throw new Error('Falha ao salvar alterações');
      close();
      await renderAgendamentos();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar.');
    }
  });
}

function bindFilters(container) {
  ['#f-tipo','#f-status','#f-prio','#f-range'].forEach(sel => {
    const el = container.querySelector(sel);
    if (el) el.addEventListener('change', () => {
      const tbody = container.querySelector('tbody');
      renderRows(applyFilters(__ag_cache, container), tbody);
    });
  });
  const btnClear = container.querySelector('#f-clear');
  if (btnClear) btnClear.addEventListener('click', () => {
    container.querySelector('#f-tipo').value = 'all';
    container.querySelector('#f-status').value = 'all';
    container.querySelector('#f-prio').value = 'all';
    container.querySelector('#f-range').value = 'all';
    const tbody = container.querySelector('tbody');
    renderRows(__ag_cache, tbody);
  });
}

function renderRows(lista, tbody) {
  if (!Array.isArray(lista) || lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">Nenhum agendamento registrado.</td></tr>';
    return;
  }
  tbody.innerHTML = '';
  lista.forEach(item => {
    const tr = document.createElement('tr');
    const dt = item.dataHora ? new Date(item.dataHora) : null;
    const prioridadeDot = `<span class="ag-dot ag-${item.prioridade || 'azul'}"></span>`;
    tr.innerHTML = `
      <td>${dt ? dt.toLocaleString('pt-BR') : ''}</td>
      <td>
        <div><strong>${item.titulo || '(sem título)'}</strong></div>
        <small>${item.tipo || 'outro'}</small>
      </td>
      <td>
        <div>${item.nome || ''}</div>
        <small>${item.telefone || ''}</small>
      </td>
      <td>${prioridadeDot} ${item.prioridade || 'azul'}</td>
      <td><small>${item.origem || ''}</small></td>
      <td>
        <span class="ag-status">${item.status || 'pendente'}</span>
      </td>
      <td>
        <div class="ag-actions">
          <button class="btn-acao" data-id="${item._id}" data-st="confirmado">Confirmar</button>
          <button class="btn-acao" data-id="${item._id}" data-st="cancelado">Cancelar</button>
          <button class="btn-edit" data-id="${item._id}">Editar</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  // Binds
  tbody.querySelectorAll('.ag-actions .btn-acao').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const st = btn.getAttribute('data-st');
      try {
        const resp = await fetch(`${API_BASE}/agendamentos/${id}/status`, {
          method: 'PATCH',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ status: st })
        });
        if (!resp.ok) throw new Error('Falha ao atualizar status');
        await renderAgendamentos();
      } catch (e) {
        console.error(e);
        alert('Não foi possível atualizar o status.');
      }
    });
  });
  tbody.querySelectorAll('.ag-actions .btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = __ag_cache.find(x => x._id === id);
      if (item) openEditModal(item, document.querySelector('#admin-agendamentos-lista'));
    });
  });
}

export async function renderAgendamentos() {
    const container = document.querySelector('#admin-agendamentos-lista');
    if (!container) return;
    container.innerHTML = `
    <section class="admin-agenda">
      <div class="ag-header">
        <h3>Agenda / Agendamentos</h3>
        <button type="button" id="ag-novo" class="admin-add-btn">Novo agendamento</button>
      </div>
  <div class="ag-filters">
        <label>Tipo
          <select id="f-tipo">
            <option value="all">Todos</option>
            <option value="test-drive">Test-Drive</option>
            <option value="vistoria">Vistoria</option>
            <option value="evento">Evento</option>
            <option value="outro">Outro</option>
          </select>
        </label>
        <label>Status
          <select id="f-status">
            <option value="all">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </label>
        <label>Prioridade
          <select id="f-prio">
            <option value="all">Todas</option>
            <option value="azul">Azul</option>
            <option value="amarelo">Amarelo</option>
            <option value="vermelho">Vermelho</option>
          </select>
        </label>
        <label>Período
          <select id="f-range">
            <option value="all">Todos</option>
            <option value="7">Próximos 7 dias</option>
            <option value="30">Próximos 30 dias</option>
          </select>
        </label>
        <div class="ag-actions-inline">
          <button type="button" id="f-clear" class="btn-ghost">Limpar</button>
        </div>
      </div>
      <form id="ag-form" class="ag-form">
        <label> Tipo
          <select name="tipo">
            <option value="test-drive">Test-Drive</option>
            <option value="vistoria">Vistoria</option>
            <option value="evento">Evento</option>
            <option value="outro">Outro</option>
          </select>
        </label>
        <label> Prioridade
          <select name="prioridade">
            <option value="azul">Azul (baixa)</option>
            <option value="amarelo">Amarelo (média)</option>
            <option value="vermelho">Vermelho (alta)</option>
          </select>
        </label>
        <label> Título
          <input type="text" name="titulo" placeholder="ex.: Test-drive do João">
        </label>
        <label> Nome
          <input type="text" name="nome" placeholder="Nome do cliente/contato">
        </label>
        <label> Telefone
          <input type="text" name="telefone" placeholder="(xx) xxxxx-xxxx">
        </label>
        <label> Data/Hora
          <input type="datetime-local" name="dataHora" required>
        </label>
        <label class="ag-notas"> Notas
          <input type="text" name="notas" placeholder="Observações, veículo, etc.">
        </label>
        <div class="ag-form-actions">
          <button type="submit" class="btn-primary">Adicionar</button>
          <button type="button" id="ag-recarregar" class="btn-ghost">Recarregar</button>
        </div>
      </form>

      <table id="agendamentos-table" class="admin-table">
        <thead>
          <tr>
            <th>Quando</th>
            <th>Título/Tipo</th>
            <th>Contato</th>
            <th>Prioridade</th>
            <th>Origem</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody><tr><td colspan="7">Carregando...</td></tr></tbody>
      </table>
    </section>
    `;
  const tbody = container.querySelector('tbody');
  const form = container.querySelector('#ag-form');
  const btnReload = container.querySelector('#ag-recarregar');
  const btnNovo = container.querySelector('#ag-novo');
    try {
        const resp = await fetch(`${API_BASE}/agendamentos`, { headers: authHeaders() });
        if (resp.status === 401 || resp.status === 403) { window.location.href = 'login.html'; return; }
        __ag_cache = await resp.json();
        bindFilters(container);
        renderRows(applyFilters(__ag_cache, container), tbody);
        // Ação: Novo agendamento (preset + scroll)
        if (btnNovo) {
          btnNovo.addEventListener('click', () => {
            if (!form) return;
            form.reset();
            // padrões úteis
            if (form.tipo) form.tipo.value = 'test-drive';
            if (form.prioridade) form.prioridade.value = 'azul';
            // próxima hora (minutos zerados)
            const now = new Date();
            const next = new Date(now.getTime() + 60*60*1000);
            next.setMinutes(0,0,0);
            const localISO = new Date(next.getTime() - next.getTimezoneOffset()*60000).toISOString().slice(0,16);
            const dh = form.querySelector('input[name="dataHora"]');
            if (dh) dh.value = localISO;
            const titulo = form.querySelector('input[name="titulo"]');
            if (titulo) titulo.focus();
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }
        // Submit do formulário
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(form));
          if (!data.dataHora) { alert('Informe a data/hora'); return; }
          try {
            const resp = await fetch(`${API_BASE}/agendamentos/admin`, {
              method: 'POST',
              headers: authHeaders({ 'Content-Type': 'application/json' }),
              body: JSON.stringify(data)
            });
            if (!resp.ok) throw new Error('Falha ao criar agendamento');
            form.reset();
            await renderAgendamentos();
          } catch (err) {
            console.error(err);
            alert('Erro ao criar agendamento.');
          }
        });
        // Recarregar manual
        btnReload.addEventListener('click', () => renderAgendamentos());
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar agendamentos.</td></tr>';
    }
}

