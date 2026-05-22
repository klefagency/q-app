import { templates } from "./templates.js";
import { fetchData, findClient, findQuote, loadMarkdown, suggestNextId, invalidateCache } from "./data.js";
import { addCotizacion, addClienteExtra, loadLocal, applyClientesPatchFromUpload } from "./local-store.js";
import {
    auditLocalBackups,
    buildManifest,
    buildFullExportPayload,
    exportMergedCotizacionesFile,
    exportMergedClientesFile,
    STATUS,
    STATUS_LABELS
} from "./reconcile.js";
import { PATHS } from "./paths.js";
import { downloadText } from "./download.js";
import {
    buildContactCatalog,
    contactIdToStorage,
    contactosForEmpresa,
    empresasForContacto,
    findContacto,
    isVinculoValid,
    resolveContactDisplayName,
    slugify
} from "./contacts.js";
import {
    initCustomSelect,
    renderCustomSelectOptions,
    setComboboxSearchMode,
    clearCombobox,
    setCustomSelectValue,
    updateCustomSelectOptions
} from "./custom-select.js";
import { formatDate } from "../date-formatter.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/+esm";
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";

mermaid.initialize({ startOnLoad: false, theme: "default" });

const container = document.getElementById("app");
const navItems = document.querySelectorAll(".nav-item");

export async function hydrate(state) {
    container.setAttribute("data-status", "skel");
    container.innerHTML = templates.skeleton;
    _updateNavActiveState(state);

    try {
        await fetchData();

        if (state.screen === 'search') {
            await _renderSearch();
        } else if (state.screen === 'list') {
            await _renderList(state.options.tipo);
        } else if (state.screen === 'quote') {
            await _renderQuote(state.options.id);
        } else if (state.screen === 'create') {
            await _renderCreate();
        } else if (state.screen === 'reconcile') {
            await _renderReconcile();
        }
    } catch (e) {
        container.setAttribute("data-status", "fancy-error");
        container.innerHTML = templates.error("Ocurrió un error", e.message);
    }
}

function _updateNavActiveState(state) {
    navItems.forEach(item => {
        item.classList.remove('active', 'selected');
        const href = item.getAttribute('href');

        if (state.screen === 'search' && href === '#/search') {
            item.classList.add('selected');
        } else if (state.screen === 'create' && href === '#/nueva') {
            item.classList.add('selected');
        } else if (state.screen === 'reconcile' && href === '#/conciliar') {
            item.classList.add('selected');
        } else if (state.screen === 'list') {
            if (href === `#/directorio/${state.options.tipo}`) {
                item.classList.add('active');
            }
        }
    });
}

async function _renderSearch() {
    container.setAttribute("data-status", "loaded");
    container.innerHTML = templates.search;

    const form = document.getElementById('pos-quote-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputVal = document.getElementById('pos-quote-input').value.trim();
        if (inputVal) {
            window.location.hash = `#/cotizacion/${encodeURIComponent(inputVal)}`;
        }
    });
}

function _todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function _showFormError(msg) {
    const el = document.getElementById('create-form-error');
    if (!el) return;
    if (msg) {
        el.textContent = msg;
        el.hidden = false;
    } else {
        el.textContent = '';
        el.hidden = true;
    }
}

async function _renderCreate() {
    const cache = await fetchData();
    const catalog = buildContactCatalog(cache.clientes || []);

    const contactOptionsHtml = renderCustomSelectOptions(
        catalog.contactos.map(c => ({ value: c.id, label: c.nombre }))
    );
    const empresaOptionsHtml = renderCustomSelectOptions(
        catalog.empresas.map(e => ({ value: e.value, label: e.label }))
    );

    container.setAttribute("data-status", "loaded");
    container.innerHTML = templates.createForm(contactOptionsHtml, empresaOptionsHtml);

    const contactoWrapper = document.getElementById("create-contactoWrapper");
    const empresaWrapper = document.getElementById("create-empresaWrapper");
    const contactoHidden = document.getElementById("create-contacto");
    const empresaHidden = document.getElementById("create-empresa");
    const contactoInput = document.getElementById("create-contactoInput");
    const empresaInput = document.getElementById("create-empresaInput");

    function renderContactOptions(empresaSlug, keepId) {
        const list = contactosForEmpresa(catalog, empresaSlug);
        const html = renderCustomSelectOptions(
            list.map(c => ({ value: c.id, label: c.nombre }))
        );
        const valid = list.some(c => c.id === keepId);
        updateCustomSelectOptions(contactoWrapper, html, valid ? keepId : "");
    }

    function renderEmpresaOptions(contactId, keepSlug) {
        const list = empresasForContacto(catalog, contactId);
        const html = renderCustomSelectOptions(
            list.map(e => ({ value: e.value, label: e.label }))
        );
        const valid = list.some(e => e.value === keepSlug);
        updateCustomSelectOptions(empresaWrapper, html, valid ? keepSlug : "");
    }

    initCustomSelect(contactoWrapper, {
        onChange: ({ value }) => {
            renderEmpresaOptions(value, empresaHidden.value);
            const empresas = empresasForContacto(catalog, value);
            if (empresas.length === 1) {
                setCustomSelectValue(empresaWrapper, empresas[0].value, empresas[0].label);
            }
        }
    });

    initCustomSelect(empresaWrapper, {
        onChange: ({ value }) => {
            renderContactOptions(value, contactoHidden.value);
        }
    });

    const contactoNuevoToggle = document.getElementById("create-contacto-nuevo");

    function setContactMode(isNew) {
        setComboboxSearchMode(contactoWrapper, !isNew);
        setComboboxSearchMode(empresaWrapper, !isNew);
        contactoInput.placeholder = isNew ? "Nombre del contacto" : "Buscar contacto…";
        empresaInput.placeholder = isNew ? "Nombre de la empresa" : "Buscar empresa…";
        if (isNew) {
            clearCombobox(contactoWrapper);
            clearCombobox(empresaWrapper);
            renderContactOptions("", "");
            renderEmpresaOptions("", "");
        } else {
            renderContactOptions(empresaHidden.value, contactoHidden.value);
            renderEmpresaOptions(contactoHidden.value, empresaHidden.value);
        }
    }

    contactoNuevoToggle.addEventListener("change", () => {
        setContactMode(contactoNuevoToggle.checked);
        _showFormError("");
    });

    const tipoEl = document.getElementById('create-tipo');
    const idEl = document.getElementById('create-id');
    const folioEl = document.getElementById('create-folio');
    const fechaEl = document.getElementById('create-fecha');
    fechaEl.value = _todayISO();

    function applySuggestions() {
        const { id, folio } = suggestNextId(tipoEl.value, cache.cotizaciones || []);
        idEl.value = id;
        folioEl.value = folio;
    }

    applySuggestions();
    tipoEl.addEventListener('change', applySuggestions);

    document.getElementById('create-quote-form').addEventListener('submit', (e) => {
        e.preventDefault();
        _showFormError('');

        const id = idEl.value.trim().toLowerCase();
        const folio = document.getElementById('create-folio').value.trim();
        const tipo = tipoEl.value;
        const estado = document.getElementById('create-estado').value;
        const fecha = fechaEl.value;
        const isNewContact = contactoNuevoToggle.checked;
        const markdown = document.getElementById('create-markdown').value.trim();

        let client_slug;
        let client_contact;

        if (isNewContact) {
            const contactNombre = contactoInput.value.trim();
            const empresaNombre = empresaInput.value.trim();

            if (!contactNombre || !empresaNombre) {
                _showFormError('Escribe el contacto y la empresa.');
                return;
            }

            client_slug = slugify(empresaNombre);
            client_contact = slugify(contactNombre);

            if (!client_slug || !client_contact) {
                _showFormError('Usa letras o números en contacto y empresa.');
                return;
            }
        } else {
            const contactId = contactoHidden.value;
            client_slug = empresaHidden.value;

            if (!contactId || !client_slug) {
                _showFormError('Selecciona contacto y empresa de la lista.');
                return;
            }
            if (!findContacto(catalog, contactId)) {
                _showFormError('Selecciona un contacto válido.');
                return;
            }
            if (!isVinculoValid(catalog, contactId, client_slug)) {
                _showFormError('Este contacto no está vinculado a esa empresa.');
                return;
            }
            client_contact = contactIdToStorage(contactId);
        }

        if (!/^[a-z0-9]+$/.test(id)) {
            _showFormError('El ID solo puede contener letras minúsculas y números.');
            return;
        }
        if (!folio || !fecha || !markdown) {
            _showFormError('Completa todos los campos obligatorios.');
            return;
        }
        if (findQuote(id)) {
            _showFormError(`Ya existe una cotización con id "${id}".`);
            return;
        }

        if (isNewContact) {
            addClienteExtra(empresaInput.value.trim(), contactoInput.value.trim());
        }

        const quote = {
            id,
            cliente: {
                client_slug,
                client_contact
            },
            tipo,
            folio,
            fecha,
            estado,
            source: 'local'
        };

        addCotizacion(quote, markdown);
        invalidateCache();
        window.location.hash = `#/cotizacion/${encodeURIComponent(id)}`;
    });
}

function _statusClass(status) {
    if (status === STATUS.RESPALDO_OK) return "reconcile-ok";
    if (status === STATUS.JSON_SIN_MD) return "reconcile-partial";
    return "reconcile-local";
}

function _showReconcileMessage(msg) {
    const el = document.getElementById("reconcile-message");
    if (!el) return;
    if (msg) {
        el.textContent = msg;
        el.hidden = false;
    } else {
        el.textContent = "";
        el.hidden = true;
    }
}

async function _renderReconcile() {
    const audit = await auditLocalBackups();
    const local = loadLocal();

    const ok = audit.items.filter(i => i.status === STATUS.RESPALDO_OK).length;
    const partial = audit.items.filter(i => i.status === STATUS.JSON_SIN_MD).length;
    const solo = audit.items.filter(i => i.status === STATUS.SOLO_NAVEGADOR).length;

    const stats = `
        <span><strong>${audit.localCount}</strong> en navegador</span>
        <span class="reconcile-stat-ok"><strong>${ok}</strong> respaldo completo</span>
        <span class="reconcile-stat-partial"><strong>${partial}</strong> JSON sin .md</span>
        <span class="reconcile-stat-local"><strong>${solo}</strong> solo navegador</span>
    `;

    const rowsHtml = audit.items.length
        ? audit.items.map(item =>
            templates.reconcileRow(
                item,
                STATUS_LABELS[item.status],
                _statusClass(item.status)
            )
        ).join("")
        : templates.reconcileEmpty;

    const clientesPatchHtml = audit.clientesPatch.count
        ? `<div class="reconcile-pending-block">
            <span class="reconcile-pending-label">Pendientes en navegador (${audit.clientesPatch.count}):</span>
            ${templates.reconcileClientesPending(audit.clientesPatch.pending)}
           </div>`
        : templates.reconcileClientesPending([]);

    container.setAttribute("data-status", "loaded");
    container.innerHTML = templates.reconcilePage(stats, rowsHtml, clientesPatchHtml);

    document.getElementById("reconcile-refresh")?.addEventListener("click", () => {
        invalidateCache();
        _renderReconcile();
    });

    document.getElementById("reconcile-export-readme")?.addEventListener("click", () => {
        downloadText("klef-export-README.txt", buildManifest(audit));
    });

    const jsonDesc = document.getElementById("reconcile-json-desc");
    if (jsonDesc) {
        const preview = await exportMergedCotizacionesFile();
        const added = preview.stats.added;
        jsonDesc.textContent = added > 0
            ? `Incluye las ${preview.stats.total} cotizaciones del repo más ${added} nueva(s) del navegador. Guarda como data/cotizaciones.json (reemplazo total).`
            : `Archivo completo con ${preview.stats.total} cotizaciones (repo + navegador). Guarda en data/cotizaciones.json reemplazando el actual.`;
    }

    const clientesDesc = document.getElementById("reconcile-clientes-desc");
    if (clientesDesc) {
        const preview = await exportMergedClientesFile();
        const { added, updated, pendingInBrowser, total } = preview.stats;
        if (pendingInBrowser === 0) {
            clientesDesc.textContent = `${total} clientes en el archivo (igual al repo).`;
        } else {
            clientesDesc.textContent =
                `${total} clientes: repo + ${added} nuevo(s) + ${updated} actualizado(s) en navegador. Reemplaza data/clientes.json.`;
        }
    }

    document.getElementById("reconcile-export-json")?.addEventListener("click", async () => {
        const file = await exportMergedCotizacionesFile();
        downloadText(file.filename, file.content, "application/json");
        _showReconcileMessage(
            `Descargado ${file.filename} — ${file.stats.total} cotizaciones. Reemplaza data/cotizaciones.json en el proyecto.`
        );
    });

    document.getElementById("reconcile-export-clientes-json")?.addEventListener("click", async () => {
        const file = await exportMergedClientesFile();
        downloadText(file.filename, file.content, "application/json");
        _showReconcileMessage(
            `Descargado ${file.filename} — ${file.stats.total} clientes. Reemplaza data/clientes.json en el proyecto.`
        );
    });

    document.getElementById("reconcile-import-clientes")?.addEventListener("change", async (e) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const list = parsed.clientes;
            if (!Array.isArray(list)) {
                throw new Error('El JSON debe tener la propiedad "clientes" como arreglo.');
            }
            const result = applyClientesPatchFromUpload(list);
            invalidateCache();
            _showReconcileMessage(
                result.removed > 0
                    ? `Parche aplicado: ${result.removed} cliente(s) ya respaldado(s) se quitaron del navegador. Quedan ${result.remaining} pendiente(s).`
                    : "Archivo leído. Aún hay clientes en el navegador que no coinciden con el archivo subido."
            );
            input.value = "";
            setTimeout(() => _renderReconcile(), 800);
        } catch (err) {
            _showReconcileMessage(err.message || "No se pudo leer el archivo.");
            input.value = "";
        }
    });

    document.getElementById("reconcile-export-md-all")?.addEventListener("click", () => {
        const md = local.markdown || {};
        const ids = audit.items.map(i => i.id);
        if (!ids.length) return;
        for (const id of ids) {
            const content = md[id] ?? md[id.toLowerCase()];
            if (content) {
                downloadText(`${id}.md`, content, "text/markdown");
            }
        }
    });

    document.getElementById("reconcile-export-bundle")?.addEventListener("click", async () => {
        const payload = await buildFullExportPayload();
        downloadText(
            "klef-backup-completo.json",
            JSON.stringify(payload, null, 2),
            "application/json"
        );
    });

    document.getElementById("reconcile-tbody")?.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        const id = btn.dataset.id;
        const item = audit.items.find(i => i.id === id);
        if (!item) return;

        if (btn.dataset.action === "download-md") {
            const content = local.markdown?.[id] ?? local.markdown?.[id.toLowerCase()];
            if (!content) {
                _showReconcileMessage(`No hay markdown en localStorage para ${id}.`);
                return;
            }
            downloadText(`${id}.md`, content, "text/markdown");
        }
    });
}

async function _renderList(tipo) {
    const titles = {
        'todas': 'Todas las Cotizaciones',
        'devs': 'Devs',
        'branding': 'Brands',
        'studio': 'Studio',
        'marketing': 'Marketing'
    };

    const cache = await fetchData();
    let cotizaciones = cache.cotizaciones || [];

    if (tipo !== 'todas') {
        cotizaciones = cotizaciones.filter(c => c.tipo === tipo);
    }

    cotizaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    container.setAttribute("data-status", "loaded");
    container.innerHTML = templates.listBase(titles[tipo] || 'Cotizaciones', cotizaciones.length);

    const grid = document.getElementById('grid-container');

    if (cotizaciones.length === 0) {
        grid.innerHTML = templates.emptyList;
        return;
    }

    const cardsHtml = cotizaciones.map(cotizacion => {
        const cliente = findClient(cotizacion.cliente.client_slug);
        const name = cliente ? cliente.nombre : cotizacion.cliente.client_slug;
        const formDate = formatDate(cotizacion.fecha);
        return templates.listCard(cotizacion, name, formDate);
    }).join("");

    grid.innerHTML = cardsHtml;
}

async function _renderQuote(id) {
    const quote = findQuote(id);
    if (!quote) throw new Error(`Cotización con id ${id} no encontrada.`);

    const cache = await fetchData();
    const client = findClient(quote.cliente.client_slug);
    const clientName = client ? client.nombre : quote.cliente.client_slug;
    const contactName = resolveContactDisplayName(
        cache.clientes,
        quote.cliente.client_slug,
        quote.cliente.client_contact
    );
    const quoteForTemplate = {
        ...quote,
        cliente: { ...quote.cliente, client_contact: contactName }
    };

    container.setAttribute("data-status", "loaded");
    container.innerHTML = templates.quoteBase(quoteForTemplate, clientName);

    const dateDisplay = document.getElementById("quote-date-display");
    if (dateDisplay) {
        dateDisplay.textContent = formatDate(quote.fecha);
    }

    try {
        const md = await loadMarkdown(quote.url_md, quote);
        const html = marked.parse(md);
        const mdContainer = document.getElementById("quote-markdown-body");
        mdContainer.innerHTML = html;

        mdContainer.querySelectorAll("pre code.language-mermaid").forEach((codeEl) => {
            const div = document.createElement("div");
            div.className = "mermaid";
            div.textContent = codeEl.textContent;
            codeEl.closest("pre").replaceWith(div);
        });

        mermaid.run({ nodes: mdContainer.querySelectorAll(".mermaid") });
    } catch (e) {
        document.getElementById("quote-markdown-body").innerHTML = `<div class="error-message"><h3>Error leyendo documento.</h3></div>`;
    }
}
