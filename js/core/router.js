/**
 * Router Layer
 * Converts the URL #hash into a state footprint.
 * 
 * Supported Hashes:
 * #/search               -> screen: 'search'
 * #/directorio/:tipo     -> screen: 'list', options: { tipo }
 * #/cotizacion/:id       -> screen: 'quote', options: { id }
 * empty or invalid       -> defaults to 'search'
 */

export function parseHash() {
    let hash = window.location.hash.slice(1);
    
    // Quick fallback mechanism since we are migrating from parameters to Hash.
    // If the user lands here via a query param (e.g. ?cotizacion=d002), redirect.
    const params = new URLSearchParams(window.location.search);
    if(params.has("cotizacion")) {
        let quoteId = params.get("cotizacion");
        window.history.replaceState(null, "", window.location.pathname);
        window.location.hash = `#/cotizacion/${quoteId}`;
        hash = `/cotizacion/${quoteId}`;
    } else if (params.has("tipo")) {
        let tipo = params.get("tipo");
        window.history.replaceState(null, "", window.location.pathname);
        window.location.hash = `#/directorio/${tipo}`;
        hash = `/directorio/${tipo}`;
    }

    if (!hash || hash === '/') {
        return { screen: 'search', options: {} };
    }

    const segments = hash.split('/').filter(s => s.trim() !== '');
    
    if (segments[0] === 'directorio') {
        let tipo = segments[1] || 'todas';
        return { screen: 'list', options: { tipo } };
    }
    
    if (segments[0] === 'cotizacion' && segments[1]) {
        return { screen: 'quote', options: { id: segments[1] } };
    }

    // Default
    return { screen: 'search', options: {} };
}
