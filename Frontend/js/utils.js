/* ================================================
   utils.js
   Funciones compartidas en todas las paginas.
   Aqui tambien se define URL_BACKEND una sola vez
   para evitar el error de variable duplicada.
   ================================================ */

// URL del backend — apunta a tu IP en red local
// Si cambias de red, actualiza esta IP
<<<<<<< HEAD
const URL_BACKEND = 'http://172.18.9.152:5000/api';
=======
const URL_BACKEND = 'http://192.168.100.16:5000/api';
>>>>>>> 8c13c2b66efd12f81a05e9431a3c2e07cd21fb6b

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
