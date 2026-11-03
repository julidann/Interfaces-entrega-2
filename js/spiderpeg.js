/* Conecta el juego (peg-solitaire.js) con la página spiderpeg.html.
   El juego arranca solo apenas se carga la página, dentro del contenedor
   que antes tenía la imagen SpiderPeg-1.jpg. */

// Se crea el juego pasándole el canvas y los lugares donde mostrar los datos
const juego = new PegSolitaire(document.getElementById('spiderpeg-canvas'), {
    timer: document.getElementById('spiderpeg-timer'),
    fichas: document.getElementById('spiderpeg-fichas'),
    mensaje: document.getElementById('spiderpeg-mensaje')
});

// Carga las imágenes y arranca la partida
juego.iniciar();

// El botón Reiniciar empieza una partida nueva
document.getElementById('spiderpeg-reiniciar').addEventListener('click', function () {
    juego.reiniciar();
});