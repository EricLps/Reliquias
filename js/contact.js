export function renderContact(main) {
  main.innerHTML = `
    <h2>Contato / Agendamento</h2>
    <form id="contact-form" class="contact-form">
      <input type="text" name="nome" placeholder="Seu nome" required>
      <input type="email" name="email" placeholder="Seu e-mail" required>
      <input type="tel" name="telefone" placeholder="Telefone (opcional)">
      <textarea name="mensagem" placeholder="Mensagem ou interesse" required></textarea>
      <button class="btn" type="submit">Enviar</button>
    </form>
    <div id="contact-feedback" class="contact-feedback"></div>
  `;
  const form = document.getElementById('contact-form');
  form.onsubmit = e => {
    e.preventDefault();
    document.getElementById('contact-feedback').innerHTML = '<span class="feedback-success">Mensagem enviada! Entraremos em contato.</span>';
    form.reset();
  };
}
