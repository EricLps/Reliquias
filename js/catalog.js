// catalog.js - Listagem e filtros de carros
import { createCarCard } from './card.js';

export const cars = [
  {
    id: 1,
    marca: 'Chevrolet',
    modelo: 'Opala SS',
    ano: 1978,
    preco: 65000,
    carroceria: 'Sedan',
    imagem: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    descricao: 'Clássico sedã brasileiro, motor 6 cilindros, perfeito para colecionadores e apaixonados por carros antigos.',
    destaque: true
  },
  {
    id: 2,
    marca: 'FIAT',
    modelo: 'FIAT 147',
    ano: 1983,
    preco: 28000,
    carroceria: 'Hatch',
    imagem: 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=800&q=80',
    descricao: 'Compacto, econômico e estiloso, o 147 é um ícone urbano dos anos 80 com motor econômico 1.3.',
    destaque: true
  },
  {
    id: 3,
    marca: 'Toyota',
    modelo: 'Corolla AE101',
    ano: 1995,
    preco: 42000,
    carroceria: 'Sedan',
    imagem: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80',
    descricao: 'Modelo reconhecido por sua durabilidade e conforto, ideal para quem busca um clássico japonês dos anos 90.',
    destaque: false
  },
  {
    id: 4,
    marca: 'Volkswagen',
    modelo: 'Fusca',
    ano: 1980,
    preco: 35000,
    carroceria: 'Hatch',
    imagem: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=800&q=80',
    descricao: 'O clássico Fusca, restaurado com pintura impecável e motor original, perfeito para amantes do vintage.',
    destaque: true
  },
  {
    id: 5,
    marca: 'Chevrolet',
    modelo: 'Camaro Z28',
    ano: 1985,
    preco: 120000,
    carroceria: 'Coupé',
    imagem: 'https://images.unsplash.com/photo-1468071174046-657d9d351a40?auto=format&fit=crop&w=800&q=80',
    descricao: 'Muscle car icônico americano com motor V8, desempenho bruto e design agressivo dos anos 80.',
    destaque: false
  },
  {
    id: 6,
    marca: 'FIAT',
    modelo: 'FIAT Uno Mille',
    ano: 1990,
    preco: 20000,
    carroceria: 'Hatch',
    imagem: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    descricao: 'Compacto, econômico e com estilo inconfundível dos anos 90, ideal para uso diário e colecionadores.',
    destaque: false
  },
  {
    id: 7,
    marca: 'Toyota',
    modelo: 'Land Cruiser',
    ano: 1999,
    preco: 95000,
    carroceria: 'SUV',
    imagem: 'https://images.unsplash.com/photo-1517303653545-7f9272a9b869?auto=format&fit=crop&w=800&q=80',
    descricao: 'Robusto e confiável, perfeito para aventuras e colecionadores que buscam um SUV clássico.',
    destaque: false
  },
  {
    id: 8,
    marca: 'Volkswagen',
    modelo: 'Gol G3',
    ano: 1997,
    preco: 26000,
    carroceria: 'Hatch',
    imagem: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=800&q=80',
    descricao: 'Popular e versátil, o Gol G3 é um clássico dos anos 90 com manutenção simples e estilo marcante.',
    destaque: false
  }
];


function renderFilters(container, onFilter) {
  container.innerHTML = `
    <div class="filtro-marcas">
      <button class="active" data-marca="all" type="button">Todos</button>
      <button data-marca="Chevrolet" type="button">Chevrolet</button>
      <button data-marca="FIAT" type="button">FIAT</button>
      <button data-marca="Toyota" type="button">Toyota</button>
      <button data-marca="Volkswagen" type="button">Volkswagen</button>
    </div>
  `;
  const buttons = container.querySelectorAll('.filtro-marcas button');
  buttons.forEach(btn => {
    btn.onclick = () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onFilter({ marca: btn.dataset.marca });
    };
  });
}

export function renderCatalog(main, destaque = false, filtro = null) {
  main.innerHTML = '';
  const filtersDiv = document.createElement('div');
  renderFilters(filtersDiv, filterData => {
    renderCatalog(main, false, filterData);
  });
  main.appendChild(filtersDiv);

  const catalogDiv = document.createElement('div');
  catalogDiv.className = 'grid-carros';
  let filtered = cars;
  if (destaque) filtered = cars.filter(c => c.destaque);
  if (filtro && filtro.marca && filtro.marca !== 'all') {
    filtered = filtered.filter(c => c.marca === filtro.marca);
  }
  if (filtered.length === 0) {
    catalogDiv.innerHTML = '<p>Nenhum carro encontrado.</p>';
  } else {
    filtered.forEach(car => {
      catalogDiv.appendChild(createCarCard(car));
    });
  }
  main.appendChild(catalogDiv);
}
