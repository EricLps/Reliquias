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
    const allowEdit = canEdit();

    // Se é adminMaster, mostra um formulário de criação rápida acima da tabela
    try {
      if (allowEdit) {
        const host = document.getElementById('usuarios-lista');
        if (host && !document.getElementById('usuarios-create')) {
          const box = document.createElement('div');
          box.id = 'usuarios-create';
          box.style.margin = '0 0 1rem 0';
          box.innerHTML = `
            <div class="card" style="padding:1rem;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
              <strong>Novo usuário</strong>
              <p style="color:#64748b;font-size:.9rem;margin:.25rem 0 .75rem 0;">Crie usuários comuns e depois promova para admin quando necessário.</p>
              <form id="form-novo-usuario" style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;">
                <input name="nome" placeholder="Nome" required style="grid-column: span 2; padding:.6rem;border:1px solid #cbd5e1;border-radius:8px;" />
                <input name="email" placeholder="E-mail" type="email" required style="padding:.6rem;border:1px solid #cbd5e1;border-radius:8px;" />
                <input name="senha" placeholder="Senha" type="password" required style="padding:.6rem;border:1px solid #cbd5e1;border-radius:8px;" />
                <button class="btn-secondary" style="grid-column: span 2; justify-self:start;">Criar usuário</button>
                <div id="novo-feedback" style="grid-column: span 2; color:#64748b;font-size:.9rem;"></div>
              </form>
            </div>`;
          host.parentElement.insertBefore(box, host);
          const form = box.querySelector('#form-novo-usuario');
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form));
            const r = await fetch(`${API_BASE}/users`, {
              method: 'POST',
              headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
              body: JSON.stringify(data)
            });
            const fb = box.querySelector('#novo-feedback');
            if (r.status === 409) { fb.textContent = 'E-mail já cadastrado.'; return; }
            if (!r.ok) { fb.textContent = 'Não foi possível criar o usuário.'; return; }
            fb.textContent = 'Usuário criado. Atualizando lista...';
            form.reset();
            await renderUsuarios();
          });
        }
      }
    } catch {}
    if (!Array.isArray(users) || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Nenhum usuário.</td></tr>';
      // UI de bootstrap: se o usuário atual for admin (não master), permite criar o adminMaster
      try {
        const s = JSON.parse(localStorage.getItem('session')||'null');
        const isAdminOnly = s && s.role === 'admin';
        if (isAdminOnly) {
          const container = tbody.parentElement.parentElement; // div#usuarios-lista
          const boot = document.createElement('div');
          boot.style.marginTop = '1rem';
          boot.innerHTML = `
            <div class="card" style="padding:1rem;border:1px solid #e2e8f0;border-radius:10px;background:#fff;">
              <strong>Crie o Admin Master</strong>
              <p style="color:#64748b;font-size:.9rem;margin:.25rem 0 .75rem 0;">Nenhum usuário encontrado. Para habilitar a gestão de papéis, crie o adminMaster.</p>
              <form id="form-admin-master" style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;">
                <input name="nome" placeholder="Nome" required style="grid-column: span 2; padding:.6rem;border:1px solid #cbd5e1;border-radius:8px;" />
                <input name="email" placeholder="E-mail" type="email" required style="padding:.6rem;border:1px solid #cbd5e1;border-radius:8px;" />
                <input name="senha" placeholder="Senha" type="password" required style="padding:.6rem;border:1px solid #cbd5e1;border-radius:8px;" />
                <button class="btn-secondary" style="grid-column: span 2; justify-self:start;">Criar adminMaster</button>
                <div id="boot-feedback" style="grid-column: span 2; color:#64748b;font-size:.9rem;"></div>
              </form>
            </div>`;
          container.appendChild(boot);
          const form = boot.querySelector('#form-admin-master');
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form));
            const r = await fetch(`${API_BASE}/users/admin-master`, {
              method: 'POST',
              headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
              body: JSON.stringify(data)
            });
            const fb = boot.querySelector('#boot-feedback');
            if (!r.ok) {
              fb.textContent = 'Não foi possível criar. Verifique os dados ou permissões.';
              return;
            }
            fb.textContent = 'AdminMaster criado. Atualizando lista...';
            await renderUsuarios();
          });
        }
      } catch {}
      return;
    }
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
