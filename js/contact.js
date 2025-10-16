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
      const url = isAgendamento ? 'http://localhost:4000/api/agendamentos' : 'http://localhost:4000/api/leads';
      const payload = isAgendamento
        ? { nome: data.nome, email: data.email, telefone: data.telefone, dataHora: data.dataHora, status: 'pendente' }
        : { ...data, origem: 'contato' };
      const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('Falha ao enviar mensagem');
      feedback.innerHTML = '<span class="feedback-success">Enviado com sucesso! Obrigado pelo contato.</span>';
      form.reset();
      agendarCampos.style.display = 'none';
    } catch (err) {
      console.error(err);
      feedback.innerHTML = '<span class="feedback-error">Não foi possível enviar. Tente novamente.</span>';
    }
  };
}
