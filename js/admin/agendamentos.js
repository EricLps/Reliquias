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
    const status = item.status || 'pendente';
    const statusClass = `badge badge-${status}`;
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
        <span class="${statusClass}">${status}</span>
      </td>
      <td>
        <div class="ag-actions">
          <button class="btn-secondary btn-icon btn-acao" title="Confirmar" aria-label="Confirmar" data-id="${item._id}" data-st="confirmado">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="#0f2747" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="btn-ghost btn-icon btn-acao" title="Cancelar" aria-label="Cancelar" data-id="${item._id}" data-st="cancelado">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="#0f2747" stroke-width="1.8" stroke-linecap="round"/></svg>
          </button>
          <button class="btn-ghost btn-icon btn-edit" title="Editar" aria-label="Editar" data-id="${item._id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9" stroke="#0f2747" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#0f2747" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </button>
          <button class="btn-danger btn-icon btn-delete" title="Excluir" aria-label="Excluir" data-id="${item._id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18" stroke="#991b1b" stroke-width="1.8" stroke-linecap="round"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#991b1b" stroke-width="1.5"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#991b1b" stroke-width="1.5"/><path d="M10 11v6M14 11v6" stroke="#991b1b" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
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
  tbody.querySelectorAll('.ag-actions .btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = (btn.getAttribute('data-id') || '').trim();
      if (!id) return;
      if (!confirm('Excluir este agendamento? Esta ação não pode ser desfeita.')) return;
      try {
        const resp = await fetch(`${API_BASE}/agendamentos/${id}`, { method: 'DELETE', headers: authHeaders() });
        if (!resp.ok) {
          let msg = 'Falha ao excluir';
          try { const j = await resp.json(); if (j?.error) msg = `${msg}: ${j.error}`; } catch {}
          throw new Error(msg);
        }
        await renderAgendamentos();
      } catch (e) {
        console.error(e);
        alert(e?.message || 'Não foi possível excluir.');
      }
    });
  });
}

export async function renderAgendamentos() {
    const container = document.querySelector('#admin-agendamentos-lista');
    if (!container) return;
    container.innerHTML = `
    <section class="admin-agenda">
      <div class="ag-container">
      <div class="ag-header">
        <h3>Agenda / Agendamentos</h3>
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
      <form id="ag-form" class="ag-form ag-form-table">
        <div class="ag-row">
          <div class="ag-cell">
            <label>Tipo</label>
            <select name="tipo">
              <option value="test-drive">Test-Drive</option>
              <option value="vistoria">Vistoria</option>
              <option value="evento">Evento</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div class="ag-cell">
            <label>Prioridade</label>
            <select name="prioridade">
              <option value="azul">Azul (baixa)</option>
              <option value="amarelo">Amarelo (média)</option>
              <option value="vermelho">Vermelho (alta)</option>
            </select>
          </div>
          <div class="ag-cell ag-span-2">
            <label>Título</label>
            <input type="text" name="titulo" placeholder="ex.: Test-drive do João">
          </div>
        </div>

        <div class="ag-row">
          <div class="ag-cell">
            <label>Nome</label>
            <input type="text" name="nome" placeholder="Nome do cliente/contato">
          </div>
          <div class="ag-cell">
            <label>Telefone</label>
            <input type="text" name="telefone" placeholder="(xx) xxxxx-xxxx">
          </div>
          <div class="ag-cell ag-datetime">
            <label>Data/Hora</label>
            <div class="input-group">
              <input type="datetime-local" name="dataHora" required>
              <button type="button" class="append calendar-btn" title="Escolher data/hora" aria-label="Escolher data/hora">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2v2M17 2v2M4 7h16M5 11h14M5 16h8" stroke="#0f2747" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="ag-row">
          <div class="ag-cell ag-span-3">
            <label>Notas</label>
            <input type="text" name="notas" placeholder="Observações, veículo, etc.">
          </div>
        </div>

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
      </div>
    </section>
    `;
  const tbody = container.querySelector('tbody');
  const form = container.querySelector('#ag-form');
  const btnReload = container.querySelector('#ag-recarregar');
    try {
        const resp = await fetch(`${API_BASE}/agendamentos`, { headers: authHeaders() });
        if (resp.status === 401 || resp.status === 403) { window.location.href = 'login.html'; return; }
        __ag_cache = await resp.json();
        bindFilters(container);
        renderRows(applyFilters(__ag_cache, container), tbody);
        // Botão de calendário: abre o seletor nativo
        container.querySelectorAll('.calendar-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const input = btn.closest('.input-group')?.querySelector('input[type="datetime-local"]');
            if (input && typeof input.showPicker === 'function') input.showPicker(); else input?.focus();
          });
        });
        // Define alguns padrões úteis ao carregar (para facilitar o preenchimento)
        if (form) {
          if (form.tipo) form.tipo.value = form.tipo.value || 'test-drive';
          if (form.prioridade) form.prioridade.value = form.prioridade.value || 'azul';
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

