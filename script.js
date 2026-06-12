function mostrarProducto(nombre){

    document.getElementById("titulo").innerText = nombre;

    document.getElementById("modal").style.display = "flex";
}

function cerrarModal(){

    document.getElementById("modal").style.display = "none";
}

let buscador = document.getElementById("buscar");

buscador.addEventListener("keyup", function(){

    let texto = buscador.value.toLowerCase();

    let tarjetas = document.querySelectorAll(".card");

    tarjetas.forEach(function(card){

        let nombre = card.innerText.toLowerCase();

        if(nombre.includes(texto)){
            card.style.display = "block";
        }else{
            card.style.display = "none";
        }

    });

});
function login() {
    document.getElementById("loginModal").style.display = "flex";
}

function cerrarLogin() {
    document.getElementById("loginModal").style.display = "none";
}

function validarLogin() {
    let usuario = document.getElementById("usuario").value;
    let password = document.getElementById("password").value;

    if(usuario === "admin" && password === "1234") {
        alert("Bienvenido " + usuario);
        cerrarLogin();
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}