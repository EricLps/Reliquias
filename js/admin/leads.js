import { API_BASE } from '../config.js';
function authHeaders(extra={}) {
    const token = localStorage.getItem('token');
    return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

export async function renderLeads() {
    const tbody = document.querySelector('#leads-table tbody');
    if (!tbody) {
        console.error('Elemento tbody não encontrado. Verifique se a tabela foi renderizada corretamente.');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';
    try {
    const resp = await fetch(`${API_BASE}/leads`, { headers: authHeaders() });
    if (resp.status === 401 || resp.status === 403) { window.location.href = 'login.html'; return; }
        const leads = await resp.json();
        if (!Array.isArray(leads) || leads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhum lead encontrado.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        leads.forEach(lead => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lead.nome || ''}</td>
                <td>${lead.email || ''}</td>
                <td>${lead.telefone || ''}</td>
                <td>${lead.mensagem || ''}</td>
                <td>
                    <button class="btn-acao" data-email="${lead.email || ''}">Responder</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar leads.</td></tr>';
    }
}