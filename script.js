function mostrarProducto(nombre){
    document.getElementById("titulo").innerText = nombre;
    document.getElementById("modal").style.display = "flex";
}

function cerrarModal(){
    document.getElementById("modal").style.display = "none";
}

/* FORMULARIO */
function abrirFormulario(){
    document.getElementById("formModal").style.display = "flex";
}

function cerrarFormulario(){
    document.getElementById("formModal").style.display = "none";
}

function enviarFormulario(){

    let nombre = document.getElementById("nombre").value;
    let fecha = document.getElementById("fecha").value;
    let correo = document.getElementById("correo").value;
    let telefono = document.getElementById("telefono").value;

    if(nombre === "" || fecha === "" || correo === "" || telefono === ""){
        alert("Por favor completa todos los campos");
        return;
    }

    alert("Registro enviado correctamente \nBienvenido " + nombre);

    cerrarFormulario();
}

/* BUSCADOR */
document.getElementById("buscar").addEventListener("keyup", function(){

    let texto = this.value.toLowerCase();
    let tarjetas = document.querySelectorAll(".card");

    tarjetas.forEach(card => {

        let nombre = card.innerText.toLowerCase();

        card.style.display = nombre.includes(texto) ? "block" : "none";

    });

});