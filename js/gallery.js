// gallery.js - Galeria de imagens com zoom/slide
export function renderGallery(container, fotos) {
  let idx = 0;
  function show(idx) {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <img src="${fotos[idx]}" alt="Foto do carro" style="width:100%;max-width:400px;border-radius:8px;box-shadow:0 2px 8px #0002;cursor:zoom-in;" id="main-img">
        <div style="margin-top:0.5rem;display:flex;gap:0.5rem;">
          ${fotos.map((f,i) => `<img src="${f}" alt="thumb" style="width:60px;height:40px;object-fit:cover;border-radius:4px;cursor:pointer;${i===idx?'border:2px solid #ffb300;':''}" onclick="showGalleryImg(${i})">`).join('')}
        </div>
      </div>
    `;
    window.showGalleryImg = i => { idx = i; show(idx); };
    document.getElementById('main-img').onclick = () => {
      window.open(fotos[idx], '_blank');
    };
  }
  show(idx);
}
