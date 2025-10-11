export function renderGallery(container, fotos) {
  let idx = 0;
  function show(idx) {
    container.innerHTML = `
      <div class="gallery-container">
        <img src="${fotos[idx]}" alt="Foto do carro" class="gallery-main-img" id="main-img">
        <div class="gallery-thumbnails">
          ${fotos.map((f, i) => `<img src="${f}" alt="thumb" class="gallery-thumbnail ${i === idx ? 'active' : ''}" onclick="showGalleryImg(${i})">`).join('')}
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
