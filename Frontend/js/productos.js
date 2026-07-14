/* ================================================
   productos.js
   Maneja el catalogo de productos.
   URL_BACKEND esta definida en utils.js
   ================================================ */

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

        dibujarProductos(lista);

    } catch (error) {
        grid.innerHTML = `
            <div class="estado-vacio" style="grid-column:1/-1">
                <i class="ti ti-wifi-off"></i>
                <p>No se pudo conectar con el servidor.</p>
                <p style="font-size:12px; margin-top:6px;">Verifica que el backend este corriendo con <strong>dotnet run</strong></p>
            </div>
        `;
        console.error('Error al cargar productos:', error.message);
    }
}

/* ------------------------------------------------
   DIBUJAR PRODUCTOS EN EL GRID
   ------------------------------------------------ */
function dibujarProductos(productos) {
    const grid = document.getElementById('productosGrid');
    if (!grid) return;

    if (productos.length === 0) {
        grid.innerHTML = `
            <div class="estado-vacio" style="grid-column:1/-1">
                <i class="ti ti-package-off"></i>
                <p>No hay productos disponibles.</p>
            </div>
        `;
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
                        ? `<span class="precio-original">$${parseFloat(producto.precioOriginal).toFixed(2)}</span>`
                        : ''
                    }
                    $${parseFloat(producto.precio).toFixed(2)}
                </div>
                <button class="btn-ver-mas" onclick="event.stopPropagation(); abrirDetalleProducto(${producto.id})">
                    Ver mas
                </button>
            </div>

        </div>
    `).join('');
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
                    $${parseFloat(producto.precioOriginal).toFixed(2)}
                </span>
                $${parseFloat(producto.precio).toFixed(2)}
            `;
        } else {
            precioEl.textContent = `$${parseFloat(producto.precio).toFixed(2)}`;
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
        const texto = this.value.toLowerCase().trim();
        let visibles = 0;

        document.querySelectorAll('.tarjeta').forEach(tarjeta => {
            const contenido = tarjeta.innerText.toLowerCase();
            const coincide  = contenido.includes(texto);
            tarjeta.style.display = coincide ? '' : 'none';
            if (coincide) visibles++;
        });

        mostrarMensajeSinResultados(visibles === 0 && texto !== '');
    });
}

/* ------------------------------------------------
   MENSAJE "NO SE ENCONTRARON PRODUCTOS"
   ------------------------------------------------ */
function mostrarMensajeSinResultados(mostrar) {
    const grid = document.getElementById('productosGrid');
    if (!grid) return;

    let mensaje = document.getElementById('mensajeSinResultados');

    if (mostrar) {
        if (!mensaje) {
            mensaje = document.createElement('div');
            mensaje.id = 'mensajeSinResultados';
            mensaje.className = 'estado-vacio';
            mensaje.style.gridColumn = '1/-1';
            mensaje.innerHTML = `
                <i class="ti ti-search-off"></i>
                <p>No se encontraron productos que coincidan con tu busqueda.</p>
            `;
            grid.appendChild(mensaje);
        }
    } else if (mensaje) {
        mensaje.remove();
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

            const categoria = this.dataset.categoria;
            document.querySelectorAll('.tarjeta').forEach(tarjeta => {
                if (categoria === 'todos') {
                    tarjeta.style.display = '';
                } else {
                    const catTarjeta = tarjeta.querySelector('.tarjeta-categoria')?.textContent || '';
                    tarjeta.style.display = catTarjeta === categoria ? '' : 'none';
                }
            });
        });
    });
}

/* ------------------------------------------------
   INICIAR AL CARGAR LA PAGINA
   ------------------------------------------------ */
document.addEventListener('DOMContentLoaded', function () {
    const grid   = document.getElementById('productosGrid');
    const filtro = grid ? (grid.dataset.filtro || '') : '';

    cargarProductos(filtro);
    iniciarBuscador();
    iniciarFiltros();
});
