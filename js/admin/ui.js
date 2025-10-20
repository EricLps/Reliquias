export function showToast(message, type = 'info', options = {}) {
  let cont = document.getElementById('toast-container');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'toast-container';
    cont.setAttribute('aria-live', 'polite');
    cont.setAttribute('aria-atomic', 'true');
    document.body.appendChild(cont);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  if (options && options.link) {
    const a = document.createElement('a');
    a.href = options.link;
    a.textContent = message;
    a.style.color = '#fff';
    a.style.textDecoration = 'underline';
    el.appendChild(a);
    el.addEventListener('click', () => {
      try { window.location.hash = options.link; } catch {}
    });
  } else {
    el.textContent = message;
  }
  cont.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s ease';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 350);
  }, 2500);
}
