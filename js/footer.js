export function renderFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
    <div class="footer-center">
        <p>Relíquias © 2025 JELLI Group</p>
        <div class="footer-links">
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener" class="footer-link">WhatsApp</a>
            <a href="https://instagram.com/jelligroup" target="_blank" rel="noopener" class="footer-link">Instagram</a>
            <a href="https://facebook.com/jelligroup" target="_blank" rel="noopener" class="footer-link">Facebook</a>
        </div>
    </div>
    `;
}
