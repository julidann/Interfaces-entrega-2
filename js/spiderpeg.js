/* Conecta el juego (peg-solitaire.js) con la página spiderpeg.html.
   Al cargar la página se muestra el tablero vacío con el botón "Comenzar";
   la partida (y el timer) arrancan recién cuando se aprieta ese botón. */

// Se crea el juego pasándole el canvas y los lugares donde mostrar los datos
const juego = new PegSolitaire(document.getElementById('spiderpeg-canvas'), {
    timer: document.getElementById('spiderpeg-timer'),
    fichas: document.getElementById('spiderpeg-fichas'),
    mensaje: document.getElementById('spiderpeg-mensaje'),
    comenzar: document.getElementById('spiderpeg-comenzar')
});

// Carga las imágenes y muestra la pantalla de inicio
juego.iniciar();

// El botón Comenzar arranca la partida
document.getElementById('spiderpeg-comenzar').addEventListener('click', function () {
    juego.comenzar();
});

// El botón Reiniciar empieza una partida nueva
document.getElementById('spiderpeg-reiniciar').addEventListener('click', function () {
    juego.reiniciar();
});