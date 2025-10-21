import { API_BASE, buildWhatsAppLink } from '../config.js';
import { showToast } from './ui.js';
function authHeaders(extra={}) {
    const token = localStorage.getItem('token');
    return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

function handleAuthFailure(resp) {
    if (!resp) return false;
    if (resp.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        window.location.href = 'login.html';
        return true;
    }
    if (resp.status === 403) {
        alert('Sem permissão para esta ação.');
        return true;
    }
    return false;
}

async function concluirLead(id) {
    const resp = await fetch(`${API_BASE}/leads/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
        body: JSON.stringify({ status: 'concluido' })
    });
    if (handleAuthFailure(resp)) return null;
    if (!resp.ok) throw new Error('Falha ao concluir lead');
    return await resp.json();
}

async function excluirLead(id) {
    const resp = await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (handleAuthFailure(resp)) return false;
    if (resp.status === 204) return true;
    throw new Error('Falha ao excluir lead');
}

async function agendarTestDrive(lead) {
    // Usa rota admin de agendamentos para criar um evento do tipo 'test-drive'
    const payload = {
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        titulo: `Test-drive: ${lead.nome}`,
        tipo: 'test-drive',
        prioridade: 'amarelo',
        dataHora: lead.dataHora || null,
        status: 'pendente',
        notas: lead.mensagem || '',
        leadId: lead._id || undefined
    };
    const resp = await fetch(`${API_BASE}/agendamentos/admin`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
        body: JSON.stringify(payload)
    });
    if (handleAuthFailure(resp)) return null;
    if (!resp.ok) throw new Error('Falha ao criar agendamento');
    const ag = await resp.json();
    // Se criou, atrela ao lead
    try {
        if (ag && ag._id && lead && lead._id) {
            await fetch(`${API_BASE}/leads/${lead._id}`, {
                method: 'PATCH',
                headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
                body: JSON.stringify({ agendamentoId: ag._id })
            });
        }
    } catch (_) { /* não bloqueia UX */ }
    return ag;
}

export async function renderLeads() {
    const tbody = document.querySelector('#leads-table tbody');
    if (!tbody) {
        console.error('Elemento tbody não encontrado. Verifique se a tabela foi renderizada corretamente.');
        return;
    }
    tbody.innerHTML = '<tr><td colspan="7">Carregando...</td></tr>';
    try {
        const resp = await fetch(`${API_BASE}/leads`, { headers: authHeaders({ Accept: 'application/json' }) });
        if (handleAuthFailure(resp)) return;
        let leads = await resp.json();

        // Filtro por status
        const select = document.getElementById('leads-filter-status');
        const selected = (select?.value || 'all');
        if (selected !== 'all') {
            leads = leads.filter(l => (l.status || 'aberto') === selected);
        }

        const cont = document.getElementById('leads-contagem');
        if (cont) cont.textContent = `${leads.length} contato(s)`;

        if (!Array.isArray(leads) || leads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">Nenhum lead encontrado.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        leads.forEach(lead => {
            const row = document.createElement('tr');
            if (lead && lead._id) row.setAttribute('data-id', lead._id);
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
                                <td>
                                    ${lead.interesseTestDrive ? `<span class="badge badge-confirmado">Test-Drive${when?` • ${when}`:''}</span>` : '<span class="badge badge-pendente">Contato</span>'}
                                </td>
                                <td>
                                    ${lead.status === 'concluido' ? '<span class="badge badge-cancelado">Concluído</span>' : '<span class="badge badge-pendente">Aberto</span>'}
                                </td>
                                <td>
                                    <a class="btn-secondary" href="${waLink}" target="_blank" rel="noopener" title="Abrir WhatsApp">WhatsApp</a>
                                    ${lead.interesseTestDrive ? `<button class="btn-icon btn-ghost action-agendar" title="Agendar Test-Drive" ${lead.status==='concluido'?'disabled':''}>🗓️</button>` : ''}
                                    <button class="btn-icon btn-primary action-concluir" title="Marcar como concluído" ${lead.status==='concluido'?'disabled':''}>✓</button>
                                    <button class="btn-icon btn-danger action-excluir" title="Excluir contato">🗑️</button>
                                    ${lead.agendamentoId ? `<a class="btn-secondary action-ver-ag" data-id="${lead.agendamentoId}" title="Ver agendamento">Ver Agendamento</a>` : ''}
                </td>
            `;
            tbody.appendChild(row);

                        // Bind ações
                        const btnConcluir = row.querySelector('.action-concluir');
                        if (btnConcluir) {
                            btnConcluir.addEventListener('click', async () => {
                                if (lead.status === 'concluido') return;
                                if (!confirm('Marcar este contato como concluído?')) return;
                                try {
                                    await concluirLead(lead._id);
                                    showToast('Contato marcado como concluído.', 'success');
                                    await renderLeads();
                                } catch (e) {
                                    console.error(e);
                                    showToast('Não foi possível concluir o contato.', 'error');
                                }
                            });
                        }
                        const btnExcluir = row.querySelector('.action-excluir');
                        if (btnExcluir) {
                            btnExcluir.addEventListener('click', async () => {
                                if (!confirm('Excluir este contato?')) return;
                                try {
                                    const ok = await excluirLead(lead._id);
                                    if (ok) {
                                        showToast('Contato excluído.', 'success');
                                        await renderLeads();
                                    }
                                } catch (e) {
                                    console.error(e);
                                    showToast('Não foi possível excluir o contato.', 'error');
                                }
                            });
                        }
                        const btnAgendar = row.querySelector('.action-agendar');
                        if (btnAgendar) {
                            btnAgendar.addEventListener('click', async () => {
                                try {
                                    const ag = await agendarTestDrive(lead);
                                    const linkHash = ag && ag._id ? `#admin-agendamentos?focus=${ag._id}` : '#admin-agendamentos';
                                    showToast('Agendamento criado — ver na Agenda', 'success', { link: linkHash });
                                    if (ag && ag._id) {
                                        // Rerender para aparecer o botão "Ver Agendamento"
                                        await renderLeads();
                                    }
                                } catch (e) {
                                    console.error(e);
                                    showToast('Não foi possível criar o agendamento.', 'error');
                                }
                            });
                        }
                        const btnVerAg = row.querySelector('.action-ver-ag');
                        if (btnVerAg) {
                            const agId = btnVerAg.getAttribute('data-id');
                            btnVerAg.setAttribute('href', `#admin-agendamentos?focus=${agId}`);
                            btnVerAg.addEventListener('click', (ev) => {
                                // permitir que o hash seja aplicado; não precisamos prevenir o default
                            });
                        }
        });

        // Se houver ?focus=<LEAD_ID> no hash, rolar e destacar precisamente
        try {
            const hash = window.location.hash || '';
            const m = hash.match(/\?focus=([A-Za-z0-9]+)/);
            const focusId = m ? m[1] : null;
            if (focusId) {
                const row = tbody.querySelector(`tr[data-id='${focusId}']`);
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const oldBg = row.style.backgroundColor;
                    row.style.transition = 'background-color .4s ease';
                    row.style.backgroundColor = '#fffbeb';
                    setTimeout(()=>{ row.style.backgroundColor = oldBg || ''; }, 2000);
                }
            }
        } catch {}

        // Re-bind do filtro (para recarregar ao mudar)
        const select2 = document.getElementById('leads-filter-status');
        if (select2 && !select2.dataset.bound) {
            select2.addEventListener('change', renderLeads);
            select2.dataset.bound = '1';
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar leads.</td></tr>';
    }
}