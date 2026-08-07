/* ================================================
   admin.js — Panel de administracion
   URL_BACKEND definida en utils.js
   ================================================ */

let idProductoEditando = null;
let idUsuarioEditando  = null;
let todosLosProductos  = []; // Cache para el buscador

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
async function cargarEstadisticas() {
    try {
        const res   = await fetch(`${URL_BACKEND}/estadisticas`);
        if (!res.ok) return;
        const stats = await res.json();
        document.getElementById('statProductos').textContent  = stats.totalProductos  || 0;
        document.getElementById('statCategorias').textContent = stats.totalCategorias || 0;
        document.getElementById('statUsuarios').textContent   = stats.totalUsuarios   || 0;
        document.getElementById('statOfertas').textContent    = stats.enOferta        || 0;
    } catch (e) { console.error(e.message); }
}


function iniciarBuscadorAdmin() {
    const input = document.getElementById('buscadorAdmin');
    if (!input) return;

    input.addEventListener('input', function () {
        const texto = this.value.toLowerCase().trim();

        // Si no hay texto, mostrar todos
        if (!texto) {
            dibujarTablaProductos(todosLosProductos);
            return;
        }

        // Filtrar por nombre, categoria o precio
        const filtrados = todosLosProductos.filter(p =>
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
async function cargarTablaProductos() {
    const tbody = document.getElementById('tablaProductosCuerpo');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">Cargando...</td></tr>';

    try {
        const res = await fetch(`${URL_BACKEND}/productos`);
        if (!res.ok) throw new Error('Error al obtener productos');

        todosLosProductos = await res.json();
        dibujarTablaProductos(todosLosProductos);

    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#dc2626;padding:20px;">Error al cargar productos.</td></tr>';
        console.error(e.message);
    }
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
                ${p.precioOriginal ? `<span style="text-decoration:line-through;color:#94a3b8;font-size:11px;">$${parseFloat(p.precioOriginal).toFixed(2)}</span><br>` : ''}
                $${parseFloat(p.precio).toFixed(2)}
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
    document.getElementById('formProductoTitulo').textContent = 'Agregar producto';
    abrirModal('modalFormProducto');
}

async function abrirFormEditarProducto(id) {
    try {
        const res = await fetch(`${URL_BACKEND}/productos/${id}`);
        if (!res.ok) throw new Error('Producto no encontrado');
        const p   = await res.json();

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

        // Cargar especificaciones existentes en el formulario
        limpiarSpecs();
        if (p.specs && p.specs.length > 0) {
            p.specs.forEach(s => agregarFilaSpec(s.clave, s.valor));
        }

        document.getElementById('formProductoTitulo').textContent = 'Editar producto';
        abrirModal('modalFormProducto');
    } catch (e) {
        mostrarNotificacion('No se pudo cargar el producto.', 'error');
        console.error(e.message);
    }
}

async function guardarProducto() {
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
    if (!idProductoEditando && !archivoImagen) {
        mostrarNotificacion('Selecciona una imagen para el producto.', 'error'); return;
    }

    try {
        let nombreImagen = imagenActual;

        // Si hay imagen nueva, subirla primero
        if (archivoImagen) {
            const formData = new FormData();
            formData.append('imagen', archivoImagen);
            const resImg = await fetch(`${URL_BACKEND}/imagenes/subir`, { method: 'POST', body: formData });
            if (!resImg.ok) throw new Error('Error al subir la imagen.');
            const datosImg = await resImg.json();
            nombreImagen   = datosImg.nombreArchivo;
        }

        const dto = {
            nombre, categoria,
            precio:         parseFloat(precio),
            precioOriginal: precioOriginal ? parseFloat(precioOriginal) : null,
            badge:          badge || null,
            descripcion,
            imagen:         nombreImagen,
            specs:          obtenerSpecsDelFormulario()
        };

        const url    = idProductoEditando ? `${URL_BACKEND}/productos/${idProductoEditando}` : `${URL_BACKEND}/productos`;
        const metodo = idProductoEditando ? 'PUT' : 'POST';
        const res    = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dto) });

        if (!res.ok) throw new Error('Error al guardar producto');

        cerrarModal('modalFormProducto');
        mostrarNotificacion(idProductoEditando ? 'Producto actualizado.' : 'Producto agregado.', 'exito');
        cargarTablaProductos();
        cargarEstadisticas();
    } catch (e) {
        mostrarNotificacion('Error al guardar el producto.', 'error');
        console.error(e.message);
    }
}

function confirmarEliminarProducto(id, nombre) {
    document.getElementById('confirmarEliminarNombre').textContent = nombre;
    document.getElementById('btnConfirmarEliminar').onclick = () => eliminarProducto(id);
    abrirModal('modalConfirmarEliminar');
}

async function eliminarProducto(id) {
    try {
        const res = await fetch(`${URL_BACKEND}/productos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        cerrarModal('modalConfirmarEliminar');

        // Quita la fila de inmediato en vez de esperar a que cargarTablaProductos()
        // vuelva a pedir la lista completa al servidor
        const fila = document.querySelector(`#tablaProductosCuerpo button.btn-peligro[onclick*="confirmarEliminarProducto(${id},"]`)?.closest('tr');
        if (fila) fila.remove();
        todosLosProductos = todosLosProductos.filter(p => p.id !== id);

        mostrarNotificacion('Producto eliminado.', 'info');
        cargarTablaProductos();
        cargarEstadisticas();
    } catch (e) { mostrarNotificacion('Error al eliminar.', 'error'); }
}

/* ================================================
   CATEGORIAS
   ================================================ */
let idCategoriaEditando = null;

async function cargarCategorias() {
    const cont = document.getElementById('listaCategorias');
    if (!cont) return;
    try {
        const res  = await fetch(`${URL_BACKEND}/categorias`);
        if (!res.ok) throw new Error();
        const cats = await res.json();

        cont.innerHTML = cats.length === 0
            ? '<p style="color:#94a3b8;font-size:13px;">No hay categorias registradas.</p>'
            : cats.map(c => `
                <div style="display:flex;align-items:center;justify-content:space-between;
                            padding:12px 14px;background:#F4F6F9;border-radius:8px;margin-bottom:8px;">
                    <div>
                        <span style="font-weight:bold;color:#0f172a;font-size:13px;">${c.nombre}</span>
                        <span style="color:#94a3b8;font-size:11px;margin-left:8px;">${c.totalProductos} productos</span>
                    </div>
                    <div class="td-acciones">
                        <button class="btn-editar" data-id="${c.id}" data-nombre="${escaparAtributo(c.nombre)}" onclick="abrirFormEditarCategoria(this)">
                            <i class="ti ti-edit" aria-hidden="true"></i> Editar
                        </button>
                        <button class="btn-peligro" data-id="${c.id}" data-nombre="${escaparAtributo(c.nombre)}" onclick="eliminarCategoria(this)">
                            <i class="ti ti-trash" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>`).join('');

        // Mantiene el selector de categorias del formulario de productos sincronizado
        cargarCategoriasEnFormularioProducto(cats);
    } catch (e) { console.error(e.message); }
}

// Evita que un nombre de categoria con comillas rompa los atributos onclick
function escaparAtributo(texto) {
    return String(texto).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// Llena el selector "Categoria" del formulario de productos con las
// categorias reales que existen en ese momento (en vez de una lista fija)
function cargarCategoriasEnFormularioProducto(categorias) {
    const select = document.getElementById('fpCategoria');
    if (!select) return;
    const valorActual = select.value;
    select.innerHTML = '<option value="">Seleccionar...</option>' +
        categorias.map(c => `<option value="${escaparAtributo(c.nombre)}">${c.nombre}</option>`).join('');
    if (valorActual) select.value = valorActual;
}

async function agregarCategoria() {
    const nombre = document.getElementById('nuevaCategoria').value.trim();
    if (!nombre) { mostrarNotificacion('Escribe el nombre de la categoria.', 'error'); return; }
    try {
        const res = await fetch(`${URL_BACKEND}/categorias`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        if (!res.ok) throw new Error();
        document.getElementById('nuevaCategoria').value = '';
        mostrarNotificacion('Categoria agregada.', 'exito');
        cargarCategorias(); cargarEstadisticas(); cargarMenuCategorias();
    } catch (e) { mostrarNotificacion('Error al agregar la categoria.', 'error'); }
}

function abrirFormEditarCategoria(boton) {
    idCategoriaEditando = boton.dataset.id;
    document.getElementById('fcNombre').value = boton.dataset.nombre;
    abrirModal('modalFormCategoria');
}

async function guardarEdicionCategoria() {
    const nombre = document.getElementById('fcNombre').value.trim();
    if (!nombre) { mostrarNotificacion('Escribe el nombre de la categoria.', 'error'); return; }
    if (!idCategoriaEditando) return;

    try {
        const res = await fetch(`${URL_BACKEND}/categorias/${idCategoriaEditando}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        if (!res.ok) throw new Error();
        cerrarModal('modalFormCategoria');
        mostrarNotificacion('Categoria actualizada.', 'exito');
        idCategoriaEditando = null;
        cargarCategorias(); cargarEstadisticas(); cargarMenuCategorias();
    } catch (e) { mostrarNotificacion('Error al actualizar la categoria.', 'error'); }
}

async function eliminarCategoria(boton) {
    const id     = boton.dataset.id;
    const nombre = boton.dataset.nombre;
    if (!confirm(`Eliminar la categoria "${nombre}"?`)) return;
    try {
        const res    = await fetch(`${URL_BACKEND}/categorias/${id}`, { method: 'DELETE' });
        const datos  = await res.json().catch(() => ({}));
        if (!res.ok) {
            // Muestra el motivo real (ej. "tiene productos asociados") en vez de un error generico
            mostrarNotificacion(datos.mensaje || 'Error al eliminar.', 'error');
            return;
        }
        // Quita la fila de inmediato en vez de esperar a que cargarCategorias()
        // vuelva a pedir la lista completa al servidor
        boton.closest('div').parentElement.remove();
        mostrarNotificacion('Categoria eliminada.', 'info');
        cargarCategorias(); cargarEstadisticas(); cargarMenuCategorias();
    } catch (e) { mostrarNotificacion('Error al eliminar.', 'error'); }
}

/* ================================================
   EMPLEADOS
   ================================================ */
async function cargarTablaUsuarios() {
    const tbody = document.getElementById('tablaUsuariosCuerpo');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px;">Cargando...</td></tr>';
    try {
        const res      = await fetch(`${URL_BACKEND}/usuarios`);
        if (!res.ok) throw new Error();
        const usuarios = await res.json();

        tbody.innerHTML = usuarios.length === 0
            ? '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px;">No hay empleados registrados.</td></tr>'
            : usuarios.map(u => `
                <tr>
                    <td style="color:#94a3b8">${u.id}</td>
                    <td style="font-weight:bold;color:#0f172a">${u.nombre}${u.esPrincipal ? ' <i class="ti ti-lock" aria-hidden="true" title="Administrador principal" style="color:#94a3b8;"></i>' : ''}</td>
                    <td>${u.correo}</td>
                    <td><span class="badge-categoria ${u.rol === 'Administrador' ? 'tecnologia' : 'accesorios'}">${u.rol}</span></td>
                    <td>
                        <div class="td-acciones">
                            <button class="btn-editar" onclick="abrirFormEditarUsuario(${u.id})">
                                <i class="ti ti-edit" aria-hidden="true"></i> Editar
                            </button>
                            ${u.esPrincipal
                                ? '<span style="font-size:11px;color:#94a3b8;padding:6px 8px;" title="El administrador principal no se puede eliminar">Protegido</span>'
                                : `<button class="btn-peligro" data-id="${u.id}" data-nombre="${escaparAtributo(u.nombre)}" onclick="eliminarUsuario(this)">
                                        <i class="ti ti-trash" aria-hidden="true"></i>
                                   </button>`
                            }
                        </div>
                    </td>
                </tr>`).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#dc2626;padding:20px;">Error al cargar empleados.</td></tr>';
    }
}

function abrirFormAgregarUsuario() {
    idUsuarioEditando = null;
    ['fuNombre','fuCorreo','fuPassword'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('fuRol').value = 'Empleado';
    document.getElementById('fuPassword').required = true;
    document.getElementById('formUsuarioTitulo').textContent = 'Agregar empleado';
    abrirModal('modalFormUsuario');
}

async function abrirFormEditarUsuario(id) {
    try {
        const res = await fetch(`${URL_BACKEND}/usuarios/${id}`);
        if (!res.ok) throw new Error();
        const u   = await res.json();
        idUsuarioEditando = id;
        document.getElementById('fuNombre').value   = u.nombre;
        document.getElementById('fuCorreo').value   = u.correo;
        document.getElementById('fuRol').value      = u.rol;
        document.getElementById('fuPassword').value = '';
        document.getElementById('fuPassword').required = false;
        document.getElementById('formUsuarioTitulo').textContent = 'Editar empleado';
        abrirModal('modalFormUsuario');
    } catch (e) { mostrarNotificacion('No se pudo cargar el empleado.', 'error'); }
}

async function guardarUsuario() {
    const nombre   = document.getElementById('fuNombre').value.trim();
    const correo   = document.getElementById('fuCorreo').value.trim();
    const rol      = document.getElementById('fuRol').value;
    const password = document.getElementById('fuPassword').value;

    if (!nombre || !correo || !rol) { mostrarNotificacion('Completa todos los campos.', 'error'); return; }
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(correo)) { mostrarNotificacion('Ingresa un correo electronico valido.', 'error'); return; }
    if (!idUsuarioEditando && !password) { mostrarNotificacion('La contrasena es obligatoria.', 'error'); return; }
    try {
        const url    = idUsuarioEditando ? `${URL_BACKEND}/usuarios/${idUsuarioEditando}` : `${URL_BACKEND}/usuarios`;
        const metodo = idUsuarioEditando ? 'PUT' : 'POST';
        const res    = await fetch(url, {
            method: metodo, headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, rol, password })
        });
        if (!res.ok) throw new Error();
        cerrarModal('modalFormUsuario');
        mostrarNotificacion(idUsuarioEditando ? 'Empleado actualizado.' : 'Empleado agregado.', 'exito');
        cargarTablaUsuarios(); cargarEstadisticas();
    } catch (e) { mostrarNotificacion('Error al guardar el empleado.', 'error'); }
}

async function eliminarUsuario(boton) {
    const id     = boton.dataset.id;
    const nombre = boton.dataset.nombre;
    if (!confirm(`Eliminar al empleado "${nombre}"?`)) return;
    try {
        const res   = await fetch(`${URL_BACKEND}/usuarios/${id}`, { method: 'DELETE' });
        const datos = await res.json().catch(() => ({}));
        if (!res.ok) {
            // Muestra el motivo real (ej. "es el administrador principal") en vez de un error generico
            mostrarNotificacion(datos.mensaje || 'Error al eliminar.', 'error');
            return;
        }
        // Quita la fila de inmediato en vez de esperar a que cargarTablaUsuarios()
        // vuelva a pedir la lista completa al servidor
        boton.closest('tr').remove();
        mostrarNotificacion('Empleado eliminado.', 'info');
        cargarTablaUsuarios(); cargarEstadisticas();
    } catch (e) { mostrarNotificacion('Error al eliminar.', 'error'); }
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
    if (sesion && info) info.textContent = `Sesion activa: ${sesion.nombre} (${sesion.rol})`;

    // Restringir pestana Empleados si es rol Empleado
    if (sesion && sesion.rol === 'Empleado') {
        document.querySelector('[data-pestana="tabEmpleados"]').style.display = 'none';
        document.getElementById('tabEmpleados').style.display = 'none';
    }
});

/* ================================================
   ESPECIFICACIONES TECNICAS
   ================================================ */

// Agrega una fila de clave/valor al formulario
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

// Obtiene las specs del formulario como arreglo
function obtenerSpecsDelFormulario() {
    const specs = [];
    document.querySelectorAll('.spec-fila').forEach(fila => {
        const clave = fila.querySelector('.spec-clave').value.trim();
        const valor = fila.querySelector('.spec-valor').value.trim();
        if (clave && valor) specs.push({ clave, valor });
    });
    return specs;
}

// Limpia las filas de specs
function limpiarSpecs() {
    const container = document.getElementById('specsContainer');
    if (container) container.innerHTML = '';
}
