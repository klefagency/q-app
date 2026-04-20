/**
 * Date formatting utilities for Klef Agency
 * Formats dates in Spanish locale
 */

const spanishMonths = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

/**
 * Format a date string in Spanish format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date like "03 de febrero de 2026"
 */
export function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
        return dateString;
    }

    const day = date.getDate();
    const month = spanishMonths[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month} de ${year}`;
}

/**
 * Format a date with full month name
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date like "3 de febrero de 2026"
 */
export function formatDateLong(dateString) {
    return formatDate(dateString);
}

/**
 * Format a date with short format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date like "03/02/2026"
 */
export function formatDateShort(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
