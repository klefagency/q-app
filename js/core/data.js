/**
 * Data Layer
 * Handles async fetching and caching of local JSON logic.
 */
let cache = {
    cotizaciones: null,
    clientes: null
};

export async function fetchData() {
    if (cache.cotizaciones && cache.clientes) {
        return cache;
    }
    
    try {
        const [cotsRes, clisRes] = await Promise.all([
            fetch("../data/cotizaciones.json"),
            fetch("../data/clientes.json")
        ]);

        if (!cotsRes.ok || !clisRes.ok) throw new Error("Could not fetch data files");

        const cots = await cotsRes.json();
        const clis = await clisRes.json();

        cache.cotizaciones = cots.cotizaciones || [];
        cache.clientes = clis.clientes || [];

        return cache;
    } catch (e) {
        console.error("Data Layer Error:", e);
        throw e;
    }
}

export function findClient(slugId) {
    if (!cache.clientes) return null;
    return cache.clientes.find(c => c['slug-id'] === slugId) || null;
}

export function findQuote(id) {
    if (!cache.cotizaciones) return null;
    let normalized = id.toLowerCase();
    return cache.cotizaciones.find(c => c.id.toLowerCase() === normalized) || null;
}

export async function loadMarkdown(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Markdown not found");
    return await res.text();
}
