
function iniciarSesion() {
    const correo   = document.getElementById('loginCorreo').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!correo || !password) {
        mostrarNotificacion('Completa todos los campos.', 'error');
        return;
    }

    const usuario = DEMO_CREDENCIALES.find(u => u.correo === correo && u.password === password);

    if (!usuario) {
        mostrarNotificacion('Correo o contrasena incorrectos.', 'error');
        document.getElementById('loginPassword').value = '';
        return;
    }

    sessionStorage.setItem('sesionDemo', JSON.stringify({
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
    }));

    cerrarModal('modalLogin');
    actualizarBotonLogin();
    mostrarNotificacion(`Bienvenido, ${usuario.nombre}. (Modo demo)`, 'exito');
}

function cerrarSesion() {
    sessionStorage.removeItem('sesionDemo');
    actualizarBotonLogin();
    mostrarNotificacion('Sesion cerrada.', 'info');
}

function obtenerSesion() {
    const sesion = sessionStorage.getItem('sesionDemo');
    return sesion ? JSON.parse(sesion) : null;
}

function haySesion() {
    return obtenerSesion() !== null;
}

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

function protegerPaginaAdmin() {
    if (!haySesion()) {
        alert('Debes iniciar sesion para acceder al panel de administracion. (Modo demo: admin@ryctech.com / admin123)');
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    actualizarBotonLogin();

    const passInput = document.getElementById('loginPassword');
    if (passInput) {
        passInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') iniciarSesion();
        });
    }
});
