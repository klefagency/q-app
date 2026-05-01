import { templates } from "./templates.js";
import { fetchData, findClient, findQuote, loadMarkdown } from "./data.js";
import { formatDate } from "../date-formatter.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/+esm";
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";

mermaid.initialize({ startOnLoad: false, theme: "default" });

const container = document.getElementById("app");
const navItems = document.querySelectorAll(".nav-item");

export async function hydrate(state) {
    // Show Loading
    container.setAttribute("data-status", "skel");
    container.innerHTML = templates.skeleton;
    _updateNavActiveState(state);

    try {
        await fetchData();

        if (state.screen === 'search') {
            await _renderSearch();
        } else if (state.screen === 'list') {
            await _renderList(state.options.tipo);
        } else if (state.screen === 'quote') {
            await _renderQuote(state.options.id);
        }
        
    } catch (e) {
        container.setAttribute("data-status", "fancy-error");
        container.innerHTML = templates.error("Ocurrió un error", e.message);
    }
}

function _updateNavActiveState(state) {
    navItems.forEach(item => {
        item.classList.remove('active', 'selected');
        const href = item.getAttribute('href');
        
        if (state.screen === 'search' && href === '#/search') {
            item.classList.add('selected');
        } else if (state.screen === 'list') {
            if (href.includes(`tipo=${state.options.tipo}`)) {
                item.classList.add('active');
            }
        }
    });
}

async function _renderSearch() {
    container.setAttribute("data-status", "loaded");
    container.innerHTML = templates.search;

    const form = document.getElementById('pos-quote-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputVal = document.getElementById('pos-quote-input').value.trim();
        if (inputVal) {
            window.location.hash = `#/cotizacion/${encodeURIComponent(inputVal)}`;
        }
    });
}

async function _renderList(tipo) {
    // Resolve exact title
    const titles = {
        'todas': 'Todas las Cotizaciones',
        'devs': 'Devs',
        'branding': 'Brands',
        'studio': 'Studio',
        'marketing': 'Marketing'
    };

    const cache = await fetchData();
    let cotizaciones = cache.cotizaciones || [];

    if (tipo !== 'todas') {
        cotizaciones = cotizaciones.filter(c => c.tipo === tipo);
    }

    // Sort by Date descending (newest first)
    cotizaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    container.setAttribute("data-status", "loaded");
    container.innerHTML = templates.listBase(titles[tipo] || 'Cotizaciones', cotizaciones.length);

    const grid = document.getElementById('grid-container');

    if (cotizaciones.length === 0) {
        grid.innerHTML = templates.emptyList;
        return;
    }

    const cardsHtml = cotizaciones.map(cotizacion => {
        const cliente = findClient(cotizacion.cliente.client_slug);
        const name = cliente ? cliente.nombre : cotizacion.cliente.client_slug;
        const formDate = formatDate(cotizacion.fecha);
        return templates.listCard(cotizacion, name, formDate);
    }).join("");

    grid.innerHTML = cardsHtml;
}

async function _renderQuote(id) {
    const quote = findQuote(id);
    if (!quote) throw new Error(`Cotización con id ${id} no encontrada.`);

    const client = findClient(quote.cliente.client_slug);
    const clientName = client ? client.nombre : quote.cliente.client_slug;
    
    // Switch to loaded container for skeleton
    container.setAttribute("data-status", "loaded");
    container.innerHTML = templates.quoteBase(quote, clientName);
    
    const dateDisplay = document.getElementById("quote-date-display");
    if (dateDisplay) {
        dateDisplay.textContent = formatDate(quote.fecha);
    }

    try {
        const md = await loadMarkdown(quote.url_md);
        const html = marked.parse(md);
        const mdContainer = document.getElementById("quote-markdown-body");
        mdContainer.innerHTML = html;

        // Mermaid parsing
        mdContainer.querySelectorAll("pre code.language-mermaid").forEach((codeEl) => {
            const div = document.createElement("div");
            div.className = "mermaid";
            div.textContent = codeEl.textContent;
            codeEl.closest("pre").replaceWith(div);
        });

        mermaid.run({ nodes: mdContainer.querySelectorAll(".mermaid") });
    } catch(e) {
        document.getElementById("quote-markdown-body").innerHTML = `<div class="error-message"><h3>Error leyendo documento.</h3></div>`;
    }
}
