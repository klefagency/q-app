/**
 * Contact and empresa catalogs with many-to-many links (not merged into one value).
 */
export function slugify(text) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

/** Internal id for per-empresa "main" contacts (avoids slug collision). */
export function contactIdForMain(empresa_slug) {
    return `main--${empresa_slug}`;
}

/** Maps picker id → client_contact stored on quotes. */
export function contactIdToStorage(contactId) {
    if (contactId.startsWith("main--")) return "main";
    return contactId;
}

export function buildContactCatalog(clientes) {
    const empresas = clientes
        .map(c => ({ value: c["slug-id"], label: c.nombre }))
        .sort((a, b) => a.label.localeCompare(b.label, "es"));

    const contactMap = new Map();

    for (const cliente of clientes) {
        const empresa_slug = cliente["slug-id"];
        const items = cliente.contactos?.length
            ? cliente.contactos
            : [{ nombre: "Contacto principal", slug: "main", "is-main": true }];

        for (const ct of items) {
            const contactSlug = ct.slug || (ct["is-main"] ? "main" : slugify(ct.nombre));
            const id = contactSlug === "main" ? contactIdForMain(empresa_slug) : contactSlug;

            if (!contactMap.has(id)) {
                contactMap.set(id, {
                    id,
                    nombre: ct.nombre,
                    empresas: new Set()
                });
            }
            contactMap.get(id).empresas.add(empresa_slug);
        }
    }

    const contactos = [...contactMap.values()]
        .map(c => ({
            id: c.id,
            nombre: c.nombre,
            empresas: [...c.empresas]
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    return { contactos, empresas };
}

export function findContacto(catalog, contactId) {
    return catalog.contactos.find(c => c.id === contactId) || null;
}

export function findEmpresa(catalog, empresaSlug) {
    return catalog.empresas.find(e => e.value === empresaSlug) || null;
}

export function contactosForEmpresa(catalog, empresaSlug) {
    if (!empresaSlug) return catalog.contactos;
    return catalog.contactos.filter(c => c.empresas.includes(empresaSlug));
}

export function empresasForContacto(catalog, contactId) {
    const contact = findContacto(catalog, contactId);
    if (!contact) return catalog.empresas;
    return catalog.empresas.filter(e => contact.empresas.includes(e.value));
}

export function isVinculoValid(catalog, contactId, empresaSlug) {
    const contact = findContacto(catalog, contactId);
    return Boolean(contact && contact.empresas.includes(empresaSlug));
}

export function resolveContactDisplayName(clientes, client_slug, client_contact) {
    const catalog = buildContactCatalog(clientes);
    const mainId = contactIdForMain(client_slug);
    const match =
        catalog.contactos.find(c => c.id === client_contact) ||
        (client_contact === "main" ? catalog.contactos.find(c => c.id === mainId) : null);
    return match ? match.nombre : client_contact;
}

export function mergeClientes(jsonList, extraList) {
    const bySlug = new Map();

    for (const c of jsonList) {
        bySlug.set(c["slug-id"], {
            ...c,
            contactos: c.contactos ? [...c.contactos] : undefined
        });
    }

    for (const extra of extraList || []) {
        const slug = extra["slug-id"];
        if (!bySlug.has(slug)) {
            bySlug.set(slug, {
                ...extra,
                contactos: extra.contactos ? [...extra.contactos] : []
            });
            continue;
        }
        const existing = bySlug.get(slug);
        const slugs = new Set(
            (existing.contactos || []).map(ct => ct.slug || slugify(ct.nombre))
        );
        for (const ct of extra.contactos || []) {
            const ctSlug = ct.slug || slugify(ct.nombre);
            if (!slugs.has(ctSlug)) {
                existing.contactos = existing.contactos || [];
                existing.contactos.push({ ...ct });
                slugs.add(ctSlug);
            }
        }
    }

    return Array.from(bySlug.values());
}

/** Asigna id numérico a clientes nuevos del navegador. */
export function assignClienteIds(clientes) {
    let maxId = 0;
    for (const c of clientes) {
        const n = parseInt(c.id, 10);
        if (!Number.isNaN(n)) maxId = Math.max(maxId, n);
    }
    return clientes.map(c => {
        if (c.id != null && String(c.id).trim() !== "") return c;
        maxId += 1;
        return { ...c, id: String(maxId) };
    });
}

export function buildFullClientesJson(jsonList, extraList) {
    const merged = mergeClientes(jsonList, extraList);
    return { clientes: assignClienteIds(merged) };
}

export function clienteExtraIsBackedUp(extra, uploadedCliente) {
    if (!uploadedCliente) return false;
    const extraContacts = extra.contactos || [];
    if (extraContacts.length === 0) return true;
    const upContacts = uploadedCliente.contactos || [];
    return extraContacts.every(ec => {
        const slug = ec.slug || slugify(ec.nombre);
        return upContacts.some(
            uc => (uc.slug || slugify(uc.nombre)) === slug
        );
    });
}
