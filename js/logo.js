// logo.js - Injeta a logo SVG do JELLI Group no elemento #logo-jelli
(function() {
  const logoHTML = `
    <a href="#catalog" aria-label="JELLI Group Home">
      <svg class="logo" width="120" height="40" viewBox="0 0 240 70" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Logo JELLI Group">
        <circle cx="40" cy="35" r="28" stroke="#f5e1b8" stroke-width="3" fill="none" />
        <circle cx="40" cy="35" r="10" stroke="#f5e1b8" stroke-width="3" fill="none" />
        <line x1="40" y1="7" x2="40" y2="63" stroke="#f5e1b8" stroke-width="3" />
        <line x1="12" y1="35" x2="68" y2="35" stroke="#f5e1b8" stroke-width="3" />
        <line x1="20" y1="15" x2="60" y2="55" stroke="#f5e1b8" stroke-width="3" />
        <line x1="20" y1="55" x2="60" y2="15" stroke="#f5e1b8" stroke-width="3" />
        <text x="90" y="45" font-family="Montserrat, Arial, sans-serif" font-weight="700" font-size="32" fill="#f5e1b8" letter-spacing="4">JELLI</text>
        <text x="90" y="65" font-family="Georgia, serif" font-style="italic" font-weight="400" font-size="18" fill="#f5e1b8" letter-spacing="2">Group</text>
      </svg>
    </a>
  `;
  const el = document.getElementById('logo-jelli');
  if (el) el.innerHTML = logoHTML;
})();
