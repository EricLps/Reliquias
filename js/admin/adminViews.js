export function renderAdminVeiculos() {
  return `
    <section class="admin-section">
      <h2>Gerenciar Veículos</h2>
      <button class="admin-add-btn" id="btn-add-veiculo" title="Adicionar veículo">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right:0.2em;"><circle cx="10" cy="10" r="9.2" stroke="#c9a74a" stroke-width="1.6" fill="none"/><path d="M10 6.2V13.8M6.2 10H13.8" stroke="#c9a74a" stroke-width="1.6" stroke-linecap="round"/></svg>
        <span style="font-size:1em; font-weight:400;">Adicionar</span>
      </button>
      <div id="admin-veiculos-lista">
        <!-- Tabela de veículos será renderizada aqui -->
      </div>
      <div id="admin-veiculo-form-modal" class="modal" style="display:none">
        <form id="form-veiculo" class="admin-form-modal">
          <h3 id="modal-titulo">Cadastrar Veículo</h3>
          <label>Marca<input type="text" name="marca" required maxlength="32"></label>
          <label>Modelo<input type="text" name="modelo" required maxlength="32"></label>
          <label>Ano<input type="number" name="ano" required min="1900" max="2100"></label>
          <label>Preço (R$)<input type="text" name="preco" required placeholder="0,00"></label>
          <label>Cor<input type="text" name="cor" maxlength="24"></label>
          <label>Carroceria
            <select name="carroceria">
              <option value="">Selecionar</option>
              <option>Sedan</option>
              <option>Hatch</option>
              <option>SUV</option>
              <option>Pickup</option>
              <option>Coupe</option>
              <option>Conversível</option>
              <option>Wagon</option>
              <option>Minivan</option>
              <option>Utilitário</option>
              <option>Outra</option>
            </select>
          </label>
          <label>KM<input type="text" name="km" placeholder="0"></label>
          <label>Descrição curta
            <input type="text" name="descricaoCurta" maxlength="160" placeholder="Resumo para aparecer no card (até ~160 caracteres)">
          </label>
          <label>Descrição detalhada
            <textarea name="descricao" rows="4" placeholder="Detalhes do veículo, histórico, opcionais..."></textarea>
          </label>
          <label>Imagens<input type="file" name="imagens" accept="image/*" multiple></label>
          <label>Imagem por URL<input type="url" name="imagemUrl" placeholder="https://..."></label>
          <label>Imagens por URL (separar por vírgula)<input type="text" name="imagensUrls" placeholder="https://..., https://..."></label>
          <div id="imagens-atuais" class="imagens-atuais"></div>
          <div class="admin-form-modal-actions">
            <button type="submit" class="botao-comprar admin-add-btn" id="btn-salvar-veiculo">Salvar</button>
            <button type="button" class="admin-add-btn" id="btn-cancelar-veiculo">Cancelar</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

export function renderAdminLeads() {
  const html = `
    <section class="admin-section">
      <h2>Leads / Contatos Recebidos</h2>
      <div id="leads-filtros" style="display:flex;gap:.75rem;align-items:center;margin:.5rem 0 1rem 0;">
        <label style="font-weight:700;color:#0f2747;font-size:.92rem;">
          Status
          <select id="leads-filter-status" style="margin-left:.5rem">
            <option value="all">Todos</option>
            <option value="aberto">Abertos</option>
            <option value="concluido">Concluídos</option>
          </select>
        </label>
        <span id="leads-contagem" style="font-size:.9rem;color:#475569"></span>
      </div>
      <table id="leads-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Mensagem</th>
            <th>Interesse</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  `;
  return html;
}

export function renderAdminAgendamentos() {
  const html = `
    <section class="admin-section">
      <h2>Agendamentos</h2>
      <div id="admin-agendamentos-lista"></div>
    </section>
  `;
  return html;
}

export function renderAdminRelatorios() {
  return `
    <section class="admin-section">
      <h2>Relatórios</h2>
      <div id="admin-relatorios-lista">
        <p>Relatórios de veículos, leads e agendamentos serão exibidos aqui.</p>
      </div>
    </section>
  `;
}

export function renderAdminUsuarios() {
  return `
    <section class="admin-section">
      <h2>Usuários</h2>
      <p style="color:#475569; font-size:.9rem; margin:.25rem 0 1rem 0">Apenas adminMaster pode alterar papéis. Admin pode visualizar a lista.</p>
      <div id="usuarios-lista">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nome</th><th>Email</th><th>Papel</th><th>Ações</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </section>
  `;
}
