import { createCarCard } from './card.js';
import { API_BASE } from './config.js';

// Busca veículos do backend
async function fetchVeiculos() {
  const resp = await fetch(`${API_BASE}/veiculos`);
  if (!resp.ok) throw new Error('Falha ao carregar veículos');
  const data = await resp.json();
  return Array.isArray(data) ? data : [];
}


function renderFilters(container, marcas = [], selected = 'all', onFilter) {
  const unique = Array.from(new Set(marcas.filter(Boolean)));
  const order = unique.sort((a,b) => a.localeCompare(b, 'pt-BR'));
  const btns = [
    { label: 'Todos', value: 'all' },
    ...order.map(m => ({ label: m, value: m }))
  ];
  container.innerHTML = `
    <div class="filtro-marcas">
      ${btns.map(b => `<button data-marca="${b.value}" type="button" class="${selected===b.value?'active':''}">${b.label}</button>`).join('')}
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

export async function renderCatalog(main, destaque = false, filtro = null) {
  main.innerHTML = '';
  const loading = document.createElement('p');
  loading.textContent = 'Carregando veículos...';
  main.appendChild(loading);

  let veiculos = [];
  try {
    veiculos = await fetchVeiculos();
  } catch (e) {
    loading.textContent = 'Erro ao carregar veículos.';
    console.error(e);
    return;
  }

  // Remover loading
  loading.remove();

  const selectedMarca = (filtro && filtro.marca) ? filtro.marca : 'all';
  const marcas = veiculos.map(v => v.marca).filter(Boolean);

  const filtersDiv = document.createElement('div');
  renderFilters(filtersDiv, marcas, selectedMarca, (filterData) => {
    // Re-render com filtro selecionado
    renderCatalog(main, false, filterData);
  });
  main.appendChild(filtersDiv);

  const catalogDiv = document.createElement('div');
  catalogDiv.className = 'grid-carros';

  let filtered = veiculos;
  if (destaque) filtered = veiculos.filter(v => v.destaque);
  if (selectedMarca && selectedMarca !== 'all') {
    filtered = filtered.filter(v => v.marca === selectedMarca);
  }

  if (!filtered.length) {
    catalogDiv.innerHTML = '<p>Nenhum carro encontrado.</p>';
  } else {
    filtered.forEach(v => {
      catalogDiv.appendChild(createCarCard(v));
    });
  }
  main.appendChild(catalogDiv);
}
