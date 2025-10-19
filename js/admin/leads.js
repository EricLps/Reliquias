import { API_BASE, buildWhatsAppLink } from '../config.js';
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
    tbody.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';
    try {
    const resp = await fetch(`${API_BASE}/leads`, { headers: authHeaders() });
    if (resp.status === 401 || resp.status === 403) { window.location.href = 'login.html'; return; }
        const leads = await resp.json();
        if (!Array.isArray(leads) || leads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Nenhum lead encontrado.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        leads.forEach(lead => {
            const row = document.createElement('tr');
                        const when = lead.dataHora ? new Date(lead.dataHora).toLocaleString('pt-BR') : '';
                        const firstName = (lead.nome || '').trim().split(/\s+/)[0] || '';
                        const motivoMsgRaw = (lead.mensagem || '').trim();
                        const motivoMsg = motivoMsgRaw.length > 140 ? `${motivoMsgRaw.slice(0,137)}...` : motivoMsgRaw;
                        const motivo = lead.interesseTestDrive
                            ? `seu interesse em agendar um test-drive${when ? ` em ${when}` : ''}`
                            : (motivoMsg ? `sua mensagem: "${motivoMsg}"` : 'seu contato');
                        const waMsg = `Olá ${firstName}! Aqui é da Relíquias (JELLI Group). Recebemos ${motivo}. Podemos te ajudar?`;
                        const waLink = buildWhatsAppLink(waMsg, lead.telefone || '');
            row.innerHTML = `
                <td>${lead.nome || ''}</td>
                <td>${lead.email || ''}</td>
                <td>${lead.telefone || ''}</td>
                <td>${lead.mensagem || ''}</td>
                <td>${lead.interesseTestDrive ? `<span class="badge badge-confirmado">Test-drive${when?` • ${when}`:''}</span>` : '<span class="badge badge-pendente">Contato</span>'}</td>
                <td>
                  <a class="btn-secondary" href="${waLink}" target="_blank" rel="noopener" title="Abrir WhatsApp">WhatsApp</a>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar leads.</td></tr>';
    }
}