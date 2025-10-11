export function renderContact(main) {
  main.innerHTML = `
    <h2>Contato / Agendamento</h2>
    <form id="contact-form" style="max-width:400px;margin:auto;display:flex;flex-direction:column;gap:1rem;">
      <input type="text" name="nome" placeholder="Seu nome" required>
      <input type="email" name="email" placeholder="Seu e-mail" required>
      <input type="tel" name="telefone" placeholder="Telefone (opcional)">
      <textarea name="mensagem" placeholder="Mensagem ou interesse" required></textarea>
      <button class="btn" type="submit">Enviar</button>
    </form>
    <div id="contact-feedback" style="margin-top:1rem;"></div>
  `;
  const form = document.getElementById('contact-form');
  form.onsubmit = e => {
    e.preventDefault();
    document.getElementById('contact-feedback').innerHTML = '<span style="color:green;">Mensagem enviada! Entraremos em contato.</span>';
    form.reset();
  };
}
