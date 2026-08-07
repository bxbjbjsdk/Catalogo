/* ================================================
   productos.js
   Maneja el catalogo de productos, con paginacion
   numerada en vez de mostrar todo en una sola cascada.
   ================================================ */

const PRODUCTOS_POR_PAGINA = 12;

let productosBase          = [];      // productos ya filtrados por la categoria fija de la pagina
let filtroCategoriaActivo  = 'todos'; // filtro elegido con los botones de arriba del grid
let textoBusqueda          = '';      // texto escrito en el buscador
let paginaActual           = 1;

/* ------------------------------------------------
   CARGAR PRODUCTOS DESDE EL BACKEND
   ------------------------------------------------ */
async function cargarProductos(filtro = '') {
    const grid = document.getElementById('productosGrid');
    if (!grid) return;

    grid.innerHTML = '<p style="color:#94a3b8; padding:20px;">Cargando productos...</p>';

    try {
        const respuesta = await fetch(`${URL_BACKEND}/productos`);

        if (!respuesta.ok) throw new Error('Error al obtener productos.');

        const productos = await respuesta.json();

        let lista = productos;

        if (filtro === 'Ofertas') {
            lista = productos.filter(p => p.badge === 'oferta');
        } else if (filtro !== '') {
            lista = productos.filter(p => p.categoria === filtro);
        }

        productosBase = lista;
        paginaActual  = 1;
        renderizarCatalogo();

    } catch (error) {
        grid.innerHTML = `
            <div class="estado-vacio" style="grid-column:1/-1">
                <i class="ti ti-wifi-off"></i>
                <p>No se pudo conectar con el servidor.</p>
                <p style="font-size:12px; margin-top:6px;">Verifica que el backend este corriendo con <strong>dotnet run</strong></p>
            </div>
        `;
        const paginacion = document.getElementById('paginacionContenedor');
        if (paginacion) paginacion.innerHTML = '';
        console.error('Error al cargar productos:', error.message);
    }
}

/* ------------------------------------------------
   APLICA BUSQUEDA + FILTRO DE CATEGORIA, RECORTA
   A LA PAGINA ACTUAL Y DIBUJA TODO
   ------------------------------------------------ */
function renderizarCatalogo() {
    let lista = productosBase;

    if (filtroCategoriaActivo !== 'todos') {
        lista = lista.filter(p => p.categoria === filtroCategoriaActivo);
    }

    if (textoBusqueda) {
        lista = lista.filter(p => {
            const contenido = `${p.nombre} ${p.categoria} ${p.descripcion}`.toLowerCase();
            return contenido.includes(textoBusqueda);
        });
    }

    const totalPaginas = Math.max(1, Math.ceil(lista.length / PRODUCTOS_POR_PAGINA));
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    if (paginaActual < 1) paginaActual = 1;

    const inicio        = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const productosPagina = lista.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);

    dibujarProductos(productosPagina, lista.length === 0);
    dibujarPaginacion(totalPaginas);
}

/* ------------------------------------------------
   DIBUJAR PRODUCTOS EN EL GRID (solo los de la pagina actual)
   ------------------------------------------------ */
function dibujarProductos(productos, sinResultados = false) {
    const grid = document.getElementById('productosGrid');
    if (!grid) return;

    if (productos.length === 0) {
        grid.innerHTML = sinResultados
            ? `
            <div class="estado-vacio" style="grid-column:1/-1">
                <i class="ti ti-search-off"></i>
                <p>No se encontraron productos que coincidan con tu busqueda.</p>
            </div>`
            : `
            <div class="estado-vacio" style="grid-column:1/-1">
                <i class="ti ti-package-off"></i>
                <p>No hay productos disponibles.</p>
            </div>`;
        return;
    }

    grid.innerHTML = productos.map(producto => `
        <div class="tarjeta" onclick="abrirDetalleProducto(${producto.id})">

            ${producto.badge ? `<span class="tarjeta-badge ${producto.badge}">${producto.badge}</span>` : ''}

            <div class="tarjeta-imagen">
                <img
                    src="imagenes/${producto.imagen}"
                    alt="${producto.nombre}"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                <i class="ti ti-device-laptop" style="display:none"></i>
            </div>

            <div class="tarjeta-categoria">${producto.categoria}</div>
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion.substring(0, 70)}...</p>

            <div class="tarjeta-footer">
                <div class="tarjeta-precio">
                    ${producto.precioOriginal
                        ? `<span class="precio-original">${formatearPrecio(producto.precioOriginal)}</span>`
                        : ''
                    }
                    ${formatearPrecio(producto.precio)}
                </div>
                <button class="btn-ver-mas" onclick="event.stopPropagation(); abrirDetalleProducto(${producto.id})">
                    Ver mas
                </button>
            </div>

        </div>
    `).join('');
}

/* ------------------------------------------------
   PAGINACION NUMERADA (estilo Mercado Libre)
   ------------------------------------------------ */
function dibujarPaginacion(totalPaginas) {
    const cont = document.getElementById('paginacionContenedor');
    if (!cont) return;

    if (totalPaginas <= 1) {
        cont.innerHTML = '';
        return;
    }

    const paginas = calcularRangoPaginas(paginaActual, totalPaginas);

    let html = `<button class="pagina-btn" onclick="irAPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''} aria-label="Pagina anterior">&laquo;</button>`;

    paginas.forEach(p => {
        html += p === '...'
            ? `<span class="pagina-puntos">...</span>`
            : `<button class="pagina-btn ${p === paginaActual ? 'activo' : ''}" onclick="irAPagina(${p})">${p}</button>`;
    });

    html += `<button class="pagina-btn" onclick="irAPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'disabled' : ''} aria-label="Pagina siguiente">&raquo;</button>`;

    cont.innerHTML = html;
}

// Calcula que numeros de pagina mostrar, agregando "..." cuando hay muchas
function calcularRangoPaginas(actual, total) {
    const vecinos = 1; // cuantas paginas mostrar a cada lado de la actual
    const paginas = [];

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= actual - vecinos && i <= actual + vecinos)) {
            paginas.push(i);
        }
    }

    const conPuntos = [];
    let anterior = null;
    paginas.forEach(p => {
        if (anterior !== null) {
            if (p - anterior === 2) conPuntos.push(anterior + 1);
            else if (p - anterior > 2) conPuntos.push('...');
        }
        conPuntos.push(p);
        anterior = p;
    });

    return conPuntos;
}

function irAPagina(numero) {
    if (numero < 1) return;

    paginaActual = numero;
    renderizarCatalogo();

    document.getElementById('productosGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ------------------------------------------------
   ABRIR MODAL CON DETALLE DEL PRODUCTO
   ------------------------------------------------ */
async function abrirDetalleProducto(id) {
    try {
        const respuesta = await fetch(`${URL_BACKEND}/productos/${id}`);

        if (!respuesta.ok) throw new Error('Producto no encontrado');

        const producto = await respuesta.json();

        document.getElementById('modalProdImg').src         = `imagenes/${producto.imagen}`;
        document.getElementById('modalProdImg').alt         = producto.nombre;
        document.getElementById('modalProdCategoria').textContent  = producto.categoria;
        document.getElementById('modalProdNombre').textContent     = producto.nombre;
        document.getElementById('modalProdDescripcion').textContent = producto.descripcion;

        const precioEl = document.getElementById('modalProdPrecio');
        if (producto.precioOriginal) {
            precioEl.innerHTML = `
                <span style="font-size:13px; color:#94a3b8; text-decoration:line-through; font-weight:normal;">
                    ${formatearPrecio(producto.precioOriginal)}
                </span>
                ${formatearPrecio(producto.precio)}
            `;
        } else {
            precioEl.textContent = formatearPrecio(producto.precio);
        }

        const specsEl = document.getElementById('modalProdSpecs');
        if (producto.specs && producto.specs.length > 0) {
            specsEl.innerHTML = producto.specs.map(s => `
                <div class="spec-item">
                    <div class="spec-clave">${s.clave}</div>
                    <div class="spec-valor">${s.valor}</div>
                </div>
            `).join('');
        } else {
            specsEl.innerHTML = '<p style="color:#94a3b8; font-size:12px;">Sin especificaciones registradas.</p>';
        }

        // Boton de WhatsApp con mensaje automatico (se crea una vez y se reutiliza)
        let btnWhatsapp = document.getElementById('modalProdWhatsapp');
        if (!btnWhatsapp) {
            btnWhatsapp = document.createElement('a');
            btnWhatsapp.id = 'modalProdWhatsapp';
            btnWhatsapp.className = 'btn-whatsapp-modal';
            btnWhatsapp.target = '_blank';
            btnWhatsapp.rel = 'noopener';
            btnWhatsapp.innerHTML = '<i class="ti ti-brand-whatsapp" aria-hidden="true"></i> Preguntar por WhatsApp';
            specsEl.parentNode.appendChild(btnWhatsapp);
        }
        btnWhatsapp.href = linkWhatsappProducto(producto.nombre, producto.precio);

        abrirModal('modalProducto');

    } catch (error) {
        mostrarNotificacion('No se pudo cargar el detalle del producto.', 'error');
        console.error('Error al cargar producto:', error.message);
    }
}

/* ------------------------------------------------
   BUSCADOR EN TIEMPO REAL
   ------------------------------------------------ */
function iniciarBuscador() {
    const inputBuscar = document.getElementById('inputBuscar');
    if (!inputBuscar) return;

    inputBuscar.addEventListener('input', function () {
        textoBusqueda = this.value.toLowerCase().trim();
        paginaActual  = 1;
        renderizarCatalogo();
    });
}

/* ------------------------------------------------
   FILTROS POR CATEGORIA (botones de arriba del grid)
   Se agregan dinamicamente, uno por cada categoria
   real, ademas del boton fijo "Todos".
   ------------------------------------------------ */
async function cargarFiltrosCategorias() {
    const cont = document.getElementById('filtrosContenedor');
    if (!cont) return;

    try {
        const res = await fetch(`${URL_BACKEND}/categorias`);
        if (!res.ok) return;
        const categorias = await res.json();

        categorias.forEach(cat => {
            const boton = document.createElement('button');
            boton.className = 'filtro-btn';
            boton.dataset.categoria = cat.nombre;
            boton.textContent = cat.nombre;
            cont.appendChild(boton);
        });
    } catch (e) {
        console.error('No se pudieron cargar los filtros de categoria:', e.message);
    }
}

/* ------------------------------------------------
   FILTROS POR CATEGORIA
   ------------------------------------------------ */
function iniciarFiltros() {
    document.querySelectorAll('.filtro-btn').forEach(boton => {
        boton.addEventListener('click', function () {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
            this.classList.add('activo');

            filtroCategoriaActivo = this.dataset.categoria;
            paginaActual = 1;
            renderizarCatalogo();
        });
    });
}

/* ------------------------------------------------
   INICIAR AL CARGAR LA PAGINA
   ------------------------------------------------ */
document.addEventListener('DOMContentLoaded', async function () {
    const grid   = document.getElementById('productosGrid');

    // Si la pagina trae ?categoria=Nombre en la URL (categoria.html),
    // esa categoria manda sobre el data-filtro del HTML.
    const params        = new URLSearchParams(window.location.search);
    const categoriaUrl  = params.get('categoria');
    let filtro          = grid ? (grid.dataset.filtro || '') : '';

    if (categoriaUrl) {
        filtro = categoriaUrl;
        const tituloEl = document.getElementById('categoriaTitulo');
        if (tituloEl) tituloEl.textContent = categoriaUrl;
        document.title = `${categoriaUrl} | RYC Tech`;
    }

    await cargarFiltrosCategorias();
    cargarProductos(filtro);
    iniciarBuscador();
    iniciarFiltros();
});
