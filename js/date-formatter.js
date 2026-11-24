/**
 * Date formatting utilities for Klef Agency
 * Formats dates in Spanish locale
 */

const spanishMonths = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

function parseDateParts(dateString) {
    if (!dateString) return null;

    const dateOnly = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
        const year = Number(dateOnly[1]);
        const month = Number(dateOnly[2]) - 1;
        const day = Number(dateOnly[3]);
        const localDate = new Date(year, month, day);

        if (
            localDate.getFullYear() === year &&
            localDate.getMonth() === month &&
            localDate.getDate() === day
        ) {
            return { day, month, year };
        }
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    return {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear()
    };
}

/**
 * Format a date string in Spanish format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date like "03 de febrero de 2026"
 */
export function formatDate(dateString) {
    if (!dateString) return '';

    const parts = parseDateParts(dateString);
    if (!parts) {
        return dateString;
    }

    return `${parts.day} de ${spanishMonths[parts.month]} de ${parts.year}`;
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

    const parts = parseDateParts(dateString);
    if (!parts) {
        return dateString;
    }

    const day = String(parts.day).padStart(2, '0');
    const month = String(parts.month + 1).padStart(2, '0');
    const year = parts.year;

    return `${day}/${month}/${year}`;
}
