import { openSidePanel } from './sidepanel.js';
const API_BASE = 'http://localhost:4000/api';
export function createCarCard(car) {
  const card = document.createElement('article');
  card.className = 'card-carro';
  card.setAttribute('data-marca', car.marca);
  const principal = (car.imagens || []).find(i => i.principal) || (car.imagens || [])[0];
  const imgUrl = principal?.fileId
    ? `${API_BASE}/veiculos/imagem/${principal.fileId}`
    : (principal?.url || car.imagem || 'https://via.placeholder.com/800x450?text=Ve%C3%ADculo');
  const id = car._id || car.id;
  card.innerHTML = `
    <div class="card-img">
      <img src="${imgUrl}" alt="${car.marca} ${car.modelo}" loading="lazy" decoding="async" width="800" height="450">
    </div>
    <div class="card-conteudo">
      <div class="marca">${car.marca}</div>
      <h3 class="modelo">${car.modelo}</h3>
      <div class="ano-preco">${car.ano} • R$ ${(Number(car.preco)||0).toLocaleString('pt-BR')}</div>
      <p class="descricao">${car.descricao || ''}</p>
      <button class="botao-comprar">Mais informações</button>
    </div>
  `;
  card.querySelector('.botao-comprar').onclick = e => {
    e.preventDefault();
    openSidePanel(id);
  };
  return card;
}

window.addToFavorites = function(id) {
  let favs = JSON.parse(localStorage.getItem('favoritos')||'[]');
  if (!favs.includes(id)) favs.push(id);
  localStorage.setItem('favoritos', JSON.stringify(favs));
  alert('Adicionado aos favoritos!');
};
