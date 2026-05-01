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
        <div class="search-container">
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
            </div>
        </div>
    `,

    listBase: (title, countMap) => `
        <div class="content-container">
            <div class="page-header">
                <h1 class="page-title">${title}</h1>
                <div class="result-count">${countMap} resultados</div>
            </div>
            <div class="quotes-grid" id="grid-container"></div>
        </div>
    `,

    listCard: (quote, clientName, formattedDate) => `
        <a href="#/cotizacion/${quote.id}" class="quote-card">
            <div class="card-header">
                <span class="card-folio">${quote.folio}</span>
                <span class="card-badge badge-${quote.tipo}">${quote.tipo === 'branding' ? 'brands' : quote.tipo}</span>
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
    `
};
