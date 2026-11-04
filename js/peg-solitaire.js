/* =====================================================================
   PEG SOLITAIRE
   Tablero en cruz de 7x7 (33 casilleros válidos), arranca con el centro vacío.
   Se juega saltando una ficha sobre otra (en línea recta) hacia un hueco;
   la ficha saltada se elimina. Se gana quedando 1 sola ficha.

   El canvas se redibuja solo cuando algo cambia (movimiento, reinicio, fin
   de partida). Mientras se arrastra una ficha se usa requestAnimationFrame
   para animar los hints, y se frena apenas se suelta.
   ===================================================================== */

// Rutas de las imágenes (relativas a la página HTML).
// El tablero tiene que ser de 700x700 con los agujeros alineados a la grilla.
const IMAGENES = {
  tablero: '../assets/img/tablero.png',
  fichas: [
    '../assets/img/ficha1.png',
    '../assets/img/ficha2.png',
    '../assets/img/ficha3.png'
  ]
};

const TIEMPO_LIMITE = 300;     // segundos de la partida (5 minutos)
const TAMANIO_CASILLA = 100;    // px de cada casillero
const MARGEN = .5;             // px de margen del tablero dentro del canvas (canvas de 700x700)
const RADIO_FICHA = 40;        // px de radio de cada ficha

// Mapa del tablero: -1 = no existe, 0 = hueco, 1 = ficha
const TABLERO_INICIAL = [
  [-1, -1,  1,  1,  1, -1, -1],
  [-1, -1,  1,  1,  1, -1, -1],
  [ 1,  1,  1,  1,  1,  1,  1],
  [ 1,  1,  1,  0,  1,  1,  1],
  [ 1,  1,  1,  1,  1,  1,  1],
  [-1, -1,  1,  1,  1, -1, -1],
  [-1, -1,  1,  1,  1, -1, -1]
];

// Las 4 direcciones de salto: arriba, abajo, izquierda, derecha
const DIRECCIONES = [[-1, 0], [1, 0], [0, -1], [0, 1]];


/* ---------------- CARGA DE IMÁGENES ---------------- */

/**
 * Carga una imagen desde una ruta y espera a que termine (bien o mal).
 * Deja en la propiedad "cargada" si se pudo cargar o no, y si falla
 * avisa por consola qué ruta no se encontró.
 * @param {string} ruta - ruta del archivo de imagen
 * @returns {Promise<HTMLImageElement>} imagen (revisar img.cargada antes de dibujarla)
 */
function cargarImagen(ruta) {
  return new Promise(function (resolver) {
    const img = new Image();
    img.cargada = false;
    img.onload = function () { img.cargada = true; resolver(img); };
    img.onerror = function () {
      console.error('No se pudo cargar la imagen: ' + ruta);
      resolver(img);
    };
    img.src = ruta;
  });
}


/* ---------------- CLASE PRINCIPAL DEL JUEGO ---------------- */

class PegSolitaire {

  /**
   * @param {HTMLCanvasElement} canvas - canvas donde se dibuja todo (700x700)
   * @param {Object} ui - elementos del DOM: {timer, fichas, mensaje}
   */
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    this.ui = ui;

    this.imgTablero = null;   // imagen de fondo del tablero
    this.imgFichas = [];      // imágenes de los distintos tipos de ficha
    this.listo = false;       // true cuando las imágenes ya cargaron

    // Estado de la partida (se completa en reiniciar())
    this.tablero = [];        // matriz con -1 / 0 / 1
    this.tipos = [];          // matriz con el tipo de imagen de cada ficha
    this.estado = 'jugando';  // 'jugando' | 'ganado' | 'perdido'
    this.textoFinal = '';     // mensaje que muestra el cartel de fin de partida
    this.tiempoRestante = TIEMPO_LIMITE;
    this.intervalo = null;    // id del setInterval del timer

    // Estado del arrastre
    this.arrastrando = false;
    this.animando = false;    // true mientras corre la animación de hints
    this.fichaOrigen = null;  // {f, c} de la ficha agarrada
    this.destinos = [];       // destinos válidos de la ficha agarrada
    this.mouse = { x: 0, y: 0 };

    this.registrarEventos();
  }

  /**
   * Carga todas las imágenes y arranca la partida.
   * Se llama una sola vez desde afuera.
   */
  async iniciar() {
    this.imgTablero = await cargarImagen(IMAGENES.tablero);
    for (const ruta of IMAGENES.fichas) {
      this.imgFichas.push(await cargarImagen(ruta));
    }

    this.listo = true;
    this.reiniciar();
  }

  /**
   * Deja el juego como al principio: tablero inicial, tipos de ficha al azar,
   * timer en el máximo y estado "jugando". Redibuja el canvas.
   */
  reiniciar() {
    // Copia profunda del tablero inicial para no modificar la constante
    this.tablero = TABLERO_INICIAL.map(function (fila) { return fila.slice(); });

    // A cada ficha le toca al azar uno de los 3 tipos de imagen
    this.tipos = this.tablero.map(function (fila) {
      return fila.map(function () { return Math.floor(Math.random() * 3); });
    });

    this.estado = 'jugando';
    this.arrastrando = false;
    this.destinos = [];
    this.tiempoRestante = TIEMPO_LIMITE;
    this.textoFinal = '';
    if (this.ui.mensaje) this.ui.mensaje.textContent = '';
    this.canvas.style.cursor = 'default';
    this.actualizarUI();

    // Reinicia el timer (si había uno corriendo lo frena primero)
    clearInterval(this.intervalo);
    const juego = this;
    this.intervalo = setInterval(function () { juego.pasarSegundo(); }, 1000);

    this.dibujar();
  }

  /**
   * Se ejecuta cada segundo: resta tiempo y, si llega a 0, termina la partida.
   */
  pasarSegundo() {
    if (this.estado !== 'jugando') return;
    this.tiempoRestante--;
    if (this.tiempoRestante <= 0) {
      this.tiempoRestante = 0;
      this.terminar('perdido', '¡Se acabó el tiempo!');
    }
    this.actualizarUI();
  }

  /**
   * Cierra la partida: frena el timer, muestra el cartel final y redibuja.
   * @param {string} resultado - 'ganado' o 'perdido'
   * @param {string} texto - mensaje a mostrar
   */
  terminar(resultado, texto) {
    this.estado = resultado;
    this.arrastrando = false;
    this.destinos = [];
    this.textoFinal = texto;
    clearInterval(this.intervalo);
    if (this.ui.mensaje) this.ui.mensaje.textContent = texto;
    this.dibujar();
  }

  /**
   * Actualiza los textos del timer y del contador de fichas en pantalla.
   */
  actualizarUI() {
    const min = Math.floor(this.tiempoRestante / 60);
    const seg = this.tiempoRestante % 60;
    this.ui.timer.textContent = min + ':' + (seg < 10 ? '0' : '') + seg;
    this.ui.fichas.textContent = this.contarFichas();
  }


  /* ------------ LÓGICA DEL JUEGO ------------ */

  /**
   * Cuenta cuántas fichas quedan en el tablero.
   * @returns {number} cantidad de fichas
   */
  contarFichas() {
    let total = 0;
    for (const fila of this.tablero) {
      for (const celda of fila) {
        if (celda === 1) total++;
      }
    }
    return total;
  }

  /**
   * Dice si una posición existe dentro del tablero en cruz.
   * @param {number} f - fila
   * @param {number} c - columna
   * @returns {boolean} true si es un casillero válido
   */
  existe(f, c) {
    return f >= 0 && f < 7 && c >= 0 && c < 7 && this.tablero[f][c] !== -1;
  }

  /**
   * Calcula a qué huecos puede saltar la ficha de la posición (f, c).
   * Un salto es válido si al lado hay una ficha y detrás hay un hueco.
   * @param {number} f - fila de la ficha
   * @param {number} c - columna de la ficha
   * @returns {Array} lista de destinos {f, c, medioF, medioC}
   */
  movimientosDe(f, c) {
    const lista = [];
    if (this.tablero[f][c] !== 1) return lista;
    for (const d of DIRECCIONES) {
      const medioF = f + d[0], medioC = c + d[1];       // ficha que se comería
      const destF = f + d[0] * 2, destC = c + d[1] * 2; // hueco donde cae
      if (this.existe(medioF, medioC) && this.existe(destF, destC) &&
          this.tablero[medioF][medioC] === 1 && this.tablero[destF][destC] === 0) {
        lista.push({ f: destF, c: destC, medioF: medioF, medioC: medioC });
      }
    }
    return lista;
  }

  /**
   * Revisa si en todo el tablero queda al menos un movimiento posible.
   * @returns {boolean} true si todavía se puede jugar
   */
  hayMovimientos() {
    for (let f = 0; f < 7; f++) {
      for (let c = 0; c < 7; c++) {
        if (this.movimientosDe(f, c).length > 0) return true;
      }
    }
    return false;
  }

  /**
   * Ejecuta un salto: mueve la ficha, elimina la saltada y revisa si terminó el juego.
   * @param {Object} origen - {f, c} de la ficha que salta
   * @param {Object} destino - destino elegido (con la ficha del medio)
   */
  mover(origen, destino) {
    const tipo = this.tipos[origen.f][origen.c];
    this.tablero[origen.f][origen.c] = 0;
    this.tablero[destino.medioF][destino.medioC] = 0;
    this.tablero[destino.f][destino.c] = 1;
    this.tipos[destino.f][destino.c] = tipo; // la ficha conserva su imagen
    this.actualizarUI();

    // Verificación de fin de juego después de CADA movimiento
    const quedan = this.contarFichas();
    if (quedan === 1) {
      this.terminar('ganado', '¡Ganaste! Quedó una sola ficha.');
    } else if (!this.hayMovimientos()) {
      this.terminar('perdido', 'Sin movimientos posibles. Quedaron ' + quedan + ' fichas.');
    }
  }


  /* ------------ MOUSE (drag and drop) ------------ */

  /**
   * Conecta los eventos del mouse al canvas.
   */
  registrarEventos() {
    const juego = this;
    this.canvas.addEventListener('mousedown', function (e) { juego.alApretar(e); });
    this.canvas.addEventListener('mousemove', function (e) { juego.alMover(e); });
    window.addEventListener('mouseup', function (e) { juego.alSoltar(e); });
  }

  /**
   * Convierte la posición del mouse a coordenadas internas del canvas
   * (sirve aunque el CSS cambie el tamaño visible del canvas).
   * @param {MouseEvent} e - evento del mouse
   * @returns {Object} {x, y} en píxeles del canvas
   */
  posicionMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  /**
   * Convierte una posición en píxeles al casillero (fila, columna) que la contiene.
   * @param {number} x - posición x en el canvas
   * @param {number} y - posición y en el canvas
   * @returns {Object} {f, c}
   */
  casilleroEn(x, y) {
    return {
      f: Math.floor((y - MARGEN) / TAMANIO_CASILLA),
      c: Math.floor((x - MARGEN) / TAMANIO_CASILLA)
    };
  }

  /**
   * Centro en píxeles de un casillero.
   * @param {number} f - fila
   * @param {number} c - columna
   * @returns {Object} {x, y}
   */
  centroDe(f, c) {
    return {
      x: MARGEN + c * TAMANIO_CASILLA + TAMANIO_CASILLA / 2,
      y: MARGEN + f * TAMANIO_CASILLA + TAMANIO_CASILLA / 2
    };
  }

  /**
   * Click del mouse: si se hizo sobre una ficha que se puede mover, empieza
   * el arrastre y arranca la animación de los hints.
   * @param {MouseEvent} e - evento del mouse
   */
  alApretar(e) {
    if (!this.listo || this.estado !== 'jugando') return;
    this.mouse = this.posicionMouse(e);
    const cas = this.casilleroEn(this.mouse.x, this.mouse.y);
    if (!this.existe(cas.f, cas.c)) return;

    const movs = this.movimientosDe(cas.f, cas.c);
    if (movs.length === 0) return; // ficha trabada: no se puede agarrar

    this.arrastrando = true;
    this.fichaOrigen = cas;
    this.destinos = movs; // estos son los lugares donde se muestran los hints
    this.canvas.style.cursor = 'grabbing';
    this.iniciarAnimacion();
  }

  /**
   * Movimiento del mouse: guarda la posición y cambia el cursor.
   * Mientras se arrastra, el dibujo lo actualiza la animación.
   * @param {MouseEvent} e - evento del mouse
   */
  alMover(e) {
    if (!this.listo) return;
    this.mouse = this.posicionMouse(e);
    if (this.arrastrando) return;

    // Cursor "mano" si está sobre una ficha jugable
    const cas = this.casilleroEn(this.mouse.x, this.mouse.y);
    const jugable = this.estado === 'jugando' && this.existe(cas.f, cas.c) &&
                    this.movimientosDe(cas.f, cas.c).length > 0;
    this.canvas.style.cursor = jugable ? 'grab' : 'default';
  }

  /**
   * Soltar el mouse: si se suelta sobre un destino válido se hace el salto;
   * si no, la ficha vuelve a su lugar (simplemente deja de arrastrarse).
   * @param {MouseEvent} e - evento del mouse
   */
  alSoltar(e) {
    if (!this.arrastrando) return;
    this.mouse = this.posicionMouse(e);
    const cas = this.casilleroEn(this.mouse.x, this.mouse.y);

    // Busca si el casillero donde se soltó es uno de los destinos válidos
    let elegido = null;
    for (const d of this.destinos) {
      if (d.f === cas.f && d.c === cas.c) elegido = d;
    }

    const origen = this.fichaOrigen;
    this.arrastrando = false;
    this.destinos = [];
    this.canvas.style.cursor = 'default';
    if (elegido) this.mover(origen, elegido);
    this.dibujar(); // último cuadro: sin hints y con la ficha ya en su lugar
  }


  /* ------------ DIBUJO ------------ */

  /**
   * Anima los hints mientras se arrastra una ficha. Usa requestAnimationFrame
   * y se detiene solo cuando se suelta la ficha (no queda ningún bucle corriendo).
   */
  iniciarAnimacion() {
    if (this.animando) return;
    this.animando = true;
    const juego = this;
    function cuadro(ahora) {
      juego.dibujar(ahora);
      if (juego.arrastrando) {
        requestAnimationFrame(cuadro);
      } else {
        juego.animando = false;
      }
    }
    requestAnimationFrame(cuadro);
  }

  /**
   * Dibuja un cuadro completo: tablero, fichas, hints y ficha arrastrada.
   * @param {number} [ahora] - tiempo actual en ms (para las animaciones)
   */
  dibujar(ahora) {
    if (!this.listo) return;
    if (ahora === undefined) ahora = performance.now();

    const g = this.g;
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.dibujarTablero();

    // Fichas quietas (la que se está arrastrando se dibuja aparte, al final)
    for (let f = 0; f < 7; f++) {
      for (let c = 0; c < 7; c++) {
        if (this.tablero[f][c] !== 1) continue;
        const esArrastrada = this.arrastrando && this.fichaOrigen.f === f && this.fichaOrigen.c === c;
        const p = this.centroDe(f, c);
        if (esArrastrada) {
          // Deja una sombra tenue en el lugar de origen
          g.globalAlpha = 0.25;
          this.dibujarFicha(this.tipos[f][c], p.x, p.y);
          g.globalAlpha = 1;
        } else {
          this.dibujarFicha(this.tipos[f][c], p.x, p.y);
        }
      }
    }

    // Hints animados sobre los destinos válidos
    for (const d of this.destinos) {
      const p = this.centroDe(d.f, d.c);
      this.dibujarHint(p.x, p.y, ahora);
    }

    // Ficha que sigue al mouse
    if (this.arrastrando) {
      const tipo = this.tipos[this.fichaOrigen.f][this.fichaOrigen.c];
      this.dibujarFicha(tipo, this.mouse.x, this.mouse.y, 1.15);
    }

    // Cartel de fin de partida sobre el tablero
    if (this.estado !== 'jugando') this.dibujarCartel();
  }

  /**
   * Dibuja la imagen de fondo del tablero. Si no se pudo cargar, muestra
   * un aviso en el canvas con la ruta que falló.
   */
  dibujarTablero() {
    const g = this.g;
    if (this.imgTablero.cargada) {
      g.drawImage(this.imgTablero, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      g.fillStyle = '#111';
      g.fillRect(0, 0, this.canvas.width, this.canvas.height);
      g.fillStyle = '#fff';
      g.font = '20px sans-serif';
      g.textAlign = 'center';
      g.fillText('No se encontró ' + IMAGENES.tablero, this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  /**
   * Dibuja una ficha usando su imagen.
   * @param {number} tipo - índice de la imagen (0, 1 o 2)
   * @param {number} x - centro x
   * @param {number} y - centro y
   * @param {number} [escala=1] - factor de tamaño (se usa para agrandarla al arrastrar)
   */
  dibujarFicha(tipo, x, y, escala) {
    const img = this.imgFichas[tipo];
    if (!img.cargada) return; // imagen faltante: ya se avisó por consola
    const r = RADIO_FICHA * (escala || 1);
    this.g.drawImage(img, x - r, y - r, r * 2, r * 2);
  }

  /**
   * Dibuja el hint animado de un destino: un aro que pulsa y una flecha que sube y baja.
   * @param {number} x - centro x del destino
   * @param {number} y - centro y del destino
   * @param {number} ahora - tiempo en ms para calcular la animación
   */
  dibujarHint(x, y, ahora) {
    const g = this.g;
    const pulso = (Math.sin(ahora / 200) + 1) / 2;       // va de 0 a 1 y vuelve
    const rebote = Math.sin(ahora / 180) * 7;            // sube y baja unos px

    // Aro pulsante
    g.beginPath();
    g.arc(x, y, RADIO_FICHA - 4 + pulso * 8, 0, Math.PI * 2);
    g.lineWidth = 4;
    g.strokeStyle = 'rgba(80, 255, 140, ' + (0.5 + pulso * 0.5) + ')';
    g.stroke();

    // Flecha hacia abajo, flotando arriba del destino
    const ay = y - RADIO_FICHA - 14 + rebote;
    g.beginPath();
    g.moveTo(x, ay + 14);
    g.lineTo(x - 11, ay - 4);
    g.lineTo(x + 11, ay - 4);
    g.closePath();
    g.fillStyle = '#50ff8c';
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = '#0a5a2a';
    g.stroke();
  }

  /**
   * Dibuja un cartel semitransparente con el resultado de la partida.
   */
  dibujarCartel() {
    const g = this.g;
    const w = this.canvas.width, h = this.canvas.height;
    g.fillStyle = 'rgba(0, 0, 0, 0.6)';
    g.fillRect(0, h / 2 - 70, w, 140);
    g.fillStyle = this.estado === 'ganado' ? '#50ff8c' : '#ff6b6b';
    g.font = 'bold 40px sans-serif';
    g.textAlign = 'center';
    g.fillText(this.estado === 'ganado' ? '¡VICTORIA!' : 'FIN DEL JUEGO', w / 2, h / 2 - 5);
    g.fillStyle = '#fff';
    g.font = '22px sans-serif';
    g.fillText(this.textoFinal, w / 2, h / 2 + 35);
  }
}