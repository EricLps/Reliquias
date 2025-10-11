import { renderLeads } from './leads.js';

export function loadSection(section) {
  const content = document.getElementById('admin-content');
  content.innerHTML = '';

  // Renderiza o conteúdo da seção com base no parâmetro recebido
  switch (section) {
    case 'dashboard':
      content.innerHTML = '<h2>Dashboard</h2><p>Bem-vindo ao painel de administração.</p>';
      break;
    case 'produtos':
      content.innerHTML = '<h2>Gerenciar Produtos</h2><p>Adicione, edite ou exclua produtos.</p>';
      break;
    case 'leads':
      content.innerHTML = '<h2>Leads Recebidos</h2><table id="leads-table"><thead><tr><th>Nome</th><th>Email</th><th>Telefone</th><th>Mensagem</th><th>Ações</th></tr></thead><tbody></tbody></table>';
      setTimeout(() => renderLeads(), 0); // Garante que renderLeads seja chamada após o DOM ser atualizado
      break;
    case 'contatos':
      content.innerHTML = '<h2>Tentativas de Contato</h2><p>Gerencie as tentativas de contato.</p>';
      break;
    default:
      content.innerHTML = '<h2>Seção não encontrada</h2>';
  }
}