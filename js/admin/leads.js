export function renderLeads() {
    const leads = [
        { nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-9999', mensagem: 'Gostaria de mais informações sobre o veículo.' },
        { nome: 'Maria Oliveira', email: 'maria@email.com', telefone: '(21) 98888-8888', mensagem: 'Quando estará disponível para test-drive?' },
        { nome: 'Carlos Santos', email: 'carlos@email.com', telefone: '(31) 97777-7777', mensagem: 'Qual é o preço final com desconto?' }
    ];

    setTimeout(() => {
        const tbody = document.querySelector('#leads-table tbody');
        if (!tbody) {
            console.error('Elemento tbody não encontrado. Verifique se a tabela foi renderizada corretamente.');
            return;
        }

        leads.forEach(lead => {
            const row = document.createElement('tr');

            row.innerHTML = `
              <td>${lead.nome}</td>
              <td>${lead.email}</td>
              <td>${lead.telefone}</td>
              <td>${lead.mensagem}</td>
              <td>
                <button class="btn-acao">Responder</button>
                <button class="btn-acao">Excluir</button>
              </td>
            `;

            tbody.appendChild(row);
        });
    }, 0);
}