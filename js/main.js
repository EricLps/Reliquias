// main.js - Lógica geral do site Relíquias
import { renderNavbar } from './navbar.js';
import { renderFooter } from './footer.js';

import { renderCatalog } from './catalog.js';
import { renderDetails } from './details.js';
import { renderFavorites } from './favorites.js';
import { renderContact } from './contact.js';
import { renderAuth } from './auth.js';
import { renderSobre } from './sobre.js';


function route() {
    const main = document.getElementById('main-content');
    const hash = window.location.hash.replace('#', '');
    switch(hash) {
        case 'catalog':
        case 'carros':
            renderCatalog(main);
            break;
        case 'favoritos':
            renderFavorites(main);
            break;
        case 'contato':
            renderContact(main);
            break;
        case 'login':
        case 'cadastro':
            renderAuth(main);
            break;
        case 'detalhes':
            renderDetails(main);
            break;
        case 'sobre':
        case 'sobre-nos':
            renderSobre(main);
            break;
        default:
            renderCatalog(main, true);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
    renderFooter();
    route();
    window.addEventListener('hashchange', route);
});
