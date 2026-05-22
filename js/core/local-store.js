import { slugify, clienteExtraIsBackedUp } from "./contacts.js";

const STORAGE_KEY = "klef_pos_local_v1";

const EMPTY = { cotizaciones: [], markdown: {}, clientes_extra: [] };

export function loadLocal() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { cotizaciones: [], markdown: {}, clientes_extra: [] };
        const parsed = JSON.parse(raw);
        return {
            cotizaciones: Array.isArray(parsed.cotizaciones) ? parsed.cotizaciones : [],
            markdown: parsed.markdown && typeof parsed.markdown === "object" ? parsed.markdown : {},
            clientes_extra: Array.isArray(parsed.clientes_extra) ? parsed.clientes_extra : []
        };
    } catch {
        return { cotizaciones: [], markdown: {}, clientes_extra: [] };
    }
}

export function saveLocal(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cotizaciones: data.cotizaciones || [],
        markdown: data.markdown || {},
        clientes_extra: data.clientes_extra || []
    }));
}

export function addCotizacion(quote, md) {
    const data = loadLocal();
    const id = quote.id.toLowerCase();
    const existing = data.cotizaciones.findIndex(c => c.id.toLowerCase() === id);
    if (existing >= 0) {
        data.cotizaciones[existing] = quote;
    } else {
        data.cotizaciones.push(quote);
    }
    data.markdown[id] = md;
    saveLocal(data);
}

export function addClienteExtra(empresaNombre, contactoNombre) {
    const data = loadLocal();
    data.clientes_extra = data.clientes_extra || [];

    const empresaSlug = slugify(empresaNombre);
    const contactSlug = slugify(contactoNombre);
    if (!empresaSlug || !contactSlug) return null;

    let cliente = data.clientes_extra.find(c => c["slug-id"] === empresaSlug);
    if (!cliente) {
        cliente = {
            "slug-id": empresaSlug,
            nombre: empresaNombre,
            contactos: []
        };
        data.clientes_extra.push(cliente);
    }

    const exists = (cliente.contactos || []).some(
        ct => (ct.slug || slugify(ct.nombre)) === contactSlug
    );
    if (!exists) {
        cliente.contactos = cliente.contactos || [];
        cliente.contactos.push({
            nombre: contactoNombre,
            slug: contactSlug
        });
    }

    saveLocal(data);
    return { empresaSlug, contactSlug };
}

export function getLocalMarkdown(id) {
    const data = loadLocal();
    return data.markdown[id.toLowerCase()] ?? data.markdown[id] ?? null;
}

/**
 * Tras subir clientes.json al proyecto: quita de clientes_extra lo ya respaldado en el archivo.
 */
export function applyClientesPatchFromUpload(uploadedClientes) {
    const data = loadLocal();
    if (!Array.isArray(uploadedClientes)) {
        throw new Error("El archivo debe tener un arreglo clientes.");
    }
    const bySlug = new Map(uploadedClientes.map(c => [c["slug-id"], c]));

    const before = (data.clientes_extra || []).length;
    data.clientes_extra = (data.clientes_extra || []).filter(extra => {
        const uploaded = bySlug.get(extra["slug-id"]);
        if (!uploaded) return true;
        return !clienteExtraIsBackedUp(extra, uploaded);
    });

    saveLocal(data);
    return {
        removed: before - data.clientes_extra.length,
        remaining: data.clientes_extra.length
    };
}
