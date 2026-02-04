/**
 * URL Parser utilities for Klef Agency Quote System
 * Handles query parameters for Spanish and English URLs
 */

/**
 * Get the quote ID from URL query parameters
 * Supports both 'cotizacion' (Spanish) and 'quote' (English) parameters
 * @returns {string|null} The quote ID or null if not found
 */
export function getQueryParam() {
    const params = new URLSearchParams(window.location.search);

    // Try Spanish parameter first, then English
    const cotizacion = params.get('cotizacion');
    const quote = params.get('quote');

    // Return the first one found, prioritizing Spanish
    return cotizacion || quote;
}

/**
 * Get all query parameters as an object
 * @returns {Object} Object with all query parameters
 */
export function getAllQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};

    for (const [key, value] of params) {
        result[key] = value;
    }

    return result;
}

/**
 * Check if a specific query parameter exists
 * @param {string} paramName - The parameter name to check
 * @returns {boolean} True if the parameter exists
 */
export function hasQueryParam(paramName) {
    const params = new URLSearchParams(window.location.search);
    return params.has(paramName);
}

/**
 * Get the base URL without query parameters
 * @returns {string} The base URL
 */
export function getBaseUrl() {
    return window.location.protocol + '//' + window.location.host + window.location.pathname;
}
