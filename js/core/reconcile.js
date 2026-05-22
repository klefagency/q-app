import { loadLocal } from "./local-store.js";
import { PATHS, urlMdForQuote } from "./paths.js";
import { buildFullClientesJson } from "./contacts.js";

export const STATUS = {
    SOLO_NAVEGADOR: "solo_navegador",
    JSON_SIN_MD: "json_sin_md",
    RESPALDO_OK: "respaldo_ok"
};

export const STATUS_LABELS = {
    [STATUS.SOLO_NAVEGADOR]: "Solo en navegador",
    [STATUS.JSON_SIN_MD]: "En JSON, falta .md",
    [STATUS.RESPALDO_OK]: "Respaldo completo"
};

async function fileExists(url) {
    try {
        const res = await fetch(url);
        return res.ok;
    } catch {
        return false;
    }
}

export function quoteToJsonEntry(quote) {
    return {
        id: quote.id,
        cliente: { ...quote.cliente },
        tipo: quote.tipo,
        folio: quote.folio,
        fecha: quote.fecha,
        url_md: urlMdForQuote(quote.id),
        estado: quote.estado
    };
}

export async function fetchJsonCotizaciones() {
    const res = await fetch(PATHS.cotizacionesJsonFetch);
    if (!res.ok) throw new Error("No se pudo leer data/cotizaciones.json");
    const data = await res.json();
    return data.cotizaciones || [];
}

export async function fetchJsonClientes() {
    const res = await fetch(PATHS.clientesJsonFetch);
    if (!res.ok) throw new Error("No se pudo leer data/clientes.json");
    const data = await res.json();
    return data.clientes || [];
}

export function getClientesPatchAudit() {
    const local = loadLocal();
    const extras = local.clientes_extra || [];
    return {
        pending: extras.map(e => ({
            slug: e["slug-id"],
            nombre: e.nombre,
            contactos: (e.contactos || []).map(c => c.nombre).join(", ")
        })),
        count: extras.length
    };
}

export function buildClientesExport(jsonList, extraList) {
    return JSON.stringify(buildFullClientesJson(jsonList, extraList), null, 2);
}

export async function exportMergedClientesFile() {
    const local = loadLocal();
    const jsonList = await fetchJsonClientes();
    const extras = local.clientes_extra || [];
    const full = buildFullClientesJson(jsonList, extras);
    const repoSlugs = new Set(jsonList.map(c => c["slug-id"]));

    return {
        filename: "clientes.json",
        content: buildClientesExport(jsonList, extras),
        stats: {
            total: full.clientes.length,
            fromRepo: jsonList.length,
            pendingInBrowser: extras.length,
            added: extras.filter(e => !repoSlugs.has(e["slug-id"])).length,
            updated: extras.filter(e => repoSlugs.has(e["slug-id"])).length
        }
    };
}

export async function auditLocalBackups() {
    const local = loadLocal();
    const jsonList = await fetchJsonCotizaciones();
    const jsonById = new Map(jsonList.map(c => [c.id.toLowerCase(), c]));

    const localQuotes = (local.cotizaciones || []).filter(
        q => q.source === "local"
    );

    const items = [];

    for (const quote of localQuotes) {
        const id = quote.id.toLowerCase();
        const jsonEntry = jsonById.get(id) || null;
        const mdExists = await fileExists(PATHS.cotizacionMdFetch(id));

        let status;
        if (jsonEntry && mdExists) {
            status = STATUS.RESPALDO_OK;
        } else if (jsonEntry && !mdExists) {
            status = STATUS.JSON_SIN_MD;
        } else {
            status = STATUS.SOLO_NAVEGADOR;
        }

        items.push({
            quote,
            id,
            status,
            jsonEntry,
            mdExists,
            paths: {
                md: PATHS.cotizacionMd(id),
                mdFetch: PATHS.cotizacionMdFetch(id),
                json: PATHS.cotizacionesJson
            }
        });
    }

    items.sort((a, b) => a.id.localeCompare(b.id));

    return {
        items,
        jsonCount: jsonList.length,
        localCount: localQuotes.length,
        clientesPatch: getClientesPatchAudit()
    };
}

/**
 * Arma el objeto completo data/cotizaciones.json:
 * todas las entradas del repo + cotizaciones del navegador (nuevas o actualizadas).
 */
export function buildFullCotizacionesJson(localQuotes, jsonList) {
    const merged = jsonList.map(c => ({ ...c }));

    for (const q of localQuotes) {
        const entry = quoteToJsonEntry(q);
        const key = q.id.toLowerCase();
        const idx = merged.findIndex(c => c.id.toLowerCase() === key);
        if (idx >= 0) {
            merged[idx] = entry;
        } else {
            merged.push(entry);
        }
    }

    return { cotizaciones: merged };
}

export function buildCotizacionesExport(localQuotes, jsonList) {
    return JSON.stringify(buildFullCotizacionesJson(localQuotes, jsonList), null, 4);
}

export async function exportMergedCotizacionesFile() {
    const local = loadLocal();
    const jsonList = await fetchJsonCotizaciones();
    const localQuotes = (local.cotizaciones || []).filter(q => q.source === "local");
    return {
        filename: "cotizaciones.json",
        content: buildCotizacionesExport(localQuotes, jsonList),
        stats: {
            total: buildFullCotizacionesJson(localQuotes, jsonList).cotizaciones.length,
            fromRepo: jsonList.length,
            fromBrowser: localQuotes.length,
            added: localQuotes.filter(
                q => !jsonList.some(j => j.id.toLowerCase() === q.id.toLowerCase())
            ).length
        }
    };
}

export function buildManifest(audit) {
    const lines = [
        "Klef POS — Exportación manual",
        "================================",
        "",
        "Guarda estos archivos en la raíz del proyecto q-app:",
        "",
        `1) ${PATHS.cotizacionesJson}`,
        "   → Descarga cotizaciones.json y REEMPLAZA el archivo completo en esa ruta.",
        "",
        "2) Markdown por cotización:",
        "   → cotizaciones/{id}.md (un archivo por id exportado).",
        ""
    ];

    if (audit.clientesPatch?.count > 0) {
        lines.push(
            `3) ${PATHS.clientesJson}`,
            "   → Descarga clientes.json y REEMPLAZA data/clientes.json (incluye clientes del navegador).",
            ""
        );
    }

    lines.push(
        "Después de guardar, recarga la app y abre #/conciliar para verificar.",
        "",
        `Cotizaciones locales: ${audit.localCount}`,
        `En JSON del repo: ${audit.jsonCount}`
    );

    return lines.join("\n");
}

export async function buildFullExportPayload() {
    const local = loadLocal();
    const audit = await auditLocalBackups();
    const jsonList = await fetchJsonCotizaciones();
    const localQuotes = local.cotizaciones.filter(q => q.source === "local");

    return {
        exportedAt: new Date().toISOString(),
        paths: {
            cotizacionesJson: PATHS.cotizacionesJson,
            clientesJson: PATHS.clientesJson,
            markdownDir: "cotizaciones/"
        },
        instructions: buildManifest(audit),
        cotizaciones_merged_json: JSON.parse(
            buildCotizacionesExport(localQuotes, jsonList)
        ),
        clientes_merged_json: buildFullClientesJson(
            await fetchJsonClientes(),
            local.clientes_extra || []
        ),
        markdown: local.markdown || {}
    };
}
