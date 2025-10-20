import { API_BASE } from '../config.js';

function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

function canEdit() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    return session && session.role === 'adminMaster';
  } catch {
    return false;
  }
}

export async function renderUsuarios() {
  const tbody = document.querySelector('#usuarios-lista tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';
  try {
    const resp = await fetch(`${API_BASE}/users`, { headers: authHeaders({ Accept: 'application/json' }) });
    if (resp.status === 401) { window.location.href = 'login.html'; return; }
    if (!resp.ok) throw new Error('Falha ao carregar usuários');
    const users = await resp.json();
    if (!Array.isArray(users) || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Nenhum usuário.</td></tr>';
      return;
    }
    const allowEdit = canEdit();
    tbody.innerHTML = '';
    users.forEach(u => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${u.nome || ''}</td>
        <td>${u.email || ''}</td>
        <td><span class="badge ${u.role==='adminMaster'?'badge-confirmado':(u.role==='admin'?'badge-pendente':'badge-default')}">${u.role}</span></td>
        <td>
          ${allowEdit && u.role !== 'adminMaster' ? `
            <button class="btn-secondary promote-admin" data-id="${u._id}">Tornar admin</button>
            <button class="btn-secondary revoke-admin" data-id="${u._id}" ${u.role==='user'?'disabled':''}>Rebaixar para user</button>
          ` : '<span style="color:#94a3b8;">—</span>'}
        </td>
      `;
      tbody.appendChild(row);

      if (allowEdit && u.role !== 'adminMaster') {
        const promote = row.querySelector('.promote-admin');
        if (promote) promote.addEventListener('click', async () => {
          try {
            const r = await fetch(`${API_BASE}/users/${u._id}/role`, {
              method: 'PATCH',
              headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
              body: JSON.stringify({ role: 'admin' })
            });
            if (!r.ok) throw new Error('Falha ao promover');
            await renderUsuarios();
          } catch (e) { alert('Não foi possível promover.'); }
        });
        const revoke = row.querySelector('.revoke-admin');
        if (revoke) revoke.addEventListener('click', async () => {
          try {
            const r = await fetch(`${API_BASE}/users/${u._id}/role`, {
              method: 'PATCH',
              headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
              body: JSON.stringify({ role: 'user' })
            });
            if (!r.ok) throw new Error('Falha ao rebaixar');
            await renderUsuarios();
          } catch (e) { alert('Não foi possível rebaixar.'); }
        });
      }
    });
  } catch (e) {
    console.error(e);
    tbody.innerHTML = '<tr><td colspan="4">Erro ao carregar usuários.</td></tr>';
  }
}
