/* ================================================
   utils.js (version demo, sin backend)
   Funciones compartidas en todas las paginas.
   ================================================ */

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

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-fondo')) {
        e.target.classList.remove('abierto');
        document.body.style.overflow = '';
    }
});

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
