// card.js - Componente de card individual
import { openSidePanel } from './sidepanel.js';
export function createCarCard(car) {
  const card = document.createElement('article');
  card.className = 'card-carro';
  card.setAttribute('data-marca', car.marca);
  card.innerHTML = `
    <img src="${car.imagem}" alt="${car.marca} ${car.modelo}">
    <div class="card-conteudo">
      <div class="marca">${car.marca}</div>
      <h3 class="modelo">${car.modelo}</h3>
      <div class="ano-preco">${car.ano} • R$ ${car.preco.toLocaleString('pt-BR')}</div>
      <p class="descricao">${car.descricao || ''}</p>
      <button class="botao-comprar">Mais informações</button>
    </div>
  `;
  card.querySelector('.botao-comprar').onclick = e => {
    e.preventDefault();
    openSidePanel(car.id);
  };
  return card;
}

// Função global para favoritar (opcional, pode ser adaptada para botão de favorito)
window.addToFavorites = function(id) {
  let favs = JSON.parse(localStorage.getItem('favoritos')||'[]');
  if (!favs.includes(id)) favs.push(id);
  localStorage.setItem('favoritos', JSON.stringify(favs));
  alert('Adicionado aos favoritos!');
};
