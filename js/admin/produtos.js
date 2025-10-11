export function setupProdutoEvents() {
  const produtos = [
    { id: 1, marca: 'Chevrolet', modelo: 'Opala SS', ano: 1978, preco: 65000 },
    { id: 2, marca: 'FIAT', modelo: '147', ano: 1983, preco: 28000 },
    { id: 3, marca: 'Toyota', modelo: 'Corolla AE101', ano: 1995, preco: 42000 }
  ];

  const tbody = document.querySelector('#produtos-table tbody');

  produtos.forEach(produto => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${produto.id}</td>
      <td>${produto.marca}</td>
      <td>${produto.modelo}</td>
      <td>${produto.ano}</td>
      <td>R$ ${produto.preco.toLocaleString('pt-BR')}</td>
      <td>
        <button class="btn-editar" data-id="${produto.id}">Editar</button>
        <button class="btn-excluir" data-id="${produto.id}">Excluir</button>
      </td>
    `;

    tbody.appendChild(row);
  });

  // Configura eventos para os botões de editar e excluir
  document.querySelectorAll('.btn-editar').forEach(button => {
    button.addEventListener('click', (event) => {
      const id = event.target.dataset.id;
      const produto = produtos.find(p => p.id == id);
      abrirModalProduto(produto);
    });
  });

  document.querySelectorAll('.btn-excluir').forEach(button => {
    button.addEventListener('click', (event) => {
      const id = event.target.dataset.id;
      alert(`Produto com ID ${id} será excluído.`);
    });
  });
}

function abrirModalProduto(produto) {
  const modal = document.getElementById('produto-preview-modal');
  const content = document.getElementById('produto-preview-content');

  content.innerHTML = `
    <p><strong>Marca:</strong> ${produto.marca}</p>
    <p><strong>Modelo:</strong> ${produto.modelo}</p>
    <p><strong>Ano:</strong> ${produto.ano}</p>
    <p><strong>Preço:</strong> R$ ${produto.preco.toLocaleString('pt-BR')}</p>
  `;

  modal.style.display = 'block';

  document.getElementById('close-preview').addEventListener('click', () => {
    modal.style.display = 'none';
  });
}