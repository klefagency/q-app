/**
 * Utility functions for Klef Agency Quote System
 */

/**
 * Find a client by slug-id
 * @param {string} slugId - The client slug-id to search for
 * @param {Array} clientes - Array of client objects
 * @returns {Object|null} The client object or null if not found
 */
export function findClientBySlug(slugId, clientes) {
    if (!clientes || !Array.isArray(clientes)) return null;
    return clientes.find(cliente => cliente['slug-id'] === slugId) || null;
}

/**
 * Get the main contact from a client
 * @param {Object} cliente - Client object
 * @returns {Object|null} The main contact object or null
 */
export function getMainContact(cliente) {
    if (!cliente || !cliente.contactos) return null;
    return cliente.contactos.find(contacto => contacto['is-main']) || cliente.contactos[0] || null;
}

/**
 * Find a quote by ID
 * @param {string} id - The quote ID to search for
 * @param {Array} cotizaciones - Array of quote objects
 * @returns {Object|null} The quote object or null if not found
 */
export function findCotizacionById(id, cotizaciones) {
    if (!cotizaciones || !Array.isArray(cotizaciones)) return null;
    return cotizaciones.find(cotizacion => cotizacion.id === id) || null;
}

/**
 * Show error message in the container
 * @param {string} message - Error message to display
 */
export function showError(message) {
    const container = document.getElementById('cotizacion-content');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
            </div>
        `;
    }
}

/**
 * Show loading message
 */
export function showLoading() {
    const container = document.getElementById('cotizacion-content');
    if (container) {
        container.innerHTML = '<p>Cargando cotización...</p>';
    }
}

/**
 * Show help message when no quote ID is provided
 */
export function showHelp() {
    const container = document.getElementById('cotizacion-content');
    if (container) {
        container.innerHTML = `
            <div class="help-message">
                <h2>Sistema de Cotizaciones Klef Agency</h2>
                <p>Para ver una cotización, agrega el parámetro <code>?cotizacion=</code> o <code>?quote=</code> seguido del ID.</p>
                <p>Ejemplo: <code>file/index.html?cotizacion=s001</code></p>
            </div>
        `;
    }
}
