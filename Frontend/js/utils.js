/* ================================================
   utils.js
   Funciones compartidas en todas las paginas.
   Aqui tambien se define URL_BACKEND una sola vez
   para evitar el error de variable duplicada.
   ================================================ */

// URL del backend — apunta a tu IP en red local
// Si cambias de red, actualiza esta IP
const URL_BACKEND = `http://${window.location.hostname}:5000/api`;

/* ------------------------------------------------
   FORMATEAR PRECIO EN PESOS MEXICANOS (MXN)
   ------------------------------------------------ */
function formatearPrecio(valor) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(parseFloat(valor));
}

/* ------------------------------------------------
   ABRIR MODAL
   ------------------------------------------------ */
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('abierto');
        document.body.style.overflow = 'hidden';
    }
}

/* ------------------------------------------------
   CERRAR MODAL
   ------------------------------------------------ */
function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('abierto');
        document.body.style.overflow = '';
    }
}

/* ------------------------------------------------
   CERRAR MODAL AL HACER CLIC EN EL FONDO
   ------------------------------------------------ */
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-fondo')) {
        e.target.classList.remove('abierto');
        document.body.style.overflow = '';
    }
});

/* ------------------------------------------------
   CERRAR MODAL CON TECLA ESC
   ------------------------------------------------ */
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-fondo.abierto').forEach(modal => {
            modal.classList.remove('abierto');
            document.body.style.overflow = '';
        });
    }
});

/* ------------------------------------------------
   MOSTRAR NOTIFICACION
   tipo: 'exito', 'error', 'info'
   ------------------------------------------------ */
function mostrarNotificacion(mensaje, tipo = 'info') {
    let contenedor = document.getElementById('notificacionesContenedor');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'notificacionesContenedor';
        contenedor.className = 'notificaciones-contenedor';
        document.body.appendChild(contenedor);
    }

    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    notif.textContent = mensaje;
    contenedor.appendChild(notif);

    setTimeout(() => notif.remove(), 3500);
}

/* ------------------------------------------------
   MENU DE CATEGORIAS (dinamico)
   Agrega automaticamente un enlace por cada categoria
   que exista en ese momento (incluyendo las nuevas que
   se agreguen desde el panel), justo antes de "Ofertas".
   Se ejecuta en todas las paginas porque esta en utils.js.
   Tambien se puede volver a llamar (ej. desde admin.js al
   agregar/editar/eliminar una categoria) para refrescar
   el menu sin tener que recargar la pagina.
   ------------------------------------------------ */
async function cargarMenuCategorias() {
    const ancla = document.getElementById('itemOfertas');
    if (!ancla) return;

    try {
        const res = await fetch(`${URL_BACKEND}/categorias`);
        if (!res.ok) return;
        const categorias = await res.json();

        // Quita los enlaces que se hayan agregado en una llamada anterior,
        // para no duplicarlos ni dejar categorias ya eliminadas
        document.querySelectorAll('.menu-categoria-dinamica').forEach(li => li.remove());

        const params          = new URLSearchParams(window.location.search);
        const categoriaActual = params.get('categoria');

        categorias.forEach(cat => {
            const li     = document.createElement('li');
            li.className = 'menu-categoria-dinamica';
            const activo = cat.nombre === categoriaActual ? ' class="activo"' : '';
            li.innerHTML = `<a href="categoria.html?categoria=${encodeURIComponent(cat.nombre)}"${activo}>` +
                            `<i class="ti ti-folder" aria-hidden="true"></i> ${cat.nombre}</a>`;
            ancla.parentNode.insertBefore(li, ancla);
        });
    } catch (e) {
        console.error('No se pudo cargar el menu de categorias:', e.message);
    }
}

document.addEventListener('DOMContentLoaded', cargarMenuCategorias);
