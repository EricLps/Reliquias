const API_BASE = 'http://localhost:4000/api';
function authHeaders(extra = {}) {
    const token = localStorage.getItem('token');
    return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

export async function renderAgendamentos() {
    const container = document.querySelector('#admin-agendamentos-lista');
    if (!container) return;
    container.innerHTML = `
    <table id="agendamentos-table" class="admin-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Telefone</th>
          <th>Data/Hora</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody><tr><td colspan="5">Carregando...</td></tr></tbody>
    </table>
  `;
    const tbody = container.querySelector('tbody');
    try {
        const resp = await fetch(`${API_BASE}/agendamentos`, { headers: authHeaders() });
        if (resp.status === 401 || resp.status === 403) { window.location.href = 'login.html'; return; }
        const lista = await resp.json();
        if (!Array.isArray(lista) || lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhum agendamento registrado.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        lista.forEach(item => {
            const tr = document.createElement('tr');
            const dt = item.dataHora ? new Date(item.dataHora) : null;
            tr.innerHTML = `
        <td>${item.nome || ''}</td>
        <td>${item.email || ''}</td>
        <td>${item.telefone || ''}</td>
        <td>${dt ? dt.toLocaleString('pt-BR') : ''}</td>
        <td>
          <span class="ag-status">${item.status || 'pendente'}</span>
          <div class="ag-actions">
            <button class="btn-acao" data-id="${item._id}" data-st="confirmado">Confirmar</button>
            <button class="btn-acao" data-id="${item._id}" data-st="cancelado">Cancelar</button>
          </div>
        </td>
      `;
            tbody.appendChild(tr);
        });
        // Binds de ações
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
                    if (resp.status === 401 || resp.status === 403) { window.location.href = 'login.html'; return; }
                    if (!resp.ok) throw new Error('Falha ao atualizar status');
                    await renderAgendamentos();
                } catch (e) {
                    console.error(e);
                    alert('Não foi possível atualizar o status.');
                }
            });
        });
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar agendamentos.</td></tr>';
    }
}
