import { API_BASE, WHATSAPP_NUMBER, buildWhatsAppLink } from './config.js';

async function fetchVeiculo(id) {
  const resp = await fetch(`${API_BASE}/veiculos/${id}`);
  if (!resp.ok) throw new Error('Veículo não encontrado');
  return resp.json();
}

export async function openSidePanel(carId) {
  let panel = document.getElementById('side-panel');
  let overlay = document.getElementById('side-panel-overlay');
  if (!panel) {
    panel = document.createElement('aside');
    panel.id = 'side-panel';
    panel.className = 'side-panel';
    document.body.appendChild(panel);
  }
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'side-panel-overlay';
    overlay.className = 'side-panel-overlay';
    document.body.appendChild(overlay);
  }
  let car;
  try {
    car = await fetchVeiculo(carId);
  } catch (e) { return; }
  const principal = (car.imagens || []).find(i => i.principal) || (car.imagens || [])[0];
  const imgUrl = principal?.fileId
    ? `${API_BASE}/veiculos/imagem/${principal.fileId}`
    : (principal?.url || car.imagem || 'https://via.placeholder.com/800x450?text=Ve%C3%ADculo');
  const metaParts = [];
  if (car.ano) metaParts.push(`Ano: ${car.ano}`);
  if (car.km != null) metaParts.push(`KM: ${Number(car.km).toLocaleString('pt-BR')}`);
  if (car.carroceria) metaParts.push(`Carroceria: ${car.carroceria}`);
  if (car.cor) metaParts.push(`Cor: ${car.cor}`);
  const metaLine = metaParts.join(' • ');
  panel.innerHTML = `
    <div class="side-panel-header">
      <h3>${car.marca} ${car.modelo}</h3>
      <button class="side-panel-close" aria-label="Fechar" title="Fechar">&times;</button>
    </div>
    <div class="side-panel-content">
  <img src="${imgUrl}" alt="${car.marca} ${car.modelo}">
  <div class="car-meta">${metaLine} • R$ ${car.preco.toLocaleString('pt-BR')}</div>
  <div class="car-desc">${car.descricao || car.descricaoCurta || ''}</div>
      <div class="side-panel-simulador">
        <label for="valorEntrada">Entrada (R$):</label>
        <input type="number" id="valorEntrada" min="0" max="${car.preco}" value="0">
        <label for="parcelas">Parcelas:</label>
        <input type="number" id="parcelas" min="6" max="72" value="36">
        <button id="btn-simular" type="button">Simular Financiamento</button>
        <div class="simulador-resultado" id="simulador-resultado"></div>
      </div>
      <div class="side-panel-actions">
        <button id="btn-agendar" type="button">Agendar Test-Drive</button>
        <a id="link-telefone" href="tel:+${WHATSAPP_NUMBER}">Ligar para a Concessionária</a>
        <a id="link-whatsapp" href="${buildWhatsAppLink(`Tenho interesse no ${car.marca} ${car.modelo}`)}" target="_blank">Falar no WhatsApp</a>
      </div>
    </div>
  `;

  setTimeout(() => {
    panel.classList.add('active');
    overlay.classList.add('active');
  }, 10);
  document.body.style.overflow = 'hidden';

  panel.querySelector('.side-panel-close').onclick = closeSidePanel;
  overlay.onclick = closeSidePanel;

  panel.querySelector('#btn-simular').onclick = () => {
    const entrada = parseFloat(panel.querySelector('#valorEntrada').value) || 0;
    const parcelas = parseInt(panel.querySelector('#parcelas').value) || 36;
    const valorFinanciado = Math.max(0, car.preco - entrada);
    const taxa = 0.019; // 1,9% a.m.
    const parcela = valorFinanciado * (taxa * Math.pow(1 + taxa, parcelas)) / (Math.pow(1 + taxa, parcelas) - 1);
    const total = parcela * parcelas;
    panel.querySelector('#simulador-resultado').innerHTML =
      `Parcela: <b>R$ ${parcela.toLocaleString('pt-BR', {minimumFractionDigits:2})}</b><br>Total: R$ ${total.toLocaleString('pt-BR', {minimumFractionDigits:2})}`;
  };

  panel.querySelector('#btn-agendar').onclick = () => {
    const mensagem = `Olá! Gostaria de agendar um test-drive do ${car.marca} ${car.modelo} (${car.ano}).`;
    const url = buildWhatsAppLink(mensagem);
    window.open(url, '_blank');
  };
}

export function closeSidePanel() {
  const panel = document.getElementById('side-panel');
  const overlay = document.getElementById('side-panel-overlay');
  if (panel) {
    panel.classList.remove('active');
    setTimeout(() => { if (panel.parentNode) panel.parentNode.removeChild(panel); }, 400);
  }
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 400);
  }
  document.body.style.overflow = '';
}
