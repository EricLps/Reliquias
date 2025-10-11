console.log('Script login.js carregado com sucesso');

document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  console.log('Email:', email);
  console.log('Password:', password);

  // Simula a validação de login
  if (email === 'admin@reliquias.com' && password === 'admin123') {
    console.log('Login bem-sucedido');
    localStorage.setItem('isAuthenticated', 'true'); // Armazena o estado de autenticação
    window.location.href = 'admin.html'; // Redireciona para a página de administração
  } else {
    console.log('Credenciais inválidas');
    alert('Credenciais inválidas. Tente novamente.');
  }
});