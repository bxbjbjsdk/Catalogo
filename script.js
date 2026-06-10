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