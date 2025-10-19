import { API_BASE } from './config.js';

export function renderContact(main) {
  main.innerHTML = `
    <h2>Contato / Agendamento</h2>
    <form id="contact-form" class="contact-form">
      <input type="text" name="nome" placeholder="Seu nome" required>
      <input type="email" name="email" placeholder="Seu e-mail" required>
      <input type="tel" name="telefone" placeholder="Telefone (opcional)">
      <textarea name="mensagem" placeholder="Mensagem ou interesse" required></textarea>
      <label style="display:block;margin-top:8px;"><input type="checkbox" id="ck-agendar"> Quero agendar um test-drive</label>
      <div id="agendar-campos" style="display:none;gap:8px;margin-top:6px;">
        <input type="datetime-local" name="dataHora" id="agendar-dataHora">
      </div>
      <button class="btn" type="submit">Enviar</button>
    </form>
    <div id="contact-feedback" class="contact-feedback"></div>
  `;
  const form = document.getElementById('contact-form');
  const ckAgendar = document.getElementById('ck-agendar');
  const agendarCampos = document.getElementById('agendar-campos');
  ckAgendar.addEventListener('change', () => {
    agendarCampos.style.display = ckAgendar.checked ? 'flex' : 'none';
  });
  form.onsubmit = async e => {
    e.preventDefault();
    const feedback = document.getElementById('contact-feedback');
    feedback.textContent = '';
    try {
      const data = Object.fromEntries(new FormData(form));
      const isAgendamento = ckAgendar.checked && data.dataHora;

      // 1) Sempre cria um Lead (com interesseTestDrive)
      const leadPayload = { 
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        mensagem: data.mensagem,
        origem: 'contato',
        interesseTestDrive: !!ckAgendar.checked,
        dataHora: isAgendamento ? data.dataHora : undefined
      };
      const respLead = await fetch(`${API_BASE}/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(leadPayload) });
      if (!respLead.ok) throw new Error('Falha ao registrar contato');

      //se marcar e informar data/hora, cria Agendamento público
      if (isAgendamento) {
        const agPayload = { nome: data.nome, email: data.email, telefone: data.telefone, dataHora: data.dataHora, status: 'pendente', titulo: `Test-drive de ${data.nome}`, tipo: 'test-drive' };
        const respAg = await fetch(`${API_BASE}/agendamentos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(agPayload) });
        if (!respAg.ok) throw new Error('Falha ao agendar test-drive');
      }
      feedback.innerHTML = '<span class="feedback-success">Enviado com sucesso! Obrigado pelo contato.</span>';
      form.reset();
      agendarCampos.style.display = 'none';
    } catch (err) {
      console.error(err);
      feedback.innerHTML = '<span class="feedback-error">Não foi possível enviar. Tente novamente.</span>';
    }
  };
}
