/**
 * Structure Layer - HTML Templates
 */
export const templates = {
  skeleton: `
        <div class="skel-loader">
            <div class="skel-block title"></div>
            <div class="skel-block"></div>
            <div class="skel-block paragraph"></div>
        </div>
    `,

  error: (title, message) => `
        <div class="error-message">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <h2>${title}</h2>
            <p>${message}</p>
        </div>
    `,

  search: `
        <div id="main-search-block" class="search-container" >
            <div class="pos-search-card">
                <div class="pos-logo-icon">
                    <img src="https://ivanndlezz.github.io/klef-sonatta-website/assets/images/favicons/klef-logo.png" alt="Klef Logo" style="filter: brightness(0) invert(1);">
                </div>
                <h2>Buscar Cotización</h2>
                <p>Ingresa el código de la cotización para ver los detalles.</p>
                <form id="pos-quote-form" class="pos-form">
                    <div class="pos-input-group">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" id="pos-quote-input" class="pos-input" placeholder="Ej. D002" required autocomplete="off" spellcheck="false" autofocus>
                    </div>
                    <button type="submit" class="pos-submit">
                        Continuar <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </form>
                <a href="#/nueva" class="pos-secondary-link">
                    <i class="fa-solid fa-plus"></i> 
                    Crear cotización
                </a>
                <br> 
                <a href="#/conciliar" class="pos-secondary-link">
                    <i class="fa-solid fa-arrows-rotate"></i> 
                    Conciliar
                </a>
                    
           
            </div>
        </div>
    `,

  listBase: (title, countMap) => `
        <div class="content-container">
            <div class="page-header">
                <h1 class="page-title">${title}</h1>
                <div class="page-header-actions">
                    <div class="result-count">${countMap} resultados</div>
                    <a href="#/nueva" class="btn-nueva"><i class="fa-solid fa-plus"></i> Nueva</a>
                </div>
            </div>
            <div class="quotes-grid" id="grid-container"></div>
        </div>
    `,

  listCard: (quote, clientName, formattedDate) => `
        <a href="#/cotizacion/${quote.id}" class="quote-card">
            <div class="card-header">
                <span class="card-folio">${quote.folio}</span>
                <span class="card-badges">
                    <span class="card-badge badge-${quote.tipo}">${quote.tipo === "branding" ? "brands" : quote.tipo}</span>
                    ${quote.source === "local" ? '<span class="card-badge badge-local">Local</span>' : ""}
                </span>
            </div>
            <div class="card-title">${clientName}</div>
            <div class="card-date"><i class="fa-regular fa-calendar" style="margin-right: 6px;"></i> ${formattedDate}</div>
            
            <div class="card-status status-${quote.estado}">
                <div class="status-dot"></div>
                ${quote.estado.charAt(0).toUpperCase() + quote.estado.slice(1)}
            </div>
        </a>
    `,

  emptyList: `
        <div class="empty-state">
            <i class="fa-solid fa-folder-open"></i>
            <h3>No hay cotizaciones</h3>
            <p>No se encontraron documentos en esta categoría.</p>
        </div>
    `,

  quoteBase: (quote, clientName) => `
        <div class="header-container">
            <div class="header-doc">
                <div class="left-section">
                    <div class="logo">
                        <div class="logo-icon">
                            <img src="https://ivanndlezz.github.io/klef-sonatta-website/assets/images/favicons/klef-logo.png" alt="Klef Logo">
                        </div>
                        <div class="logo-text">Klef Agency</div>
                    </div>
                    <div class="client-info">
                        <h2>${clientName}</h2>
                        <p>${quote.cliente.client_contact}</p>
                    </div>
                </div>
                <div class="right-section">
                    <div class="info-column folio">
                        <div class="tab-indicator"></div>
                        <div class="info-icon"><i class="fa-solid fa-barcode"></i></div>
                        <div class="info-label">Folio</div>
                        <div class="info-value">${quote.folio}</div>
                    </div>
                    <div class="info-column fecha">
                        <div class="tab-indicator"></div>
                        <div class="info-icon"><i class="fa-solid fa-calendar-days"></i></div>
                        <div class="info-label">Fecha</div>
                        <!-- formatting in hydrator -->
                        <div class="info-value" id="quote-date-display">...</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="cotizacion-content">
            <div class="quote-header">
                <div class="quote-meta">
                    <span class="quote-folio">${quote.folio}</span>
                    <span class="quote-tipo">${quote.tipo.toUpperCase()}</span>
                    <span class="quote-estado estado-${quote.estado}">${quote.estado.charAt(0).toUpperCase() + quote.estado.slice(1)}</span>
                </div>
            </div>
            <div id="quote-markdown-body" class="quote-content">
                <!-- markdown loaded here -->
                <div class="skel-loader" style="padding:0;"><div class="skel-block"></div></div>
            </div>
            <div class="quote-footer">
                <p>Klef Agency - Sistema de Cotizaciones</p>
            </div>
        </div>
    `,

  customSelect: (id, placeholder, optionsHtml) => `
        <div class="custom-select-wrapper" id="${id}Wrapper">
            <input type="hidden" id="${id}" value="">
            <div class="custom-select-trigger" id="${id}Trigger">
                <input type="text" class="custom-select-input" id="${id}Input" placeholder="${placeholder}" value="" autocomplete="off" autocapitalize="none" spellcheck="false">
                <svg class="custom-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <div class="custom-select-dropdown">
                <div class="custom-select-options" id="${id}Options">
                    ${optionsHtml}
                </div>
            </div>
        </div>
    `,

  createForm: (contactOptionsHtml, empresaOptionsHtml) => `
        <div class="search-container create-container">
            <div class="pos-search-card pos-create-card">
                <h2>Nueva cotización</h2>
                <p>Los datos se guardan en este navegador (localStorage).</p>
                <div id="create-form-error" class="form-error" hidden></div>
                <form id="create-quote-form" class="pos-form">
                    <div class="pos-form-grid">
                        <div class="pos-field">
                            <label class="pos-field-label" for="create-tipo">Tipo</label>
                            <select id="create-tipo" class="pos-select" required>
                                <option value="devs">Devs</option>
                                <option value="studio">Studio</option>
                                <option value="branding">Branding</option>
                                <option value="marketing">Marketing</option>
                            </select>
                        </div>
                        <div class="pos-field">
                            <label class="pos-field-label" for="create-estado">Estado</label>
                            <select id="create-estado" class="pos-select" required>
                                <option value="pendiente">Pendiente</option>
                                <option value="enviada">Enviada</option>
                            </select>
                        </div>
                        <div class="pos-field pos-field-full create-cliente-field">
                            <div class="create-cliente-header">
                                <span class="pos-field-label">Cliente</span>
                                <label class="pos-toggle pos-toggle-inline">
                                    <input type="checkbox" id="create-contacto-nuevo" class="pos-toggle-input">
                                    <span class="pos-toggle-track" aria-hidden="true"></span>
                                    <span class="pos-toggle-text">Contacto nuevo</span>
                                </label>
                            </div>
                            <div class="create-cliente-split">
                                <div class="pos-field create-cliente-col">
                                    <label class="pos-field-label" for="create-contactoInput">Contacto</label>
                                    ${templates.customSelect("create-contacto", "Buscar contacto…", contactOptionsHtml)}
                                </div>
                                <div class="pos-field create-cliente-col">
                                    <label class="pos-field-label" for="create-empresaInput">Empresa</label>
                                    ${templates.customSelect("create-empresa", "Buscar empresa…", empresaOptionsHtml)}
                                </div>
                            </div>
                        </div>
                        <div class="pos-field">
                            <label class="pos-field-label" for="create-fecha">Fecha</label>
                            <input type="date" id="create-fecha" class="pos-input pos-input-plain" required>
                        </div>
                        <div class="pos-field">
                            <label class="pos-field-label" for="create-id">ID</label>
                            <input type="text" id="create-id" class="pos-input pos-input-plain" pattern="[a-z0-9]+" required autocomplete="off" spellcheck="false">
                        </div>
                        <div class="pos-field">
                            <label class="pos-field-label" for="create-folio">Folio</label>
                            <input type="text" id="create-folio" class="pos-input pos-input-plain" required autocomplete="off">
                        </div>
                        <div class="pos-field pos-field-full">
                            <label class="pos-field-label" for="create-markdown">Contenido (Markdown)</label>
                            <textarea id="create-markdown" class="pos-textarea" rows="12" placeholder="# Título del proyecto&#10;&#10;Descripción..." required></textarea>
                        </div>
                    </div>
                    <div class="pos-form-actions">
                        <a href="#/search" class="pos-cancel">Cancelar</a>
                        <button type="submit" class="pos-submit">
                            Guardar <i class="fa-solid fa-check"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `,

  reconcilePage: (stats, rowsHtml, clientesPatchHtml) => `
        <div class="content-container reconcile-container">
            <div class="page-header">
                <h1 class="page-title">Conciliar respaldo</h1>
                <button type="button" class="btn-nueva" id="reconcile-refresh">
                    <i class="fa-solid fa-rotate"></i> Actualizar
                </button>
            </div>

            <div class="reconcile-hint">
                <h3><i class="fa-solid fa-folder-tree"></i> Rutas en el proyecto (raíz q-app)</h3>
                <ul class="reconcile-paths">
                    <li><code>data/cotizaciones.json</code> — registro de cotizaciones</li>
                    <li><code>cotizaciones/<var>{id}</var>.md</code> — contenido de cada cotización</li>
                    <li><code>data/clientes.json</code> — clientes y contactos (lista única)</li>
                </ul>
                <p class="reconcile-hint-note">Descarga cada JSON <strong>completo</strong> y reemplaza el archivo en el proyecto. Los clientes del navegador ya van integrados en <code>clientes.json</code> (no hay archivo aparte). Sube el mismo archivo para cerrar el parche en el navegador.</p>
            </div>

            <div id="reconcile-message" class="form-error" hidden></div>
            <div class="reconcile-stats">${stats}</div>

            <div class="reconcile-patch-grid">
                <div class="reconcile-export-primary">
                    <h3 class="reconcile-patch-title">Cotizaciones</h3>
                    <button type="button" class="btn-reconcile btn-reconcile-primary" id="reconcile-export-json">
                        <i class="fa-solid fa-file-export"></i>
                        Descargar data/cotizaciones.json
                    </button>
                    <p class="reconcile-export-desc" id="reconcile-json-desc"></p>
                </div>
                <div class="reconcile-export-primary">
                    <h3 class="reconcile-patch-title">Clientes</h3>
                    <button type="button" class="btn-reconcile btn-reconcile-primary" id="reconcile-export-clientes-json">
                        <i class="fa-solid fa-file-export"></i>
                        Descargar data/clientes.json
                    </button>
                    <p class="reconcile-export-desc" id="reconcile-clientes-desc"></p>
                    <label class="reconcile-upload">
                        <span class="reconcile-upload-label">Subir clientes.json (parche aplicado en disco)</span>
                        <input type="file" id="reconcile-import-clientes" accept=".json,application/json">
                    </label>
                    ${clientesPatchHtml}
                </div>
            </div>

            <div class="reconcile-actions">
                <button type="button" class="btn-reconcile" id="reconcile-export-readme">
                    <i class="fa-solid fa-file-lines"></i> Instrucciones (.txt)
                </button>
                <button type="button" class="btn-reconcile" id="reconcile-export-md-all">
                    <i class="fa-solid fa-file-code"></i> Todos los .md
                </button>
                <button type="button" class="btn-reconcile" id="reconcile-export-bundle">
                    <i class="fa-solid fa-box-archive"></i> Paquete completo (.json)
                </button>
            </div>

            <div class="reconcile-table-wrap">
                <table class="reconcile-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Folio</th>
                            <th>Estado</th>
                            <th>Ruta .md</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="reconcile-tbody">
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        </div>
    `,

  reconcileRow: (item, statusLabel, statusClass) => `
        <tr data-id="${item.id}">
            <td><a href="#/cotizacion/${item.id}">${item.id}</a></td>
            <td>${item.quote.folio}</td>
            <td><span class="reconcile-badge ${statusClass}">${statusLabel}</span></td>
            <td><code class="reconcile-path-cell">${item.paths.md}</code></td>
            <td class="reconcile-row-actions">
                <button type="button" class="btn-reconcile-sm" data-action="download-md" data-id="${item.id}" title="Descargar .md">
                    <i class="fa-solid fa-download"></i> .md
                </button>
            </td>
        </tr>
    `,

  reconcileClientesPending: (items) => {
    if (!items.length) {
      return `<p class="reconcile-pending-none">No hay clientes pendientes en el navegador.</p>`;
    }
    return `
            <ul class="reconcile-pending-list">
                ${items
                  .map(
                    (p) =>
                      `<li><strong>${p.nombre}</strong> <code>${p.slug}</code>${p.contactos ? ` — ${p.contactos}` : ""}</li>`,
                  )
                  .join("")}
            </ul>
        `;
  },

  reconcileEmpty: `
        <tr><td colspan="5" class="reconcile-empty">
            No hay cotizaciones solo en el navegador. Crea una en <a href="#/nueva">Nueva</a>.
        </td></tr>
    `,
};
