const landing = document.querySelector(".landing-main");

const imagenes = [
    "assets/img/background-ghost.jpg",
    "assets/img/background-GT.jpg",
    "assets/img/background-GTAVI.jpg",
    "assets/img/background-spiderman.jpg",
    "assets/img/background-zerodown.jpg"
];

let posicion = 0;

//para que ya cargue una img
landing.style.backgroundImage = `url("${imagenes[posicion]}")`;

setInterval(function () {
    posicion++;

    if (posicion >= imagenes.length) {
        posicion = 0;
    }

    landing.style.backgroundImage = `url("${imagenes[posicion]}")`;
}, 6000);