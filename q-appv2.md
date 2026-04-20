# Plan Q-APP v2: Sistema de Vista de Clientes

## Objetivo
Crear una ruta accesible desde el navegador para previsualizar los clientes en `data/clientes.json`.

## URLs Soportadas

| URL | Descripción |
|-----|-------------|
| `/clientes` | Lista todos los clientes |
| `/cliente/[slug-id]` | Muestra un cliente específico |

## Implementación

### 1. Actualizar url-parser.js

Agregar detección de rutas:

```javascript
export function getRoute() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    return {
        route: segments[0] || 'home',
        params: segments.slice(1)
    };
}
```

### 2. Actualizar app.js

Manejar rutas:

```javascript
async function init() {
    const { route, params } = getRoute();
    
    switch(route) {
        case 'clientes':
            await showClientesList();
            break;
        case 'cliente':
            await showClienteDetail(params[0]);
            break;
        case 'cotizacion':
        case 'quote':
            const id = getQueryParam();
            if (id) await loadCotizacion(id);
            else showHelp();
            break;
        default:
            showHelp();
    }
}
```

### 3. Crear función showClientesList()

```javascript
async function showClientesList() {
    const clientesData = await fetch('../data/clientes.json').then(res => res.json());
    const container = document.getElementById('cotizacion-content');
    
    let html = `
        <h1>Clientes Klef Agency</h1>
        <div class="clientes-grid">
    `;
    
    for (const cliente of clientesData.clientes) {
        const contacto = cliente.contactos.find(c => c['is-main']) || cliente.contactos[0];
        html += `
            <div class="cliente-card">
                <h3>${cliente.nombre}</h3>
                <p>Slug: ${cliente['slug-id']}</p>
                ${contacto ? `
                    <p>Contacto: ${contacto.nombre}</p>
                    <p>Email: ${contacto.email}</p>
                ` : ''}
                <a href="/cliente/${cliente['slug-id']}" class="btn">Ver Detalle</a>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}
```

### 4. Crear función showClienteDetail()

```javascript
async function showClienteDetail(slugId) {
    const clientesData = await fetch('../data/clientes.json').then(res => res.json());
    const cliente = clientesData.clientes.find(c => c['slug-id'] === slugId);
    
    if (!cliente) {
        showError(`No se encontró el cliente: ${slugId}`);
        return;
    }
    
    const container = document.getElementById('cotizacion-content');
    
    let html = `
        <h1>${cliente.nombre}</h1>
        <div class="cliente-detail">
            <h2>Información</h2>
            <p><strong>Slug:</strong> ${cliente['slug-id']}</p>
            
            <h2>Contactos</h2>
            <ul>
    `;
    
    for (const contacto of cliente.contactos) {
        html += `
            <li>
                <strong>${contacto.nombre}</strong> ${contacto['is-main'] ? '(Principal)' : ''}<br>
                Email: ${contacto.email}<br>
                Teléfono: ${contacto.telefono}
            </li>
        `;
    }
    
    html += `
            </ul>
        </div>
        <a href="/clientes" class="btn">Volver a Clientes</a>
    `;
    
    container.innerHTML = html;
}
```

### 5. Agregar estilos CSS

```css
.clientes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.cliente-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.cliente-card h3 {
    margin-bottom: 10px;
    color: #1a1a1a;
}

.cliente-card p {
    margin-bottom: 5px;
    color: #666;
}

.btn {
    display: inline-block;
    padding: 8px 16px;
    background: #6b6b6b;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    margin-top: 10px;
}

.btn:hover {
    background: #555;
}
```

## Notas de Implementación

1. **GitHub Pages**: Las URLs como `/clientes` requieren configurar GitHub Pages para manejar SPA routing o usar query params alternativos.

2. **Alternativa con query params**: Si no se puede configurar el servidor, usar:
   - `?view=clientes`
   - `?view=cliente&slug=cumbretezal`

3. **Compatibilidad**: La solución actual con query params `?cotizacion=s001` sigue funcionando.

## Pasos de Implementación

1. [ ] Actualizar url-parser.js con función getRoute()
2. [ ] Actualizar app.js para manejar rutas /clientes y /cliente/[slug]
3. [ ] Crear funciones showClientesList() y showClienteDetail()
4. [ ] Agregar estilos CSS para las vistas
5. [ ] Probar localmente con servidor de desarrollo
6. [ ] Configurar GitHub Pages si es necesario
