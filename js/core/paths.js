/**
 * Rutas del proyecto (relativas a la raíz del repo q-app).
 * La app vive en file/; los fetch usan ../ desde ahí.
 */
export const PATHS = {
    cotizacionesJson: "data/cotizaciones.json",
    clientesJson: "data/clientes.json",
    cotizacionMd: (id) => `cotizaciones/${id.toLowerCase()}.md`,
    cotizacionMdFetch: (id) => `../cotizaciones/${id.toLowerCase()}.md`,
    cotizacionesJsonFetch: "../data/cotizaciones.json",
    clientesJsonFetch: "../data/clientes.json"
};

export function urlMdForQuote(id) {
    return `../${PATHS.cotizacionMd(id)}`;
}
