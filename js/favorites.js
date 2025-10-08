// favorites.js - Lista de carros favoritos do usuário
import { createCarCard } from './card.js';
import { renderCatalog } from './catalog.js';

const cars = [
  { id: 1, marca: 'Chevrolet', modelo: 'Opala Diplomata', ano: 1988, preco: 65000, carroceria: 'Sedan', imagem: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d' },
  { id: 2, marca: 'FIAT', modelo: 'Uno Mille', ano: 1995, preco: 18000, carroceria: 'Hatch', imagem: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e' },
  { id: 3, marca: 'Toyota', modelo: 'Corolla', ano: 2000, preco: 32000, carroceria: 'Sedan', imagem: 'https://images.unsplash.com/photo-1461632830798-3adb3034e4c8' },
  { id: 4, marca: 'Volkswagen', modelo: 'Gol GTI', ano: 1992, preco: 40000, carroceria: 'Hatch', imagem: 'https://images.unsplash.com/photo-1502877338535-766e1452684a' }
];

export function renderFavorites(main) {
  main.innerHTML = '<h2>Meus Favoritos</h2>';
  let favs = JSON.parse(localStorage.getItem('favoritos')||'[]');
  if (!favs.length) {
    main.innerHTML += '<p>Nenhum carro favoritado ainda.</p>';
    return;
  }
  const favCars = cars.filter(c => favs.includes(c.id));
  const div = document.createElement('div');
  div.className = 'grid-carros';
  favCars.forEach(car => div.appendChild(createCarCard(car)));
  main.appendChild(div);
}
