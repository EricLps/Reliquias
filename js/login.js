console.log('Script login.js carregado com sucesso');

const form = document.getElementById('login-form');
if (form) {
  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const email = (emailInput?.value || '').trim().toLowerCase();
    const password = (passwordInput?.value || '').trim();

    console.log('Email:', email);

    try {
      const resp = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password })
      });
      if (!resp.ok) {
        console.warn('Credenciais inválidas');
        alert('Credenciais inválidas. Tente novamente.');
        return;
      }
      const data = await resp.json();
      if (!data?.token) {
        alert('Resposta de login inválida.');
        return;
      }
      // Guardar token e sessão
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('session', JSON.stringify(data.user || { email, role: 'admin', nome: 'Administrador' }));
      window.location.href = 'admin.html#admin-veiculos';
    } catch (e) {
      console.error('Falha no login:', e);
      alert('Erro ao conectar ao servidor.');
    }
  });
} else {
  console.error('Formulário de login não encontrado. Verifique o id="login-form" em login.html.');
}