// details.js - Página de detalhes do carro
import { renderGallery } from './gallery.js';

const cars = [
  {
    id: 1,
    marca: 'Chevrolet',
    modelo: 'Opala Diplomata',
    ano: 1988,
    preco: 65000,
    carroceria: 'Sedan',
    imagem: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d',
    fotos: [
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d',
      'https://images.unsplash.com/photo-1511918984145-48de785d4c4e',
      'https://images.unsplash.com/photo-1461632830798-3adb3034e4c8'
    ],
    ficha: {
      motor: '4.1L 6 cilindros',
      cambio: 'Manual',
      cor: 'Prata',
      quilometragem: '120.000 km',
      opcionais: 'Ar, direção, vidro elétrico',
      doc: 'IPVA 2025 pago',
      historico: 'Único dono, revisões em dia.'
    },
    avaliacoes: [
      { usuario: 'Carlos', nota: 5, comentario: 'Carro impecável!' },
      { usuario: 'Ana', nota: 4, comentario: 'Ótimo estado, recomendo.' }
    ]
  },
  // ...outros carros (mesmo formato do catalog.js)
];

function getCarById(id) {
  return cars.find(c => c.id == id);
}

export function renderDetails(main) {
  const params = new URLSearchParams(window.location.hash.split('?')[1]);
  const id = params.get('id');
  const car = getCarById(id);
  if (!car) {
    main.innerHTML = '<p>Carro não encontrado.</p>';
    return;
  }
  main.innerHTML = `
    <h2>${car.marca} ${car.modelo} (${car.ano})</h2>
    <div id="gallery"></div>
    <div class="car-details">
      <p><strong>Preço:</strong> R$ ${car.preco.toLocaleString('pt-BR')}</p>
      <p><strong>Carroceria:</strong> ${car.carroceria}</p>
      <p><strong>Motor:</strong> ${car.ficha.motor}</p>
      <p><strong>Câmbio:</strong> ${car.ficha.cambio}</p>
      <p><strong>Cor:</strong> ${car.ficha.cor}</p>
      <p><strong>Quilometragem:</strong> ${car.ficha.quilometragem}</p>
      <p><strong>Opcionais:</strong> ${car.ficha.opcionais}</p>
      <p><strong>Documentação:</strong> ${car.ficha.doc}</p>
      <p><strong>Histórico:</strong> ${car.ficha.historico}</p>
      <button class="btn" onclick="window.open('https://wa.me/5511999999999?text=Tenho%20interesse%20no%20${encodeURIComponent(car.marca + ' ' + car.modelo)}','_blank')">Contato via WhatsApp</button>
    </div>
    <h3>Avaliações</h3>
    <ul>
      ${car.avaliacoes.map(a => `<li><b>${a.usuario}</b> (${a.nota}/5): ${a.comentario}</li>`).join('')}
    </ul>
  `;
  renderGallery(document.getElementById('gallery'), car.fotos);
}
