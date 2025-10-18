// As views abaixo passam a apenas RETORNAR o HTML. A lógica de inserção no DOM
// e inicializações adicionais (ex.: renderLeads/renderAgendamentos) ficam em admin.js.

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
      <table id="leads-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Mensagem</th>
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
