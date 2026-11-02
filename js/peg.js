/**
 * -----------------------------------------------------------------
 * PEG SOLITAIRE
 * Tablero 7x7 en cruz, drag & drop, hints animados, timer y
 * reinicio. Dibujo con canvas y requestAnimationFrame.
 * -----------------------------------------------------------------
 */

// ---------------------------------------------------------------
// CONSTANTES
// ---------------------------------------------------------------
const TAM_CELDA = 90;          // Tamaño de cada celda en píxeles (7 * 90 = 630)
const CANT_CELDAS = 7;         // El tablero es de 7x7
const RADIO_FICHA = 32;        // Radio con el que se dibuja cada ficha
const TIEMPO_LIMITE = 300;     // Tiempo máximo de juego en segundos

const EXTERNO = -1;            // Celda fuera del tablero (esquinas de la cruz)
const VACIO = 0;               // Agujero sin ficha
const FICHA = 1;               // Agujero con ficha

// Saltos posibles: dos celdas arriba, abajo, izquierda o derecha
const DIRECCIONES = [
    { f: -2, c: 0 },
    { f: 2, c: 0 },
    { f: 0, c: -2 },
    { f: 0, c: 2 }
];

// ---------------------------------------------------------------
// ELEMENTOS DEL DOM
// ---------------------------------------------------------------
const canvas = document.getElementById('tableroCanvas');
const ctx = canvas.getContext('2d');
const elTimer = document.getElementById('timer');
const elContador = document.getElementById('contadorFichas');
const elMensaje = document.getElementById('mensaje');
const elOverlay = document.getElementById('overlayFin');
const elTituloFin = document.getElementById('tituloFin');
const btnReiniciarOverlay = document.getElementById('btnReiniciarOverlay');
const selectFicha = document.getElementById('selectFicha');
const btnReiniciar = document.getElementById('btnReiniciar');

// ---------------------------------------------------------------
// IMÁGENES
// ---------------------------------------------------------------
// Las rutas son relativas a pages/peg-solitaire.html
const RUTA_IMG = '../assets/peg/img/';
const TIPOS_FICHA = {
    ficha1: RUTA_IMG + 'ficha1.png',
    ficha2: RUTA_IMG + 'ficha2.png',
    ficha3: RUTA_IMG + 'ficha3.png'
};

let imagenesPendientes = 1 + Object.keys(TIPOS_FICHA).length;
const imgTablero = cargarImagen(RUTA_IMG + 'tablero.png');
const imgFichas = {};
for (let tipo in TIPOS_FICHA) {
    imgFichas[tipo] = cargarImagen(TIPOS_FICHA[tipo]);
}

/**
 * Crea una imagen y avisa cuando terminó de cargar (o falló),
 * para poder iniciar el juego una vez que todas están listas.
 */
function cargarImagen(src) {
    const img = new Image();
    img.onload = imagenLista;
    img.onerror = imagenLista;
    img.src = src;
    return img;
}

/**
 * Descuenta una imagen pendiente. Cuando no queda ninguna, inicia el juego.
 */
function imagenLista() {
    imagenesPendientes--;
    if (imagenesPendientes === 0) {
        reiniciarJuego();
        bucleAnimacion();
    }
}

/**
 * Indica si una imagen se cargó correctamente.
 */
function imagenOk(img) {
    return img.complete && img.naturalWidth > 0;
}

// ---------------------------------------------------------------
// ESTADO DEL JUEGO
// ---------------------------------------------------------------
let tablero = [];                   // Matriz 7x7 con EXTERNO, VACIO o FICHA
let fichaSeleccionada = null;       // {fila, col, x, y} de la ficha que se arrastra
let destinosValidos = [];           // Lugares donde se puede soltar la ficha
let tipoFicha = 'ficha1';           // Tipo de ficha elegido en el selector
let juegoTerminado = false;
let tiempoRestante = TIEMPO_LIMITE;
let intervaloTimer = null;

// ---------------------------------------------------------------
// INICIO Y REINICIO
// ---------------------------------------------------------------

/**
 * Crea el tablero inicial: cruz completa con el agujero central vacío.
 */
function crearTablero() {
    const t = [];
    for (let f = 0; f < CANT_CELDAS; f++) {
        t[f] = [];
        for (let c = 0; c < CANT_CELDAS; c++) {
            // Las esquinas (2x2 en cada punta) quedan fuera del tablero
            const esquinaFila = f < 2 || f > 4;
            const esquinaCol = c < 2 || c > 4;
            t[f][c] = (esquinaFila && esquinaCol) ? EXTERNO : FICHA;
        }
    }
    t[3][3] = VACIO;
    return t;
}

/**
 * Deja el juego en su estado inicial y arranca el timer.
 */
function reiniciarJuego() {
    tablero = crearTablero();
    fichaSeleccionada = null;
    destinosValidos = [];
    juegoTerminado = false;
    tiempoRestante = TIEMPO_LIMITE;
    elOverlay.style.display = 'none';
    actualizarContador();
    mostrarTiempo();
    iniciarTimer();
}

// ---------------------------------------------------------------
// TIMER
// ---------------------------------------------------------------

/**
 * Inicia el temporizador regresivo. Al llegar a cero termina el juego.
 */
function iniciarTimer() {
    clearInterval(intervaloTimer);
    intervaloTimer = setInterval(() => {
        tiempoRestante--;
        mostrarTiempo();
        if (tiempoRestante <= 0) {
            terminarJuego('¡Tiempo!', 'Se acabó el tiempo.');
        }
    }, 1000);
}

/**
 * Muestra el tiempo restante con formato minutos:segundos.
 */
function mostrarTiempo() {
    const min = Math.floor(tiempoRestante / 60);
    const seg = tiempoRestante % 60;
    elTimer.innerText = min + ':' + (seg < 10 ? '0' + seg : seg);
}

// ---------------------------------------------------------------
// LÓGICA DEL JUEGO
// ---------------------------------------------------------------

/**
 * Devuelve true si la fila y columna están dentro del tablero 7x7.
 */
function dentroDelTablero(f, c) {
    return f >= 0 && f < CANT_CELDAS && c >= 0 && c < CANT_CELDAS;
}

/**
 * Calcula los destinos válidos de una ficha: saltos de dos celdas
 * hacia un agujero vacío pasando por encima de otra ficha.
 */
function calcularDestinos(fila, col) {
    const validos = [];
    for (let d of DIRECCIONES) {
        const fDest = fila + d.f;
        const cDest = col + d.c;
        const fMed = fila + d.f / 2;
        const cMed = col + d.c / 2;

        if (dentroDelTablero(fDest, cDest) &&
            tablero[fDest][cDest] === VACIO &&
            tablero[fMed][cMed] === FICHA) {
            validos.push({ fila: fDest, col: cDest });
        }
    }
    return validos;
}

/**
 * Ejecuta un salto: la ficha sale del origen, cae en el destino
 * y se elimina la ficha del medio.
 */
function moverFicha(origen, destino) {
    const fMed = (origen.fila + destino.fila) / 2;
    const cMed = (origen.col + destino.col) / 2;

    tablero[origen.fila][origen.col] = VACIO;
    tablero[fMed][cMed] = VACIO;
    tablero[destino.fila][destino.col] = FICHA;
}

/**
 * Cuenta cuántas fichas quedan en el tablero.
 */
function contarFichas() {
    let total = 0;
    for (let fila of tablero) {
        for (let celda of fila) {
            if (celda === FICHA) total++;
        }
    }
    return total;
}

/**
 * Muestra la cantidad de fichas restantes en pantalla.
 */
function actualizarContador() {
    elContador.innerText = contarFichas();
}

/**
 * Devuelve true si alguna ficha del tablero tiene al menos un movimiento.
 */
function hayMovimientosPosibles() {
    for (let f = 0; f < CANT_CELDAS; f++) {
        for (let c = 0; c < CANT_CELDAS; c++) {
            if (tablero[f][c] === FICHA && calcularDestinos(f, c).length > 0) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Se llama después de cada movimiento: si no quedan movimientos,
 * termina el juego (con victoria si quedó una sola ficha).
 */
function verificarFinDeJuego() {
    if (hayMovimientosPosibles()) return;

    const restantes = contarFichas();
    if (restantes === 1) {
        terminarJuego('¡Ganaste!', 'Quedó una sola ficha.');
    } else {
        terminarJuego('Fin del juego', 'Sin movimientos posibles. Quedaron ' + restantes + ' fichas.');
    }
}

/**
 * Frena el timer, bloquea el juego y muestra el cartel de resultado
 * (overlay) con un título y un mensaje.
 */
function terminarJuego(titulo, mensaje) {
    juegoTerminado = true;
    clearInterval(intervaloTimer);
    fichaSeleccionada = null;
    destinosValidos = [];
    elTituloFin.innerText = titulo;
    elMensaje.innerText = mensaje;
    elOverlay.style.display = 'flex';
}

// ---------------------------------------------------------------
// DIBUJO
// ---------------------------------------------------------------

/**
 * Bucle principal: dibuja el cuadro actual y pide el siguiente.
 */
function bucleAnimacion() {
    dibujar();
    requestAnimationFrame(bucleAnimacion);
}

/**
 * Dibuja todo: fondo, fichas, hints y la ficha que se arrastra.
 */
function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarFondo();
    dibujarFichas();
    dibujarHints();

    if (fichaSeleccionada) {
        dibujarFicha(fichaSeleccionada.x, fichaSeleccionada.y);
    }
}

/**
 * Dibuja la imagen de fondo del tablero vacío. Si la imagen no
 * cargó, dibuja los agujeros a mano para poder jugar igual.
 */
function dibujarFondo() {
    if (imagenOk(imgTablero)) {
        ctx.drawImage(imgTablero, 0, 0, canvas.width, canvas.height);
        return;
    }
    for (let f = 0; f < CANT_CELDAS; f++) {
        for (let c = 0; c < CANT_CELDAS; c++) {
            if (tablero[f][c] !== EXTERNO) {
                const p = centroCelda(f, c);
                ctx.beginPath();
                ctx.arc(p.x, p.y, RADIO_FICHA + 2, 0, Math.PI * 2);
                ctx.fillStyle = '#444';
                ctx.fill();
            }
        }
    }
}

/**
 * Dibuja las fichas fijas del tablero (menos la que se está arrastrando).
 */
function dibujarFichas() {
    for (let f = 0; f < CANT_CELDAS; f++) {
        for (let c = 0; c < CANT_CELDAS; c++) {
            const arrastrada = fichaSeleccionada &&
                fichaSeleccionada.fila === f && fichaSeleccionada.col === c;
            if (tablero[f][c] === FICHA && !arrastrada) {
                const p = centroCelda(f, c);
                dibujarFicha(p.x, p.y);
            }
        }
    }
}

/**
 * Dibuja una ficha centrada en (x, y) con la imagen del tipo elegido.
 */
function dibujarFicha(x, y) {
    const img = imgFichas[tipoFicha];
    if (imagenOk(img)) {
        ctx.drawImage(img, x - RADIO_FICHA, y - RADIO_FICHA, RADIO_FICHA * 2, RADIO_FICHA * 2);
    } else {
        // Respaldo si la imagen no cargó
        ctx.beginPath();
        ctx.arc(x, y, RADIO_FICHA, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
    }
}

/**
 * Dibuja los hints animados sobre los destinos válidos: un círculo
 * que pulsa y una flecha que rebota (ambos con Math.sin).
 */
function dibujarHints() {
    if (!fichaSeleccionada) return;

    const oscilacion = Math.sin(Date.now() / 150);   // Va de -1 a 1
    const pulso = (oscilacion + 1) / 2;              // Va de 0 a 1

    for (let dest of destinosValidos) {
        const p = centroCelda(dest.fila, dest.col);

        // Círculo que pulsa
        ctx.beginPath();
        ctx.arc(p.x, p.y, RADIO_FICHA - 4 + pulso * 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Flecha que rebota arriba del destino
        const yFlecha = p.y - RADIO_FICHA - 8 + oscilacion * 4;
        ctx.beginPath();
        ctx.moveTo(p.x - 8, yFlecha - 10);
        ctx.lineTo(p.x + 8, yFlecha - 10);
        ctx.lineTo(p.x, yFlecha);
        ctx.closePath();
        ctx.fillStyle = '#2ecc71';
        ctx.fill();
    }
}

/**
 * Devuelve el centro en píxeles de la celda (fila, col).
 */
function centroCelda(fila, col) {
    return {
        x: col * TAM_CELDA + TAM_CELDA / 2,
        y: fila * TAM_CELDA + TAM_CELDA / 2
    };
}

// ---------------------------------------------------------------
// EVENTOS DE MOUSE (DRAG & DROP)
// ---------------------------------------------------------------

/**
 * Convierte las coordenadas de un evento de mouse a coordenadas del canvas.
 */
function posicionMouse(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

/**
 * Click: si hay una ficha en la celda, empieza a arrastrarla y
 * calcula los lugares donde se puede soltar.
 */
canvas.addEventListener('mousedown', (e) => {
    if (juegoTerminado) return;

    const pos = posicionMouse(e);
    const col = Math.floor(pos.x / TAM_CELDA);
    const fila = Math.floor(pos.y / TAM_CELDA);

    if (dentroDelTablero(fila, col) && tablero[fila][col] === FICHA) {
        fichaSeleccionada = { fila: fila, col: col, x: pos.x, y: pos.y };
        destinosValidos = calcularDestinos(fila, col);
    }
});

/**
 * Movimiento: la ficha arrastrada sigue al mouse. Se escucha en window
 * para que siga funcionando aunque el mouse salga del canvas.
 */
window.addEventListener('mousemove', (e) => {
    if (!fichaSeleccionada) return;
    const pos = posicionMouse(e);
    fichaSeleccionada.x = pos.x;
    fichaSeleccionada.y = pos.y;
});

/**
 * Soltar: si el lugar es un destino válido se mueve la ficha;
 * si no, la ficha vuelve a su lugar. Se escucha en window para
 * que soltar fuera del canvas no deje la ficha trabada.
 */
window.addEventListener('mouseup', (e) => {
    if (!fichaSeleccionada) return;

    const pos = posicionMouse(e);
    const col = Math.floor(pos.x / TAM_CELDA);
    const fila = Math.floor(pos.y / TAM_CELDA);

    const destino = destinosValidos.find(d => d.fila === fila && d.col === col);
    if (destino) {
        moverFicha(fichaSeleccionada, destino);
        actualizarContador();
        verificarFinDeJuego();
    }

    fichaSeleccionada = null;
    destinosValidos = [];
});

// ---------------------------------------------------------------
// CONTROLES
// ---------------------------------------------------------------

/**
 * Botones de reinicio (el de la página y el del cartel de resultado).
 */
btnReiniciar.addEventListener('click', reiniciarJuego);
btnReiniciarOverlay.addEventListener('click', reiniciarJuego);

/**
 * Selector: cambia el tipo de ficha con el que se dibuja el tablero.
 */
selectFicha.addEventListener('change', () => {
    tipoFicha = selectFicha.value;
});