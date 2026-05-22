/**
 * Data Layer
 * Handles async fetching and caching of local JSON logic.
 */
import { loadLocal, getLocalMarkdown } from "./local-store.js";
import { mergeClientes } from "./contacts.js";

let cache = {
    cotizaciones: null,
    clientes: null
};

const TIPO_PREFIX = {
    devs: "d",
    studio: "s",
    branding: "b",
    marketing: "m"
};

function mergeCotizaciones(jsonList, localList) {
    const byId = new Map();
    for (const q of jsonList) {
        byId.set(q.id.toLowerCase(), q);
    }
    for (const q of localList) {
        const key = q.id.toLowerCase();
        if (byId.has(key)) {
            console.warn(`Cotización local "${q.id}" reemplaza entrada del JSON.`);
        }
        byId.set(key, q);
    }
    return Array.from(byId.values());
}

export function invalidateCache() {
    cache.cotizaciones = null;
    cache.clientes = null;
}

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
        const local = loadLocal();

        cache.cotizaciones = mergeCotizaciones(cots.cotizaciones || [], local.cotizaciones || []);
        cache.clientes = mergeClientes(clis.clientes || [], local.clientes_extra || []);

        return cache;
    } catch (e) {
        console.error("Data Layer Error:", e);
        throw e;
    }
}

export function findClient(slugId) {
    if (!cache.clientes) return null;
    return cache.clientes.find(c => c["slug-id"] === slugId) || null;
}

export function findQuote(id) {
    if (!cache.cotizaciones) return null;
    const normalized = id.toLowerCase();
    return cache.cotizaciones.find(c => c.id.toLowerCase() === normalized) || null;
}

export function suggestNextId(tipo, allQuotes) {
    const prefix = TIPO_PREFIX[tipo] || "x";
    let maxNum = 0;
    for (const q of allQuotes) {
        const m = q.id.match(new RegExp(`^${prefix}(\\d+)$`, "i"));
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    }
    const next = maxNum + 1;
    const id = `${prefix}${String(next).padStart(3, "0")}`;
    const folioLetter = prefix.toUpperCase();
    const folio = `${folioLetter}-${String(next).padStart(3, "0")}`;
    return { id, folio };
}

export async function loadMarkdown(url, quote) {
    if (quote?.source === "local") {
        const md = getLocalMarkdown(quote.id);
        if (!md) throw new Error("Markdown local no encontrado");
        return md;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Markdown not found");
    return await res.text();
}
