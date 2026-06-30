/* ================================================
   productos.js (version demo, sin backend)
   Lee los productos del arreglo DEMO_PRODUCTOS
   en lugar de hacer fetch() a una API
   ================================================ */

function cargarProductos(filtro = '') {
    const grid = document.getElementById('productosGrid');
    if (!grid) return;

    let lista = DEMO_PRODUCTOS;

    if (filtro === 'Ofertas') {
        lista = DEMO_PRODUCTOS.filter(p => p.badge === 'oferta');
    } else if (filtro !== '') {
        lista = DEMO_PRODUCTOS.filter(p => p.categoria === filtro);
    }

    dibujarProductos(lista);
}

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
                        ? `<span class="precio-original">$${producto.precioOriginal.toFixed(2)}</span>`
                        : ''
                    }
                    $${producto.precio.toFixed(2)}
                </div>
                <button class="btn-ver-mas" onclick="event.stopPropagation(); abrirDetalleProducto(${producto.id})">
                    Ver mas
                </button>
            </div>

        </div>
    `).join('');
}

function abrirDetalleProducto(id) {
    const producto = DEMO_PRODUCTOS.find(p => p.id === id);
    if (!producto) {
        mostrarNotificacion('Producto no encontrado.', 'error');
        return;
    }

    document.getElementById('modalProdImg').src         = `imagenes/${producto.imagen}`;
    document.getElementById('modalProdImg').alt         = producto.nombre;
    document.getElementById('modalProdCategoria').textContent  = producto.categoria;
    document.getElementById('modalProdNombre').textContent     = producto.nombre;
    document.getElementById('modalProdDescripcion').textContent = producto.descripcion;

    const precioEl = document.getElementById('modalProdPrecio');
    if (producto.precioOriginal) {
        precioEl.innerHTML = `
            <span style="font-size:13px; color:#94a3b8; text-decoration:line-through; font-weight:normal;">
                $${producto.precioOriginal.toFixed(2)}
            </span>
            $${producto.precio.toFixed(2)}
        `;
    } else {
        precioEl.textContent = `$${producto.precio.toFixed(2)}`;
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
}

function iniciarBuscador() {
    const inputBuscar = document.getElementById('inputBuscar');
    if (!inputBuscar) return;

    inputBuscar.addEventListener('input', function () {
        const texto = this.value.toLowerCase().trim();
        document.querySelectorAll('.tarjeta').forEach(tarjeta => {
            const contenido = tarjeta.innerText.toLowerCase();
            tarjeta.style.display = contenido.includes(texto) ? '' : 'none';
        });
    });
}

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

document.addEventListener('DOMContentLoaded', function () {
    const grid   = document.getElementById('productosGrid');
    const filtro = grid ? (grid.dataset.filtro || '') : '';

    cargarProductos(filtro);
    iniciarBuscador();
    iniciarFiltros();
});
