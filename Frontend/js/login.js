/* ================================================
   login.js
   Maneja el inicio y cierre de sesion.
   URL_BACKEND esta definida en utils.js
   ================================================ */

/* ------------------------------------------------
   INICIAR SESION
   ------------------------------------------------ */
async function iniciarSesion() {
    const correo   = document.getElementById('loginCorreo').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!correo || !password) {
        mostrarNotificacion('Completa todos los campos.', 'error');
        return;
    }

    try {
        const respuesta = await fetch(`${URL_BACKEND}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });

        if (!respuesta.ok) {
            mostrarNotificacion('Correo o contrasena incorrectos.', 'error');
            document.getElementById('loginPassword').value = '';
            return;
        }

        const usuario = await respuesta.json();

        // Guardar sesion en sessionStorage
        sessionStorage.setItem('sesion', JSON.stringify(usuario));

        cerrarModal('modalLogin');
        actualizarBotonLogin();

        mostrarNotificacion(`Bienvenido, ${usuario.nombre}.`, 'exito');

    } catch (error) {
        mostrarNotificacion('No se pudo conectar con el servidor.', 'error');
        console.error('Error al iniciar sesion:', error.message);
    }
}

/* ------------------------------------------------
   CERRAR SESION
   ------------------------------------------------ */
function cerrarSesion() {
    sessionStorage.removeItem('sesion');
    actualizarBotonLogin();
    mostrarNotificacion('Sesion cerrada.', 'info');
}

/* ------------------------------------------------
   OBTENER SESION ACTIVA
   ------------------------------------------------ */
function obtenerSesion() {
    const sesion = sessionStorage.getItem('sesion');
    return sesion ? JSON.parse(sesion) : null;
}

/* ------------------------------------------------
   VERIFICAR SI HAY SESION
   ------------------------------------------------ */
function haySesion() {
    return obtenerSesion() !== null;
}

/* ------------------------------------------------
   ACTUALIZAR BOTON DE LOGIN EN EL TOPBAR
   ------------------------------------------------ */
function actualizarBotonLogin() {
    const btn = document.getElementById('btnLogin');
    if (!btn) return;

    const sesion = obtenerSesion();

    if (sesion) {
        btn.textContent = sesion.nombre;
        btn.onclick = () => {
            if (confirm('Cerrar sesion?')) cerrarSesion();
        };
    } else {
        btn.innerHTML = '<i class="ti ti-lock" aria-hidden="true"></i> Iniciar sesion';
        btn.onclick = () => abrirModal('modalLogin');
    }
}

/* ------------------------------------------------
   PROTEGER PAGINA ADMIN
   Si no hay sesion, redirige al inicio
   ------------------------------------------------ */
function protegerPaginaAdmin() {
    if (!haySesion()) {
        alert('Debes iniciar sesion para acceder al panel de administracion.');
        window.location.href = 'index.html';
    }
}

/* ------------------------------------------------
   INICIAR AL CARGAR LA PAGINA
   ------------------------------------------------ */
document.addEventListener('DOMContentLoaded', function () {
    actualizarBotonLogin();

    const passInput = document.getElementById('loginPassword');
    if (passInput) {
        passInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') iniciarSesion();
        });
    }
});
