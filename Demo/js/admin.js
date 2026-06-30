/* ================================================
   admin.js (version demo, sin backend)
   El CRUD modifica el arreglo DEMO_PRODUCTOS en memoria.
   Los cambios se ven en pantalla pero se pierden
   al recargar la pagina (no hay base de datos real).
   ================================================ */

let idProductoEditando = null;
let idUsuarioEditando  = null;
let siguienteIdProducto = 100;
let siguienteIdUsuario  = 100;

/* ================================================
   PESTANAS
   ================================================ */
function iniciarPestanas() {
    document.querySelectorAll('.pestana-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.pestana-btn').forEach(b => b.classList.remove('activo'));
            document.querySelectorAll('.pestana-contenido').forEach(c => c.classList.remove('activo'));
            this.classList.add('activo');
            document.getElementById(this.dataset.pestana).classList.add('activo');
        });
    });
}

/* ================================================
   ESTADISTICAS
   ================================================ */
function cargarEstadisticas() {
    document.getElementById('statProductos').textContent  = DEMO_PRODUCTOS.length;
    document.getElementById('statCategorias').textContent = DEMO_CATEGORIAS.length;
    document.getElementById('statUsuarios').textContent   = DEMO_USUARIOS.length;
    document.getElementById('statOfertas').textContent    = DEMO_PRODUCTOS.filter(p => p.badge === 'oferta').length;
}

/* ================================================
   BUSCADOR DE PRODUCTOS
   ================================================ */
function iniciarBuscadorAdmin() {
    const input = document.getElementById('buscadorAdmin');
    if (!input) return;

    input.addEventListener('input', function () {
        const texto = this.value.toLowerCase().trim();
        if (!texto) { dibujarTablaProductos(DEMO_PRODUCTOS); return; }

        const filtrados = DEMO_PRODUCTOS.filter(p =>
            p.nombre.toLowerCase().includes(texto)    ||
            p.categoria.toLowerCase().includes(texto) ||
            p.precio.toString().includes(texto)
        );
        dibujarTablaProductos(filtrados);
    });
}

/* ================================================
   PRODUCTOS
   ================================================ */
function cargarTablaProductos() {
    dibujarTablaProductos(DEMO_PRODUCTOS);
}

function dibujarTablaProductos(productos) {
    const tbody = document.getElementById('tablaProductosCuerpo');
    if (!tbody) return;

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No se encontraron productos.</td></tr>';
        return;
    }

    tbody.innerHTML = productos.map(p => `
        <tr>
            <td style="color:#94a3b8">${p.id}</td>
            <td><img src="imagenes/${p.imagen}" alt="${p.nombre}"
                style="width:44px;height:44px;object-fit:contain;background:#f8fafc;border-radius:6px;padding:3px;"
                onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2244%22 height=%2244%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23f8fafc%22/></svg>'">
            </td>
            <td style="font-weight:bold;color:#0f172a">${p.nombre}</td>
            <td>
                <span class="badge-categoria ${p.categoria.toLowerCase()}">${p.categoria}</span>
                ${p.badge ? `<span class="tarjeta-badge ${p.badge}" style="position:static;display:inline-block;margin-left:4px;">${p.badge}</span>` : ''}
            </td>
            <td>
                ${p.precioOriginal ? `<span style="text-decoration:line-through;color:#94a3b8;font-size:11px;">$${p.precioOriginal.toFixed(2)}</span><br>` : ''}
                $${p.precio.toFixed(2)}
            </td>
            <td>
                <div class="td-acciones">
                    <button class="btn-editar" onclick="abrirFormEditarProducto(${p.id})">
                        <i class="ti ti-edit" aria-hidden="true"></i> Editar
                    </button>
                    <button class="btn-peligro" onclick="confirmarEliminarProducto(${p.id}, '${p.nombre}')">
                        <i class="ti ti-trash" aria-hidden="true"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function previsualizarImagen(input) {
    const preview = document.getElementById('imagenPreview');
    const file    = input.files[0];
    if (!file) return;
    const reader  = new FileReader();
    reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(file);
}

function abrirFormAgregarProducto() {
    idProductoEditando = null;
    ['fpNombre','fpPrecio','fpPrecioOriginal','fpDescripcion','fpImagen','fpImagenActual'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('fpCategoria').value = '';
    document.getElementById('fpBadge').value     = '';
    const preview = document.getElementById('imagenPreview');
    preview.src   = ''; preview.style.display = 'none';
    limpiarSpecs();
    document.getElementById('formProductoTitulo').textContent = 'Agregar producto (modo demo)';
    abrirModal('modalFormProducto');
}

function abrirFormEditarProducto(id) {
    const p = DEMO_PRODUCTOS.find(x => x.id === id);
    if (!p) { mostrarNotificacion('Producto no encontrado.', 'error'); return; }

    idProductoEditando = id;
    document.getElementById('fpNombre').value         = p.nombre;
    document.getElementById('fpCategoria').value      = p.categoria;
    document.getElementById('fpPrecio').value         = p.precio;
    document.getElementById('fpPrecioOriginal').value = p.precioOriginal || '';
    document.getElementById('fpBadge').value          = p.badge || '';
    document.getElementById('fpDescripcion').value    = p.descripcion;
    document.getElementById('fpImagen').value         = '';
    document.getElementById('fpImagenActual').value   = p.imagen;

    const preview = document.getElementById('imagenPreview');
    preview.src   = `imagenes/${p.imagen}`; preview.style.display = 'block';

    limpiarSpecs();
    if (p.specs && p.specs.length > 0) {
        p.specs.forEach(s => agregarFilaSpec(s.clave, s.valor));
    }

    document.getElementById('formProductoTitulo').textContent = 'Editar producto (modo demo)';
    abrirModal('modalFormProducto');
}

function guardarProducto() {
    const nombre         = document.getElementById('fpNombre').value.trim();
    const categoria      = document.getElementById('fpCategoria').value;
    const precio         = document.getElementById('fpPrecio').value;
    const precioOriginal = document.getElementById('fpPrecioOriginal').value;
    const badge          = document.getElementById('fpBadge').value;
    const descripcion    = document.getElementById('fpDescripcion').value.trim();
    const archivoImagen  = document.getElementById('fpImagen').files[0];
    const imagenActual   = document.getElementById('fpImagenActual').value;

    if (!nombre || !categoria || !precio || !descripcion) {
        mostrarNotificacion('Completa todos los campos obligatorios.', 'error'); return;
    }

    // En modo demo, si suben una imagen nueva usamos una de muestra existente
    // ya que no hay backend para guardarla de verdad
    const nombreImagen = imagenActual || 'oferta.jpg';

    const specs = obtenerSpecsDelFormulario();

    if (idProductoEditando) {
        const idx = DEMO_PRODUCTOS.findIndex(p => p.id === idProductoEditando);
        if (idx !== -1) {
            DEMO_PRODUCTOS[idx] = {
                ...DEMO_PRODUCTOS[idx],
                nombre, categoria,
                precio: parseFloat(precio),
                precioOriginal: precioOriginal ? parseFloat(precioOriginal) : null,
                badge: badge || null,
                descripcion,
                imagen: nombreImagen,
                specs
            };
        }
        mostrarNotificacion('Producto actualizado. (Modo demo, no se guarda en una base de datos real)', 'exito');
    } else {
        DEMO_PRODUCTOS.push({
            id: siguienteIdProducto++,
            nombre, categoria,
            precio: parseFloat(precio),
            precioOriginal: precioOriginal ? parseFloat(precioOriginal) : null,
            badge: badge || null,
            descripcion,
            imagen: nombreImagen,
            specs
        });
        mostrarNotificacion('Producto agregado. (Modo demo, no se guarda en una base de datos real)', 'exito');
    }

    cerrarModal('modalFormProducto');
    cargarTablaProductos();
    cargarEstadisticas();
}

function confirmarEliminarProducto(id, nombre) {
    document.getElementById('confirmarEliminarNombre').textContent = nombre;
    document.getElementById('btnConfirmarEliminar').onclick = () => eliminarProducto(id);
    abrirModal('modalConfirmarEliminar');
}

function eliminarProducto(id) {
    const idx = DEMO_PRODUCTOS.findIndex(p => p.id === id);
    if (idx !== -1) DEMO_PRODUCTOS.splice(idx, 1);

    cerrarModal('modalConfirmarEliminar');
    mostrarNotificacion('Producto eliminado. (Modo demo)', 'info');
    cargarTablaProductos();
    cargarEstadisticas();
}

/* ================================================
   CATEGORIAS
   ================================================ */
function cargarCategorias() {
    const contenedor = document.getElementById('listaCategorias');
    if (!contenedor) return;

    contenedor.innerHTML = DEMO_CATEGORIAS.map(c => `
        <div style="display:flex; align-items:center; justify-content:space-between;
                    padding:12px 14px; background:#F4F6F9; border-radius:8px; margin-bottom:8px;">
            <div>
                <span style="font-weight:bold; color:#0f172a; font-size:13px;">${c.nombre}</span>
                <span style="color:#94a3b8; font-size:11px; margin-left:8px;">
                    ${DEMO_PRODUCTOS.filter(p => p.categoria === c.nombre).length} productos
                </span>
            </div>
            <button class="btn-peligro" onclick="eliminarCategoria(${c.id}, '${c.nombre}')">
                <i class="ti ti-trash" aria-hidden="true"></i>
            </button>
        </div>
    `).join('');
}

function agregarCategoria() {
    const nombre = document.getElementById('nuevaCategoria').value.trim();
    if (!nombre) { mostrarNotificacion('Escribe el nombre de la categoria.', 'error'); return; }

    DEMO_CATEGORIAS.push({ id: Date.now(), nombre, totalProductos: 0 });
    document.getElementById('nuevaCategoria').value = '';
    mostrarNotificacion('Categoria agregada. (Modo demo)', 'exito');
    cargarCategorias();
    cargarEstadisticas();
}

function eliminarCategoria(id, nombre) {
    if (!confirm(`Eliminar la categoria "${nombre}"?`)) return;
    const idx = DEMO_CATEGORIAS.findIndex(c => c.id === id);
    if (idx !== -1) DEMO_CATEGORIAS.splice(idx, 1);
    mostrarNotificacion('Categoria eliminada. (Modo demo)', 'info');
    cargarCategorias();
    cargarEstadisticas();
}

/* ================================================
   EMPLEADOS
   ================================================ */
function cargarTablaUsuarios() {
    const tbody = document.getElementById('tablaUsuariosCuerpo');
    if (!tbody) return;

    tbody.innerHTML = DEMO_USUARIOS.map(u => `
        <tr>
            <td style="color:#94a3b8">${u.id}</td>
            <td style="font-weight:bold;color:#0f172a">${u.nombre}</td>
            <td>${u.correo}</td>
            <td><span class="badge-categoria ${u.rol === 'Administrador' ? 'tecnologia' : 'accesorios'}">${u.rol}</span></td>
            <td>
                <div class="td-acciones">
                    <button class="btn-editar" onclick="abrirFormEditarUsuario(${u.id})">
                        <i class="ti ti-edit" aria-hidden="true"></i> Editar
                    </button>
                    <button class="btn-peligro" onclick="eliminarUsuario(${u.id}, '${u.nombre}')">
                        <i class="ti ti-trash" aria-hidden="true"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function abrirFormAgregarUsuario() {
    idUsuarioEditando = null;
    ['fuNombre','fuCorreo','fuPassword'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('fuRol').value = 'Empleado';
    document.getElementById('fuPassword').required = true;
    document.getElementById('formUsuarioTitulo').textContent = 'Agregar empleado (modo demo)';
    abrirModal('modalFormUsuario');
}

function abrirFormEditarUsuario(id) {
    const u = DEMO_USUARIOS.find(x => x.id === id);
    if (!u) { mostrarNotificacion('Empleado no encontrado.', 'error'); return; }

    idUsuarioEditando = id;
    document.getElementById('fuNombre').value   = u.nombre;
    document.getElementById('fuCorreo').value   = u.correo;
    document.getElementById('fuRol').value      = u.rol;
    document.getElementById('fuPassword').value = '';
    document.getElementById('fuPassword').required = false;
    document.getElementById('formUsuarioTitulo').textContent = 'Editar empleado (modo demo)';
    abrirModal('modalFormUsuario');
}

function guardarUsuario() {
    const nombre = document.getElementById('fuNombre').value.trim();
    const correo = document.getElementById('fuCorreo').value.trim();
    const rol    = document.getElementById('fuRol').value;

    if (!nombre || !correo || !rol) { mostrarNotificacion('Completa todos los campos.', 'error'); return; }

    if (idUsuarioEditando) {
        const idx = DEMO_USUARIOS.findIndex(u => u.id === idUsuarioEditando);
        if (idx !== -1) DEMO_USUARIOS[idx] = { ...DEMO_USUARIOS[idx], nombre, correo, rol };
        mostrarNotificacion('Empleado actualizado. (Modo demo)', 'exito');
    } else {
        DEMO_USUARIOS.push({ id: siguienteIdUsuario++, nombre, correo, rol });
        mostrarNotificacion('Empleado agregado. (Modo demo)', 'exito');
    }

    cerrarModal('modalFormUsuario');
    cargarTablaUsuarios();
    cargarEstadisticas();
}

function eliminarUsuario(id, nombre) {
    if (!confirm(`Eliminar al empleado "${nombre}"?`)) return;
    const idx = DEMO_USUARIOS.findIndex(u => u.id === id);
    if (idx !== -1) DEMO_USUARIOS.splice(idx, 1);
    mostrarNotificacion('Empleado eliminado. (Modo demo)', 'info');
    cargarTablaUsuarios();
    cargarEstadisticas();
}

/* ================================================
   ESPECIFICACIONES TECNICAS
   ================================================ */
function agregarFilaSpec(clave = '', valor = '') {
    const container = document.getElementById('specsContainer');
    if (!container) return;

    const fila = document.createElement('div');
    fila.className = 'spec-fila';
    fila.style.cssText = 'display:flex; gap:8px; margin-bottom:8px; align-items:center;';
    fila.innerHTML = `
        <input type="text" placeholder="Clave (ej. RAM)" value="${clave}"
               style="flex:1; padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px;
                      font-size:13px; background:#F4F6F9; font-family:Arial,sans-serif;"
               class="spec-clave">
        <input type="text" placeholder="Valor (ej. 8 GB)" value="${valor}"
               style="flex:1; padding:8px 10px; border:1px solid #e2e8f0; border-radius:6px;
                      font-size:13px; background:#F4F6F9; font-family:Arial,sans-serif;"
               class="spec-valor">
        <button type="button" class="btn-peligro" onclick="this.parentElement.remove()"
                style="padding:6px 10px; flex-shrink:0;">
            <i class="ti ti-trash" aria-hidden="true"></i>
        </button>
    `;
    container.appendChild(fila);
}

function obtenerSpecsDelFormulario() {
    const specs = [];
    document.querySelectorAll('.spec-fila').forEach(fila => {
        const clave = fila.querySelector('.spec-clave').value.trim();
        const valor = fila.querySelector('.spec-valor').value.trim();
        if (clave && valor) specs.push({ clave, valor });
    });
    return specs;
}

function limpiarSpecs() {
    const container = document.getElementById('specsContainer');
    if (container) container.innerHTML = '';
}

/* ================================================
   INIT
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {
    protegerPaginaAdmin();
    iniciarPestanas();
    iniciarBuscadorAdmin();
    cargarEstadisticas();
    cargarTablaProductos();
    cargarCategorias();
    cargarTablaUsuarios();

    const sesion = obtenerSesion();
    const info   = document.getElementById('infoSesion');
    if (sesion && info) info.textContent = `Sesion activa: ${sesion.nombre} (${sesion.rol}) — Modo demo`;
});
