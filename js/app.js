/**
 * Klef Agency Quote System - Main Application
 * 
 * This module handles loading and rendering quotes from Markdown files
 */

import { getQueryParam } from './url-parser.js';
import { formatDate } from './date-formatter.js';
import {
    findCotizacionById,
    findClientBySlug,
    showError,
    showLoading,
    showHelp
} from './utils.js';

// Import marked.js from CDN
import { marked } from "https://cdn.jsdelivr.net/npm/marked/+esm";

/**
 * Main initialization function
 */
async function init() {
    const quoteId = getQueryParam();

    if (!quoteId) {
        showHelp();
        return;
    }

    showLoading();

    try {
        await loadCotizacion(quoteId);
    } catch (error) {
        console.error('Error loading quote:', error);
        showError('No se pudo cargar la cotización. Verifica que el ID sea correcto.');
    }
}

/**
 * Load and render a quote
 * @param {string} quoteId - The quote ID to load
 */
async function loadCotizacion(quoteId) {
    // Load data files in parallel
    const [cotizacionesData, clientesData] = await Promise.all([
        fetch('../data/cotizaciones.json').then(res => res.json()),
        fetch('../data/clientes.json').then(res => res.json())
    ]);

    // Find the quote
    const cotizacion = findCotizacionById(quoteId, cotizacionesData.cotizaciones);

    if (!cotizacion) {
        showError(`No se encontró la cotización con ID: ${quoteId}`);
        return;
    }

    // Find the client
    const cliente = findClientBySlug(cotizacion.cliente.client_slug, clientesData.clientes);

    // Fetch the markdown file
    const markdownResponse = await fetch(cotizacion.url_md);
    if (!markdownResponse.ok) {
        throw new Error(`Failed to load markdown: ${cotizacion.url_md}`);
    }
    const markdownContent = await markdownResponse.text();

    // Populate header and render content
    populateHeader(cotizacion, cliente);
    renderContent(cotizacion, markdownContent);
}

/**
 * Populate the header with quote and client information
 * @param {Object} cotizacion - Quote data
 * @param {Object} cliente - Client data
 */
function populateHeader(cotizacion, cliente) {
    // Populate folio
    const folioDisplay = document.getElementById('quote-folio-display');
    if (folioDisplay) {
        folioDisplay.textContent = cotizacion.folio;
    }

    // Populate date
    const dateDisplay = document.getElementById('quote-date-display');
    if (dateDisplay) {
        dateDisplay.textContent = formatDate(cotizacion.fecha);
    }

    // Populate client name
    const clientNameDisplay = document.getElementById('client-name');
    if (clientNameDisplay && cliente) {
        clientNameDisplay.textContent = cliente.nombre;
    }
}

/**
 * Render the markdown content to the content area
 * @param {Object} cotizacion - Quote data
 * @param {string} markdownContent - Markdown content
 */
function renderContent(cotizacion, markdownContent) {
    const container = document.getElementById('cotizacion-content');

    if (!container) {
        console.error('Container element not found');
        return;
    }

    // Parse markdown to HTML
    const htmlContent = marked.parse(markdownContent);

    // Get estado label
    const estadoLabel = {
        'pendiente': 'Pendiente',
        'enviada': 'Enviada',
        'aceptada': 'Aceptada',
        'rechazada': 'Rechazada'
    };

    const containerHTML = `
        <div class="quote-header">
            <div class="quote-meta">
                <span class="quote-folio">${cotizacion.folio}</span>
                <span class="quote-tipo">${cotizacion.tipo.toUpperCase()}</span>
                <span class="quote-estado estado-${cotizacion.estado}">${estadoLabel[cotizacion.estado] || cotizacion.estado}</span>
            </div>
            <div class="quote-date"></div>
        </div>
        <div class="quote-content">
            ${htmlContent}
        </div>
        <div class="quote-footer">
            <p>Klef Agency - Sistema de Cotizaciones</p>
        </div>
    `;

    container.innerHTML = containerHTML;
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
